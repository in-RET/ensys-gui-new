import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {ToastService} from '../../../../shared/services/toast.service';
import {TemplateModel} from '../../models/template.model';
import {TemplateService} from '../../services/template.service';
import {NgForOf, NgIf} from "@angular/common";
import {TemplateScenarioItemComponent} from '../template-scenario-item/template-scenario-item.component';
import {AlertService} from '../../../../shared/services/alert.service';
import {map} from 'rxjs';
import {ResDataModel, ResModel} from '../../../../shared/models/http.model';
import {ScenarioResModel} from '../../../scenario/models/scenario.model';
import {ScenarioService} from '../../../scenario/services/scenario.service';
import {
    ProjectScenarioItemComponent
} from '../../../project/project-explore/project-scenario-item/project-scenario-item.component';

@Component({
    selector: 'app-template-item',
    standalone: true,
    templateUrl: './template-item.component.html',
    imports: [
        NgForOf,
        NgIf,
        TemplateScenarioItemComponent,
        ProjectScenarioItemComponent
    ],
    styleUrls: ['./template-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TemplateItemComponent implements OnInit {
    @Input() template!: TemplateModel;

    @Output() deleteProject: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateProject: EventEmitter<any> = new EventEmitter<any>();

    templateService = inject(TemplateService)
    router = inject(Router)
    alertService = inject(AlertService)
    toastService = inject(ToastService)
    scenarioService = inject(ScenarioService)

    getScenarios(templateId: number) {
        this.scenarioService
            .getScenarios(templateId)
            .pipe(
                map((res: ResModel<ScenarioResModel>) => {
                    if (res.success) return res.data;
                    throw new Error('Unknown API error');
                })
            )
            .subscribe({
                next: (val: ResDataModel<ScenarioResModel>) => {
                    this.template.scenarioList = val.items;
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.error(err);
                },
            });
    }

    ngOnInit() {
        this.getScenarios(this.template.id)
    }
}

