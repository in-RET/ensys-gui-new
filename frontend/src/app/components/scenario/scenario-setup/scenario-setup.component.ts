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
import { ScenarioService } from '../services/scenario.service';

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
        simulationPeriod: new FormControl('', [Validators.required]),
        sDate: new FormControl(null, [Validators.required]),
        timeStep: new FormControl('', [Validators.required]),
        simulationYear: new FormControl('', [Validators.required]),

        // minimal_renewable_factor_active: new FormControl(true),
        // minimal_renewable_factor: new FormControl(
        //     { value: null, disabled: false },
        //     [Validators.required]
        // ),
        // maximum_emissions_active: new FormControl(true),
        // maximum_emissions: new FormControl({ value: null, disabled: false }, [
        //     Validators.required,
        // ]),
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

    private readonly route = inject(ActivatedRoute);
    scenarioService = inject(ScenarioService);

    projectList!: any[];

    ngOnInit() {
        this.getProjects();
        this.loadCurrentData();

        this.projectId?.valueChanges.subscribe((id: any) => {
            this.project?.patchValue({
                name: this.projectList.find((x) => x.id == id).name,
            });
        });
    }

    getProjects() {
        this.route.data
            .pipe(
                map((res: any) => {
                    return res.projectList;
                })
            )
            .subscribe((res: any) => {
                this.projectList = [];
                this.projectList = res;
            });
    }

    loadCurrentData() {
        let scenarioBaseData: any =
            this.scenarioService.restoreBaseInfo_Storage();

        if (
            scenarioBaseData &&
            scenarioBaseData !== null &&
            scenarioBaseData !== undefined
        ) {
            if (scenarioBaseData.project.id) {
                let {
                    project,
                    name,
                    simulationPeriod,
                    timeStep,
                    sDate,
                    simulationYear,
                } = scenarioBaseData;

                this.form.patchValue({
                    project: { id: project.id, name: project.name },
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
}
