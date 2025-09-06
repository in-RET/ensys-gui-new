import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
import { ScenarioModel, ScenarioService } from '../services/scenario.service';
import { SimulationService } from '../simulation/services/simulation.service';
import { ScenarioFooterComponent } from './scenario-footer/scenario-footer.component';
import { ScenarioProgressionComponent } from './scenario-progression/scenario-progression.component';

interface ScenarioReqData {
    id?: number;
    name: string;
    start_date: string;
    time_steps: number;
    interval: number;
    project_id: number;
    modeling_data: string;
}

interface ScenarioComponent {
    label: string;
    oemof_type: string;
    data: {};
    inputs: [];
    outputs: [];
    additionalProp1: {};
}

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
    currentScenario!: ScenarioModel;

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

        const {
            name,
            simulationPeriod,
            sDate,
            timeStep,
            simulationYear,
            project,
        } = data;

        const _data: ScenarioModel = {
            project,
            scenario: {
                name,
                simulationPeriod,
                sDate,
                timeStep,
                simulationYear,
            },
        };

        this.scenarioService.saveBaseInfo_Storage(_data);
        this.currentScenario = _data;
    }

    async saveScenario(): Promise<number | boolean> {
        const scenarioData: ScenarioModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return false;
        }

        const drawflowData = this.scenarioService.restoreDrawflow_Storage(true);

        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return false;
        }

        let newScenarioData: ScenarioReqData = {
            name: scenarioData.scenario?.name,
            start_date: scenarioData.scenario?.sDate,
            time_steps: scenarioData.scenario?.timeStep,
            project_id: scenarioData.project.id,
            interval: 0,
            modeling_data: drawflowData,
        };

        try {
            const response = await firstValueFrom(
                this.scenarioService.createScenario(newScenarioData)
            );
            console.log('Saved:', response);
            return scenarioData.scenario.id ?? true;
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
            return false;
        }
    }

    async updateScenario(
        startSimulatioAfetr: boolean = false
    ): Promise<number | boolean> {
        const scenarioData: ScenarioModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return false;
        }

        if (!scenarioData.scenario.id) {
            this.alertService.warning('Error: Id not found!');
            return false;
        }

        let newScenarioData: ScenarioReqData = {
            name: scenarioData.scenario?.name,
            start_date: scenarioData.scenario?.sDate,
            time_steps: scenarioData.scenario?.timeStep,
            project_id: scenarioData.project.id,
            interval: 0,
            modeling_data: this.scenarioService.restoreDrawflow_Storage(true),
        };

        const drawflowData = this.scenarioService.restoreDrawflow_Storage();

        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return false;
        }

        try {
            const response = await firstValueFrom(
                this.scenarioService.updateScenario(
                    newScenarioData,
                    scenarioData.scenario.id
                )
            );

            console.log('Updated:', response);
            return scenarioData.scenario.id;
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

    async startSimulation(scenarioId?: number) {
        console.log(this.currentScenario);

        if (scenarioId) {
            const confirmed = await this.alertService.confirm(
                'Update Scenario & Start Simulation?',
                'Update & Play'
            );

            if (confirmed) {
                const newScenario = await this.updateScenario(true);
                this.toastService.success('Simulation has started.');
            }
        } else {
            const confirmed = await this.alertService.confirm(
                'Save Scenario & Start Simulation?',
                'Save & Play'
            );

            if (confirmed) {
                const newScenario = await this.saveScenario();
                console.log(newScenario);
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
