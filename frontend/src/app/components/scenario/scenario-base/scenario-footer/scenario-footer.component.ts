import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserModelingSTEP } from '../../models/scenario.model';
import { ScenarioStateService } from '../../services/scenario-state.service';
import { ScenarioService } from '../../services/scenario.service';

@Component({
    selector: 'app-scenario-footer',
    imports: [CommonModule, RouterModule],
    templateUrl: './scenario-footer.component.html',
    styleUrl: './scenario-footer.component.scss',
})
export class ScenarioFooterComponent {
    UserModelingSTEP = UserModelingSTEP;

    @Output() nextStep: EventEmitter<void> = new EventEmitter<void>();
    @Output() prevtStep: EventEmitter<void> = new EventEmitter<void>();
    @Output() saveScenario: EventEmitter<void> = new EventEmitter<void>();
    @Output() updateScenario: EventEmitter<void> = new EventEmitter<void>();
    @Output() startSimulation: EventEmitter<void> = new EventEmitter<void>();
    @Output() openSimulations: EventEmitter<void> = new EventEmitter<void>();

    scenarioService = inject(ScenarioService);
    scenarioStateService = inject(ScenarioStateService);

    next() {
        this.nextStep.emit();
    }

    previous() {
        this.update();
        this.prevtStep.emit();
    }

    update() {
        // const data: void = {
        //     project: this.scenarioStateService.getScenarioData()
        //         ?.project as ScenarioUpdatedModel_project,
        //     scenario: this.scenarioStateService.getScenarioData()
        //         ?.scenario as ScenarioUpdatedModel_scenario,
        // };
        // this.updateScenario.emit(data);
    }

    onStartSimulation() {
        this.startSimulation.emit();
    }

    onOpenSimulations() {
        this.openSimulations.emit();
    }

    onSaveScenario() {
        this.saveScenario.emit();
    }

    onUpdateScenario() {
        this.updateScenario.emit();
    }
}
