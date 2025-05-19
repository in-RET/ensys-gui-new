import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild,
} from '@angular/core';
import Drawflow, { DrawflowNode } from 'drawflow';
import Swal from 'sweetalert2';
import { FormComponent } from '../form/form.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-energy-drawflow',
    imports: [CommonModule, ModalComponent, FormComponent],
    templateUrl: './energy-drawflow.component.html',
    styleUrl: './energy-drawflow.component.scss',
})
export class EnergyDrawflowComponent {
    editor!: Drawflow;
    currentNode: any;
    currentPosition: any;

    // form
    formData!: any;
    formError: any = {
        msg: '',
        isShow: false,
    };
    modalVisibility: boolean = false;
    currentConnection: any;
    ASSET_TYPE_NAME: string = 'asset_type_name';

    @ViewChild(ModalComponent)
    modalComponent!: ModalComponent;

    @Output('_drop') _drop: EventEmitter<any> = new EventEmitter();
    @Output('editNode') editNode: EventEmitter<any> = new EventEmitter();

    @ViewChild(FormComponent) formComponent!: FormComponent;

    constructor(private elementRef: ElementRef) {}

    ngOnInit() {
        var id: any = document.getElementById('drawflow');
        this.editor = new Drawflow(id);
        this.editor.zoom = 0.7;
        this.editor.start();
        this.editor.zoom_refresh();

        this.editor.on('connectionCreated', (connection: any) => {
            this.currentConnection = connection;
            this.connectionCreated(connection);
        });

        this.editor.on('moduleChanged', (data: any) => {
            console.log(data);
        });

        this.checkDBClickComponent();

        let CURRENT_DRAWFLOW = localStorage.getItem('CURRENT_DRAWFLOW');
        CURRENT_DRAWFLOW = CURRENT_DRAWFLOW ? JSON.parse(CURRENT_DRAWFLOW) : '';

        if (CURRENT_DRAWFLOW && CURRENT_DRAWFLOW.trim() != '') {
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

    checkDBClickComponent() {
        var transform = '';
        let _this = this;

        document.addEventListener('dblclick', function (e: any) {
            const closestNode = e.target.closest('.drawflow-node');

            if (closestNode) {
                const nodeType = closestNode
                    .querySelector('.box')
                    .getAttribute('asset_type_name');

                const topologyNodeId = closestNode.id.split('node-')[1];
                _this.openModal(topologyNodeId);
            }
        });
    }

    allowDrop(ev: any) {
        ev.preventDefault();
    }

    onDrop(ev: any) {
        ev.preventDefault();

        const nodeId = ev.dataTransfer.getData('id');
        const nodeName = ev.dataTransfer.getData('node');
        const nodeGroup = ev.dataTransfer.getData('group');

        this.currentPosition = {
            x: this.getNodePosition(ev.clientX, 'x'),
            y: this.getNodePosition(ev.clientY, 'y'),
        };

        this.currentNode = {
            nodeId,
            nodeName,
            nodeGroup,
        };

        this._drop.emit({
            id: nodeId,
            name: nodeName,
            group: nodeGroup,
            x: this.currentPosition.x,
            y: this.currentPosition.y,
        });
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

        // tmporary
        const CURRENT_DRAWFLOW = this.editor.export().drawflow.Home.data;
        localStorage.setItem(
            'CURRENT_DRAWFLOW',
            JSON.stringify(CURRENT_DRAWFLOW)
        );
    }

    addNode(data: any) {
        this.addNodeToDrawFlow(
            this.currentNode.nodeId,
            data.name,
            this.currentPosition.x,
            this.currentPosition.y,
            data.inp,
            data.out,
            data
        );
    }
    updateNode(nodeId: number, data: any) {
        this.editor.drawflow.drawflow.Home.data[nodeId].html = `
            <div class="box" ${this.ASSET_TYPE_NAME}="${data.name}"></div>
        
            <div class="drawflow-node__name nodeName">
                <span>
                ${data.name}
                </span>
            </div>

            <div class="img"></div>
        `;

        this.editor.updateNodeDataFromId(nodeId, data);
    }

    connectionCreated(connection: any) {
        var nodeIn = this.editor.getNodeFromId(connection['input_id']);
        var nodeOut = this.editor.getNodeFromId(connection['output_id']);

        let followRules = this.checkRules(connection, nodeIn, nodeOut);

        if (followRules) {
            this.showModalConnection();
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

    showModalConnection() {
        this.initFormData();
        this.toggleModal(true);
    }

    initFormData() {
        this.formData = {
            sections: [
                {
                    name: '',
                    class: 'col-12',
                    fields: [
                        {
                            name: 'Investment',
                            placeholder: 'Investment',
                            label: 'Investment',
                            isReq: true,
                            type: 'check',
                            span: 'auto',
                            value: false,
                            onClick: () => {
                                this.formComponent.toggleControl(
                                    'nominal_value'
                                );

                                this.formData.sections.forEach(
                                    (section: any) => {
                                        if (section.name == 'Inv') {
                                            section.fields.forEach(
                                                (element: any) => {
                                                    this.formComponent.toggleControl(
                                                        element.name
                                                    );
                                                }
                                            );
                                        }
                                    }
                                );
                            },
                        },
                        {
                            name: 'nominal_value',
                            placeholder: 'nominal_value',
                            label: 'nominal_value',
                            isReq: true,
                            type: 'text',
                            span: '4',
                        },
                    ],
                },

                {
                    name: 'Inv',
                    class: 'col-12',
                    fields: [
                        {
                            name: 'maximum ',
                            placeholder: 'maximum ',
                            label: 'maximum ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'minimum',
                            placeholder: 'minimum',
                            label: 'minimum',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'ep_costs ',
                            placeholder: 'ep_costs ',
                            label: 'ep_costs ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'existing ',
                            placeholder: 'existing ',
                            label: 'existing ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'nonconvex ',
                            placeholder: 'nonconvex ',
                            label: 'nonconvex ',
                            type: 'text',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'offset ',
                            placeholder: 'offset ',
                            label: 'offset',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'overall_maximum ',
                            placeholder: 'overall_maximum ',
                            label: 'overall_maximum ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'overall_minimum ',
                            placeholder: 'overall_minimum ',
                            label: 'overall_minimum ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },

                        {
                            name: 'interest_rate ',
                            placeholder: 'interest_rate ',
                            label: 'interest_rate ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                        {
                            name: 'lifetime ',
                            placeholder: 'lifetime ',
                            label: 'lifetime ',
                            type: 'number',
                            span: 'auto',
                            disabled: true,
                        },
                    ],
                },

                {
                    name: '',
                    class: 'col-12',
                    fields: [
                        {
                            name: 'variable_costs',
                            placeholder: 'variable_costs',
                            label: 'variable_costs',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'max',
                            placeholder: 'max',
                            label: 'max',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'min',
                            placeholder: 'min',
                            label: 'min',
                            type: 'number',
                            span: 'auto',
                        },

                        {
                            name: 'fix ',
                            placeholder: 'fix ',
                            label: 'fix',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'positive_gradient_limit ',
                            placeholder: 'positive_gradient_limit ',
                            label: 'positive_gradient_limit ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'negative_gradient_limit ',
                            placeholder: 'negative_gradient_limit ',
                            label: 'negative_gradient_limit ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'full_load_time_max ',
                            placeholder: 'full_load_time_max ',
                            label: 'full_load_time_max ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'full_load_time_min ',
                            placeholder: 'full_load_time_min ',
                            label: 'full_load_time_min ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'integer ',
                            placeholder: 'integer ',
                            label: 'integer ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'nonconvex',
                            placeholder: 'nonconvex',
                            label: 'nonconvex',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'fixed_costs ',
                            placeholder: 'fixed_costs ',
                            label: 'fixed_costs ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: '_lifetime ',
                            placeholder: 'lifetime ',
                            label: 'lifetime ',
                            type: 'number',
                            span: 'auto',
                        },
                        {
                            name: 'age ',
                            placeholder: 'age ',
                            label: 'age ',
                            type: 'number',
                            span: 'auto',
                        },
                    ],
                },
            ],
        };
    }

    investFieldsToggleVisible() {}

    setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

    toggleModal(appear: boolean) {
        this.modalVisibility = appear;
    }

    closeModal(approve: any) {
        this.toggleModal(approve);
        this.setFormError(false, '');

        if (!approve) {
            this.removeSingleConnection(this.currentConnection);
        }

        this.currentConnection = null;
    }

    submitForm_Flow() {
        const _formData = this.formComponent.submit();

        if (_formData) {
            this.setFormError(false, '');
            // make flow

            this.modalComponent._closeModal(true);
        } else {
            this.setFormError(true, ' * Complete the form!');
        }
    }

    getData() {
        const drawflowData = this.editor.export().drawflow.Home.data;
        return drawflowData;
    }

    openModal(nodeId: string) {
        const node = this.editor.getNodeFromId(nodeId);
        this.editNode.emit({ id: nodeId, name: node.class, data: node.data });
    }
}
