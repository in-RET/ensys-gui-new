import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import Drawflow, { DrawflowNode } from 'drawflow';
import { AlertService } from '../../../../shared/services/alert.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ScenarioService } from '../../services/scenario.service';
import { FormComponent } from '../form/form.component';
import { ModalComponent } from '../modal/modal.component';

interface ContextMenuState {
    show: boolean;
    x: number;
    y: number;
    direction: 'left' | 'right';
    nodeId: number;
    nodeClass: string;
    nodePorts: any;
    nodeConnections: {
        in: any[];
        out: any[];
    };
    nodeFlowsColor: string;
}

@Component({
    selector: 'app-energy-drawflow',
    imports: [CommonModule],
    templateUrl: './energy-drawflow.component.html',
    styleUrl: './energy-drawflow.component.scss',
})
export class EnergyDrawflowComponent {
    editor!: Drawflow;
    flowZoom: number = 1;

    // form
    formData!: any;
    formError: any = {
        msg: '',
        isShow: false,
    };
    seelctedConnection: any = { title: '' };
    ASSET_TYPE_NAME: string = 'asset_type_name';

    selected_nodeId: any;
    selected_flowId: any;
    touchTimer: any;

    contextmenu: ContextMenuState | null = null;

    @ViewChild(ModalComponent)
    modalComponent: ModalComponent = {} as ModalComponent;

    @Output('_drop') drop: EventEmitter<any> = new EventEmitter();
    @Output('showFormModal_node') showFormModal_node: EventEmitter<any> =
        new EventEmitter();
    @Output('showFormModal_flow') showFormModal_flow: EventEmitter<any> =
        new EventEmitter();
    @Output() toggleFullScreen: EventEmitter<any> = new EventEmitter();
    @Output('touchEnd') _touchEnd: EventEmitter<any> = new EventEmitter();

    @ViewChild(FormComponent) formComponent!: FormComponent;

