import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import Drawflow, { DrawflowNode } from 'drawflow';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-energy-drawflow',
    imports: [CommonModule],
    templateUrl: './energy-drawflow.component.html',
    styleUrl: './energy-drawflow.component.scss',
})
export class EnergyDrawflowComponent {
    modalVisibility: boolean = false;
    editor!: Drawflow;
    currentNode: any;
    currentPosition: any;

    @Output('_drop') _drop: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        var id: any = document.getElementById('drawflow');
        this.editor = new Drawflow(id);
        this.editor.zoom = 0.7;
        this.editor.start();
        this.editor.zoom_refresh();

        this.editor.on('connectionCreated', (connection: any) => {
            this.connectionCreated(connection);
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
            x: ev.clientX,
            y: ev.clientY,
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

    IOBusOptions(nodeId: string, nodeName: string, posX: any, posY: any) {
        const checkMinMax = (value: any, min: any, max: any) =>
            value <= min ? min : value >= max ? max : value;

        // const inputs = checkMinMax('---', 1, 1);
        // const outputs = checkMinMax('---', 1, 1);
        this.addNodeToDrawFlow(nodeId, nodeName, posX, posY, 3, 6);
    }

    addNodeToDrawFlow(
        id: string,
        name: string,
        pos_x: any,
        pos_y: any,
        nodeInputs?: any,
        nodeOutputs?: any,
        data?: any
    ) {
        // if (this.editor.editor_mode === 'fixed') return false;
        // the following translation/transformation is required to correctly drop the nodes in the current clientScreen
        pos_x =
            pos_x *
                (this.editor.precanvas.clientWidth /
                    (this.editor.precanvas.clientWidth * this.editor.zoom)) -
            this.editor.precanvas.getBoundingClientRect().x *
                (this.editor.precanvas.clientWidth /
                    (this.editor.precanvas.clientWidth * this.editor.zoom));
        pos_y =
            pos_y *
                (this.editor.precanvas.clientHeight /
                    (this.editor.precanvas.clientHeight * this.editor.zoom)) -
            this.editor.precanvas.getBoundingClientRect().y *
                (this.editor.precanvas.clientHeight /
                    (this.editor.precanvas.clientHeight * this.editor.zoom));

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
        const ASSET_TYPE_NAME = 'asset_type_name';
        const source_html = `
        <div class="box" ${ASSET_TYPE_NAME}="${nodeName}"></div>
    
        <div class="drawflow-node__name nodeName">
            <span>
              ${nodeName}
            </span>
        </div>

        <div class="img"></div>`;

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

    connectionCreated(connection: any) {
        var nodeIn = this.editor.getNodeFromId(connection['input_id']);
        var nodeOut = this.editor.getNodeFromId(connection['output_id']);

        this.checkRules(connection, nodeIn, nodeOut);
    }

    checkRules(connection: any, nodeIn: any, nodeOut: any) {
        let rule_1 = this.isConnectionThroughBus(nodeIn, nodeOut);

        if (rule_1) {
            let rule_3 = this.hasSingleConnection(connection, nodeIn, nodeOut);

            if (rule_3) {
            } else {
                this.removeSingleConnection(connection);

                Swal.fire(
                    'Unexpected Connection',
                    'More than 1 connection per port is not allowed.',
                    'error'
                );
            }
        } else {
            this.removeSingleConnection(connection);
            Swal.fire(
                'Unexpected Connection',
                'Please connect assets to each other\n only through a bus node. Interconnecting busses is also not allowed.',
                'error'
            );
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
        // exception for bus

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

    removeSingleConnection(connection: any) {
        this.editor.removeSingleConnection(
            connection['output_id'],
            connection['input_id'],
            connection['output_class'],
            connection['input_class']
        );
    }
}
