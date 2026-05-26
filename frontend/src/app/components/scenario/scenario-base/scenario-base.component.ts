import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { EnergyModelConverterService } from '../../../shared/services/energy-model-converter-service/energy-model-converter.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioResModel,
    ScenarioUpdatedModel,
    UserModelingStateModel,
    UserModelingSTEP,
} from '../models/scenario.model';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
import {
    ScenarioStateModel,
    ScenarioStateService,
} from '../services/scenario-state.service';
import { ScenarioService } from '../services/scenario.service';
import { SimulationService } from '../simulation/services/simulation.service';
import { ScenarioFooterComponent } from './scenario-footer/scenario-footer.component';

@Component({
    selector: 'app-scenario-base',
    imports: [
        CommonModule,
        ScenarioFooterComponent,
        ScenarioSetupComponent,
        ScenarioEnergyDesignComponent,
    ],
    templateUrl: './scenario-base.component.html',
    styleUrl: './scenario-base.component.scss',
})
export class ScenarioBaseComponent implements OnInit {
    subscriptionScenarioState!: Subscription;
    UserModelingSTEP = UserModelingSTEP;
    currentScenario!: ScenarioStateModel | null;

    @ViewChild('setup')
    setupComponent!: ScenarioSetupComponent;
    @ViewChild('sed', { static: false })
    energyDesignComponent!: any;

    scenarioService = inject(ScenarioService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    alertService = inject(AlertService);
    toastService = inject(ToastService);
    simulationService = inject(SimulationService);
    serv = inject(EnergyModelConverterService);
    scenarioStateService = inject(ScenarioStateService);

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
        this.loadCurrentScenarioData();

        this.subscriptionScenarioState =
            this.scenarioStateService.scenarioState.subscribe(
                (res: ScenarioStateModel | null) => {
                    console.log('Scenario_State has changed: ', res);
                    this.currentScenario = res;
                },
            );
    }

    private checkScenarioBaseDataAvailablity() {
        this.route.data
            .pipe(
                map((res: any) => {
                    if (res) {
                        return res;
                    }
                }),
            )
            .subscribe((res: any) => {
                if (!res.currentProject) this.router.navigate(['projects']);
            });
    }

    goToStep(step: UserModelingSTEP) {
        this.scenarioService.updateUserModelingState({
            currentStep: step,
        });
        this.scenarioStateService.setUserModelingState({
            currentStep: step,
        });
    }

    private loadCurrentScenarioData() {
        const currentScenarioData: ScenarioStateModel | null =
            this.scenarioStateService.getScenarioData();

        if (!currentScenarioData) {
            const currentScenarioData_storage: ScenarioBaseInfoModel | null =
                this.scenarioService.restoreBaseInfo_Storage();

            if (currentScenarioData_storage) {
                let scenarioStateData: ScenarioBaseInfoModel | null = null;

                if (currentScenarioData_storage.project) {
                    scenarioStateData = {
                        project: {
                            id: currentScenarioData_storage.project.id,
                            name: currentScenarioData_storage.project?.name,
                        },
                    };

                    if (currentScenarioData_storage.scenario) {
                        scenarioStateData.scenario = {
                            id: currentScenarioData_storage.scenario.id,
                            name: currentScenarioData_storage.scenario.name,
                            sDate: currentScenarioData_storage.scenario.sDate,
                            timeStep:
                                currentScenarioData_storage.scenario.timeStep,
                            interval:
                                currentScenarioData_storage.scenario.interval,
                            simulationYear:
                                currentScenarioData_storage.scenario
                                    .simulationYear,
                            modeling_data:
                                currentScenarioData_storage.scenario
                                    .modeling_data,
                            constraints:
                                currentScenarioData_storage.scenario
                                    .constraints,
                        };
                    }
                }

                if (scenarioStateData)
                    this.scenarioStateService.setScenarioData(
                        scenarioStateData,
                    );
            }
        }

        // user state
        const userModelingState: UserModelingStateModel | null =
            this.scenarioStateService.getUserModelingState();

        if (!userModelingState) {
            const currentuserModelingState: UserModelingStateModel | null =
                this.scenarioService.restoreUserModelingState();

            if (currentuserModelingState) {
                this.scenarioStateService.setUserModelingState(
                    currentuserModelingState,
                );
            }
        }
    }

    async saveAndGoToScenarioPage() {
        const formData = this.setupComponent.getFormData();

        if (!formData) {
            this.toastService.warning('Please fill in all required fields!');
            return;
        }

        formData.id =
            this.scenarioStateService.getScenarioData()?.scenario?.id!;
        const constraints = this.setupComponent.getConstraintData();

        if (!formData.id) {
            const data: ScenarioBaseInfoModel = {
                project: formData.project,
                scenario: {
                    name: formData.name,
                    sDate: formData.sDate,
                    timeStep: formData.timeStep,
                    interval: 1,
                    simulationYear: formData.simulationYear,
                    constraints: constraints,
                    modeling_data: null,
                },
            };
            await this.saveScenario(data);
        } else {
            const data: ScenarioUpdatedModel = {
                project: formData.project,
                scenario: {
                    id: formData.id,
                    name: formData.name,
                    sDate: formData.sDate,
                    timeStep: formData.timeStep,
                    interval: 1,
                    simulationYear: formData.simulationYear,
                    constraints: constraints,
                    modeling_data:
                        this.scenarioStateService.getScenarioData()?.scenario
                            ?.modeling_data || null,
                },
            };
            await this.updateScenario(data);
        }

        this.goToStep(UserModelingSTEP.SCENARIO_MODELING);
    }

