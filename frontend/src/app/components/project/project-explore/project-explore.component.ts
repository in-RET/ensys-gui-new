import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioService } from '../../scenario/services/scenario.service';
import { ProjectService } from '../services/project.service';
import { ProjectItemComponent } from './project-item/project-item.component';

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, RouterLink, ProjectItemComponent],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent {
    project_list!: any[];

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
                map((res: any) => {
                    if (res && res.data) res = res.data;
                    return res;
                })
            )
            .subscribe({
                next: (value) => {
                    this.project_list = value.items;
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
