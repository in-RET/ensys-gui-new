import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ScenarioService } from '../../../scenario/services/scenario.service';
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
        private scenarioService: ScenarioService,
        private router: Router,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.getScenarios(this.project.id);
    }

    async delete_modal(id: number) {
        const confirmed = await this.alertService.confirm(
            'This will also delete all related project data.',
            undefined,
            undefined,
            undefined,
            'warning'
        );
        if (confirmed) {
            this._deleteProject(id);
            this.alertService.success(`Removed the project`);
        }
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

    newScenario(pId: number, pName: string) {
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
