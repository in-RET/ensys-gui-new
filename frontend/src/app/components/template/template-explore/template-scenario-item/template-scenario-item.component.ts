import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ScenarioModel,} from '../../../scenario/models/scenario.model';
import {TemplateModel} from '../../models/template.model';

@Component({
    selector: 'app-template-scenario-item',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './template-scenario-item.component.html',
    styleUrl: './template-scenario-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateScenarioItemComponent {
    @Input() template!: TemplateModel;
    @Input() scenario!: ScenarioModel;
}
