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
    project: any = { name: 'A' };
    scenario: any = { name: 'A' };

    @Input() components: any;

    @Output('clearGridModel') clearGridModel: EventEmitter<any> =
        new EventEmitter();

    onClearGridModel() {
        this.clearGridModel.emit();
    }
}
