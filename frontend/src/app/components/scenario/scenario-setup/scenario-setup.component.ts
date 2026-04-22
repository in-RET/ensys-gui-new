import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { PublicService } from '../../../shared/services/public.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ProjectResModel } from '../../project/models/project.model';
import { ProjectService } from '../../project/services/project.service';
import {
    ScenarioBaseInfoModel,
    ScenarioUpdatedModel,
} from '../models/scenario.model';
import {
    ScenarioStateModel,
    ScenarioStateService,
} from '../services/scenario-state.service';
import { ScenarioService } from '../services/scenario.service';
import { ConstraintsComponent } from './constraints/constraints.component';
import { ConstraintRow } from './constraints/models/constraints.model';

@Component({
    selector: 'app-scenario-setup',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ConstraintsComponent,
    ],
    templateUrl: './scenario-setup.component.html',
    styleUrl: './scenario-setup.component.scss',
})
export class ScenarioSetupComponent implements OnInit {
    form: FormGroup = new FormGroup({
        project: new FormGroup({
            id: new FormControl(null, [Validators.required]),
            name: new FormControl(null, [Validators.required]),
        }),
        id: new FormControl(null),
        name: new FormControl(null, [Validators.required]),
        simulationPeriod: new FormControl({ value: 8760, disabled: true }),
        sDate: new FormControl({
            value: new Date('2025').getTime() / 1000,
            disabled: true,
        }),
        timeStep: new FormControl({ value: 8760, disabled: true }),
        simulationYear: new FormControl(2025, [Validators.required]),
    });

    get id() {
        return this.form.get('id');
    }

    get name() {
        return this.form.get('name');
    }

    get simulationPeriod() {
        return this.form.get('simulationPeriod');
    }

    get timeStep() {
        return this.form.get('timeStep');
    }

    get sDate() {
        return this.form.get('sDate');
    }

    get simulationYear() {
        return this.form.get('simulationYear');
    }

    get minimal_renewable_factor_active() {
        return this.form.get('minimal_renewable_factor_active');
    }

    get minimal_renewable_factor() {
        return this.form.get('minimal_renewable_factor');
    }

    get maximum_emissions_active() {
        return this.form.get('maximum_emissions_active');
    }

    get maximum_emissions() {
        return this.form.get('maximum_emissions');
    }

    get project() {
        return this.form.get('project');
    }

    get projectId() {
        return this.form.get('project.id');
    }

    simulationYearList: number[] = [2025, 2030, 2035, 2040, 2045, 2050];
    subscriptionScenarioState!: Subscription;
    projects!: ProjectResModel[] | null;

    private _loading: any = {
        projects: false,
    };
    set loading(val: any) {
        this._loading = { ...this._loading, ...val };

        // #1 rule
        if (val.projects) this.project?.disable();
        else this.project?.enable();
    }
    get loading() {
        return this._loading;
    }

    @ViewChild('constraints') constraintsComponent!: ConstraintsComponent;

    @Output() saveScenario: EventEmitter<ScenarioBaseInfoModel> =
        new EventEmitter<ScenarioBaseInfoModel>();
    @Output() updateScenario: EventEmitter<ScenarioUpdatedModel> =
        new EventEmitter<ScenarioUpdatedModel>();

    scenarioService = inject(ScenarioService);
    toastService = inject(ToastService);
    projectService = inject(ProjectService);
    scenarioStateService = inject(ScenarioStateService);
    publicService = inject(PublicService);

    ngOnInit() {
        this.loadProjects();
        this.loadCurrentData();

        this.projectId?.valueChanges.subscribe((id: any) => {
            if (this.projects) {
                this.project?.patchValue({
                    name: this.projects.find((x: ProjectResModel) => x.id == id)
                        ?.name,
                });
            }
        });

        this.simulationYear?.valueChanges.subscribe((year) => {
            this.sDate?.setValue(new Date(year).getTime() / 1000);
            this.toastService.info('Date changed!');
        });

        // for set project list disable
        // this.subscriptionScenarioState =
        //     this.scenarioStateService.scenarioState.subscribe(
        //         (res: ScenarioStateModel | null) => {
        //             if (res?.scenario?.id) this.projectId?.disable();
        //         },
        //     );
    }

