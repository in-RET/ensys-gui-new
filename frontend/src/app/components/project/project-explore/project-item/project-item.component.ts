import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { ScenarioService } from '../../../scenario/services/scenario.service';
import { ProjectScenarioItemComponent } from '../project-scenario-item/project-scenario-item.component';

@Component({
    selector: 'app-project-item',
    imports: [CommonModule, RouterLink, ProjectScenarioItemComponent],
    templateUrl: './project-item.component.html',
    styleUrl: './project-item.component.scss',
})
export class ProjectItemComponent implements OnInit {
    scenarioList!: any[];

    @Input() project: any;

    @Output() deleteProject: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private scenarioService: ScenarioService,
        private router: Router
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
        this.scenarioService
            .getScenarios(projectId)
            .pipe(
                map((res) => {
                    if (res && res.success) return res.data.items;
                })
            )
            .subscribe({
                next: (value) => {
                    this.project.scenarioList = value;
                },
                error(err) {
                    console.error(err);
                },
            });
    }

    newScenario(pId: string, pName: string) {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.removeDrawflow_Storage();

        this.scenarioService.saveBaseInfo_Storage({
            project: {
                id: pId,
                name: pName,
            },
        });
        this.router.navigate(['../../scenario']);
    }
}
