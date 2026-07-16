import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DrawflowNode } from 'drawflow';
import { map, Subscription } from 'rxjs';
import { ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioResModel,
    ScenarioUpdatedModel,
    ScenarioUpdatedModel_project,
    ScenarioUpdatedModel_scenario,
    UserModelingStateModel,
    UserModelingSTEP,
} from '../models/scenario.model';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
import { FlowService } from '../services/flow.service';
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
    scenarioStateService = inject(ScenarioStateService);
    flowService = inject(FlowService);

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
        this.loadCurrentScenarioData();

        this.subscriptionScenarioState =
            this.scenarioStateService.scenarioState.subscribe(
                (res: ScenarioStateModel | null) => {
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
                    simulationYear: +formData.simulationYear,
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
                    simulationYear: +formData.simulationYear,
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
        return new Promise(async (resolve, reject) => {
            // check whether the simulationYear has changed
            const oldSimulationYear =
                this.scenarioStateService.getScenarioData()?.scenario
                    ?.simulationYear;

            if (oldSimulationYear !== data.scenario.simulationYear) {
                if (
                    await this.alertService.confirm(
                        'Your selected Simulation Year has changed. This will update all the nodes/flows pre-defined data based on the new Simulation Year. Do you want to continue?',
                        'Warning',
                        undefined,
                        undefined,
                        'question',
                    )
                )
                    // update node/flow's data (preDefData/formInfo) based on Selected Start_Date
                    await this.updateScenario_nodes_preDefData_basedOn_simulationYear(
                        data.scenario.simulationYear,
                    );
            }

            this.scenarioService.updateCurrentScenario(data).subscribe({
                next: (val: ScenarioResModel) => {
                    // update CURRENT_DRAWFLOW session storage
                    this.scenarioService.saveDrawflow_Storage(
                        data.scenario.modeling_data || {},
                    );

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

    updateScenario_nodes_preDefData_basedOn_simulationYear(
        simulationYear: number,
    ): Promise<void> | void {
        return new Promise(async (resolve, reject) => {
            // get all the nodes in the drawflow
            const currentDrawflowData:
                | string
                | {
                      [nodeKey: string]: DrawflowNode;
                  }
                | null = this.scenarioStateService.getDrawflowData();

            if (
                currentDrawflowData == null ||
                Object.keys(currentDrawflowData).length == 0
            )
                resolve();

            if (
                !currentDrawflowData ||
                JSON.stringify(currentDrawflowData) === '{}' ||
                Object.keys(currentDrawflowData).length == 0
            ) {
                resolve();
            }
            //         // update the preDefData based on the selected simulationYear
            for (const key in currentDrawflowData) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        currentDrawflowData,
                        key,
                    )
                ) {
                    const node: DrawflowNode = currentDrawflowData[key];

                    // update node's preDefData
                    // 1. del prev data
                    // 2. add new one
                    if (
                        node.data.type !== 'bus' &&
                        node.data.source !== 'user_defined' &&
                        node.data.oep == true
                    ) {
                        node.data.preDefData = null;
                        const preDefData =
                            await this.flowService.getPreDefinedValue_ports(
                                node.data.source,
                                simulationYear,
                            );
                        node.data.preDefData = preDefData;

                        // update flows' in/output formInfo
                        node.data.connections.inputs.forEach(
                            (input: any, i: number) => {
                                Object.keys(input.formInfo).forEach((key) => {
                                    if (
                                        preDefData.inputs[i].flow_data &&
                                        key in preDefData.inputs[i].flow_data
                                    ) {
                                        (input.formInfo as any)[key] = (
                                            preDefData.inputs[i]
                                                .flow_data as any
                                        )[key];
                                    }
                                });
                            },
                        );

                        node.data.connections.outputs.forEach(
                            (output: any, i: number) => {
                                Object.keys(output.formInfo).forEach((key) => {
                                    if (
                                        preDefData.outputs[i].flow_data &&
                                        key in preDefData.outputs[i].flow_data
                                    ) {
                                        (output.formInfo as any)[key] = (
                                            preDefData.outputs[i]
                                                .flow_data as any
                                        )[key];
                                    }
                                });
                            },
                        );
                    }
                }
            }

            resolve();
        });
    }

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
        // save all the last changes
        const currentScenarioData: ScenarioStateModel | null =
            this.scenarioStateService.getScenarioData();
        const scenarioBaseInfoData: ScenarioUpdatedModel = {
            project:
                currentScenarioData?.project as ScenarioUpdatedModel_project,
            scenario:
                currentScenarioData?.scenario as ScenarioUpdatedModel_scenario,
        };

        this.updateScenario(scenarioBaseInfoData);
        //--------------------------------------------------

        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioStateService.clearScenarioData();

        this.scenarioService.removeUserModelingState();
        this.scenarioStateService.clearUserModelingState();

        this.scenarioService.removeDrawflow_Data();

        this.subscriptionScenarioState.unsubscribe();
    }
}
