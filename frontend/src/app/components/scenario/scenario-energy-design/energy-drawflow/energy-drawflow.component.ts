import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import Drawflow from 'drawflow';

@Component({
    selector: 'app-energy-drawflow',
    imports: [CommonModule],
    templateUrl: './energy-drawflow.component.html',
    styleUrl: './energy-drawflow.component.scss',
})
export class EnergyDrawflowComponent {
    modalVisibility: boolean = false;
    editor!: Drawflow;

    @Output('_drop') _drop: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        var id: any = document.getElementById('drawflow');
        this.editor = new Drawflow(id);
        this.editor.start();
    }

    allowDrop(ev: any) {
        ev.preventDefault();
    }

    onDrop(ev: any) {
        ev.preventDefault();

        const nodeId = ev.dataTransfer.getData('id');
        const nodeName = ev.dataTransfer.getData('node');
        const nodeGroup = ev.dataTransfer.getData('group');

        nodeName === 'Transformer'
            ? this.IOBusOptions(nodeId, ev.clientX, ev.clientY)
            : this.addNodeToDrawFlow(nodeId, ev.clientX, ev.clientY, 1, 1);

        // this.addNodeToDrawFlow(nodeName, ev.clientX, ev.clientY, 1, 1);

        this.modalVisibility = true;
        this._drop.emit({ name: nodeId, x: ev.clientX, y: ev.clientY });
    }

    IOBusOptions(nodeName: any, posX: any, posY: any) {
        const checkMinMax = (value: any, min: any, max: any) =>
            value <= min ? min : value >= max ? max : value;

        // const inputs = checkMinMax('---', 1, 1);
        // const outputs = checkMinMax('---', 1, 1);
        this.addNodeToDrawFlow(nodeName, posX, posY, 3, 6);
    }

    addNodeToDrawFlow(
        name: any,
        pos_x: any,
        pos_y: any,
        nodeInputs?: any,
        nodeOutputs?: any
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

        this.createNodeObject(name, nodeInputs, nodeOutputs, {}, pos_x, pos_y);
    }

    createNodeObject(
        nodeName: any,
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
            nodeName,
            nodeData,
            source_html,
            false
        );
    }
}
