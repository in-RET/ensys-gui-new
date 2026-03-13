// converter.ts

import { DrawflowNode } from 'drawflow';

type AnyObj = Record<string, any>;

// interface DrawflowNode {
//     id: number;
//     name?: string;
//     class: 'source' | 'sink' | 'bus' | 'transformer' | string;
//     data?: AnyObj;
// }

interface BusConnectionEntry {
    baseInfo: {
        input_node: string; // e.g. "2" (bus)
        input_port: string; // e.g. "input_1"
        output_node: string; // e.g. "1" (source)
        output_port: string; // e.g. "output_1"
    };
    formInfo: AnyObj; // parameters we want to carry over
}

interface ConvertedModel {
    energysystem: {
        busses: Array<{ label: string; balanced: boolean }>;
        sinks: Array<{ label: string; inputs: Record<string, AnyObj> }>;
        sources: Array<{ label: string; outputs: Record<string, AnyObj> }>;
        converters: Array<AnyObj>;
        generic_storages: Array<AnyObj>;
        constraints: Array<AnyObj>;
    };
    solver: string;
    solver_verbose: boolean;
    solver_kwargs: any;
}

// ---- Helpers ----

function toStrId(id: string | number): string {
    return String(id);
}

function safeArr<T>(v: any): T[] {
    return Array.isArray(v) ? v : [];
}

/**
 * Builds a "default parameter object" that matches the shape in converted_model.json
 * (keys present, nulls where unknown).
 */
function normalizeParams(formInfo: AnyObj | null | undefined): AnyObj {
    const f: any = formInfo ?? {};

    // Keep the same key set you show in converted_model.json :contentReference[oaicite:2]{index=2}
    return {
        nominal_value: f.nominal_value ?? null,
        variable_costs: f.variable_costs ?? null,
        min: f.min ?? null,
        max: f.max ?? null,
        fix: f.fix ?? null, // sink example uses [] ; source example uses null
        positive_gradient_limit: f.positive_gradient_limit ?? null,
        negative_gradient_limit: f.negative_gradient_limit ?? null,
        full_load_time_max: f.full_load_time_max ?? null,
        full_load_time_min: f.full_load_time_min ?? null,
        integer: f.integer ?? null,
        nonconvex: f.nonconvex ?? f._nonconvex ?? null,
        fixed_costs: f.fixed_costs ?? null,
        lifetime: f.lifetime ?? f._lifetime ?? null,
        age: f.age ?? null,
        custom_attributes: f.custom_attributes ?? null,
    };
}

/**
 * Attempts to infer the "commodity" label used on a bus (e.g. "electricity")
 * by looking at connected sinks/sources/transformers and their port names.
 *
 * If it can't infer, it falls back to bus.data.outputport_name or bus.name/id.
 */
function inferBusLabel(
    bus: DrawflowNode,
    nodesById: Map<string, DrawflowNode>,
): string {
    const data: any = bus.data ?? {};
    const conns = data.connections ?? {};
    const inputs: BusConnectionEntry[] = safeArr(conns.inputs);
    const outputs: BusConnectionEntry[] = safeArr(conns.outputs);

    const tryFromNodePort = (nodeIdStr: string): string | null => {
        const n: any = nodesById.get(nodeIdStr);
        if (!n) return null;

        // sink: inputport_name often is the commodity (e.g. "electricity") :contentReference[oaicite:3]{index=3}
        if (n.class === 'sink') {
            return n.data?.inputport_name ?? null;
        }

        // source: outputport_name sometimes is commodity
        if (n.class === 'source') {
            return n.data?.outputport_name ?? null;
        }

        // transformer: output port names can be commodities (heat/electricity) :contentReference[oaicite:4]{index=4}
        if (n.class === 'transformer') {
            const outs: any = safeArr(n.data?.ports?.outputs);
            if (outs.length > 0 && outs[0]?.name) return outs[0].name;
        }

        return null;
    };

    // Prefer outputs from bus (bus -> sink), because that tends to indicate what the bus “is”
    for (const o of outputs) {
        const label = tryFromNodePort(o.baseInfo.input_node);
        if (label) return label;
    }

    // Otherwise try inputs feeding into the bus (source/transformer -> bus)
    for (const i of inputs) {
        const label = tryFromNodePort(i.baseInfo.output_node);
        if (label) return label;
    }

    return (
        data.outputport_name ??
        data.inputport_name ??
        bus.name ??
        `bus_${bus.id}`
    );
}

function inferComponentLabel(node: DrawflowNode): string {
    // Prefer a clean label if present
    return node.data?.name ?? node.name ?? `${node.class}_${node.id}`;
}

/**
 * Finds the bus-connection formInfo for an edge:
 *   upstream (source/transformer output) -> bus input
 */
function findFormInfoForBusInput(
    bus: DrawflowNode,
    upstreamNodeId: string,
    upstreamPortCode: string,
): AnyObj | null {
    const inputs: BusConnectionEntry[] = safeArr(bus.data?.connections?.inputs);
    const hit = inputs.find(
        (e) =>
            e.baseInfo.output_node === upstreamNodeId &&
            e.baseInfo.output_port === upstreamPortCode,
    );
    return hit?.formInfo ?? null;
}