    private scenarioService = inject(ScenarioService);
    private renderer = inject(Renderer2);
    private alertService = inject(AlertService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    // @HostListener('document:mousedown   ', ['$event'])
    // onMouseDown(e: MouseEvent): void {
    //     this.unShowConextMenu();
    // }

    ngAfterViewInit() {
        setTimeout(() => {
            this.initDrawingBoard();
        }, 10);
    }

    private initDrawingBoard() {
        this.initDrawFlow();
        this.addEditorEvents();
        this.loadCurrentDrawflow();
    }

    private initDrawFlow() {
        if (typeof document !== 'undefined') {
            const drawFlowHtmlElement = document.getElementById('drawflow');
            this.editor = new Drawflowoverride(
                drawFlowHtmlElement as HTMLElement,
            );

            const container = document.getElementById('drawflow');
            const _this = this;

            if (container) {
                container.addEventListener('dblclick', function (e: any) {
                    e.preventDefault();
                    e.stopPropagation();

                    const closestNode = e.target.closest('.drawflow-node');

                    if (closestNode) {
                        const nodeId = closestNode.id.split('node-')[1];
                        _this.showModalEdit(
                            'node',
                            undefined,
                            _this.editor.getNodeFromId(nodeId),
                        );
                    }
                });
            }
            this.editor.reroute = false;
            this.editor.curvature = 1;
            this.editor.force_first_input = true;
            this.editor.zoom = this.flowZoom;

            this.editor.start();
            this.editor.zoom_refresh();
        }
    }

    private updateInputPorts() {
        const module = this.editor.module;
        const nodes = this.editor.drawflow.drawflow[module].data;

        Object.values(nodes).forEach((node) => {
            const nodeElement = document.getElementById('node-' + node.id);
            if (!nodeElement) return;

            Object.keys(node.inputs).forEach((inputName) => {
                const input = node.inputs[inputName];

                const portEl = nodeElement.querySelector(`.input.${inputName}`);
                if (!portEl) return;

                // DEFAULT STATE
                if (input.connections.length === 0) {
                    portEl.classList.add('disabled');
                } else {
                    portEl.classList.remove('disabled');
                }
            });
        });
    }

    private addEditorEvents() {
        this.editor.on('import', (data: any) => {
            setTimeout(() => this.updateInputPorts(), 0);
        });

        this.editor.on('moduleChanged', () => {
            setTimeout(() => this.updateInputPorts(), 0);
        });

        this.editor.on('nodeCreated', (data: any) => {
            console.log('Drawflow event: nodeCreated');
            this.toastService.info('Drawflow event: nodeCreated');
            this.saveCurrentDrawflow();

            setTimeout(() => this.updateInputPorts(), 0);
        });

        this.editor.on('nodeDataChanged', (data: any) => {
            console.log('Drawflow event: nodeDataChanged');
            this.saveCurrentDrawflow();
        });

        this.editor.on('nodeRemoved', (data: any) => {
            console.log('Drawflow event: nodeRemoved');
            this.toastService.info('Drawflow event: nodeRemoved');
            this.saveCurrentDrawflow();
        });

        this.editor.on('connectionCreated', (connection: any) => {
            console.log('Drawflow event: connectionCreated');
            this.toastService.info('Drawflow event: connectionCreated');

            connection = {
                input_node: connection.input_id,
                input_port: connection.input_class,
                output_node: connection.output_id,
                output_port: connection.output_class,
            };
            this.connectionCreated(connection);

            this.updateInputPorts();
        });

        this.editor.on('connectionRemoved', (connection: any) => {
            console.log('Drawflow event: connectionRemoved');
            this.toastService.info('Drawflow event: connectionRemoved');
            this.saveCurrentDrawflow();

            setTimeout(() => this.updateInputPorts(), 0);
        });

        this.editor.on('connectionSelected', (connection: any) => {});

        this.editor.on('zoom', (data: any) => {
            console.log('zoom', data);
            this.saveCurrentDrawflow();
        });

        this.editor.on('contextmenu', (e: any) => {
            this.unShowConextMenu();

            e.preventDefault;
            e.stopPropagation;

            const closestNode = e.target.closest('.drawflow-node');
            const closestEdge = e.target.closest('.main-path');

            if (closestNode) {
                this.showConextMenu(
                    e.clientX,
                    e.clientY,
                    closestNode
                        ? closestNode.id.split('node-')[1]
                        : closestEdge.id.split('node-')[1],
                );
            }
        });

        this.editor.on('nodeMoved', (nodeId: any) => {
            this.saveCurrentDrawflow();
        });

        this.editor.on('translate', (position: any) => {
            // this.saveCurrentDrawflow();
        });

        this.renderer.listen('window', 'click', (e: any) => {
            if (
                e.target &&
                // !this.contextMenuRef.nativeElement.contains(e.target)
                !e.target.closest('#contextmenu') &&
                this.contextmenu
            ) {
                this.unShowConextMenu();
            }
        });

        this.connectionMagneticSnap();

        // addEventListener(
        //     'touchstart',
        //     (e: any) => {
        //         // this.touchStart(e);
        //     },
        //     { passive: false }
        // );
        // addEventListener('touchend', this.touchEnd, { passive: false });

        // this.listenNodeDBClick();
    }

    connectionMagneticSnap() {
        let isConnecting: boolean = false;
        let snapSource: any = null;
        let snapTarget: any = null;
        let ports_all: NodeListOf<Element>;
        let ports_in: NodeListOf<Element>;
        let ports_out: NodeListOf<Element>;

        this.editor.container.addEventListener('mousedown', (e: any) => {
            if (
                e.target.classList.contains('output')
                // ||
                // e.target.classList.contains('input')
            ) {
                isConnecting = true;
            }
        });

        this.editor.container.addEventListener('mouseup', () => {
            isConnecting = false;
            removeAllportsHighlight();

            if (snapTarget)
                getConnectionOfNode(
                    snapTarget.port.parentNode.parentNode,
                    snapTarget.port.getAttribute('class'),
                    snapSource.parentNode.parentNode,
                    snapSource.getAttribute('class'),
                );
            snapTarget = null;
        });

        this.editor.container.addEventListener('mousemove', (e) => {
            ports_all =
                this.editor.container.querySelectorAll('.output, .input');
            ports_in = this.editor.container.querySelectorAll('.input');
            ports_out = this.editor.container.querySelectorAll('.output');

            makeIputPortsHihlight(e);

            if (isConnecting) snapConnection(e);
            // else snapConnection_in(e);
        });

        const removeAllportsHighlight = () => {
            ports_all.forEach((p) => p.classList.remove('magnet-highlight'));
        };

        const makeIputPortsHihlight = (e: any) => {
            let closest: any = null;
            let minDist = Infinity;

            if (!isConnecting) {
                ports_out.forEach((port: any) => {
                    const rect = port.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    const dist = Math.hypot(
                        centerX - e.clientX,
                        centerY - e.clientY,
                    );

                    if (dist < minDist && dist < 100) {
                        // Adjust threshold for magnetic strength
                        minDist = dist;
                        closest = port;
                    }
                });

                if (closest) {
                    // You can optionally add a visual highlight
                    ports_out.forEach((p) =>
                        p.classList.remove('magnet-highlight'),
                    );
                    closest.classList.add('magnet-highlight');
                    snapSource = closest;
                } else {
                    ports_out.forEach((p) =>
                        p.classList.remove('magnet-highlight'),
                    );
                }
            } else {
                ports_in.forEach((port: any) => {
                    const rect = port.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    const dist = Math.hypot(
                        centerX - e.clientX,
                        centerY - e.clientY,
                    );

                    if (dist < minDist && dist < 100) {
                        // Adjust threshold for magnetic strength
                        minDist = dist;
                        closest = port;
                    }
                });

                if (closest) {
                    // You can optionally add a visual highlight
                    ports_in.forEach((p) =>
                        p.classList.remove('magnet-highlight'),
                    );

                    closest.classList.add('magnet-highlight');

                    // Optional: Snap the temporary SVG line to this port visually
                    // You would need to manually update the SVG path (trickier but doable)
                } else {
                    ports_in.forEach((p) =>
                        p.classList.remove('magnet-highlight'),
                    );
                }
            }
        };

        const snapConnection = (e: any) => {
            const connectionPathList = this.editor.container.querySelectorAll(
                '.connection .main-path',
            );
            const connectionPath_current =
                connectionPathList[connectionPathList.length - 1];

            if (!connectionPath_current) return;

            let closest = null;
            let minDist = Infinity;

            ports_in.forEach((port) => {
                const rect = port.getBoundingClientRect();

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                // const centerY = this.getNodePosition(rect.y, 'y') || 0;

                const dist = Math.hypot(
                    centerX - e.clientX,
                    centerY - e.clientY,
                );

                if (dist < minDist && dist < 100) {
                    minDist = dist;
                    closest = {
                        x: centerX,
                        y: centerY,
                        z: this.getNodePosition(rect.y, 'y') || 0,
                        port: port,
                    };
                }
            });

            snapTarget = closest;

            const connectionList =
                this.editor.container.querySelectorAll('.connection');
            const svg = connectionList[connectionList.length - 1];

            if (svg) {
                const svgRect = svg.getBoundingClientRect();

                // Get starting point from d attribute (M x1 y1)
                const d: any = connectionPath_current.getAttribute('d');
                const match = /M\s*(-?\d+(?:\.\d+)?)\s*(-?\d+(?:\.\d+)?)/.exec(
                    d,
                );

                if (!match) return;

                if (snapTarget) {
                    let endX = snapTarget.x - svgRect.left;
                    let endY = snapTarget.y - svgRect.top;

                    const svg_d_param = d
                        .split(' ')
                        .filter((x: string) => x.trim() != '');
                    let new_d_svg_d_param = svg_d_param.splice(
                        0,
                        svg_d_param.length - 2,
                    );

                    new_d_svg_d_param = new_d_svg_d_param.join(' ');

                    endX = this.getNodePosition(snapTarget.x, 'x') || 0;
                    endY = snapTarget.z + 5;

                    const newD = `${new_d_svg_d_param}  ${endX} ${endY}`;
                    connectionPath_current.setAttribute('d', newD);
                }
            }
        };

        const snapConnection_in = (e: any) => {
            const editorEl: any = document.querySelector('#drawflow');
            let previewPath: any = null;
            const SNAP_RADIUS = 50; // px
            const overlay: any = document.querySelector('#magnetic-overlay');

            function createPreviewPath() {
                previewPath = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'path',
                );
                previewPath.setAttribute('stroke', 'rgba(0,150,255,0.6)');
                previewPath.setAttribute('stroke-width', '2');
                previewPath.setAttribute('fill', 'none');
                overlay.appendChild(previewPath);
            }

            // Update preview line
            function updatePreview(mouseX: any, mouseY: any, targetEl: any) {
                if (!previewPath) createPreviewPath();

                const rect = targetEl.getBoundingClientRect();
                const inputX = rect.left + rect.width / 2;
                const inputY = rect.top + rect.height / 2;

                // Get coords relative to SVG
                // const svgRect = editorEl
                //     .querySelector('svg')
                const svgRect = overlay.getBoundingClientRect();
                const startX = mouseX - svgRect.left;
                const startY = mouseY - svgRect.top;
                const endX = inputX - svgRect.left;
                const endY = inputY - svgRect.top;

                const path = `M ${startX} ${startY} C ${
                    startX + 50
                } ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`;

                previewPath.setAttribute('d', path);
            }

            // Remove preview
            function removePreview() {
                if (previewPath) {
                    previewPath.remove();
                    previewPath = null;
                }
            }

            const outputs = [...editorEl.querySelectorAll('.output')];

            let nearest = null;
            let minDist = SNAP_RADIUS;

            outputs.forEach((out) => {
                const rect = out.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDist) {
                    minDist = dist;
                    nearest = out;
                }
            });

            if (nearest) {
                updatePreview(e.clientX, e.clientY, nearest);
            } else {
                removePreview();
            }
        };

