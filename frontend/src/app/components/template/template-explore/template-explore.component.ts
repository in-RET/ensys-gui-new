import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { catchError, map, of, shareReplay } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioService } from '../../scenario/services/scenario.service';
import { TemplateModel, TemplateResModel } from '../models/template.model';
import { TemplateService } from '../services/template.service';
import { TemplateItemComponent } from './template-item/template-item.component';
import { FooterComponent } from '../../../core/layout/footer/footer.component';

@Component({
    selector: 'app-template-explore',
    imports: [CommonModule, TemplateItemComponent, FooterComponent],
    templateUrl: './template-explore.component.html',
    styleUrl: './template-explore.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateExploreComponent implements OnInit {
    template_list!: TemplateModel[];

    templates$ = this.templateService
        .getTemplates()
        .pipe(
            map((res: ResModel<TemplateResModel>) => {
                if (res.success) return (res.data as ResDataModel<TemplateResModel>).items as TemplateModel[];
                throw new Error('Unknown API error');
            }),
            catchError((err) => {
                console.error(err);
                this.toastService.error('Failed to load templates.');
                return of([] as TemplateModel[]);
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

    toastService = inject(ToastService);
    templateService = inject(TemplateService);
    scenarioService = inject(ScenarioService);

    ngOnInit() {
        this.templates$.subscribe((items) => (this.template_list = items));
    }

    trackByTemplateId = (_: number, item: TemplateModel) => item.id;
}
