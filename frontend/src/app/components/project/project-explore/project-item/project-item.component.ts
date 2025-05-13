import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProjectService } from '../../services/project.service';
import { ScenarioService } from '../../services/scenario.service';
import { ProjectScenarioItemComponent } from '../project-scenario-item/project-scenario-item.component';

@Component({
    selector: 'app-project-item',
    imports: [CommonModule, RouterLink, ProjectScenarioItemComponent],
    templateUrl: './project-item.component.html',
    styleUrl: './project-item.component.scss',
})
export class ProjectItemComponent {
    scenarioList!: any[];

    @Input() project: any;

    @Output() deleteProject: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private projectService: ProjectService,
        private scenarioService: ScenarioService
    ) {}

    ngOnInit() {
        this.getScenarios(this.project.id);
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
                this._deleteProject(id);
            }
        });
    }

    _deleteProject(id: number) {
        this.deleteProject.emit(id);
    }

    getScenarios(projectId: number) {
        this.scenarioService.getScenarios(projectId).subscribe({
            next: (value) => {
                this.scenarioList = value;
            },
            error(err) {
                console.error(err);
            },
        });
    }
}
