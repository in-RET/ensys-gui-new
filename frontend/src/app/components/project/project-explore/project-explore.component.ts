import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
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

    constructor(private projectService: ProjectService) {}

    ngOnInit() {
        this.getProjects();
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
}
