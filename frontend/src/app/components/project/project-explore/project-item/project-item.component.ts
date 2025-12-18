import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { catchError, map, Observable, of } from 'rxjs';
import { AlertService } from '../../../../shared/services/alert.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ScenarioService } from '../../../scenario/services/scenario.service';
import { ProjectModel } from '../../models/project.model';
import { ProjectScenarioItemComponent } from '../project-scenario-item/project-scenario-item.component';

@Component({
    selector: 'app-project-item',
    imports: [
        CommonModule,
        RouterLink,
        ProjectScenarioItemComponent,
        NgbCollapseModule,
    ],
    templateUrl: './project-item.component.html',
    styleUrl: './project-item.component.scss',
})
export class ProjectItemComponent implements OnInit {
    isCollapsed = true;

    @Input() project!: ProjectModel;

    @Output() deleteProject: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateProject: EventEmitter<any> = new EventEmitter<any>();

    scenarios$!: Observable<any[]>;

    scenarioService = inject(ScenarioService);
    router = inject(Router);
    alertService = inject(AlertService);
    toastService = inject(ToastService);

    ngOnInit() {
        this.loadScenarios();
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
            await this.alertService.success(`Removed the project`);
        }
    }

    private _deleteProject(id: number) {
        this.deleteProject.emit(id);
    }

    async duplicate_modal(id: number) {
        const confirmed = await this.alertService.confirm(
            'This will also duplicate all related project data.',
            undefined,
            undefined,
            undefined,
            'warning'
        );

        if (confirmed) {
            this._duplicateProject(id);
            await this.alertService.success(`Duplicated the project`);
        }
    }

    private _duplicateProject(id: number) {
        this.duplicateProject.emit(id);
    }

    loadScenarios() {
        this.scenarios$ = this.scenarioService
            .getScenarios(this.project.id)
            .pipe(
                map((value: any) => {
                    this.project.scenarioList = value.data.items;
                    return value.data.items;
                }),
                catchError((error: any) => {
                    this.toastService.error(error);
                    return of([]);
                })
            );
    }

    newScenario(pId: number, pName: string) {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioService.removeDrawflow_Storage();

        this.scenarioService.saveBaseInfo_Storage({
            project: {
                id: pId,
                name: pName,
                scenarioList: this.project.scenarioList ?? [],
            },
        });
        this.router.navigate(['../../scenario']);
    }

    deleteScenario(scenarioId: number) {
        this.project.scenarioList = this.project.scenarioList?.filter(
            (x: any) => x.id !== scenarioId
        );
    }

    duplicateScenario($event: any) {
        this.loadScenarios();
    }
}