/**
 * Finds the bus-connection formInfo for an edge:
 *   bus output -> downstream (sink/transformer input)
 */
function findFormInfoForBusOutput(
    bus: DrawflowNode,
    downstreamNodeId: string,
    busPortCode: string,
): AnyObj | null {
    const outputs: BusConnectionEntry[] = safeArr(
        bus.data?.connections?.outputs,
    );
    const hit = outputs.find(
        (e) =>
            e.baseInfo.input_node === downstreamNodeId &&
            e.baseInfo.output_port === busPortCode,
    );
    return hit?.formInfo ?? null;
}

// ---- Main conversion ----

export function convertDrawflowToEnergyModel(
    drawflowJson: AnyObj,
): ConvertedModel {
    // Your input is keyed by node-id strings: { "1": {...}, "2": {...} } :contentReference[oaicite:5]{index=5}
    const nodes: DrawflowNode[] = Object.values(
        drawflowJson ?? {},
    ) as DrawflowNode[];
    const nodesById = new Map<string, DrawflowNode>();
    for (const n of nodes) nodesById.set(toStrId(n.id), n);

    const buses = nodes.filter((n) => n.class === 'bus');
    const sources = nodes.filter((n) => n.class === 'source');
    const sinks = nodes.filter((n) => n.class === 'sink');
    const transformers = nodes.filter((n) => n.class === 'transformer');

    // Convert buses
    const convertedBusses = buses.map((b) => ({
        label: inferBusLabel(b, nodesById),
        balanced: true,
    }));

    // Convert sources (outputs)
    const convertedSources = sources.map((s: any) => {
        const sId = toStrId(s.id);
        const label = inferComponentLabel(s);

        const outputs: Record<string, AnyObj> = {};
        const outPorts = safeArr<any>(s.data?.ports?.outputs);

        for (const p of outPorts) {
            const portName: string = p?.name ?? 'output';
            const portCode: string = p?.code ?? 'output_1';

            // Find which bus this output goes into (via drawflow 'outputs' connections)
            // In your sample: s.outputs.output_1.connections[0].node == "2" (bus) :contentReference[oaicite:6]{index=6}
            const drawflowOutputs = s.outputs ?? {};
            const connList = safeArr<any>(
                drawflowOutputs[portCode]?.connections,
            );
            const firstBusId = connList[0]?.node
                ? String(connList[0].node)
                : null;

            let formInfo: AnyObj | null = null;
            if (firstBusId) {
                const busNode = nodesById.get(firstBusId);
                if (busNode?.class === 'bus') {
                    formInfo = findFormInfoForBusInput(busNode, sId, portCode);
                }
            }

            outputs[portName] = normalizeParams(formInfo);
        }

        return { label, outputs };
    });

    // Convert sinks (inputs)
    const convertedSinks = sinks.map((k: any) => {
        const kId = toStrId(k.id);
        const label = inferComponentLabel(k);

        const inputs: Record<string, AnyObj> = {};
        const inPorts = safeArr<any>(k.data?.ports?.inputs);

        for (const p of inPorts) {
            const portName: string = p?.name ?? 'input';
            const portCode: string = p?.code ?? 'input_1';

            // Find which bus feeds this sink input (via sink.inputs[input_1].connections[0].node == bus) :contentReference[oaicite:7]{index=7}
            const drawflowInputs = k.inputs ?? {};
            const connList = safeArr<any>(
                drawflowInputs[portCode]?.connections,
            );
            const firstBusId = connList[0]?.node
                ? String(connList[0].node)
                : null;

            let formInfo: AnyObj | null = null;
            if (firstBusId) {
                const busNode = nodesById.get(firstBusId);
                if (busNode?.class === 'bus') {
                    // Bus output code is usually bus "output_1" in drawflow, but we can read it from connection
                    // In sample: sink input connection has {node:"2", input:"output_1"} :contentReference[oaicite:8]{index=8}
                    const busPortCode = connList[0]?.input
                        ? String(connList[0].input)
                        : 'output_1';
                    formInfo = findFormInfoForBusOutput(
                        busNode,
                        kId,
                        busPortCode,
                    );
                }
            }

            inputs[portName] = normalizeParams(formInfo);
        }

        return { label, inputs };
    });

    // Convert transformers to converters (basic example)
    const convertedConverters = transformers.map((t: any) => {
        return {
            label: inferComponentLabel(t),
            inputs: (t.data?.ports?.inputs ?? []).map((p: any) => ({
                name: p.name,
                number: p.number ?? null,
            })),
            outputs: (t.data?.ports?.outputs ?? []).map((p: any) => ({
                name: p.name,
                number: p.number ?? null,
            })),
            // Keep raw preDefData if present
            preDefData: t.data?.preDefData ?? null,
        };
    });

    // Final model (matches your converted_model.json top-level keys) :contentReference[oaicite:9]{index=9}
    return {
        energysystem: {
            busses: convertedBusses,
            sinks: convertedSinks,
            sources: convertedSources,
            converters: convertedConverters,
            generic_storages: [],
            constraints: [],
        },
        solver: 'gurobi',
        solver_verbose: true,
        solver_kwargs: null,
    };
}
