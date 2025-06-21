import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import Drawflow, { DrawflowNode } from 'drawflow';
import Swal from 'sweetalert2';
import { ScenarioService } from '../../services/scenario.service';
import { FormComponent } from '../form/form.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-energy-drawflow',
    imports: [CommonModule],
    templateUrl: './energy-drawflow.component.html',
    styleUrl: './energy-drawflow.component.scss',
})
export class EnergyDrawflowComponent {
    editor!: Drawflow;
    flowZoom: number = 1.9;
    // currentNode: any;
    // currentPosition: any;

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

    contextmenu!: {
        nodeId: number;
        nodePorts: { inputs: any; outputs: any };
        nodeConnections: { in: any; out: any };
    } | null;

    @ViewChild(ModalComponent)
    modalComponent: ModalComponent = {} as ModalComponent;

    @Output('_drop') drop: EventEmitter<any> = new EventEmitter();
    @Output('showFormModal') showFormModal = new EventEmitter();
    @Output() toggleFullScreen: EventEmitter<any> = new EventEmitter();
    @Output('touchEnd') _touchEnd: EventEmitter<any> = new EventEmitter();

    @ViewChild(FormComponent) formComponent!: FormComponent;
    @ViewChild('contextMenu') contextMenuRef!: ElementRef<HTMLDivElement>;

    constructor(
        private scenarioService: ScenarioService,
        private renderer: Renderer2
    ) {}

    ngOnInit() {
        //this.showModalConnection();
    }

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
            // this.editor = new Drawflow(drawFlowHtmlElement as HTMLElement);
            this.editor = new Drawflowoverride(
                drawFlowHtmlElement as HTMLElement
            );

            this.editor.reroute = false;
            this.editor.curvature = 1;
            this.editor.force_first_input = true;
            this.editor.zoom = this.flowZoom;

