import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {map} from 'rxjs';
import {ResDataModel, ResModel} from '../../../../shared/models/http.model';
import {AlertService} from '../../../../shared/services/alert.service';
import {ToastService} from '../../../../shared/services/toast.service';
import {ScenarioResModel} from '../../../scenario/models/scenario.model';
import {ScenarioService} from '../../../scenario/services/scenario.service';
import {TemplateModel} from '../../models/template.model';
import {TemplateScenarioItemComponent} from '../template-scenario-item/template-scenario-item.component';

@Component({
    selector: 'app-template-item',
    standalone: true,
    templateUrl: './template-item.component.html',
    imports: [
        CommonModule,
        RouterLink,
        TemplateScenarioItemComponent
    ],
    styleUrls: ['./template-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TemplateItemComponent implements OnInit {
    @Input() template!: TemplateModel;

    @Output() deleteTemplate: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateTemplate: EventEmitter<any> = new EventEmitter<any>();

    scenarioService = inject(ScenarioService)
    router = inject(Router)
    alertService = inject(AlertService)
    toastService = inject(ToastService)

    ngOnInit() {
        this.getScenarios(this.template.id);
    }

    async delete_modal(id: number) {
        const confirmed = await this.alertService.confirm(
            'This will also delete all related template data.',
            undefined,
            undefined,
            undefined,
            'warning'
        );
        if (confirmed) {
            this._deleteTemplate(id);
            this.alertService.success(`Removed the template`);
        }
    }

    private _deleteTemplate(id: number) {
        this.deleteTemplate.emit(id);
    }

    async duplicate_modal(id: number) {
        const confirmed = await this.alertService.confirm(
            'This will also duplicate all related template data.',
            undefined,
            undefined,
            undefined,
            'warning'
        );

        if (confirmed) {
            this._duplicateTemplate(id);
            this.alertService.success(`Duplicated the template`);
        }
    }

    private _duplicateTemplate(id: number) {
        this.duplicateTemplate.emit(id);
    }

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

    newScenario(tId: number, tName: string) {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.removeDrawflow_Storage();

        this.scenarioService.saveBaseInfo_Storage({
            template: {
                id: tId,
                name: tName,
                scenarioList: this.template.scenarioList ?? [],
            },
        });
        this.router.navigate(['../../scenario']);
    }

    deleteScenario(scenarioId: number) {
        this.template.scenarioList = this.template.scenarioList?.filter(
            (x: any) => x.id !== scenarioId
        );
    }

    duplicateScenario(template_id: number) {
        this.getScenarios(template_id);
    }
}

