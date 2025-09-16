import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioService } from '../../scenario/services/scenario.service';
import { ProjectModel, ProjectResModel } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { ProjectItemComponent } from './project-item/project-item.component';
import {FooterComponent} from '../../../core/layout/footer/footer.component';

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, RouterLink, ProjectItemComponent, FooterComponent],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent implements OnInit {
    project_list!: ProjectModel[];

    toastService = inject(ToastService);

    constructor(
        private projectService: ProjectService,
        private scenarioService: ScenarioService
    ) {}

    ngOnInit() {
        this.getProjects();
        this.clearScenarioDataStorage();
    }

    getProjects() {
        this.projectService
            .getProjects()
            .pipe(
                map((res: ResModel<ProjectResModel>) => {
                    if (res.success) return res.data;
                    throw new Error('Unknown API error');
                })
            )
            .subscribe({
                next: (val: ResDataModel<ProjectResModel>) => {
                    this.project_list = val.items;
                },

                error: (err) => {
                    console.error(err);
                },
            });
    }

    deleteProject(id: number) {
        this.projectService.deleteProject(id).subscribe({
            next: (value) => {
                if (value.success) {
                    this.project_list.splice(
                        this.project_list.findIndex((x) => x.id == id),
                        1
                    );
                }
            },
            error(err) {},
        });
    }

    clearScenarioDataStorage() {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.removeDrawflow_Storage();
        this.toastService.info('Storage cleared.');
    }
}
