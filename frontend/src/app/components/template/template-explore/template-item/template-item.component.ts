import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {ToastService} from '../../../../shared/services/toast.service';
import {TemplateModel, TemplateResModel} from '../../models/template.model';
import {TemplateScenarioItemComponent} from '../template-scenario-item/template-scenario-item.component';
import {TemplateService} from '../../services/template.service';

@Component({
    selector: 'app-template-item',
    standalone: true,
    templateUrl: './template-item.component.html',
    imports: [
        CommonModule,
        TemplateScenarioItemComponent
    ],
    styleUrls: ['./template-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TemplateItemComponent implements OnInit {
    @Input() template!: TemplateModel;

    @Output() deleteTemplate: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateTemplate: EventEmitter<any> = new EventEmitter<any>();

    template_scenarios$!: Observable<TemplateResModel[]>;

    templateService = inject(TemplateService);
    router = inject(Router)
    toastService = inject(ToastService)

    ngOnInit() {
        this.loadTemplateScenarios();
    }

    loadTemplateScenarios() {
        this.template_scenarios$ = this.templateService
            .getTemplateScenarios(this.template.id)
            .pipe(
                map((value: any) => {
                    this.template.scenarioList = value.data.items;
                    return value.data.items;
                }),
                catchError((err) => {
                    console.error(err);
                    this.toastService.error(err);
                    return of([]);
                })
            );
    }

    createProjectFromTemplate(id: number) {
        this.templateService.createProjectFromTemplate(id).subscribe({
            next: (value) => {
                if (value.success) {
                    console.log(value);
                } else this.toastService.error('An error occured.');
            },
            error: (err) => {
                this.toastService.error(err);
            },
        });
    }

}

