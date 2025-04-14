import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { EnergyDragItemsComponent } from './energy-drag-items/energy-drag-items.component';

@Component({
    selector: 'app-energy-components',
    imports: [CommonModule, EnergyDragItemsComponent],
    templateUrl: './energy-components.component.html',
    styleUrl: './energy-components.component.scss',
})
export class EnergyComponentsComponent {
    @Output('clearGridModel') clearGridModel: EventEmitter<any> =
        new EventEmitter();

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

    onClearGridModel() {
        this.clearGridModel.emit();
    }
}
