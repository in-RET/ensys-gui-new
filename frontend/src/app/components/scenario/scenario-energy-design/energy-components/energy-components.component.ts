import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EnergyDragItemsComponent } from './energy-drag-items/energy-drag-items.component';

@Component({
    selector: 'app-energy-components',
    imports: [CommonModule, EnergyDragItemsComponent],
    templateUrl: './energy-components.component.html',
    styleUrl: './energy-components.component.scss',
})
export class EnergyComponentsComponent {
    project: any = {};
    scenario: any = {};

    @Input() components: any;

    @Output('clearGridModel') clearGridModel: EventEmitter<any> =
        new EventEmitter();

    ngOnInit() {
        let initalData: any = localStorage.getItem('scenario-step-0');

        if (initalData) {
            initalData = JSON.parse(initalData);
            this.project['name'] = initalData.projectName;
            this.scenario['name'] = initalData.name;
        }
    }

    onClearGridModel() {
        this.clearGridModel.emit();
    }
}
