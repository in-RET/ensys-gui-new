import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay } from 'rxjs';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectExploreComponent implements OnInit {
    project_list!: ProjectModel[];

    loading: { projects: boolean } = { projects: true };

    toastService = inject(ToastService);
    projectService = inject(ProjectService);
    scenarioService = inject(ScenarioService);

    projects$: Observable<ProjectModel[]> = this.projectService
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
        );

    ngOnInit() {
        // Initialize storage cleanup on enter
        if (this.scenarioService.restoreBaseInfo_Storage() != null)
            this.clearScenarioDataStorage();

        // Prime local list cache
        this.projects$.subscribe((items) => (this.project_list = items));
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
                    // Reload projects after duplication
                    this.projects$ = this.projectService.getProjects().pipe(
                        map((res: ResModel<ProjectResModel>) => {
                            if (res.success)
                                return (
                                    res.data as ResDataModel<ProjectResModel>
                                ).items as ProjectModel[];
                            throw new Error('Unknown API error');
                        }),
                        catchError((err) => {
                            console.error(err);
                            this.toastService.error('Failed to load projects.');
                            return of([] as ProjectModel[]);
                        }),
                        shareReplay({ bufferSize: 1, refCount: true })
                    );
                    this.projects$.subscribe(
                        (items) => (this.project_list = items)
                    );
                } else this.toastService.error('An error occured.');
            },
            error: (err) => {
                this.toastService.error(err);
            },
        });
    }
}
