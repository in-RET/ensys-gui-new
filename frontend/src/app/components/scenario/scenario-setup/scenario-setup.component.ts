import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
export class ScenarioSetupComponent implements OnInit {
    form: FormGroup = new FormGroup({
        project: new FormGroup({
            id: new FormControl(null, [Validators.required]),
            name: new FormControl(null, [Validators.required]),
        }),
        name: new FormControl(null, [Validators.required]),
        sDate: new FormControl(null, [Validators.required]),

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

    get sDate() {
        return this.form.get('sDate');
    }

    // get simulationYear() {
    //     return this.form.get('simulationYear');
    // }

    // get minimal_renewable_factor_active() {
    //     return this.form.get('minimal_renewable_factor_active');
    // }

    // get minimal_renewable_factor() {
    //     return this.form.get('minimal_renewable_factor');
    // }

    // get maximum_emissions_active() {
    //     return this.form.get('maximum_emissions_active');
    // }

    // get maximum_emissions() {
    //     return this.form.get('maximum_emissions');
    // }

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
        const scenarioBaseData: { project: any; scenario: any } =
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
                const {
                    name,
                    sDate
                } = scenarioBaseData.scenario;

                this.form.patchValue({
                    name,
                    sDate
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
