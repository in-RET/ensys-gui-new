import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { ScenarioModel, ScenarioService } from '../services/scenario.service';

@Component({
    selector: 'app-scenario-setup',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './scenario-setup.component.html',
    styleUrl: './scenario-setup.component.scss',
})
export class ScenarioSetupComponent {
    form: FormGroup = new FormGroup({
        project: new FormGroup({
            id: new FormControl(null, [Validators.required]),
            name: new FormControl(null, [Validators.required]),
        }),
        name: new FormControl(null, [Validators.required]),
        simulationPeriod: new FormControl({ value: 8760, disabled: true }),
        sDate: new FormControl({
            value: new Date().toISOString().split('T')[0],
            disabled: true,
        }),
        timeStep: new FormControl({ value: 60, disabled: true }),
        simulationYear: new FormControl(2025, [Validators.required]),
    });

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

    private readonly route = inject(ActivatedRoute);
    scenarioService = inject(ScenarioService);
    toastService = inject(ToastService);

    ngOnInit() {
        this.loadProjects();
        this.loadCurrentData();

        this.projectId?.valueChanges.subscribe((id: any) => {
            this.project?.patchValue({
                name: this.projectList.find((x) => x.id == id).name,
            });
        });

        this.simulationYear?.valueChanges.subscribe((year) => {
            this.sDate?.setValue(new Date(year).toISOString().split('T')[0]);
            this.toastService.info('Date changed!');
        });

        this.setFormDefaultVal();
    }

    loadProjects() {
        this.route.data
            .pipe(map((res: any) => (res = res.projectList)))
            .subscribe((res: any) => {
                this.projectList = res;
            });
    }

    loadCurrentData() {
        let scenarioBaseData: ScenarioModel | null =
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

            if (scenarioBaseData.scenario) {
                let {
                    name,
                    simulationPeriod,
                    timeStep,
                    sDate,
                    simulationYear,
                } = scenarioBaseData.scenario;

                this.form.patchValue({
                    name,
                    simulationPeriod,
                    timeStep,
                    sDate,
                    simulationYear,
                });
            }
        }
    }

    // call from ScenarioBaseComponent
    getData() {
        this.form.markAllAsTouched();
        return this.form.valid ? this.form.getRawValue() : false;
    }

    setFormDefaultVal() {
        this.name?.setValue(`Scenario_${this.projectList.length + 1}`);
        // this.sDate?.setValue(new Date().toISOString().split('T')[0]);
        // this.simulationPeriod?.setValue(1);
        // this.timeStep?.setValue(60);
        // this.simulationYear?.setValue(2025);
    }
}
