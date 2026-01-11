import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScenarioModel } from '../../../scenario/models/scenario.model';

@Component({
    selector: 'app-template-scenario-item',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './template-scenario-item.component.html',
    styleUrl: './template-scenario-item.component.scss',
})
export class TemplateScenarioItemComponent {
    @Input() scenario!: ScenarioModel;
}
