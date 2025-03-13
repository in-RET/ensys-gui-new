import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProjectService } from '../services/project.service';

@Component({
    selector: 'app-explore',
    imports: [CommonModule],
    templateUrl: './explore.component.html',
    styleUrl: './explore.component.scss',
})
export class ExploreComponent {
    project_list: any = [
        {
            id: 0,
            scenario_list: [],
        },
    ];

    constructor(private projectService: ProjectService) {}

    ngOnInit() {
        // this.getProjectsan();
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
