import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioReqModel,
    ScenarioResModel,
} from '../models/scenario.model';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
import { ScenarioService } from '../services/scenario.service';
import { SimulationService } from '../simulation/services/simulation.service';
import { ScenarioFooterComponent } from './scenario-footer/scenario-footer.component';
import { ScenarioProgressionComponent } from './scenario-progression/scenario-progression.component';

@Component({
    selector: 'app-scenario-base',
    imports: [
        CommonModule,
        ScenarioProgressionComponent,
        ScenarioFooterComponent,
        ScenarioSetupComponent,
        ScenarioEnergyDesignComponent,
    ],
    templateUrl: './scenario-base.component.html',
    styleUrl: './scenario-base.component.scss',
})
export class ScenarioBaseComponent {
    currentStep: number = 1;
    currentScenario!: ScenarioBaseInfoModel;
    isScenarioNew!: boolean;

    @ViewChild('setup')
    scenarioSetupComponent!: ScenarioSetupComponent;
    @ViewChild('sed', { static: false })
    scenarioEnergyDesignComponent!: any;

    scenarioService = inject(ScenarioService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    alertService = inject(AlertService);
    toastService = inject(ToastService);
    simulationService = inject(SimulationService);

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
        this.checkScenarioIsNew();
    }

    nextStep() {
        switch (this.currentStep) {
            case 0:
                let scenarioBaseData = this.scenarioSetupComponent.getData();

                if (scenarioBaseData) {
                    this.saveBaseInfo(scenarioBaseData);
                    ++this.currentStep;
                }
                break;
        }
    }

    prevtStep() {
        --this.currentStep;
    }

    saveBaseInfo(data: any) {
        this.scenarioService.removeBaseInfo_Storage();

        const { id, name, sDate, timeStep, interval, simulationYear, project } =
            data;

        const _data: ScenarioBaseInfoModel = {
            project,
            scenario: {
                id,
                name,
                sDate,
                timeStep,
                interval,
                simulationYear,
            },
        };

        this.scenarioService.saveBaseInfo_Storage(_data);
        this.currentScenario = _data;
    }

    onSaveScenario(): void {
        this.scenarioService.onSaveScenario()?.subscribe({
            next: (val: ScenarioResModel) => {
                this.toastService.success(`Scenario ${val.name} saved.`);

                // update session
                const scenarioData: ScenarioBaseInfoModel | null =
                    this.scenarioService.restoreBaseInfo_Storage();

                if (scenarioData && scenarioData.scenario) {
                    scenarioData.scenario.id = val.id;

                    this.scenarioService.updateBaseInfo_Scenario(scenarioData);

                    // update local this.data
                    this.currentScenario.scenario = scenarioData.scenario;
                    // update view+data by id
                    this.checkScenarioIsNew();
                }
            },
            error: (err: string) => {
                this.toastService.error(err);
            },
        });
    }

    async saveScenario(): Promise<Observable<any> | undefined> {
        const scenarioData: ScenarioBaseInfoModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return;
        }

