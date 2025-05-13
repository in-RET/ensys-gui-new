import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EnergyDrawflowComponent } from '../scenario-energy-design/energy-drawflow/energy-drawflow.component';
import { ScenarioEnergyDesignComponent } from '../scenario-energy-design/scenario-energy-design.component';
import { ScenarioSetupComponent } from '../scenario-setup/scenario-setup.component';
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
    currentStep: number = 0;

    @ViewChild('setup')
    scenarioSetupComponent!: ScenarioSetupComponent;

    @ViewChild('drawflow')
    energyDrawflowComponent!: EnergyDrawflowComponent;

    private readonly route = inject(ActivatedRoute);
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
                currentStateData = this.energyDrawflowComponent.getData();
                break;
        }
    }

    prevtStep() {
        this.currentStep -= 1;
    }

    saveCurrentStateData(state: number, data: any) {
        localStorage.removeItem(`scenario-step-${state}`);
        localStorage.setItem(`scenario-step-${state}`, JSON.stringify(data));
    }
}
