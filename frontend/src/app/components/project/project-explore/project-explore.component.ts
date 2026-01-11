import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, of, shareReplay } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioService } from '../../scenario/services/scenario.service';
import { ProjectModel, ProjectResModel } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { ProjectItemComponent } from './project-item/project-item.component';

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, RouterLink, ProjectItemComponent],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent implements OnInit {
    project_list!: ProjectModel[];

    loading: { projects: boolean } = { projects: true };

    toastService = inject(ToastService);
    projectService = inject(ProjectService);
    scenarioService = inject(ScenarioService);
    cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        // Initialize storage cleanup on enter
        if (this.scenarioService.restoreBaseInfo_Storage() != null)
            this.clearScenarioDataStorage();

        // Prime local list cache
        this.loadProjects();
    }

    loadProjects() {
        this.loading.projects = true;

        this.projectService
            .getProjects()
            .pipe(
                map((res: ResModel<ProjectResModel>) => {
                    if (res.success)
                        return (res.data as ResDataModel<ProjectResModel>)
                            .items as ProjectModel[];

                    throw new Error('Unknown API error');
                }),
                finalize(() => {
                    this.loading.projects = false;
                }),
                catchError((err) => {
                    console.error(err);
                    this.toastService.error('Failed to load projects.');
                    return of([] as ProjectModel[]);
                }),
                shareReplay({ bufferSize: 1, refCount: true })
            )
            .subscribe((val: any) => {
                this.project_list = val;
            });
    }

    trackByProjectId = (_: number, item: ProjectModel) => item.id;

    deleteProject(id: number) {
        this.projectService.deleteProject(id).subscribe({
            next: (value) => {
                if (value.success) {
                    // Immutable update to work well with OnPush
                    this.project_list = this.project_list.filter(
                        (p) => p.id !== id
                    );
                    this.cdr.detectChanges();
                    this.toastService.success('Project deleted successfully.');
                }
            },
            error: (err) => {
                console.error(err);
                this.toastService.error('Failed to delete project.');
            },
        });
    }

    clearScenarioDataStorage() {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.removeDrawflow_Storage();
        this.toastService.info('Storage cleared.');
    }

    duplicateProject(id: number) {
        this.projectService.duplicateProject(id).subscribe({
            next: (value) => {
                if (value.success) {
                    // Immutable update to work well with OnPush
                    const newProject = this.project_list.find(
                        (p) => p.id === value.data?.id
                    )!;
                    this.project_list = [...this.project_list, newProject];

                    this.toastService.success(
                        'Project duplicated successfully.'
                    );
                } else this.toastService.error('An error occured.');
            },
            error: (err) => {
                this.toastService.error(err);
            },
        });
    }
}