        const getConnectionOfNode = (
            node_in: Element,
            portClass_in: string,
            node_out: Element,
            portClass_out: string,
        ) => {
            const nodeId_in = node_in.getAttribute('id')?.split('node-')[1];
            const portName_in = portClass_in?.split(' ')[1];
            const nodeId_out = node_out.getAttribute('id')?.split('node-')[1];
            const portName_out = portClass_out?.split(' ')[1];

            if (nodeId_in && nodeId_out) {
                let newConnection: {
                    input_port: string;
                    input_node: string;
                    output_port: string;
                    output_node: string;
                } = {
                    input_port: portName_in,
                    input_node: nodeId_in?.toString(),
                    output_port: portName_out,
                    output_node: nodeId_out,
                };

                this.editor.addConnection(
                    newConnection.output_node,
                    newConnection.input_node,
                    newConnection.output_port,
                    newConnection.input_port,
                );
            }
        };
    }

    touchStart(e: any) {
        e.preventDefault;

        // this.touchTimer = setTimeout(() => {
        //     // this.touchHolding(e);
        // }, 500);
    }

    touchEnd() {
        if (this.touchTimer) clearTimeout(this.touchTimer);
    }

    touchHolding(e: any) {
        const closestNode = e.target.closest('.drawflow-node');
        const closestEdge = e.target.closest('.main-path');

        if (closestNode || closestEdge) {
            this.showConextMenu(
                e.changedTouches[0].clientX,
                e.changedTouches[0].clientY,
                0,
            );
        }
    }

    allowDrop(ev: any) {
        ev.preventDefault();
    }

    onDrop(ev: any) {
        ev.preventDefault();

        const nodeType = ev.dataTransfer.getData('id');
        const nodeName = ev.dataTransfer.getData('node');
        // const nodeGroup = ev.dataTransfer.getData('group');

        this.showFormModal_node.emit({
            title: `${nodeName}`,
            action: { fn: 'submitFormData', label: 'Save' },
            editMode: false,
            node: {
                type: nodeType,
                name: nodeName,
                position: {
                    x: ev.clientX,
                    y: ev.clientY,
                },
            },
        });
    }

    loadCurrentDrawflow() {
        let CURRENT_DRAWFLOW = this.scenarioService.restoreDrawflow_Storage();

        if (CURRENT_DRAWFLOW) {
            const dataToImport = {
                drawflow: {
                    Home: {
                        data: CURRENT_DRAWFLOW,
                    },
                },
            };
            this.editor.import(dataToImport);
            this.setBusColorFlows(CURRENT_DRAWFLOW);
        }
    }

    setBusColorFlows(drawflowData: any) {
        Object.values(drawflowData).forEach((element: any) => {
            if (element.class == 'bus' && element.data.flowsColor)
                this.setBusFlowsColor(element.id, element.data.flowsColor);
        });
    }

    saveCurrentDrawflow() {
        const CURRENT_DRAWFLOW = this.editor.export().drawflow.Home.data;
        this.scenarioService.saveDrawflow_Storage(CURRENT_DRAWFLOW);
    }

    getNodePosition(position: number, type: 'x' | 'y') {
        if (type == 'x')
            return (
                position *
                    (this.editor.precanvas.clientWidth /
                        (this.editor.precanvas.clientWidth *
                            this.editor.zoom)) -
                this.editor.precanvas.getBoundingClientRect().x *
                    (this.editor.precanvas.clientWidth /
                        (this.editor.precanvas.clientWidth * this.editor.zoom))
            );
        else if (type == 'y')
            return (
                position *
                    (this.editor.precanvas.clientHeight /
                        (this.editor.precanvas.clientHeight *
                            this.editor.zoom)) -
                this.editor.precanvas.getBoundingClientRect().y *
                    (this.editor.precanvas.clientHeight /
                        (this.editor.precanvas.clientHeight * this.editor.zoom))
            );
        else return false;
    }

    addNodeToDrawFlow(
        id: string,
        name: string,
        pos_x: any,
        pos_y: any,
        nodeInputs: any,
        nodeOutputs: any,
        data?: any,
    ) {
        this.createNodeObject(
            id,
            name,
            nodeInputs,
            nodeOutputs,
            data,
            pos_x,
            pos_y,
        );
    }

    createNodeObject(
        nodeId: string,
        nodeName: string,
        connectionInputs: any,
        connectionOutputs: any,
        nodeData: any = {},
        pos_x: any,
        pos_y: any,
    ) {
        const source_html = `
            <div class="box" ${this.ASSET_TYPE_NAME}="${nodeName}"></div>

            <div class="drawflow-node__name nodeName">
                <span>
                ${nodeName}
                </span>
            </div>

            <div class="img"></div>
        `;

        this.editor.addNode(
            nodeName,
            connectionInputs,
            connectionOutputs,
            pos_x,
            pos_y,
            nodeId,
            nodeData,
            source_html,
            false,
        );
    }

    addNode(node: any) {
        this.addNodeToDrawFlow(
            node.id,
            node.name,
            node.position.x,
            node.position.y,
            node.inp,
            node.out,
            node.data,
        );
    }

    updateNode(nodeId: number, nodeType: string, data: any) {
        let currentNode = this.editor.drawflow.drawflow.Home.data[nodeId];

        currentNode.name = data.name;
        currentNode.html = `
            <div class="box" ${this.ASSET_TYPE_NAME}=" ${data.name}"></div>

            <div class="drawflow-node__name nodeName">
                <span>
                    ${currentNode.name}
                </span>
            </div>

            <div class="img"></div>
        `;
        this.editor.updateNodeDataFromId(nodeId, data);

        if (nodeType === 'transformer') {
            // remove/reorder port if it changed
            this.updatePortsAfterEdit({ ...currentNode }, data);
        }

        this.editor.dispatch('nodeDataChanged', nodeId);
        this.editor.import(this.editor.export());
        this.setBusColorFlows(this.editor.export().drawflow.Home.data);
    }

    updatePortsAfterEdit(currentNode: any, changedData: any) {
        currentNode.inputs = Object.entries(currentNode.inputs).map(
            ([name]) => ({ name }),
        );
        currentNode.outputs = Object.entries(currentNode.outputs).map(
            ([name]) => ({ name }),
        );

        const syncPorts = (original: any, modified: any, isInput: boolean) => {
            const originalIds = new Set(original.map((item: any) => item.name));
            const modifiedIds = new Set(modified.map((item: any) => item.code));

            // Find removed item(s)
            const removed = original
                .filter((item: any) => !modifiedIds.has(item.name))
                .map((obj: any) => obj.name);

            // Find added item(s)
            const added = modified
                .filter((item: any) => !originalIds.has(item.code))
                .map((obj: any) => obj.code);

            // Add new items
            for (const item of added) {
                isInput
                    ? this.editor.addNodeInput(currentNode.id)
                    : this.editor.addNodeOutput(currentNode.id);
            }

            // Add new items
            for (const item of removed) {
                isInput
                    ? this.editor.removeNodeInput(currentNode.id, item)
                    : this.editor.removeNodeOutput(currentNode.id, item);
            }
        };

        syncPorts(currentNode.inputs, changedData.ports.inputs, true);
        syncPorts(currentNode.outputs, changedData.ports.outputs, false);
    }

    connectionCreated(connection: {
        output_node: string;
        input_node: string;
        output_port: string;
        input_port: string;
    }) {
        var nodeIn = this.editor.getNodeFromId(connection.input_node);
        var nodeOut = this.editor.getNodeFromId(connection.output_node);
        let followRules = this.checkRules(connection, nodeIn, nodeOut);
        const node = nodeIn.class != 'bus' ? nodeIn : nodeOut;

        if (followRules) {
            this.showFormModal_flow.emit({
                id: node.class.toLocaleLowerCase(),
                title: `Flow(${nodeOut.name}:${nodeIn.name})`,
                action: { fn: 'submitFormData', label: 'save' },
                editMode: false,
                data: node.data,
                node: node,
                connection: connection,
            });
        } else {
            this.removeSingleConnection(connection);
        }
    }

    checkRules(connection: any, nodeIn: any, nodeOut: any) {
        let rule_1 = this.isConnectionThroughBus(nodeIn, nodeOut);

        if (rule_1) {
            let rule_3 = this.hasSingleConnection(connection, nodeIn, nodeOut);

            if (rule_3) {
                return true;
            } else {
                this.alertService.error(
                    'More than 1 connection per port is not allowed.',
                    'Unexpected Connection',
                );

                return false;
            }
        } else {
            this.alertService.error(
                'Please connect assets to each other\n only through a bus node. Interconnecting busses is also not allowed.',
                'Unexpected Connection',
            );

            return false;
        }
    }

    // rule #1
    isConnectionThroughBus(nodeIn: DrawflowNode, nodeOut: DrawflowNode) {
        return nodeIn['class'] === 'bus' || nodeOut['class'] === 'bus'
            ? true
            : false;
    }

    // rule #3
    hasSingleConnection(
        connection: any,
        nodeIn: DrawflowNode,
        nodeOut: DrawflowNode,
    ) {
        // rule #5 - exception for bus
        if (nodeIn['class'] === 'bus' && nodeOut['class'] === 'bus')
            return true;
        else {
            const inputConnections =
                nodeIn.inputs[connection.input_port].connections;
            const outputConnections =
                nodeOut.outputs[connection.output_port].connections;

            return (
                (nodeIn['class'] !== 'bus' && inputConnections.length <= 1
                    ? true
                    : false) ||
                (nodeOut['class'] !== 'bus' && outputConnections.length <= 1
                    ? true
                    : false)
            );
        }
    }

    removeSingleConnection(connection: {
        output_node: string;
        input_node: string;
        output_port: string;
        input_port: string;
    }) {
        this.editor.removeSingleConnection(
            connection['output_node'],
            connection['input_node'],
            connection['output_port'],
            connection['input_port'],
        );
    }

    investFieldsToggleVisible() {}

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    _showFormModalNode(nodeId: number, x: number, y: number) {
        this.showConextMenu(x, y, nodeId);
    }

    _showFormModal_edge(nodeId: number, x: number, y: number) {
        this.showConextMenu(x, y, nodeId);
    }

    _toggleFullScreen() {
        this.toggleFullScreen.emit();
    }

    showModalEdit(
        type: 'node' | 'flow',
        connection?: {
            source: { node: any; port: any };
            destination: { node: any; port: any };
        },
        node?: DrawflowNode,
    ) {
        if (this.contextmenu != null) {
            const selectedNode = this.editor.getNodeFromId(
                this.contextmenu.nodeId,
            );

            if (type == 'node') {
                if (selectedNode)
                    this.showFormModal_node.emit({
                        node: selectedNode,
                        id: selectedNode.class.toLocaleLowerCase(),
                        title: `Edit: ${selectedNode.name}`,
                        action: { fn: 'submitFormData', label: 'Update' },
                        editMode: true,
                        data: selectedNode.data,
                        _id: +this.contextmenu.nodeId,
                    });

                this.unShowConextMenu();
            } else if (type == 'flow' && connection) {
                let portIndex;
                let selectedConnectionData!: { baseInfo: any; formInfo: any };
                let connectionDataList = undefined;

                // clicked node isn't a bus
                if (selectedNode.class !== 'bus') {
                    const nodeConnections = selectedNode.data['connections'];
                    connectionDataList =
                        connection.source.node.class === 'bus'
                            ? nodeConnections['inputs']
                            : nodeConnections['outputs'];

                    portIndex =
                        connection.destination.node.class !== 'bus'
                            ? connectionDataList.findIndex(
                                  (conn: any) =>
                                      conn.baseInfo.output_node ==
                                      connection.source.node.id,
                              )
                            : connectionDataList.findIndex(
                                  (conn: any) =>
                                      conn.baseInfo.input_node ==
                                      connection.destination.node.id,
                              );
                } else {
                    const nodeConnections =
                        connection.destination.node.class !== 'bus'
                            ? connection.destination.node.data['connections']
                            : connection.source.node.data['connections'];

                    connectionDataList =
                        connection.destination.node.class !== 'bus'
                            ? nodeConnections['inputs']
                            : nodeConnections['outputs'];

                    portIndex = connectionDataList.findIndex(
                        (conn: any) =>
                            conn.baseInfo.input_node ==
                                connection.destination.node.id &&
                            conn.baseInfo.input_port ==
                                connection.destination.port.code &&
                            conn.baseInfo.output_node ==
                                connection.source.node.id &&
                            conn.baseInfo.output_port ==
                                connection.source.port.code,
                    );
                }

                selectedConnectionData = connectionDataList[portIndex];
                let _node;

                if (selectedNode.class !== 'bus') _node = selectedNode;
                else if (
                    selectedNode.class === 'bus' &&
                    connection.destination.node.class === 'bus'
                ) {
                    _node = connection.source.node;
                } else _node = connection.destination.node;

                this.showFormModal_flow.emit({
                    id: selectedNode.class.toLocaleLowerCase(),
                    title: `Flow(${connection.source.port.name}:${connection.destination.port.name})`,
                    action: { fn: 'submitFormData', label: 'save' },
                    editMode: true,
                    data: selectedConnectionData.formInfo,
                    node: _node,
                    connection: selectedConnectionData.baseInfo,
                });

                this.unShowConextMenu();
            }
        } else if (type == 'node' && node) {
            this.showFormModal_node.emit({
                id: node.class.toLocaleLowerCase(),
                node: node,
                title: `Edit: ${node.name}`,
                action: { fn: 'submitFormData', label: 'Update' },
                editMode: true,
                data: node.data,
                _id: node.id,
            });
        }
    }

    async deleteSelectedNode() {
        if (this.contextmenu != null && this.contextmenu.nodeId) {
            const node: DrawflowNode = this.editor.getNodeFromId(
                this.contextmenu.nodeId,
            );
            this.unShowConextMenu();

            const confirmed = await this.alertService.confirm(
                `Removing node: ${node.name}`,
            );

            if (confirmed) {
                if (node.class != 'bus') {
                    // remove all it's related conns from bus
                    for (const key in node.inputs) {
                        if (!Object.hasOwn(node.inputs, key)) continue;

                        for (const portName in node.inputs) {
                            if (!Object.hasOwn(node.inputs, portName)) continue;

                            node.inputs[portName].connections.forEach(
                                (connection: any) => {
                                    this.deleteConnectionData({
                                        input_node: node.id,
                                        input_port: portName,
                                        output_node: connection.node,
                                        output_port: connection.output,
                                    });
                                },
                            );
                        }
                    }

                    for (const key in node.outputs) {
                        if (!Object.hasOwn(node.outputs, key)) continue;

                        for (const portName in node.outputs) {
                            if (!Object.hasOwn(node.outputs, portName))
                                continue;
                            // connections
                            // const element = node.outputs[key];
                            node.outputs[portName].connections.forEach(
                                (connection: any) => {
                                    this.deleteConnectionData({
                                        input_node: connection.node,
                                        input_port: connection.output,
                                        output_node: node.id,
                                        output_port: portName,
                                    });
                                },
                            );
                        }
                    }
                } else {
                    node.inputs['input_1'].connections.forEach(
                        (el_bus: { input: string; node: string }) => {
                            // remove connection data in node.data
                            const nodeOut: DrawflowNode =
                                this.editor.drawflow.drawflow.Home.data[
                                    +el_bus.node
                                ];

                            nodeOut.data.connections.outputs.forEach(
                                (el_node: any, i: number) => {
                                    if (
                                        el_node.baseInfo.output_node ===
                                            el_bus.node &&
                                        el_node.baseInfo.output_port ===
                                            el_bus.input
                                    ) {
                                        nodeOut.data.connections.outputs.splice(
                                            i,
                                        );
                                    }
                                },
                            );
                        },
                    );
                }

                this.editor.removeNodeId(`node-${node.id}`);
                this.saveCurrentDrawflow();
                this.toastService.info(
                    `Node: ${node.name} deleted successfully!`,
                );
            }
        }
    }

    // R-Click event , Touching events
    private buildInputConnections(node: any): any[] {
        const result: any[] = [];

        node.data.ports.inputs?.forEach((input: any) => {
            node.inputs[input.code]?.connections.forEach((conn: any) => {
                const source = this.editor.getNodeFromId(conn.node);

                result.push({
                    source: {
                        node: source,
                        port: source.data.ports.outputs.find(
                            (p: any) => p.code === conn.input,
                        ),
                    },
                    destination: {
                        node,
                        port: input,
                    },
                });
            });
        });

        return result;
    }

    private buildOutputConnections(node: any): any[] {
        const result: any[] = [];

        node.data.ports.outputs?.forEach((output: any) => {
            node.outputs[output.code]?.connections.forEach((conn: any) => {
                const dest = this.editor.getNodeFromId(conn.node);

                result.push({
                    source: {
                        node,
                        port: output,
                    },
                    destination: {
                        node: dest,
                        port: dest.data.ports.inputs.find(
                            (p: any) => p.code === conn.output,
                        ),
                    },
                });
            });
        });

        return result;
    }

    showConextMenu(x: any, y: any, nodeId: number) {
        const MENU_WIDTH = 160;
        const ACTIONS_WIDTH = 180;

        const direction: 'left' | 'right' =
            x + MENU_WIDTH + ACTIONS_WIDTH > window.innerWidth
                ? 'left'
                : 'right';

        const currentNode = this.editor.getNodeFromId(nodeId);

        const nodeConnections_in = this.buildInputConnections(currentNode);
        const nodeConnections_out = this.buildOutputConnections(currentNode);

        this.contextmenu = {
            show: true,
            x: direction === 'left' ? x - MENU_WIDTH : x,
            y,
            direction,
            nodeId,
            nodeClass: currentNode.class,
            nodePorts: currentNode.data.ports,
            nodeConnections: {
                in: nodeConnections_in,
                out: nodeConnections_out,
            },
            nodeFlowsColor: currentNode.data.flowsColor ?? '#000000',
        };

        this.cdr.detectChanges();
    }

    unShowConextMenu() {
        this.contextmenu = null;
        this.cdr.detectChanges();
    }

    listenNodeDBClick() {
        document.addEventListener('dblclick', (e: any) => {
            const closestNode = e.target.closest('.drawflow-node');
            const closestEdge = e.target.closest('.main-path');

            // event.target.closest('.drawflow_content_node') != null ||
            //     event.target.classList[0] === 'drawflow-node' ||
            //     event.target.classList[0] === 'main-path'

            if (closestNode) {
                // const nodeType = closestNode
                //     .querySelector('.box')
                //     .getAttribute('asset_type_name');

                this.selected_nodeId = closestNode.id.split('node-')[1];
                this._showFormModalNode(
                    this.selected_nodeId,
                    e.clientX,
                    e.clientY,
                );
            }

            if (closestEdge) {
                this._showFormModal_edge(
                    this.selected_nodeId,
                    e.clientX,
                    e.clientY,
                );
            }
        });
    }

    checkNodeDuplication(nodeName: string, nodeId: number) {
        const currentNodeList = this.editor.drawflow.drawflow.Home.data;

        if (currentNodeList && JSON.stringify(currentNodeList) !== '{}') {
            for (const key in currentNodeList) {
                if (
                    Object.prototype.hasOwnProperty.call(currentNodeList, key)
                ) {
                    const node = currentNodeList[key];

                    if (node.id != nodeId || !nodeId)
                        if (
                            node.name === nodeName ||
                            node.data.name === nodeName
                        )
                            return true;
                }
            }
        }

        return false;
    }

    async clearGridModel() {
        const confirmed = await this.alertService.confirm(
            'This will clear the whole grid model! This will not actually delete any asset from the scenario. You will need to save after clearing for the changes to actually take effect.',
            undefined,
            'Yes, clear everything!',
            undefined,
            'warning',
        );

        if (confirmed) {
            this.editor.clearModuleSelected();
            this.editor.nodeId = 1;
            this.scenarioService.removeDrawflow_Storage();
            this.toastService.info(`Cleaned the grid model successfully!`);
        }
    }

    // flow
    saveConnectionInNode(connection: any, editMode: boolean, data: any) {
        let node, connections;

        if (
            this.editor.drawflow.drawflow.Home.data[connection.output_node]
                .class !== 'bus'
        ) {
            node =
                this.editor.drawflow.drawflow.Home.data[connection.output_node];
            connections = node.data.connections.outputs;
        } else {
            node =
                this.editor.drawflow.drawflow.Home.data[connection.input_node];
            connections = node.data.connections.inputs;
        }

        if (!editMode) {
            connections.push({
                baseInfo: connection,
                formInfo: data,
            });
        } else {
            const index = connections.findIndex(
                (conn: any) =>
                    (conn.baseInfo.input_node == node.id &&
                        conn.baseInfo.output_node == connection.output_node) ||
                    (conn.baseInfo.output_node == node.id &&
                        conn.baseInfo.input_node == connection.input_node),
            );

            connections[index].formInfo = data;
        }

        this.saveCurrentDrawflow();
    }

    async deleteFlow(
        node_source: {
            node: { id: number; name: string };
            port: { id: number; name: string; code: string };
        },
        node_destination: {
            node: { id: number; name: string };
            port: { id: number; name: string; code: string };
        },
    ) {
        this.unShowConextMenu();

        const confirmed = await this.alertService.confirm(
            `Removing connection from ${node_source.node.name} to ${node_destination.node.name}`,
            undefined,
            'Yes!',
            undefined,
            'warning',
        );

        if (confirmed) {
            this.editor.removeSingleConnection(
                node_source.node.id,
                node_destination.node.id,
                node_source.port.code,
                node_destination.port.code,
            );

            const currentConnection = {
                output_node: node_source.node.id,
                output_port: node_source.port.code,
                input_node: node_destination.node.id,
                input_port: node_destination.port.code,
            };

            this.deleteConnectionData(currentConnection);
            this.saveCurrentDrawflow();
        }
    }

    deleteConnectionData(connection: {
        output_node: number;
        output_port: string;
        input_node: number;
        input_port: string;
    }) {
        let connectionList;
        let source:
            | {
                  id: number;
                  port: string;
              }
            | undefined;
        let destination:
            | {
                  id: number;
                  port: string;
              }
            | undefined;
        let busNode: any;

        if (
            this.editor.drawflow.drawflow.Home.data[connection.input_node]
                .class === 'bus'
        ) {
            busNode =
                this.editor.drawflow.drawflow.Home.data[connection.input_node];

            source = {
                id: connection.output_node,
                port: connection.output_port,
            };
            destination = {
                id: connection.input_node,
                port: connection.input_port,
            };
        } else if (
            this.editor.drawflow.drawflow.Home.data[connection.output_node]
                .class === 'bus'
        ) {
            busNode =
                this.editor.drawflow.drawflow.Home.data[connection.output_node];

            source = {
                id: connection.output_node,
                port: connection.output_port,
            };
            destination = {
                id: connection.input_node,
                port: connection.input_port,
            };
        }

        connectionList = busNode.data['connections'];

        let index = -1;

        if (destination && busNode.id == destination.id) {
            index = connectionList['inputs'].findIndex(
                (conn: any) =>
                    conn.baseInfo.input_node == busNode.id &&
                    conn.baseInfo.output_node == connection.output_node &&
                    conn.baseInfo.output_port == connection.output_port,
            );

            connectionList['inputs'].splice(index, 1);
        } else if (source && busNode.id == source.id) {
            index = connectionList['outputs'].findIndex(
                (conn: any) =>
                    conn.baseInfo.output_node == busNode.id &&
                    conn.baseInfo.input_node == connection.input_node &&
                    conn.baseInfo.input_port == connection.input_port,
            );
            connectionList['outputs'].splice(index, 1);
        }
    }

    getData() {
        const drawflowData = this.editor.export().drawflow.Home.data;
        return drawflowData;
    }

    onChangeBusFlowsColor(e: any) {
        const currentNode = this.editor.getNodeFromId(this.contextmenu!.nodeId);
        currentNode.data.flowsColor = e.value;
        this.updateNode(this.contextmenu!.nodeId, 'bus', currentNode.data);
        this.setBusFlowsColor(this.contextmenu!.nodeId, e.value);
    }

    setBusFlowsColor(nodeId: number, color: string) {
        const connections = document.querySelectorAll(
            `#drawflow .connection.node_out_node-${nodeId} path , #drawflow .connection.node_in_node-${nodeId} path`,
        );

        connections.forEach((connection: Element) => {
            (connection as HTMLElement).style.stroke = color;
        });
    }
}

class Drawflowoverride extends Drawflow {
    removeConnection(e: any) {}
}

//  onTouchEnd(nodeId: number, nodeName: string, nodeGroup: string, pos: any) {
//         // this.currentPosition = {
//         //     x: this.getNodePosition(pos.x, 'x'),
//         //     y: this.getNodePosition(pos.y, 'y'),
//         // };
//         // this.currentNode = {
//         //     nodeId,
//         //     nodeName,
//         //     nodeGroup,
//         // };
//         // this.showFormModal.emit({
//         //     node: {
//         //         id: nodeId,
//         //         name: nodeName,
//         //         group: nodeGroup,
//         //         x: pos.x,
//         //         y: pos.y,
//         //     },
//         //     editMode: false,
//         // });
//     }
