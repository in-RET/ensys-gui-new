import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { DrawflowNode } from 'drawflow';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
import { ScenarioService } from '../services/scenario.service';
import { ScenarioFooterComponent } from './scenario-footer/scenario-footer.component';
import { ScenarioProgressionComponent } from './scenario-progression/scenario-progression.component';

interface ScenarioReqData {
    name: string;
    timestep: string;
    period: number;
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
export class ScenarioBaseComponent {
    currentStep: number = 1;
    isFullscreen: boolean = true;

    @ViewChild('setup')
    scenarioSetupComponent!: ScenarioSetupComponent;

    @ViewChild('sed', { static: false })
    scenarioEnergyDesignComponent!: any;

    scenarioService = inject(ScenarioService);

    ngOnInit() {
        this.checkScenarioBaseDataAvailablity();
    }

    nextStep() {
        switch (this.currentStep) {
            case 0:
                let scenarioBaseData = this.scenarioSetupComponent.getData();

                if (scenarioBaseData) {
                    // scenarioBaseData = {
                    //     ...scenarioBaseData,
                    // };

                    this.saveBaseInfo(scenarioBaseData);
                    this.goToStep(++this.currentStep);
                }
                break;

            case 1:
                // scenarioBaseData = this.energyDrawflowComponent.getData();
                break;
        }
    }

    prevtStep() {
        this.goToStep(--this.currentStep);
    }

    saveBaseInfo(data: any) {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.saveBaseInfo_Storage(data);
    }

    saveScenario() {
        const drawflowData = this.scenarioEnergyDesignComponent.getData();
        let scenarioData: any = this.scenarioService.restoreBaseInfo_Storage();

        if (
            scenarioData &&
            scenarioData.trim() !== '' &&
            scenarioData !== null &&
            scenarioData !== undefined
        ) {
            scenarioData = JSON.parse(scenarioData);

            let newScenarioData: ScenarioReqData = {
                name: scenarioData['name'],
                timestep: scenarioData['timeStep'],
                period: scenarioData['simulationPeriod'],
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
                next: (value) => {
                    console.log(value);
                },
                error: (err) => {
                    console.error(err);
                },
            });
        }
    }

    checkScenarioBaseDataAvailablity() {
        const Data = this.scenarioService.restoreBaseInfo_Storage();

        if (!Data) {
            this.goToStep(0);
        }
    }

    goToStep(number: number) {
        this.currentStep = number;
    }

    fullScreen() {
        // const elem = this.scenarioEnergyDesignComponent.nativeElement;

        // if (elem.requestFullscreen) {
        //     elem.requestFullscreen();
        // } else if (elem.msRequestFullscreen) {
        //     elem.msRequestFullscreen();
        // } else if (elem.mozRequestFullScreen) {
        //     elem.mozRequestFullScreen();
        // } else if (elem.webkitRequestFullscreen) {
        //     elem.webkitRequestFullscreen();
        // }
        this.isFullscreen = !this.isFullscreen;
    }
}
