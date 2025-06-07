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

    contextmenu!: { id: number } | null;
    editMode: boolean = false;

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

        this.renderer.listen('window', 'click', (e: any) => {
            if (
                e.target &&
                !this.contextMenuRef.nativeElement.contains(e.target)
            )
                this.unShowConextMenu();
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initDrawingBoard();
        }, 0);
    }

    private initDrawingBoard() {
        this.initDrawFlow();
        this.addEditorEvents();
        this.loadCurrentDrawflow();
    }

    private initDrawFlow() {
        if (typeof document !== 'undefined') {
            const drawFlowHtmlElement = document.getElementById('drawflow');
            this.editor = new Drawflow(drawFlowHtmlElement as HTMLElement);

            this.editor.reroute = false;
            this.editor.curvature = 1;
            this.editor.force_first_input = true;
            this.editor.zoom = 0.9;

            this.editor.start();
            this.editor.zoom_refresh();
        }
    }

    private addEditorEvents() {
        this.editor.on('nodeCreated', (data: any) => {
            this.saveCurrentDrawflow();
        });
        this.editor.on('nodeDataChanged', (data: any) => {
            this.saveCurrentDrawflow();
        });
        this.editor.on('nodeRemoved', (data: any) => {
            this.saveCurrentDrawflow();
        });

        this.editor.on('connectionCreated', (connection: any) => {
            // this.currentConnection = connection;
            this.connectionCreated(connection);
            // this.saveCurrentDrawflow();
        });
        this.editor.on('connectionRemoved', (connection: any) => {
            this.saveCurrentDrawflow();
        });
        this.editor.on('connectionSelected', (connection: any) => {
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

            if (closestNode || closestEdge) {
                this.showConextMenu(
                    e.clientX,
                    e.clientY,
                    closestNode
                        ? closestNode.id.split('node-')[1]
                        : closestEdge.id.split('node-')[1]
                );
            }
        });

        this.editor.on('click', (event: any) => {});

        this.editor.on('nodeMoved', (nodeId: any) => {
            // console.log(this.editor.drawflow.drawflow.Home.data[nodeId].pos_x);
            // console.log(this.editor.drawflow.drawflow.Home.data[nodeId].pos_y);

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

        // this.currentPosition = {
        //     x: ev.clientX, // this.getNodePosition(ev.clientX, 'x'),
        //     y: ev.clientY, // this.getNodePosition(ev.clientY, 'y'),
        // };

        // this.currentNode = {
        //     nodeId,
        //     nodeName,
        //     nodeGroup,
        // };

        this.showFormModal.emit({
            // node: {
            //     id: nodeId,
            //     name: nodeName,
            //     class: nodeId,
            //     x: this.currentPosition.x,
            //     y: this.currentPosition.y,
            // },
            type: 'node',
            id: `${nodeId}`,
            title: `${nodeName}`,
            action: { fn: 'submitFormData', label: 'save' },
            editMode: false,
            data: {
                node: {
                    name: nodeGroup,
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
        console.log(node);

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
    updateNode(nodeId: number, data: any) {
        // console.log(data);

        this.editor.drawflow.drawflow.Home.data[nodeId].name = data.name;
        this.editor.drawflow.drawflow.Home.data[nodeId].html = `
            <div class="box" ${this.ASSET_TYPE_NAME}=" ${data.name}"></div>

            <div class="drawflow-node__name nodeName">
                <span>
                    ${this.editor.drawflow.drawflow.Home.data[nodeId].name}
                </span>
            </div>

            <div class="img"></div>
        `;
        this.editor.updateNodeDataFromId(nodeId, data);
        this.editor.dispatch('nodeDataChanged', nodeId);
        this.editor.import(this.editor.export());
    }

    connectionCreated(connection: any) {
        var nodeIn = this.editor.getNodeFromId(connection['input_id']);
        var nodeOut = this.editor.getNodeFromId(connection['output_id']);
        let followRules = this.checkRules(connection, nodeIn, nodeOut);

        if (followRules) {
            this.showFormModal.emit({
                type: 'flow',
                id: '_flow', //`${nodeOut.id}-${nodeIn.id}`,
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

    removeSingleConnection(connection: any) {
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

    getData() {
        const drawflowData = this.editor.export().drawflow.Home.data;
        return drawflowData;
    }

    _showFormModalNode(nodeId: number, x: number, y: number) {
        debugger;
        this.showConextMenu(x, y, nodeId);
    }

    _showFormModal_edge(nodeId: number, x: number, y: number) {
        debugger;
        this.showConextMenu(x, y, nodeId);
    }

    _toggleFullScreen() {
        this.toggleFullScreen.emit();
    }

    showModalEdit() {
        this.editMode = true;

        if (this.contextmenu != null && this.contextmenu.id) {
            const node = this.editor.getNodeFromId(this.contextmenu.id);

            if (node)
                // this.showFormModal.emit({
                //     node: {
                //         id: this.contextmenu.id,
                //         name: node.data.name,
                //         class: node.class,
                //         x: node.pos_x,
                //         y: node.pos_y,
                //         data: node.data,
                //     },
                //     editMode: true,
                // });

                this.unShowConextMenu();
        } else {
            // var nodeConnectionIn = this.editor.getNodeFromId(
            //     this.currentConnection.input_id
            // );
            // const _connectionData =
            //     nodeConnectionIn.data['connections'][0].data;
            // console.log(_connectionData);
            // this.showModalConnection(_connectionData);
        }
    }

    deleteNode(nodeId: number) {
        this.editor.removeNodeId(`node-${nodeId}`);
        this.unShowConextMenu();
    }

    deleteConnection() {
        // this.editor.removeSingleConnection(
        //     this.currentConnection['output_id'],
        //     this.currentConnection['input_id'],
        //     this.currentConnection['output_class'],
        //     this.currentConnection['input_class']
        // );
    }

    // R-Click event , Touching events
    showConextMenu(x: any, y: any, nodeId: number) {
        this.contextMenuRef.nativeElement.style.display = 'block';
        this.contextMenuRef.nativeElement.style.left = x + 'px';
        this.contextMenuRef.nativeElement.style.top = y + 'px';

        if (nodeId)
            this.contextmenu = {
                id: nodeId,
            };
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

    checkNodeDuplication(nodeName: string) {
        let isDuplicate = false;
        const currentNodeList = this.editor.drawflow.drawflow.Home.data;

        if (currentNodeList && JSON.stringify(currentNodeList) !== '{}') {
            for (const key in currentNodeList) {
                if (
                    Object.prototype.hasOwnProperty.call(currentNodeList, key)
                ) {
                    const node = currentNodeList[key];
                    node.name === nodeName || node.data.name === nodeName
                        ? (isDuplicate = false)
                        : (isDuplicate = true);
                }
            }

            return isDuplicate;
        }

        return true;
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
        // .then((result) => save_topology());
    }

    saveConnectionInNodes(connection: any) {
        this.editor.drawflow.drawflow.Home.data[connection.output_id].data[
            'connections'
        ] = [connection];

        this.editor.drawflow.drawflow.Home.data[connection.input_id].data[
            'connections'
        ] = [connection];
        this.saveCurrentDrawflow();
    }
}
