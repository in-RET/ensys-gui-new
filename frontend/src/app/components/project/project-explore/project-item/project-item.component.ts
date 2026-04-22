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
import { ResModel } from '../../../../shared/models/http.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { ToastService } from '../../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioModel,
    ScenarioResModel,
    UserModelingSTEP,
} from '../../../scenario/models/scenario.model';
import { ConstraintRow } from '../../../scenario/scenario-setup/constraints/models/constraints.model';
import { ScenarioStateService } from '../../../scenario/services/scenario-state.service';
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
    loading: {
        scenarios: boolean;
    } = {
        scenarios: false,
    };

    private _project!: ProjectModel;
    @Input() set project(val: ProjectModel) {
        this._project = val;
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
    scenarioStateService = inject(ScenarioStateService);

    ngOnInit() {}

    loadScenarios() {
        this.loading.scenarios = true;

        this.scenarioService
            .getScenarios(this.project.id)
            .pipe(
                map((res: ResModel<ScenarioResModel>) => {
                    this.loading.scenarios = false;

                    if (res.success) {
                        let _res: ScenarioModel[] = [];
                        res.data.items.forEach((element: ScenarioResModel) => {
                            const _data: ScenarioModel = {
                                id: element.id,
                                interval: element.interval,
                                name: element.name,
                                project_id: element.project_id,
                                simulation_year: element.simulation_year,
                                sDate: element.start_date,
                                timeStep: element.time_steps,
                                constraints: element.constraints
                                    ? (JSON.parse(
                                          element.constraints as unknown as string,
                                      ) as ConstraintRow[])
                                    : [],
                            };
                            _res.push(_data);
                        });

                        return _res;
                    }
                    throw new Error('Unknown API error');
                }),
                catchError((err: any) => {
                    console.error(err);
                    this.toastService.error('Failed to load scenarios.');
                    return of([] as ScenarioModel[]);
                }),
            )
            .subscribe(
                (data: ScenarioModel[]) => (this.project.scenarioList = data),
            );
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (!this.project.scenarioList) {
            this.loading.scenarios = true;

            setTimeout(() => {
                this.loadScenarios();
            }, 500);
        }
    }

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
        this.scenarioService.removeDrawflow_Data();

        const d: ScenarioBaseInfoModel = {
            project: {
                id: pId,
                name: pName,
                scenarioList: this.project.scenarioList ?? [],
            },
        };

        this.scenarioService.saveBaseInfo_Storage(d);
        this.scenarioStateService.setScenarioData(d);

        this.scenarioService.updateUserModelingState({
            currentStep: UserModelingSTEP.SCENARIO_SETUP,
            autoUpdate: true,
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
