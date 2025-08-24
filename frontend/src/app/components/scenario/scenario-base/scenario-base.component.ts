import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DrawflowNode } from 'drawflow';
import { map } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
import { ScenarioModel, ScenarioService } from '../services/scenario.service';
import { ScenarioFooterComponent } from './scenario-footer/scenario-footer.component';
import { ScenarioProgressionComponent } from './scenario-progression/scenario-progression.component';

interface ScenarioReqData {
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
    currentScenario: any;

    @ViewChild('setup')
    scenarioSetupComponent!: ScenarioSetupComponent;
    @ViewChild('sed', { static: false })
    scenarioEnergyDesignComponent!: any;

    scenarioService = inject(ScenarioService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    alertService = inject(AlertService);

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
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
            case 1:
                // scenarioBaseData = this.energyDrawflowComponent.getData();
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

        let _data: any = {
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

    saveScenario() {
        const scenarioData: ScenarioModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

        if (scenarioData && scenarioData.scenario) {
            let newScenarioData: ScenarioReqData | null = {
                name: scenarioData.scenario?.name,
                start_date: scenarioData.scenario?.sDate,
                time_steps: scenarioData.scenario?.timeStep,
                project_id: scenarioData.project.id,
                interval: 0,
                modeling_data:
                    this.scenarioService.restoreDrawflow_Storage(true),
            };

            const drawflowData = this.scenarioService.restoreDrawflow_Storage();

            for (const key in drawflowData) {
                if (Object.prototype.hasOwnProperty.call(drawflowData, key)) {
                    const element: DrawflowNode = drawflowData[key];
                    // newScenarioData.modeling_data.components.push({
                    //     data: element.data,
                    //     inputs: [],
                    //     outputs: [],
                    //     label: element.name,
                    //     oemof_type: '',
                    //     additionalProp1: {},
                    // });
                }
            }

            this.scenarioService.createScenario(newScenarioData).subscribe({
                next: (value: any) => {
                    console.log(value);
                },
                error: (err: any) => {
                    console.error(err);
                    this.alertService.error(err.message);
                },
            });
        } else {
            this.alertService.warning('There is no data to save!');
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
}
