import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

    @ViewChild('setup')
    scenarioSetupComponent!: ScenarioSetupComponent;

    @ViewChild('sed')
    scenarioEnergyDesignComponent!: ScenarioEnergyDesignComponent;

    private readonly route = inject(ActivatedRoute);
    scenarioService = inject(ScenarioService);

    projectId!: number | null;
    projectName!: string | null;

    ngOnInit() {
        const p_id = this.route.snapshot.paramMap.get('p_id');
        this.projectId = p_id ? +p_id : null;

        const p_name = this.route.snapshot.paramMap.get('p_name');
        this.projectName = p_name ? p_name : null;
    }

    nextStep() {
        let currentStateData;

        switch (this.currentStep) {
            case 0:
                currentStateData = this.scenarioSetupComponent.getData();

                if (currentStateData) {
                    currentStateData = {
                        ...currentStateData,
                        projectId: this.projectId,
                        projectName: this.projectName,
                    };

                    this.saveCurrentStateData(
                        this.currentStep,
                        currentStateData
                    );
                    this.currentStep += 1;
                }
                break;

            case 1:
                // currentStateData = this.energyDrawflowComponent.getData();
                break;
        }
    }

    prevtStep() {
        this.currentStep -= 1;
    }

    saveCurrentStateData(state: number, data: any) {
        localStorage.removeItem(`scenario_data`);
        localStorage.setItem(`scenario_data`, JSON.stringify(data));
    }

    saveScenario() {
        const drawflowData = this.scenarioEnergyDesignComponent.getData();
        let scenarioData: any = localStorage.getItem('scenario_data');

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

            console.log(newScenarioData);

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
}
