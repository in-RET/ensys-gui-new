export interface OEPResponse {
    node_data: Record<string, any>; // if you know the shape, replace `any`
    ports_data: OEPPorts;
}

export interface OEPPorts {
    inputs: Port[];
    outputs: Port[];
}

export interface Port {
    name: string;
    flow_data: FlowData;
    efficiency?: number;
}

export interface FlowData {
    fix?: number[]; // optional array of numbers
    investment?: {
        ep_costs: number;
        [key: string]: number | undefined; // allows future investment fields
    };
    [key: string]: any; // allow for other flow_data keys (variable_costs, max, etc.)
}
