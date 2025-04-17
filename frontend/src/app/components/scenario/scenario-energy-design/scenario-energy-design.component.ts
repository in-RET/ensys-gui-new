import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

    drop(e: any) {
        this.createdNode['name'] = e.name;
        // this.modalVisibility = true;
    }

    closeModal() {
        this.modalVisibility = false;
        console.log(this.modalVisibility);
    }
}
