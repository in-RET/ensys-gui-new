import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProjectService } from '../services/project.service';

@Component({
    selector: 'app-project-explore',
    imports: [CommonModule, RouterLink],
    templateUrl: './project-explore.component.html',
    styleUrl: './project-explore.component.scss',
})
export class ProjectExploreComponent {
    project_list: any = [
        {
            name: 'Hossein',
            country: 'Iran',
            date_created: 'March 18, 2025, 4:49 p.m.',
            duration: '10',
            scenario_list: [],
        },
        {
            name: 'ملیحه قره چشمه',
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

    delete_modal(id: number) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will also delete all related project data.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
            }
        });
    }

    deleteProject(id: number) {
        this.projectService.deleteProject(id).subscribe({
            next(value) {},
            error(err) {},
        });
    }
}