    loadProjects() {
        this.getProjects();
    }

    loadCurrentData() {
        const scenarioBaseData: ScenarioStateModel | null =
            this.scenarioStateService.getScenarioData();

        if (scenarioBaseData) {
            if (scenarioBaseData.project) {
                this.form.patchValue({
                    project: {
                        id: scenarioBaseData.project.id,
                        name: scenarioBaseData.project.name,
                    },
                });
            }

            // created scenario
            if (scenarioBaseData.scenario) {
                const { id, name, timeStep, simulationYear } =
                    scenarioBaseData.scenario;

                this.form.patchValue({
                    id,
                    name,
                    timeStep,
                    simulationYear,
                });
            } else {
                // Use optional chaining and a safe fallback to avoid using project when it may be undefined
                this.name?.setValue(
                    `Scenario_${this.publicService.getCurrentDateTimeString()}`,
                );
            }
        }
    }

    // call from ScenarioBaseComponent
    getFormData() {
        this.form.markAllAsTouched();
        const formData = this.form.valid ? this.form.getRawValue() : null;
        return formData;
    }

    getConstraintData(): ConstraintRow[] {
        return this.constraintsComponent.getConstraintData();
        // will be used when correct data structure is implemented
    }

    getProjects() {
        this.loading = {
            projects: true,
        };

        this.projectService
            .getProjects()
            .pipe(
                map((res: ResModel<ProjectResModel>) => {
                    this.loading = {
                        projects: false,
                    };

                    if (res.success) return res.data;
                    throw new Error('Unknown API error');
                }),
            )
            .subscribe({
                next: (val: ResDataModel<ProjectResModel>) => {
                    this.projects = val.items;
                },
                error: (err) => {
                    console.error(err);
                },
            });
    }

    unixToDateString(unix: number): string {
        return new Date(unix * 1000).toISOString().slice(0, 10);
    }

    onSaveScenario() {
        const formData: any = this.getFormData();

        if (!formData) {
            this.toastService.warning('Please fill in all required fields!');
            return;
        }

        const data: ScenarioBaseInfoModel = {
            project: formData.project,
            scenario: {
                id: formData.id,
                name: formData.name,
                sDate: formData.sDate,
                timeStep: formData.timeStep,
                interval: 1,
                simulationYear: formData.simulationYear,
                constraints: this.getConstraintData(),
                modeling_data: null,
            },
        };

        this.saveScenario.emit(data);
    }

    onUpdateScenario() {
        const formData: any = this.getFormData();

        if (!formData) {
            this.toastService.warning('Please fill in all required fields!');
            return;
        }

        let scenarioId: number;

        if (
            !this.scenarioStateService.getScenarioData() ||
            !this.scenarioStateService.getScenarioData()?.scenario
        ) {
            this.toastService.warning(
                'There is no scenario data available for update!',
            );
            return;
        }

        scenarioId = this.scenarioStateService.getScenarioData()?.scenario?.id!;

        const data: ScenarioUpdatedModel = {
            project: formData.project,
            scenario: {
                id: scenarioId,
                name: formData.name,
                sDate: formData.sDate,
                timeStep: formData.timeStep,
                interval: 1,
                simulationYear: formData.simulationYear,
                constraints: this.getConstraintData(),
                modeling_data:
                    this.scenarioStateService.getScenarioData()?.scenario
                        ?.modeling_data || null,
            },
        };
        this.updateScenario.emit(data);
    }

    setFormFieldError(fControlName: string, err: string) {
        this.form.get(fControlName)?.setErrors({ err: err });
    }

    ngOnDestroy() {
        if (this.subscriptionScenarioState)
            this.subscriptionScenarioState.unsubscribe();
    }
}
