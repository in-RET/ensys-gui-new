import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import Drawflow from 'drawflow';
import Swal from 'sweetalert2';
import { EnergyComponentsComponent } from './energy-components/energy-components.component';
import { EnergyDrawflowComponent } from './energy-drawflow/energy-drawflow.component';
import { ModalComponent } from './modal/modal.component';

@Component({
    selector: 'app-scenario-energy-design',
    imports: [
        CommonModule,
        ModalComponent,
        EnergyComponentsComponent,
        EnergyDrawflowComponent,
    ],
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

    editor!: Drawflow;
    modalVisibility: boolean = false;
    createdNode: any = {}; // {name: ....}

    @ViewChild(EnergyDrawflowComponent)
    energyDrawflowComponent!: EnergyDrawflowComponent;

    ngOnInit() {}

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

    drop(node: any) {
        // this.createdNode['id'] = e.id;
        // this.createdNode['name'] = e.name;
        this.createdNode = node;
        this.modalVisibility = true;
    }

    closeModal(data: any) {
        this.modalVisibility = false;

        switch (this.createdNode.group) {
            case 'production':
                this.energyDrawflowComponent.addNode({
                    ...data,
                    inp: 0,
                    out: 1,
                });
                break;

            case 'bus':
            case 'storage':
                this.energyDrawflowComponent.addNode({
                    ...data,
                    inp: 1,
                    out: 1,
                });
                break;

            case 'demand':
                this.energyDrawflowComponent.addNode({
                    ...data,
                    inp: 0,
                    out: 1,
                });
                break;

            case 'conversion':
                if (this.createdNode.id == 'myTransformer')
                    this.energyDrawflowComponent.addNode({
                        ...data,
                        inp: data['ports']['inputs']
                            ? data['ports']['inputs'].length
                            : 0,
                        out: data['ports']['outputs']
                            ? data['ports']['outputs'].length
                            : 0,
                    });
                break;
        }
    }
}
