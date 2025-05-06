import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProjectService } from '../../services/project.service';
import { ProjectScenarioItemComponent } from '../project-scenario-item/project-scenario-item.component';

@Component({
    selector: 'app-project-item',
    imports: [CommonModule, RouterLink, ProjectScenarioItemComponent],
    templateUrl: './project-item.component.html',
    styleUrl: './project-item.component.scss',
})
export class ProjectItemComponent {
    @Input() project: any;

    constructor(private projectService: ProjectService) {}

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