            this.editor.start();
            this.editor.zoom_refresh();
        }
    }

    private addEditorEvents() {
        this.editor.on('nodeCreated', (data: any) => {
            console.log('Drawflow event: nodeCreated');
            this.saveCurrentDrawflow();
        });
        this.editor.on('nodeDataChanged', (data: any) => {
            console.log('Drawflow event: nodeDataChanged');
            this.saveCurrentDrawflow();
        });
        this.editor.on('nodeRemoved', (data: any) => {
            console.log('Drawflow event: nodeRemoved');
            this.saveCurrentDrawflow();
        });

        this.editor.on('connectionCreated', (connection: any) => {
            console.log('Drawflow event: connectionCreated');
            this.connectionCreated(connection);
        });
        this.editor.on('connectionRemoved', (connection: any) => {
            console.log('Drawflow event: connectionRemoved');
            this.saveCurrentDrawflow();
        });
        this.editor.on('connectionSelected', (connection: any) => {
            console.log('Drawflow event: connectionSelected');

            // this.currentConnection = connection;

            // const inputs = this.editor.getNodeFromId(connection.input_id);
            // const outputs = this.editor.getNodeFromId(connection.output_id);

            if (document.activeElement !== this.editor.container) {
                this.editor.container.focus();
            }
        });

        this.editor.on('zoom', (data: any) => {
            this.saveCurrentDrawflow();
        });

        this.editor.on('contextmenu', (e: any) => {
            this.unShowConextMenu();

            e.preventDefault;
            const closestNode = e.target.closest('.drawflow-node');
            const closestEdge = e.target.closest('.main-path');

            // if (closestNode || closestEdge) {
            if (closestNode) {
                this.showConextMenu(
                    e.clientX,
                    e.clientY,
                    closestNode
                        ? closestNode.id.split('node-')[1]
                        : closestEdge.id.split('node-')[1]
                );
            }
        });

        this.editor.on('click', (event: any) => {
            this.unShowConextMenu();
        });

        this.renderer.listen('window', 'click', (e: any) => {
            if (
                e.target &&
                !this.contextMenuRef.nativeElement.contains(e.target)
            ) {
                this.unShowConextMenu();
            }
        });

        this.editor.on('nodeMoved', (nodeId: any) => {
            this.saveCurrentDrawflow();
        });

        this.editor.on('translate', (position: any) => {
            // this.saveCurrentDrawflow();
        });

        addEventListener(
            'touchstart',
            (e: any) => {
                this.touchStart(e);
            },
            { passive: false }
        );
        addEventListener('touchend', this.touchEnd, { passive: false });

        // this.listenNodeDBClick();
        this.connectionMagneticSnap();
    }

    connectionMagneticSnap() {
        let isConnecting: boolean = false;
        let snapTarget: any = null;
        let ports_all: NodeListOf<Element>;
        let ports_in: NodeListOf<Element>;
        let ports_out: NodeListOf<Element>;

        this.editor.container.addEventListener('mousedown', (e: any) => {
            if (
                e.target.classList.contains('output') ||
                e.target.classList.contains('input')
            ) {
                isConnecting = true;
            }
        });
        this.editor.container.addEventListener('mouseup', () => {
            isConnecting = false;
            removeAllportsHighlight();
            snapTarget = null;
        });
        this.editor.container.addEventListener('mousemove', (e) => {
            ports_all =
                this.editor.container.querySelectorAll('.output, .input');
            ports_in = this.editor.container.querySelectorAll('.input');
            ports_out = this.editor.container.querySelectorAll('.output');

            makeIputPortsHihlight(e);

            if (isConnecting) snapConnection(e);
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
                        centerY - e.clientY
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
                        p.classList.remove('magnet-highlight')
                    );
                    closest.classList.add('magnet-highlight');

                    // Optional: Snap the temporary SVG line to this port visually
                    // You would need to manually update the SVG path (trickier but doable)
                } else {
                    ports_out.forEach((p) =>
                        p.classList.remove('magnet-highlight')
                    );
                }
            } else {
                ports_in.forEach((port: any) => {
                    const rect = port.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    const dist = Math.hypot(
                        centerX - e.clientX,
                        centerY - e.clientY
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
                        p.classList.remove('magnet-highlight')
                    );
                    closest.classList.add('magnet-highlight');

                    // Optional: Snap the temporary SVG line to this port visually
                    // You would need to manually update the SVG path (trickier but doable)
                } else {
                    ports_in.forEach((p) =>
                        p.classList.remove('magnet-highlight')
                    );
                }
            }
        };

        const snapConnection = (e: any) => {
            const connectionPathList = this.editor.container.querySelectorAll(
                '.connection .main-path'
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
                    centerY - e.clientY
                );

                if (dist < minDist && dist < 100) {
                    minDist = dist;
                    closest = {
                        x: centerX,
                        y: centerY,
                        z: this.getNodePosition(rect.y, 'y') || 0,
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
                    d
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
                        svg_d_param.length - 2
                    );

                    new_d_svg_d_param = new_d_svg_d_param.join(' ');

                    endX = this.getNodePosition(snapTarget.x, 'x') || 0;
                    endY = snapTarget.z + 5;
                    const newD = `${new_d_svg_d_param}  ${endX} ${endY}`;
                    connectionPath_current.setAttribute('d', newD);
                }
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
                0
            );
        }
    }

    allowDrop(ev: any) {
        ev.preventDefault();
    }

    onDrop(ev: any) {
        ev.preventDefault();

        const nodeId = ev.dataTransfer.getData('id');
        const nodeName = ev.dataTransfer.getData('node');
        const nodeGroup = ev.dataTransfer.getData('group');

        this.showFormModal.emit({
            type: 'node',
            id: `${nodeId}`,
            title: `${nodeName}`,
            action: { fn: 'submitFormData', label: 'Save' },
            editMode: false,
            data: {
                node: {
                    groupName: nodeGroup,
                    position: {
                        x: ev.clientX,
                        y: ev.clientY,
                    },
                },
            },
        });
    }

    onTouchEnd(nodeId: number, nodeName: string, nodeGroup: string, pos: any) {
        // this.currentPosition = {
        //     x: this.getNodePosition(pos.x, 'x'),
        //     y: this.getNodePosition(pos.y, 'y'),
        // };
        // this.currentNode = {
        //     nodeId,
        //     nodeName,
        //     nodeGroup,
        // };
        // this.showFormModal.emit({
        //     node: {
        //         id: nodeId,
        //         name: nodeName,
        //         group: nodeGroup,
        //         x: pos.x,
        //         y: pos.y,
        //     },
        //     editMode: false,
        // });
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
        }
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
        data?: any
    ) {
        this.createNodeObject(
            id,
            name,
            nodeInputs,
            nodeOutputs,
            data,
            pos_x,
            pos_y
        );
    }

    createNodeObject(
        nodeId: string,
        nodeName: string,
        connectionInputs: any,
        connectionOutputs: any,
        nodeData: any = {},
        pos_x: any,
        pos_y: any
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
            false
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
            node.data
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
    }

    updatePortsAfterEdit(currentNode: any, changedData: any) {
        currentNode.inputs = Object.entries(currentNode.inputs).map(
            ([name]) => ({ name })
        );
        currentNode.outputs = Object.entries(currentNode.outputs).map(
            ([name]) => ({ name })
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

    connectionCreated(connection: any) {
        var nodeIn = this.editor.getNodeFromId(connection['input_id']);
        var nodeOut = this.editor.getNodeFromId(connection['output_id']);
        let followRules = this.checkRules(connection, nodeIn, nodeOut);

        if (followRules) {
            this.showFormModal.emit({
                type: 'flow',
                id: '_flow',
                title: `Flow(${nodeOut.name}:${nodeIn.name})`,
                action: { fn: 'submitFormData', label: 'save' },
                editMode: false,
                data: {
                    connection: connection,
                },
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
                Swal.fire(
                    'Unexpected Connection',
                    'More than 1 connection per port is not allowed.',
                    'error'
                );

                return false;
            }
        } else {
            Swal.fire(
                'Unexpected Connection',
                'Please connect assets to each other\n only through a bus node. Interconnecting busses is also not allowed.',
                'error'
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
        nodeOut: DrawflowNode
    ) {
        // rule #5 - exception for bus
        if (nodeIn['class'] === 'bus' && nodeOut['class'] === 'bus')
            return true;
        else {
            const inputConnections =
                nodeIn.inputs[connection.input_class].connections;
            const outputConnections =
                nodeOut.outputs[connection.output_class].connections;

            return (
                (nodeIn['class'] !== 'bus' && inputConnections.length == 1
                    ? true
                    : false) ||
                (nodeOut['class'] !== 'bus' && outputConnections.length == 1
                    ? true
                    : false)
            );
        }
    }

    removeSingleConnection(connection: {
        output_id: string;
        input_id: string;
        output_class: string;
        input_class: string;
    }) {
        this.editor.removeSingleConnection(
            connection['output_id'],
            connection['input_id'],
            connection['output_class'],
            connection['input_class']
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
        }
    ) {
        if (type == 'node') {
            if (this.contextmenu != null) {
                const node = this.editor.getNodeFromId(this.contextmenu.nodeId);

                if (node)
                    this.showFormModal.emit({
                        type: 'node',
                        id: node.class,
                        node: node,
                        title: `Edit: ${node.name}`,
                        action: { fn: 'submitFormData', label: 'Update' },
                        editMode: true,
                        data: node.data,
                        _id: this.contextmenu.nodeId,
                    });

                this.unShowConextMenu();
            }
        } else if (type == 'flow' && connection) {
            if (this.contextmenu != null) {
                var nodeConnectionIn = this.editor.getNodeFromId(
                    this.contextmenu.nodeId
                );
                const _connectionData: { baseInfo: any; formInfo: any } =
                    nodeConnectionIn.data['connections'][
                        connection.source.port.id
                    ] ||
                    nodeConnectionIn.data['connections'][
                        connection.destination.port.id
                    ];

                _connectionData.formInfo['connection'] =
                    _connectionData.baseInfo;
                this.showFormModal.emit({
                    type: 'flow',
                    id: '_flow', //`${nodeOut.id}-${nodeIn.id}`,
                    title: `Flow(${connection.source.port.name}:${connection.destination.port.name})`,
                    action: { fn: 'submitFormData', label: 'save' },
                    editMode: true,
                    data: _connectionData.formInfo,
                });

                this.unShowConextMenu();
            }
        }
    }

    deleteSelectedNode() {
        if (this.contextmenu != null && this.contextmenu.nodeId) {
            const node = this.editor.getNodeFromId(this.contextmenu.nodeId);
            this.unShowConextMenu();

            Swal.fire({
                title: `Removing node: ${node.name}`,
                text: 'Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.editor.removeNodeId(`node-${node.id}`);
                    this.saveCurrentDrawflow();
                }
            });
        }
    }

    // R-Click event , Touching events
    showConextMenu(x: any, y: any, nodeId: number) {
        this.contextMenuRef.nativeElement.style.display = 'block';
        this.contextMenuRef.nativeElement.style.left = x + 'px';
        this.contextMenuRef.nativeElement.style.top = y + 'px';

        if (nodeId) {
            const currentNode = this.editor.getNodeFromId(nodeId);
            let nodeConnections_in: any[] = [];
            let nodeConnections_out: any[] = [];

            if (currentNode.data.ports.inputs)
                currentNode.data.ports.inputs.forEach(
                    (currentNode_input: {
                        code: string;
                        id: number;
                        name: string;
                    }) => {
                        if (currentNode.inputs[currentNode_input.code])
                            currentNode.inputs[
                                currentNode_input.code
                            ].connections.forEach(
                                (input_conn: {
                                    input: string;
                                    node: string;
                                }) => {
                                    const sourceNode =
                                        this.editor.getNodeFromId(
                                            input_conn.node
                                        );

                                    nodeConnections_in.push({
                                        source: {
                                            node: {
                                                id: sourceNode.id,
                                                name: sourceNode.name,
                                            },
                                            port: {
                                                id: input_conn.input,
                                                name: sourceNode.data.ports.outputs
                                                    .filter(
                                                        (x: any) =>
                                                            x.code ===
                                                            input_conn.input
                                                    )
                                                    .map((x: any) => x.name)[0],
                                            },
                                        },
                                        destination: {
                                            node: {
                                                id: currentNode.id,
                                                name: currentNode.name,
                                            },
                                            port: {
                                                id: currentNode_input.code,
                                                name: currentNode_input.name,
                                            },
                                        },
                                    });
                                }
                            );
                    }
                );

            if (currentNode.data.ports.outputs)
                currentNode.data.ports.outputs.forEach(
                    (currentNode_output: {
                        code: string;
                        id: number;
                        name: string;
                    }) => {
                        if (currentNode.outputs[currentNode_output.code])
                            currentNode.outputs[
                                currentNode_output.code
                            ].connections.forEach((output_conn: any) => {
                                const destionationNode =
                                    this.editor.getNodeFromId(output_conn.node);

                                nodeConnections_out.push({
                                    source: {
                                        node: {
                                            id: currentNode.id,
                                            name: currentNode.name,
                                        },
                                        port: {
                                            id: currentNode_output.code,
                                            name: currentNode_output.name,
                                        },
                                    },
                                    destination: {
                                        node: {
                                            id: destionationNode.id,
                                            name: destionationNode.name,
                                        },
                                        port: {
                                            id: output_conn.output,
                                            name: destionationNode.data.ports.inputs
                                                .filter(
                                                    (x: any) =>
                                                        x.code ===
                                                        output_conn.output
                                                )
                                                .map((x: any) => x.name)[0],
                                        },
                                    },
                                });
                            });
                    }
                );

            this.contextmenu = {
                nodeId: nodeId,
                nodePorts: currentNode.data.ports,
                nodeConnections: {
                    in: nodeConnections_in,
                    out: nodeConnections_out,
                },
            };
        }
    }

    unShowConextMenu() {
        this.contextMenuRef.nativeElement.style.display = 'none';
        this.contextmenu = null;
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
                    e.clientY
                );
            }

            if (closestEdge) {
                this._showFormModal_edge(
                    this.selected_nodeId,
                    e.clientX,
                    e.clientY
                );
            }
        });
    }

    checkNodeDuplication(nodeName: string, nodeId?: number) {
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

    clearGridModel() {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will clear the whole grid model! This will not actually delete any asset from the scenario. You will need to save after clearing for the changes to actually take effect.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear everything!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                this.editor.clearModuleSelected();
                this.saveCurrentDrawflow();
            }
        });
    }

    // flow
    saveConnectionInNodes(connection: any, data: any) {
        this.editor.drawflow.drawflow.Home.data[connection.output_id].data[
            'connections'
        ] = {
            [connection.output_class]: {
                baseInfo: connection,
                formInfo: data,
            },
        };

        this.editor.drawflow.drawflow.Home.data[connection.input_id].data[
            'connections'
        ] = {
            [connection.input_class]: {
                baseInfo: connection,
                formInfo: data,
            },
        };

        this.saveCurrentDrawflow();
    }

    // saveConnectionData(connection: any, data: any) {
    //     this.editor.drawflow.drawflow.Home.data[connection.output_id].data[
    //         'connections'
    //     ] = [connection];

    //     this.editor.drawflow.drawflow.Home.data[connection.input_id].data[
    //         'connections'
    //     ] = [connection];

    //     this.saveCurrentDrawflow();
    // }

    deleteFlow(
        node_source: {
            node: { id: string; name: string };
            port: { id: string; name: string };
        },
        node_destination: {
            node: { id: string; name: string };
            port: { id: string; name: string };
        }
    ) {
        this.unShowConextMenu();

        Swal.fire({
            title: `Removing connection from ${node_source.node.name} to ${node_destination.node.name}`,
            text: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                this.editor.removeSingleConnection(
                    node_source.node.id,
                    node_destination.node.id,
                    node_source.port.id,
                    node_destination.port.id
                );

                const currentConnection = {
                    output_id: node_source.node.id,
                    output_class: node_source.port.id,
                    input_id: node_destination.node.id,
                    input_class: node_destination.port.id,
                };
                this.deleteConnectionData(currentConnection);

                this.saveCurrentDrawflow();
            }
        });
    }

    deleteConnectionData(connection: {
        output_id: string;
        output_class: string;
        input_id: string;
        input_class: string;
    }) {
        delete this.editor.drawflow.drawflow.Home.data[connection.output_id]
            .data['connections'][connection.output_class];

        delete this.editor.drawflow.drawflow.Home.data[connection.input_id]
            .data['connections'][connection.input_class];
    }

    getData() {
        const drawflowData = this.editor.export().drawflow.Home.data;
        return drawflowData;
    }
}

class Drawflowoverride extends Drawflow {
    removeConnection(e: any) {}
}
