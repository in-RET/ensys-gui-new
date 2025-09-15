import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScenarioBaseInfoModel } from '../../models/scenario.model';
import { ScenarioService } from '../../services/scenario.service';

@Component({
    selector: 'app-scenario-footer',
    imports: [CommonModule, RouterModule],
    templateUrl: './scenario-footer.component.html',
    styleUrl: './scenario-footer.component.scss',
})
export class ScenarioFooterComponent {
    @Input('step') step!: number;
    @Input('scenarioData') scenarioData!: ScenarioBaseInfoModel;
    @Input('isScenarioNew') isScenarioNew!: boolean;

    @Output() nextStep: EventEmitter<any> = new EventEmitter<any>();
    @Output() prevtStep: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveScenario: EventEmitter<any> = new EventEmitter<any>();
    @Output() updateScenario: EventEmitter<any> = new EventEmitter<any>();
    @Output() startSimulation: EventEmitter<any> = new EventEmitter<any>();
    @Output() openSimulations: EventEmitter<any> = new EventEmitter<any>();

    scenarioService = inject(ScenarioService);

    next() {
        this.nextStep.emit();
    }

    previous() {
        this.prevtStep.emit();
    }

    save() {
        this.saveScenario.emit();
        // after saving should be sened update scenarioData with id for going to simulation pgae
    }

    update() {
        this.updateScenario.emit();
    }

    onStartSimulation() {
        this.startSimulation.emit(this.scenarioData.scenario?.id);
    }

    onOpenSimulations(scenarioId: number | undefined) {
        if (scenarioId) this.openSimulations.emit(scenarioId);
    }
}
