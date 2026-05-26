import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { catchError, map, of } from 'rxjs';
import { ResDataModel, ResModel } from '../../../../shared/models/http.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ScenarioModel } from '../../../scenario/models/scenario.model';
import { TemplateModel } from '../../models/template.model';
import { TemplateService } from '../../services/template.service';
import { TemplateScenarioItemComponent } from '../template-scenario-item/template-scenario-item.component';

@Component({
    selector: 'app-template-item',
    standalone: true,
    templateUrl: './template-item.component.html',
    imports: [CommonModule, TemplateScenarioItemComponent, NgbCollapseModule],
    styleUrls: ['./template-item.component.scss'],
})
export class TemplateItemComponent {
    isCollapsed = true;
    loading: {
        scenarios: boolean;
    } = {
        scenarios: false,
    };

    private _template!: TemplateModel;
    @Input() set template(val: TemplateModel) {
        if (val) {
            this._template = val;
        }
    }
    get template(): TemplateModel {
        return this._template;
    }

    @Output() deleteTemplate: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateTemplate: EventEmitter<any> = new EventEmitter<any>();

    templateService = inject(TemplateService);
    router = inject(Router);
    toastService = inject(ToastService);
    alertService = inject(AlertService);

    ngOnInit() {}

    createProjectFromTemplate(id: number) {
        this.templateService.createProjectFromTemplate(id).subscribe({
            next: (value) => {
                if (value.success) {
                    this.toastService.success('Project created from template.');
                    this.router.navigate(['/explore']).then();
                } else this.toastService.error('An error occured.');
            },
            error: (err) => {
                this.toastService.error(
                    err.error.detail ||
                        'An error occured while creating project.',
                );
            },
        });
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (!this.template.scenarioList) {
            this.loading.scenarios = true;

            setTimeout(() => {
                this.loadScenarios();
            }, 500);
        }
    }

    loadScenarios() {
        this.loading.scenarios = true;

        this.templateService
            .getTemplateScenarios(this._template.id)
            .pipe(
                map((res: ResModel<ScenarioModel>) => {
                    this.loading.scenarios = false;

                    if (res.success)
                        return (res.data as ResDataModel<ScenarioModel>)
                            .items as ScenarioModel[];

                    throw new Error('Unknown API error');
                }),
                catchError((err: any) => {
                    console.error(err);
                    this.toastService.error('Failed to load scenarios.');
                    return of([] as ScenarioModel[]);
                }),
            )
            .subscribe({
                next: (data: ScenarioModel[]) => {
                    this._template.scenarioList = data;
                },
            });
    }
}
