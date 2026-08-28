import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { catchError, finalize, map, of, shareReplay } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ExploreService } from '../../explore/services/explore.service';
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
    loading: { templates: boolean } = { templates: true };

    toastService = inject(ToastService);
    templateService = inject(TemplateService);
    exploreService = inject(ExploreService);
    scenarioService = inject(ScenarioService);

    trackByTemplateId = (_: number, item: TemplateModel) => item.id;

    ngOnInit() {
        // Prime local list cache
        this.loadTemplates();

        // Subscribe to sort option changes
        this.exploreService.exploreTemplate_selectedSortOption.subscribe(
            (option: string) => {
                if (this.templateList) {
                    this.templateList = this.exploreService.sortData(
                        this.templateList,
                        option,
                    );
                }
            },
        );
    }

    loadTemplates() {
        this.loading.templates = true;

        this.templateService
            .getTemplates()
            .pipe(
                map((res: ResModel<TemplateResModel>) => {
                    if (res.success)
                        return (res.data as ResDataModel<TemplateResModel>)
                            .items as TemplateModel[];

                    throw new Error('Unknown API error');
                }),
                finalize(() => {
                    this.loading.templates = false;
                }),
                catchError((err) => {
                    console.error(err);
                    this.toastService.error('Failed to load templates.');
                    return of([] as TemplateModel[]);
                }),
                shareReplay({ bufferSize: 1, refCount: true }),
            )
            .subscribe((val: TemplateModel[]) => {
                val = this.exploreService.sortData(
                    val,
                    this.exploreService.getExploreTemplate_selectedSortOption(),
                );
                this.templateList = val;
            });
    }
}
