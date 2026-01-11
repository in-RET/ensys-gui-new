import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { catchError, map, of, shareReplay } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioService } from '../../scenario/services/scenario.service';
import { TemplateModel, TemplateResModel } from '../models/template.model';
import { TemplateService } from '../services/template.service';
import { TemplateItemComponent } from './template-item/template-item.component';

@Component({
    selector: 'app-template-explore',
    imports: [CommonModule, TemplateItemComponent],
    templateUrl: './template-explore.component.html',
    styleUrl: './template-explore.component.scss',
})
export class TemplateExploreComponent implements OnInit {
    templateList!: TemplateModel[];

    toastService = inject(ToastService);
    templateService = inject(TemplateService);
    scenarioService = inject(ScenarioService);

    templates$ = this.templateService.getTemplates().pipe(
        map((res: ResModel<TemplateResModel>) => {
            if (res.success)
                return (res.data as ResDataModel<TemplateResModel>)
                    .items as TemplateModel[];
            throw new Error('Unknown API error');
        }),
        catchError((err) => {
            console.error(err);
            this.toastService.error('Failed to load templates.');
            return of([] as TemplateModel[]);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    ngOnInit() {
        // Initialize storage cleanup on enter
        this.clearScenarioDataStorage();
        // Prime local list cache
        this.templates$.subscribe(
            (items: TemplateModel[]) => (this.templateList = items)
        );
    }

    trackByTemplateId = (_: number, item: TemplateModel) => item.id;

    clearScenarioDataStorage() {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.removeDrawflow_Storage();
        this.toastService.info('Storage cleared.');
    }
}
