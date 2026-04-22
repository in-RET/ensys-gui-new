import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
    ScenarioUpdatedModel,
    ScenarioUpdatedModel_project,
    ScenarioUpdatedModel_scenario,
} from '../../../models/scenario.model';
import { ScenarioStateService } from '../../../services/scenario-state.service';
import { ModalComponent } from '../../modal/modal.component';
import { ModalStateService } from '../modal-state.service';

@Component({
    selector: 'app-setup-modal',
    imports: [CommonModule, ModalComponent],
    templateUrl: './setup-modal.component.html',
    styleUrl: './setup-modal.component.scss',
})
export class SetupModalComponent {
    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };

    @Input() showModal!: {
        setup: boolean;
        constaints: boolean;
    };

    @Input() modalInfo: boolean | null = null;
    @Output() updateScenario: EventEmitter<ScenarioUpdatedModel> =
        new EventEmitter<ScenarioUpdatedModel>();
    @Output() modalClosed = new EventEmitter<boolean>();

    private scenarioStateService = inject(ScenarioStateService);
    private modalStateService = inject(ModalStateService);

    onFormSubmitted() {
        const data: ScenarioUpdatedModel = {
            project: this.scenarioStateService.getScenarioData()
                ?.project as ScenarioUpdatedModel_project,
            scenario: this.scenarioStateService.getScenarioData()
                ?.scenario as ScenarioUpdatedModel_scenario,
        };

        this.updateScenario.emit(data);
        this.closeModal(true);
    }

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
        this.modalStateService.closeSetup();
    }
}
