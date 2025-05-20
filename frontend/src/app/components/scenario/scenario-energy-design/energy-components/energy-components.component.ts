import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ScenarioService } from '../../services/scenario.service';
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

    scenarioService = inject(ScenarioService);

    @Input() components: any;

    @Output('clearGridModel') clearGridModel: EventEmitter<any> =
        new EventEmitter();
    @Output('touchEnd') touchEnd: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        let initalData = this.scenarioService.restoreBaseInfo_Storage();

        if (initalData) {
            this.project['name'] = initalData.project.name;
            this.scenario['name'] = initalData.name;
        }
    }

    onClearGridModel() {
        this.clearGridModel.emit();
    }

    _touchEnd(e: any) {
        this.touchEnd.emit(e);
    }
}
