import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map, Observable } from 'rxjs';
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
    isScenarioNew!: boolean;

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
        this.checkScenarioIsNew();
    }

    nextStep() {
        switch (this.currentStep) {
            case 0:
                let scenarioBaseData = this.scenarioSetupComponent.getData();

                if (scenarioBaseData) {
                    if (this.isScenarioNew) this.saveBaseInfo(scenarioBaseData);
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

        const { name, sDate, timeStep, interval, simulationYear, project } =
            data;

        const _data: ScenarioBaseInfoModel = {
            project,
            scenario: {
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

    async onSaveScenario(): Promise<any> {
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

        try {
            this.scenarioService
                .createScenario(newScenarioData)
                .pipe(
                    map((res: ResModel<ScenarioResModel>) => {
                        if (res.success) return res.data.items[0];
                        throw new Error('Unknown API error');
                    })
                )
                .subscribe({
                    next: (val: ScenarioResModel) => {
                        this.toastService.success(
                            `Scenario ${newScenarioData.name} saved.`
                        );

                        // update session
                        if (scenarioData.scenario) {
                            scenarioData.scenario.id = val.id;

                            this.scenarioService.updateBaseInfo_Scenario(
                                scenarioData
                            );

                            // update local this.data
                            this.currentScenario.scenario =
                                scenarioData.scenario;
                            // update view+data by id
                            this.checkScenarioIsNew();
                        }
                    },
                    error: (err: string) => {
                        this.toastService.error(err);
                        return false;
                    },
                });
        } catch (err: any) {
            console.error(err);

            if (err.status == 409) {
                const confirmed = await this.alertService.confirm(
                    'Do you want change the name? Or Update current?',
                    'Duplicate Scenario!',
                    '< Step',
                    'Update',
                    'error'
                );

                if (confirmed) {
                    this.prevtStep();
                } else {
                    this.updateScenario();
                }
            } else this.alertService.error(err.message || 'Save failed');
        }
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

    async updateScenario(
        startSimulatioAfetr: boolean = false
    ): Promise<void | boolean> {
        const scenarioData: ScenarioBaseInfoModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return false;
        }

        if (!scenarioData.scenario.id) {
            this.alertService.warning('Error: Id not found!');
            return false;
        }

        let newScenarioData: ScenarioReqModel = {
            name: scenarioData.scenario?.name,
            start_date: scenarioData.scenario?.sDate,
            time_steps: scenarioData.scenario?.timeStep,
            interval: 1,
            modeling_data: this.scenarioService.restoreDrawflow_Storage(true),
        };

        const drawflowData = this.scenarioService.restoreDrawflow_Storage();

        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return false;
        }

        try {
            const res = await firstValueFrom(
                this.scenarioService
                    .updateScenario(newScenarioData, scenarioData.scenario.id)
                    .pipe(
                        map((res: ResModel<ScenarioResModel>) => {
                            if (!res.success)
                                throw new Error('Unknown API error');
                            return res.data;
                        })
                    )
            );

            this.toastService.success(
                `Scenario ${scenarioData.scenario.name} updated`
            );
        } catch (err: any) {
            console.error(err);
            this.alertService.error(err.message || 'Save failed');
            return false;
        }
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
        console.log(scenarioId);

        const drawflowData = this.scenarioService.restoreDrawflow_Storage(true);
        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return false;
        }

        // scenario has stored
        if (scenarioId) {
            const confirmed = await this.alertService.confirm(
                'Update Scenario & Start Simulation?',
                'Update & Play',
                `Update & Simulation`,
                `Just Simulation`
            );

            if (confirmed) await this.updateScenario(true);

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
                    next: (val: ResDataModel<ScenarioResModel>) => {
                        this.toastService.success('Simulation has started.');
                    },
                    error: (err) => {
                        this.alertService.error('Failed');
                    },
                });
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
}