        const drawflowData = this.scenarioService.restoreDrawflow_Storage(true);

        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return;
        }

        let newScenarioData: ScenarioReqModel = {
            name: scenarioData.scenario?.name,
            start_date: scenarioData.scenario?.sDate,
            time_steps: scenarioData.scenario.timeStep,
            project_id: scenarioData.project.id,
            interval: 1,
            modeling_data: drawflowData,
        };

        return this.scenarioService.createScenario(newScenarioData);
    }

    onUpdateScenario() {
        this.scenarioService.onUpdateScenario()?.subscribe({
            next: (val: ScenarioResModel) => {
                this.toastService.success(`Scenario ${val.name} updated.`);
            },
        });
    }

    checkScenarioBaseDataAvailablity() {
        this.route.data
            .pipe(
                map((res: any) => {
                    if (res) {
                        const { currentProject, currentScenario } = res;

                        this.currentScenario = {
                            project: currentProject,
                            scenario: currentScenario,
                        };

                        return res;
                    }
                })
            )
            .subscribe((res: any) => {
                if (!res.currentProject) this.router.navigate(['projects']);
                else if (!res.currentScenario) this.goToStep(0);
            });
    }

    goToStep(number: number) {
        this.currentStep = number;
    }

    async startSimulation(scenarioId: number | undefined): Promise<any> {
        const drawflowData = this.scenarioService.restoreDrawflow_Storage(true);
        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return false;
        }

        // scenario has stored
        if (scenarioId) {
            const confirmed_updateAndSimulation =
                await this.alertService.confirm(
                    'Update Scenario & Start Simulation?',
                    'Update & Play',
                    `Update & Simulation`,
                    `Just Simulation`
                );

            if (confirmed_updateAndSimulation) {
                this.scenarioService
                    .onUpdateScenario()
                    ?.pipe(
                        map((res: ScenarioResModel) => {
                            if (res) {
                                this.toastService.success(
                                    `Scenario ${res.name} updated.`
                                );
                                return res;
                            }
                            throw new Error('Unknown API error');
                        }),
                        switchMap(() =>
                            this.simulationService
                                .startSimulation(scenarioId)
                                .pipe(
                                    map((res: ResModel<ScenarioResModel>) => {
                                        if (res.success) return res.data;
                                        throw new Error('Unknown API error');
                                    })
                                )
                        )
                    )
                    .subscribe({
                        next: (val: any) => {
                            this.toastService.success(val);
                        },
                        error: (err) => {
                            debugger;
                            this.alertService.error('Failed');
                        },
                    });
            } else {
                // start simulation
                this.simulationService
                    .startSimulation(scenarioId)
                    .pipe(
                        map((res: ResModel<ScenarioResModel>) => {
                            if (res.success) return res.data;
                            throw new Error('Unknown API error');
                        })
                    )
                    .subscribe({
                        next: (val: any) => {
                            this.toastService.success(val);
                        },
                        error: (err) => {
                            this.alertService.error('Failed');
                        },
                    });
            }
        }
        // has not stored yet
        else {
            const confirmed = await this.alertService.confirm(
                'The Scenrio has not been stored, you need to save at first.',
                'Save & Play',
                `Save + Start`,
                `No`
            );

            if (confirmed) {
                let res: Observable<any> | undefined =
                    await this.saveScenario();

                if (res) {
                    res.pipe(
                        map((res: ResModel<ScenarioResModel>) => {
                            if (res.success) return res.data.items[0];
                            throw new Error('Unknown API error');
                        })
                    ).subscribe({
                        next: (val: ScenarioResModel) => {
                            const scenarioData: ScenarioBaseInfoModel | null =
                                this.scenarioService.restoreBaseInfo_Storage();

                            this.toastService.success(`Scenario  saved.`);

                            // update session
                            if (scenarioData?.scenario) {
                                scenarioData.scenario.id = val.id;

                                this.scenarioService.updateBaseInfo_Scenario(
                                    scenarioData
                                );

                                // update local this.data
                                this.currentScenario.scenario =
                                    scenarioData.scenario;
                                // update view+data by id
                                this.checkScenarioIsNew();

                                if (this.currentScenario.scenario?.id) {
                                    // start simulation
                                    this.simulationService
                                        .startSimulation(
                                            this.currentScenario.scenario.id
                                        )
                                        .pipe(
                                            map(
                                                (
                                                    res: ResModel<ScenarioResModel>
                                                ) => {
                                                    if (res.success)
                                                        return res.data;
                                                    throw new Error(
                                                        'Unknown API error'
                                                    );
                                                }
                                            )
                                        )
                                        .subscribe({
                                            next: (
                                                val: ResDataModel<ScenarioResModel>
                                            ) => {
                                                this.toastService.success(
                                                    'Simulation has started.'
                                                );
                                            },
                                            error: (err) => {
                                                this.alertService.error(
                                                    'Failed'
                                                );
                                            },
                                        });
                                }
                            }
                        },
                        error: (err: string) => {
                            this.toastService.error(err);
                            return false;
                        },
                    });
                }
            }
        }
    }

    checkScenarioIsNew() {
        if (this.currentScenario.scenario?.id) {
            this.isScenarioNew = false;
            return false;
        } else {
            this.isScenarioNew = true;
            return true;
        }
    }

    openSimulations(scenarioId: number) {
        this.scenarioEnergyDesignComponent.openSimulations(scenarioId);
    }
}