    goToSetupPage() {
        // this.updateScenario()
        this.goToStep(UserModelingSTEP.SCENARIO_SETUP);
    }

    onSaveScenario(e: ScenarioBaseInfoModel) {
        this.saveScenario(e);
    }
    /**
     *
     * @param baseData
     * @param constraints
     * both of params are filled if the fn called by Setup component
     * @returns a promise for await
     */
    saveScenario(data: ScenarioBaseInfoModel): Promise<void> | void {
        return new Promise((resolve, reject) => {
            this.scenarioService.saveCurrentScenario(data).subscribe({
                next: (val: ScenarioResModel) => {
                    if (data.scenario) {
                        data.scenario.id = val.id;
                    }

                    // update session
                    this.scenarioService.replaceBaseInfo_Storage(data);

                    // update drawflowData$ state
                    this.scenarioStateService.setScenarioData(data);

                    this.toastService.success(`Scenario "${val.name}" saved.`);
                    resolve();
                },
                error: (err: any) => {
                    let errStr: string;
                    if (err && err.error.detail) errStr = err.error.detail;
                    else if (err && err.message) errStr = err.message;
                    else errStr = 'Unknown API error';
                    this.toastService.error(errStr);
                    reject(err);
                },
            });
        });
    }

    updateScenario(data: ScenarioUpdatedModel): Promise<void> | void {
        return new Promise((resolve, reject) => {
            this.scenarioService.updateCurrentScenario(data).subscribe({
                next: (val: ScenarioResModel) => {
                    // update session
                    this.scenarioService.replaceBaseInfo_Storage(data);

                    // update drawflowData$ state
                    this.scenarioStateService.setScenarioData(data);

                    this.toastService.success(
                        `Scenario "${val.name}" updated.`,
                    );
                    resolve();
                },
                error: (err: any) => {
                    let errStr: string;
                    if (err && err.error.detail) errStr = err.error.detail;
                    else if (err && err.message) errStr = err.message;
                    else errStr = 'Unknown API error';
                    this.toastService.error(errStr);
                    reject(err);
                },
            });
        });
    }

    // onUpdateScenarioDrawflow() {}

    async startSimulation(): Promise<void> {
        if (
            this.currentScenario &&
            this.currentScenario.scenario &&
            this.currentScenario.project
        ) {
            // first update current scenario, then start simulation
            const data: ScenarioUpdatedModel = {
                project: this.currentScenario.project,
                scenario: {
                    id: this.currentScenario.scenario.id!,
                    name: this.currentScenario.scenario.name,
                    sDate: this.currentScenario.scenario.sDate,
                    timeStep: this.currentScenario.scenario.timeStep,
                    interval: 1,
                    simulationYear:
                        this.currentScenario.scenario.simulationYear,
                    constraints: this.currentScenario.scenario.constraints,
                    modeling_data: this.currentScenario.scenario.modeling_data,
                },
            };
            await this.updateScenario(data);

            // start simulation
            this.simulationService
                .startSimulation(data.scenario.id)
                .pipe(
                    map((res: ResModel<ScenarioResModel>) => {
                        if (res.success) return res.data;
                        throw new Error('Unknown API error');
                    }),
                )
                .subscribe({
                    next: (val: any) => {
                        this.toastService.success(val);

                        // const d: {
                        //     [nodeKey: string]: DrawflowNode;
                        // } | null =
                        //     this.scenarioService.restoreDrawflow_Storage();

                        // if (d) {
                        //     const new_d =
                        //         this.serv.convertDrawFlowDataToOemofModelData(
                        //             d,
                        //         );
                        //     this.serv.downloadJson(new_d, 'a');
                        // }
                    },
                    error: (err) => {
                        this.alertService.error('Failed');
                    },
                });
        } else {
            this.alertService.error(
                'Failed to update scenario before simulation!',
            );
        }
    }

    openSimulations() {
        const scenarioId =
            this.scenarioStateService.getScenarioData()?.scenario?.id;

        if (scenarioId) {
            this.energyDesignComponent.showModal_Simulation(scenarioId);
        }
    }

    footerSaveScenario() {
        this.setupComponent.onSaveScenario();
    }

    footerUpdateScenario() {
        this.setupComponent.onUpdateScenario();
    }

    ngOnDestroy() {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioStateService.clearScenarioData();

        this.scenarioService.removeUserModelingState();
        this.scenarioStateService.clearUserModelingState();

        this.scenarioService.removeDrawflow_Data();

        this.subscriptionScenarioState.unsubscribe();
    }
}
