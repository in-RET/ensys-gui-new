import { Component } from '@angular/core';
import { ScenarioFooterComponent } from './scenario-footer/scenario-footer.component';
import { ScenarioProgressionComponent } from './scenario-progression/scenario-progression.component';

@Component({
    selector: 'app-scenario-base',
    imports: [ScenarioProgressionComponent, ScenarioFooterComponent],
    templateUrl: './scenario-base.component.html',
    styleUrl: './scenario-base.component.scss',
})
export class ScenarioBaseComponent {
    currentStep: number = 0;

    nextStep() {
        this.currentStep += 1;
    }

    prevtStep() {
        this.currentStep -= 1;
    }
}
