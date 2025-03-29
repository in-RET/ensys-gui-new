import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Drawflow from 'drawflow';
import Swal from 'sweetalert2';
import { EnergyDragItemsComponent } from './energy-drag-items/energy-drag-items.component';

@Component({
    selector: 'app-scenario-energy-design',
    imports: [CommonModule, EnergyDragItemsComponent],
    templateUrl: './scenario-energy-design.component.html',
    styleUrl: './scenario-energy-design.component.scss',
})
export class ScenarioEnergyDesignComponent {
    components: any = {
        items: [
            {
                group_name: 'production',
                group_components: [
                    {
                        id: 'mySource',
                        name: 'Source',
                    },
                    {
                        id: 'myPredefinedSource',
                        name: 'Predefined Source',
                    },
                ],
            },
            {
                group_name: 'conversion',
                group_components: [
                    {
                        id: 'myTransformer',
                        name: 'Transformer',
                    },
                    {
                        id: 'myPredefinedTransformer',
                        name: 'Predefined Transformer',
                    },
                ],
            },
            {
                group_name: 'storage',
                group_components: [
                    {
                        id: 'myGenericStorage',
                        name: 'GenericStorage',
                    },
                    {
                        id: 'myPredefinedStorage',
                        name: 'Predefined Storage',
                    },
                ],
            },
            {
                group_name: 'demand',
                group_components: [
                    {
                        id: 'mySink',
                        name: 'Sink',
                    },
                    {
                        id: 'myExcess',
                        name: 'Excess',
                    },
                    {
                        id: 'myExport',
                        name: 'Export',
                    },
                    {
                        id: 'myPredefinedSinkOEP',
                        name: 'Load profile from the Open Energy Platform',
                    },
                ],
            },
            {
                group_name: 'bus',
                group_components: [
                    {
                        id: 'bus',
                        name: 'Bus',
                    },
                ],
            },
        ],
    };

    editor: any;

    ngOnInit() {
        var id: any = document.getElementById('drawflow');
        this.editor = new Drawflow(id);
        this.editor.start();
    }

    allowDrop(ev: any) {
        ev.preventDefault();
    }

    drop(ev: any) {
        ev.preventDefault();

        const nodeName = ev.dataTransfer.getData('node');
        // nodeName === 'bus'
        //     ? this.IOBusOptions(nodeName, ev.clientX, ev.clientY)
        //     : this.addNodeToDrawFlow(nodeName, ev.clientX, ev.clientY, 1, 1);
        this.addNodeToDrawFlow(nodeName, ev.clientX, ev.clientY, 3, 3);
    }

    IOBusOptions(nodeName: any, posX: any, posY: any) {
        const checkMinMax = (value: any, min: any, max: any) =>
            value <= min ? min : value >= max ? max : value;

        const inputs = checkMinMax('---', 1, 7);
        const outputs = checkMinMax('---', 1, 7);
        this.addNodeToDrawFlow(nodeName, posX, posY, inputs, outputs);
    }

    addNodeToDrawFlow(
        name: any,
        pos_x: any,
        pos_y: any,
        nodeInputs?: any,
        nodeOutputs?: any
    ) {
        if (this.editor.editor_mode === 'fixed') return false;
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

        return this.createNodeObject(
            name,
            nodeInputs,
            nodeOutputs,
            {},
            pos_x,
            pos_y
        );
    }

    createNodeObject(
        nodeName: any,
        connectionInputs: any,
        connectionOutputs: any,
        nodeData: any = {},
        pos_x: any,
        pos_y: any
    ) {
        const shownName =
            typeof nodeData.name === 'undefined' ? nodeName : nodeData.name;
        const source_html = `<div class="box" asset_type_name="${nodeName}">
            <div class="modal" style="display:none">
              <div class="modal-content">
                <span class="close" onclick="closemodal(event)">&times;</span>
                <br>
                <h2 class="panel-heading" text-align: left">${nodeName.replaceAll(
                    '_',
                    ' '
                )} Properties</h2>
                <br>
                <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <form></form>
                </div>
                </div>
                <br>
                <div class="row">
                    <div class="col-md-3"></div>
                    <div class="col-md-6">
                       <button class="modalbutton" style="font-size: medium; font-family: century gothic" onclick="submitForm(event)">Ok</button>'
                    </div>
                </div>
              </div>
            </div>
        </div>
        <div class="nodeName" >${shownName}</div>`;

        return {
            editorNodeId: this.editor.addNode(
                nodeName,
                connectionInputs,
                connectionOutputs,
                pos_x,
                pos_y,
                nodeName,
                nodeData,
                source_html
            ),
            specificNodeType: nodeName,
        };
    }

    clearGridModel() {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will clear the whole grid model! This will not actually delete any asset from the scenario. You will need to save after clearing for the changes to actually take effect.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear everything!',
            cancelButtonText: 'Cancel',
        }).then((result) => result.value && this.editor.clearModuleSelected());
        // .then((result) => save_topology());
    }
}
