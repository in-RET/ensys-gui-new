import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ScenarioService } from '../../services/scenario.service';
import { EnergyDragItemsComponent } from './energy-drag-items/energy-drag-items.component';

@Component({
    selector: 'app-energy-components',
    imports: [CommonModule, EnergyDragItemsComponent],
    templateUrl: './energy-components.component.html',
    styleUrl: './energy-components.component.scss',
})
export class EnergyComponentsComponent {
    scenarioService = inject(ScenarioService);
    router = inject(Router);

    @Input() components: any;
    @Input() currentScenario: any;

    @Output('clearGridModel') clearGridModel: EventEmitter<any> =
        new EventEmitter();
    @Output('touchEnd') touchEnd: EventEmitter<any> = new EventEmitter();

    onClearGridModel() {
        this.clearGridModel.emit();
    }

    _touchEnd(e: any) {
        this.touchEnd.emit(e);
    }
}
