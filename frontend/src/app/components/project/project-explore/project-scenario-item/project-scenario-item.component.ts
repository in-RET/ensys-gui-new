import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ResModel } from '../../../../shared/models/http.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { PublicService } from '../../../../shared/services/public.service';
import { ToastService } from '../../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioModel,
    ScenarioResModel,
    UserModelingSTEP,
} from '../../../scenario/models/scenario.model';
import {
    ScenarioStateModel,
    ScenarioStateService,
} from '../../../scenario/services/scenario-state.service';
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
    scenarioStateService = inject(ScenarioStateService);
    router = inject(Router);
    publicService = inject(PublicService);

    openScenario(scenario_id: number) {
        this.scenarioService.getScenario(scenario_id).subscribe({
            next: (res) => {
                if (res.success && res.data && res.data.length != 0) {
                    const data: ScenarioResModel = res.data.items[0];
                    const modeling_data: string | null =
                        this.publicService.normalizeString(data.modeling_data);

                    if (modeling_data)
                        this.scenarioService.saveDrawflow_Storage(
                            JSON.parse(modeling_data),
                        );

                    // save project,scenario - storage
                    const scenarioData: ScenarioBaseInfoModel = {
                        project: {
                            id: this.project.id,
                            name: this.project.name ?? '_',
                        },
                        scenario: {
                            id: data.id,
                            name: data.name,
                            sDate: data.start_date,
                            timeStep: 8760,
                            interval: data.interval,
                            simulationYear: data.simulation_year,
                            constraints:
                                data.constraints &&
                                typeof data.constraints === 'string'
                                    ? JSON.parse(data.constraints)
                                    : null,
                            modeling_data: modeling_data
                                ? JSON.parse(modeling_data)
                                : null,
                        },
                    };
                    this.scenarioService.saveBaseInfo_Storage(scenarioData);

                    // update drawflowData$ state
                    const d: ScenarioStateModel = {
                        project: {
                            id: this.project.id,
                            name: this.project.name,
                        },
                        scenario: {
                            id: data.id,
                            name: data.name,
                            sDate: data.start_date,
                            timeStep: 8760,
                            interval: data.interval,
                            simulationYear: data.simulation_year,
                            constraints:
                                data.constraints &&
                                typeof data.constraints === 'string'
                                    ? JSON.parse(data.constraints)
                                    : null,
                            modeling_data: modeling_data
                                ? JSON.parse(modeling_data)
                                : null,
                        },
                    };

                    this.scenarioStateService.setScenarioData(d);
                    this.scenarioService.updateUserModelingState({
                        currentStep: UserModelingSTEP.SCENARIO_SETUP,
                        autoUpdate: true,
                    });
                    // this.toastService.info('Scenario data restored.');
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
        if (
            await this.alertService.confirm(
                `Are you sure delete scenario ${this.scenario.name}?`,
                'Delete',
            )
        ) {
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
                    this.toastService.error(
                        err.error.detail ||
                            'An error occured while deleting scenario.',
                    );
                },
            });
        }
    }

    async onDuplicateScenario(scenarioId: number) {
        if (
            await this.alertService.confirm(
                `Are you sure duplicate scenario ${this.scenario.name}?`,
                'Duplicate',
            )
        ) {
            this.scenarioService
                .duplicateScenario(scenarioId)
                .pipe(
                    map((res: ResModel<ScenarioResModel>) => {
                        if (res.success) {
                            return res.data.items[0];
                        }
                        throw new Error('Unknown API error');
                    }),
                    catchError((err: any) => {
                        console.error(err);
                        return of({} as ScenarioResModel);
                    }),
                )
                .subscribe({
                    next: (value: ScenarioResModel) => {
                        this.toastService.success(
                            `Scenario "${this.scenario.name}" successfully duplicated.`,
                        );

                        this.duplicateScenario.emit({
                            projectId: this.scenario.project_id,
                            scenarioId: scenarioId,
                            newScenario: value,
                        });
                    },
                    error: (err) => {
                        this.toastService.error(
                            err.error.detail ||
                                'An error occured while duplicating scenario.',
                        );
                    },
                });
        }
    }
}
