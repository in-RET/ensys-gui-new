import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    catchError,
    concatMap,
    finalize,
    from,
    map,
    of,
    shareReplay,
    toArray,
} from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ExploreService } from '../../explore/services/explore.service';
import { ScenarioService } from '../../scenario/services/scenario.service';
import { ProjectModel, ProjectResModel } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { ProjectItemComponent } from './project-item/project-item.component';

export interface LoadingModel {
    page?: boolean;
    projects?: boolean;
}

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, FormsModule, ProjectItemComponent],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent implements OnInit {
    project_list!: ProjectModel[];
    showUploadModal = false;
    uploadError = '';
    loading: LoadingModel = {
        page: false,
        projects: true,
    };

    toastService = inject(ToastService);
    loadingService = inject(LoadingService);
    projectService = inject(ProjectService);
    exploreService = inject(ExploreService);
    scenarioService = inject(ScenarioService);

    ngOnInit() {
        // Initialize storage cleanup on enter
        if (this.scenarioService.restoreBaseInfo_Storage() != null)
            this.clearScenarioDataStorage();

        // Prime local list cache
        this.loadProjects();

        // Subscribe to sort option changes
        this.exploreService.exploreProject_selectedSortOption.subscribe(
            (option: string) => {
                if (this.project_list) {
                    this.project_list = this.exploreService.sortData(
                        this.project_list,
                        option,
                    );
                }
            },
        );
    }

    loadProjects() {
        this.loading.projects = true;
        this.loadingService.start();

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
                    this.loadingService.stop();
                }),
                catchError((err) => {
                    this.toastService.error(err.error.detail);
                    console.error(err);
                    this.toastService.error('Failed to load projects.');
                    return of([] as ProjectModel[]);
                }),
                shareReplay({ bufferSize: 1, refCount: true }),
            )
            .subscribe((val: ProjectModel[]) => {
                val = this.exploreService.sortData(
                    val,
                    this.exploreService.getExploreProject_selectedSortOption(),
                );
                this.project_list = val;
            });
    }

    trackByProjectId = (_: number, item: ProjectModel) => item.id;

    submitUploadProjects(uploadData: string): boolean {
        let importedProjects: unknown;

        try {
            importedProjects = JSON.parse(uploadData);
        } catch {
            this.uploadError = 'Enter valid project JSON';
            return false;
        }

        if (
            !Array.isArray(importedProjects) ||
            importedProjects.length === 0 ||
            !importedProjects.every(isImportableProject)
        ) {
            this.uploadError =
                'One/s of necessary fileds are missing: name, country, description, coordinates, currency, energy unit, and CO2 unit.';
            return false;
        }

        const projectPayloads = importedProjects.map((project) => ({
            name: project.name,
            country: project.country,
            description: project.description,
            latitude: project.latitude,
            longitude: project.longitude,
            currency: project.unit_currency ?? project.currency,
            unit_energy: project.unit_energy,
            unit_co2: project.unit_co2,
        }));

        this.uploadError = '';
        this.showUploadModal = false;
        this.loadingService.start();

        from(projectPayloads)
            .pipe(
                concatMap((project) =>
                    this.projectService.createProject(project).pipe(
                        map((res: ResModel<ProjectResModel>) => {
                            if (!res.success) {
                                throw new Error('Project import was rejected.');
                            }
                            return true;
                        }),
                        catchError((error: unknown) => {
                            console.error('Failed to import project:', error);
                            return of(false);
                        }),
                    ),
                ),
                toArray(),
                finalize(() => this.loadingService.stop()),
            )
            .subscribe({
                next: (results) => {
                    const importedCount = results.filter(Boolean).length;
                    const failedCount = results.length - importedCount;

                    if (failedCount === 0) {
                        this.toastService.success(
                            `${importedCount} project(s) imported successfully.`,
                        );
                    } else {
                        this.toastService.error(
                            `${importedCount} project(s) imported; ${failedCount} failed.`,
                        );
                    }

                    this.loadProjects();
                },
                error: (error: unknown) => {
                    console.error('Project import failed:', error);
                    this.toastService.error('Failed to import projects.');
                },
            });

        return true;
    }

    deleteProject(id: number) {
        this.loadingService.start();
        this.projectService
            .deleteProject(id)
            .pipe(finalize(() => this.loadingService.stop()))
            .subscribe({
                next: (value) => {
                    if (value.success) {
                        // Immutable update to work well with OnPush
                        this.project_list = this.project_list.filter(
                            (p) => p.id !== id,
                        );

                        this.toastService.success(
                            'Project deleted successfully.',
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
        this.toastService.info('Storage cleared.');
    }

    duplicateProject(id: number) {
        this.loadingService.start();
        this.projectService
            .duplicateProject(id)
            .pipe(
                map((res: ResModel<ProjectResModel>) => {
                    if (res.success)
                        return res.data.items[0] as ProjectResModel;
                    throw new Error('Unknown API error');
                }),
                finalize(() => this.loadingService.stop()),
            )
            .subscribe({
                next: (value: ProjectResModel) => {
                    this.project_list.push(value);
                    this.project_list = this.exploreService.sortData(
                        this.project_list,
                        this.exploreService.getExploreProject_selectedSortOption(),
                    );

                    this.toastService.success(
                        'Project duplicated successfully.',
                    );
                },
                error: (err) => {
                    this.toastService.error(
                        err.error.detail || 'An error occured!',
                    );
                },
            });
    }
}

interface ImportableProject {
    name: string;
    country: string;
    description: string;
    latitude: number;
    longitude: number;
    unit_currency?: string;
    currency?: string;
    unit_energy: string;
    unit_co2: string;
}

function isImportableProject(value: unknown): value is ImportableProject {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    const project = value as Record<string, unknown>;
    const currency = project['unit_currency'] ?? project['currency'];

    return (
        typeof project['name'] === 'string' &&
        project['name'].trim().length > 0 &&
        typeof project['country'] === 'string' &&
        project['country'].trim().length > 0 &&
        typeof project['description'] === 'string' &&
        project['description'].trim().length > 0 &&
        typeof project['latitude'] === 'number' &&
        typeof project['longitude'] === 'number' &&
        typeof currency === 'string' &&
        typeof project['unit_energy'] === 'string' &&
        typeof project['unit_co2'] === 'string'
    );
}
