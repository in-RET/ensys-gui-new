import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { ToastService } from '../../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioModel,
} from '../../../scenario/models/scenario.model';
import { ScenarioService } from '../../../scenario/services/scenario.service';
import { ProjectModel } from '../../models/project.model';

@Component({
    selector: 'app-project-scenario-item',
    imports: [CommonModule, RouterModule],
    templateUrl: './project-scenario-item.component.html',
    styleUrl: './project-scenario-item.component.scss',
})
export class ProjectScenarioItemComponent {
    @Input() project!: ProjectModel;
    @Input() scenario!: ScenarioModel;

    @Output() deleteScenario: EventEmitter<any> = new EventEmitter<any>();

    toastService = inject(ToastService);
    alertService = inject(AlertService);

    constructor(
        private scenarioService: ScenarioService,
        private router: Router
    ) {}

    openScenario(data: ScenarioModel) {
        // save project,scenario - storage
        const scenarioData: ScenarioBaseInfoModel = {
            project: {
                id: this.project.id,
                name: this.project.name ?? '_',
                scenarioList: this.project.scenarioList ?? [],
            },
            scenario: {
                id: data.id,
                name: data.name,
                sDate: data.sDate,
                timeStep: 60,
                interval: data.interval,
                simulationYear: 2025,
            },
        };

        this.scenarioService.saveBaseInfo_Storage(scenarioData);
        // this.scenarioService.cleanDrawflow_Storage();

        this.router.navigate(['/scenario']);
        this.toastService.info('Scenario data restored.');
    }

    async onDeleteScenario(scenarioId: number) {
        const confirmed = await this.alertService.confirm(
            `Are you sure delete scenario ${this.scenario.name}?`,
            'Delete'
        );

        if (confirmed) {
            this.scenarioService.deleteScenario(scenarioId).subscribe({
                next: (value) => {
                    if (value.success) {
                        this.toastService.success(
                            `Scenario ${this.scenario.name} deleted.`
                        );
                        this.deleteScenario.emit(scenarioId);
                    } else this.toastService.error('An error occured.');
                },
                error: (err) => {
                    this.toastService.error(err);
                },
            });
        }
    }
}
