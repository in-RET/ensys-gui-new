import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { map } from 'rxjs';
import { ResDataModel, ResModel } from '../../../shared/models/http.model';
import { ToastService } from '../../../shared/services/toast.service';
import { ProjectResModel } from '../../project/models/project.model';
import { ProjectService } from '../../project/services/project.service';
import { ScenarioBaseInfoModel } from '../models/scenario.model';
import { ScenarioService } from '../services/scenario.service';

@Component({
    selector: 'app-scenario-setup',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

    projectList!: any[];
    simulationYearList: number[] = [2025, 2030, 2035, 2040, 2045, 2050];

    scenarioService = inject(ScenarioService);
    toastService = inject(ToastService);
    projectService = inject(ProjectService);

    ngOnInit() {
        this.loadProjects();
        this.loadCurrentData();

        this.projectId?.valueChanges.subscribe((id: any) => {
            this.project?.patchValue({
                name: this.projectList.find((x) => x.id == id).name,
            });
        });

        this.simulationYear?.valueChanges.subscribe((year) => {
            this.sDate?.setValue(new Date(year).getTime() / 1000);
            this.toastService.info('Date changed!');
        });
    }

    loadProjects() {
        this.getProjects();
    }

    loadCurrentData() {
        const scenarioBaseData: ScenarioBaseInfoModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

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
                const { id, name, timeStep, sDate, simulationYear } =
                    scenarioBaseData.scenario;

                this.form.patchValue({
                    id,
                    name,
                    timeStep,
                    sDate,
                    simulationYear,
                });
            } else {
                this.name?.setValue(
                    `Scenario_${
                        scenarioBaseData.project.scenarioList.length + 1
                    }`
                );
            }
        }
    }

    // call from ScenarioBaseComponent
    getData() {
        this.form.markAllAsTouched();
        return this.form.valid ? this.form.getRawValue() : false;
    }

    getProjects() {
        this.projectService
            .getProjects()
            .pipe(
                map((res: ResModel<ProjectResModel>) => {
                    if (res.success) return res.data;
                    throw new Error('Unknown API error');
                })
            )
            .subscribe({
                next: (val: ResDataModel<ProjectResModel>) => {
                    this.projectList = val.items;
                },

                error: (err) => {
                    console.error(err);
                },
            });
    }

    unixToDateString(unix: number): string {
        if (unix) {
            return new Date(unix * 1000).toISOString().slice(0, 10);
        } else {
            // TODO: fix this
            const ret_date = '01/02/' + this.simulationYear?.value;
            return new Date(ret_date).toISOString().slice(0, 10);
        }
    }
}
