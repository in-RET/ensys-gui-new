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
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './project-scenario-item.component.html',
    styleUrl: './project-scenario-item.component.scss',
})
export class ProjectScenarioItemComponent {
    @Input() project!: ProjectModel;
    @Input() scenario!: ScenarioModel;

    @Output() deleteScenario: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateScenario: EventEmitter<any> = new EventEmitter<any>();

    toastService = inject(ToastService);
    alertService = inject(AlertService);
    scenarioService = inject(ScenarioService);
    router = inject(Router);

    openScenario(scenario_id: number) {
        this.scenarioService.getScenario(scenario_id).subscribe({
            next: (res) => {
                if (res.success && res.data && res.data.length != 0) {
                    const data = res.data.items[0];

                    this.scenarioService.saveDrawflow_Storage(
                        data.modeling_data,
                        false,
                    );

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
                            timeStep: 8760,
                            interval: data.interval,
                            simulationYear: 2025,
                        },
                    };

                    this.scenarioService.saveBaseInfo_Storage(scenarioData);
                    this.toastService.info('Scenario data restored.');
                    this.router.navigate(['/scenario']);
                } else {
                    this.toastService.error(
                        'An error occured while loading scenario data.',
                    );
                }
            },
            error: (err) => {
                this.toastService.error(err);
            },
        });
    }

    async onDeleteScenario(scenarioId: number) {
        const confirmed = await this.alertService.confirm(
            `Are you sure delete scenario ${this.scenario.name}?`,
            'Delete',
        );

        if (confirmed) {
            this.scenarioService.deleteScenario(scenarioId).subscribe({
                next: (value) => {
                    if (value.success) {
                        this.toastService.success(
                            `Scenario ${this.scenario.name} deleted.`,
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

    async onDuplicateScenario(scenarioId: number) {
        const confirmed = await this.alertService.confirm(
            `Are you sure duplicate scenario ${this.scenario.name}?`,
            'Duplicate',
        );

        if (confirmed) {
            this.scenarioService.duplicateScenario(scenarioId).subscribe({
                next: (value) => {
                    if (value.success) {
                        this.toastService.success(
                            `Scenario ${this.scenario.name} duplicated.`,
                        );
                        this.duplicateScenario.emit({
                            projectId: this.scenario.project_id,
                            scenarioId: scenarioId,
                            newScenario: value.data,
                        });
                    } else this.toastService.error('An error occured.');
                },
                error: (err) => {
                    this.toastService.error(err);
                },
            });
        }
    }
}
