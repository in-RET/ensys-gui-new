import {CommonModule} from '@angular/common';
import {Component, inject, ViewChild, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DrawflowNode} from 'drawflow';
import {map} from 'rxjs';
import {ScenarioEnergyDesignComponent} from '../scenario-energy-design/scenario-energy-design.component';
import {ScenarioSetupComponent} from '../scenario-setup/scenario-setup.component';
import {ScenarioService} from '../services/scenario.service';
import {ScenarioFooterComponent} from './scenario-footer/scenario-footer.component';
import {ScenarioProgressionComponent} from './scenario-progression/scenario-progression.component';

interface ScenarioReqData {
    name: string;
    simulation_year: number;
    project_id: number;
    energysystem_model: {
        constraints: [];
        components: ScenarioComponent[];
    };
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
export class ScenarioBaseComponent implements OnInit {
    currentStep = 1;
    currentScenario: any;

    @ViewChild('setup')
    scenarioSetupComponent!: ScenarioSetupComponent;
    @ViewChild('sed', {static: false})
    scenarioEnergyDesignComponent!: any;

    scenarioService = inject(ScenarioService);
    route = inject(ActivatedRoute);
    router = inject(Router);

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
    }

    nextStep() {
        switch (this.currentStep) {
            case 0:
                const scenarioBaseData = this.scenarioSetupComponent.getData();

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
            sDate,
            simulationYear,
            project,
        } = data;

        const _data: any = {
            project,
            scenario: {
                name,
                sDate,
                simulationYear,
            },
        };

        this.scenarioService.saveBaseInfo_Storage(_data);
        this.currentScenario = _data;
    }

    saveScenario() {
        const drawflowData = this.scenarioEnergyDesignComponent.getData();
        let scenarioData: any = this.scenarioService.restoreBaseInfo_Storage();

        if (
            scenarioData &&
            scenarioData.trim() !== ''
        ) {
            scenarioData = JSON.parse(scenarioData);
            const newScenarioData: ScenarioReqData = {
                name: scenarioData['name'],
                simulation_year: scenarioData['simulationYear'],
                project_id: scenarioData['projectId'],
                energysystem_model: {
                    constraints: [],
                    components: [],
                },
            };

            for (const key in drawflowData) {
                if (Object.prototype.hasOwnProperty.call(drawflowData, key)) {
                    const element: DrawflowNode = drawflowData[key];
                    newScenarioData.energysystem_model.components.push({
                        data: element.data,
                        inputs: [],
                        outputs: [],
                        label: element.name,
                        oemof_type: '',
                        additionalProp1: {},
                    });
                }
            }

            this.scenarioService.createScenario(newScenarioData).subscribe({
                next: (value: any) => {
                    console.log(value);
                },
                error: (err: any) => {
                    console.error(err);
                },
            });
        }
    }

    checkScenarioBaseDataAvailablity() {
        this.route.data
            .pipe(
                map((res: any) => {
                    if (res) {
                        const {currentProject, currentScenario} = res;

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
