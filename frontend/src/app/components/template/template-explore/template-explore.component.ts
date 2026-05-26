import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { catchError, finalize, map, of, shareReplay } from 'rxjs';
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
    loading: { templates: boolean } = { templates: true };

    toastService = inject(ToastService);
    templateService = inject(TemplateService);
    scenarioService = inject(ScenarioService);

    trackByTemplateId = (_: number, item: TemplateModel) => item.id;

    ngOnInit() {
        // Prime local list cache
        this.loadTemplates();
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
                this.templateList = val;
            });
    }

    duplicateTemplate(id: number) {
        this.templateService.duplicateTemplate(id).subscribe({
            next: (value) => {
                if (value.success) {
                    // Immutable update to work well with OnPush
                    const newItem = this.templateList.find(
                        (t) => t.id === value.data?.id,
                    )!;
                    this.templateList = [...this.templateList, newItem];

                    this.toastService.success(
                        'Template duplicated successfully.',
                    );
                } else this.toastService.error('An error occured.');
            },
            error: (err) => {
                this.toastService.error(err.error.detail);
                console.error(err);
                this.toastService.error('Failed to duplicate template.');
            },
        });
    }

    deleteTemplate(id: number) {
        this.templateService.deleteTemplate(id).subscribe({
            next: (value) => {
                if (value.success) {
                    // Immutable update to work well with OnPush
                    this.templateList = this.templateList.filter(
                        (t) => t.id !== id,
                    );

                    this.toastService.success('Template deleted successfully.');
                }
            },
            error: (err) => {
                this.toastService.error(err.error.detail);
                console.error(err);
                this.toastService.error('Failed to delete template.');
            },
        });
    }
}
