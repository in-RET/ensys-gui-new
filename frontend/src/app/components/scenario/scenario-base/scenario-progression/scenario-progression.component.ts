import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-scenario-progression',
    imports: [RouterModule, CommonModule],
    templateUrl: './scenario-progression.component.html',
    styleUrl: './scenario-progression.component.scss',
})
export class ScenarioProgressionComponent {
    steps: any = ['Scenario Setup', 'Energy system design', 'Simulation'];

    @Input('step') currentStep!: number;
}
