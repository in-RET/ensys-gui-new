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
import { catchError, map, of } from 'rxjs';
import { ResDataModel, ResModel } from '../../../../shared/models/http.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { ToastService } from '../../../../shared/services/toast.service';
import {
    ScenarioModel,
    ScenarioResModel,
} from '../../../scenario/models/scenario.model';
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

    private _project!: ProjectModel;
    @Input() set project(val: ProjectModel) {
        this._project = val;

        this.scenarioService
            .getScenarios(this._project.id)
            .pipe(
                map((res: ResModel<ScenarioResModel>) => {
                    if (res.success)
                        return (res.data as ResDataModel<ScenarioResModel>)
                            .items as ScenarioModel[];

                    throw new Error('Unknown API error');
                }),
                catchError((err: any) => {
                    console.error(err);
                    this.toastService.error('Failed to load scenarios.');
                    return of([] as ScenarioModel[]);
                }),
            )
            .subscribe(
                (data: ScenarioModel[]) => (this._project.scenarioList = data),
            );
    }
    get project(): ProjectModel {
        return this._project;
    }

    @Output() deleteProject: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateProject: EventEmitter<any> = new EventEmitter<any>();

    scenarioService = inject(ScenarioService);
    router = inject(Router);
    alertService = inject(AlertService);
    toastService = inject(ToastService);

    ngOnInit() {}

    async onDeleteProject(id: number) {
        if (
            await this.alertService.confirm(
                'This will also delete all related project data.',
                'Delete',
                undefined,
                undefined,
                'error',
            )
        )
            this.deleteProject.emit(id);
    }

    async onDuplicateProject(id: number) {
        if (
            await this.alertService.confirm(
                `Are you sure you want to duplicate project ${this.project.name}?`,
                'Duplicate',
            )
        )
            this.duplicateProject.emit(id);
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
            (x: any) => x.id !== scenarioId,
        );
    }

    duplicateScenario(e: {
        projectId: number;
        scenarioId: number;
        newScenario: string;
    }) {
        // const baseScenario = this.project.scenarioList?.find(
        //     (x: ScenarioModel) => x.id === e.scenarioId,
        // );
        // baseScenario?.name
        // this.project.scendarioList?.push(e.newScenario);
    }
}
