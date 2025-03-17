import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProjectService } from '../services/project.service';

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, RouterLink, RouterOutlet],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent {
    project_list: any;

    constructor(private projectService: ProjectService) {}

    ngOnInit() {
        this.getProjects();
    }

    getProjects() {
        this.projectService.getProjects().subscribe({
            next: (value) => {
                console.log(value);
            },

            error: (err) => {
                console.error(err);
            },
        });
    }
}
