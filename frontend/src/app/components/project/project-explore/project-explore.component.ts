import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { ProjectItemComponent } from './project-item/project-item.component';

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, RouterLink, ProjectItemComponent],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent {
    project_list: any = [
        {
            id: 0,
            name: 'Hossein',
            country: 'Iran',
            date_created: 'March 18, 2025, 4:49 p.m.',
            duration: '10',
            scenario_list: [
                {
                    id: 1,
                    name: 'name',
                },
                {
                    id: 1,
                    name: 'name',
                },
                {
                    id: 1,
                    name: 'name',
                },
                {
                    id: 1,
                    name: 'name',
                },
                {
                    id: 1,
                    name: 'name',
                },
            ],
        },
        {
            id: 1,
            name: 'حسین',
            country: 'Iran',
            date_created: 'March 18, 2025, 4:49 p.m.',
            duration: '10',
            scenario_list: [],
        },
    ];

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
