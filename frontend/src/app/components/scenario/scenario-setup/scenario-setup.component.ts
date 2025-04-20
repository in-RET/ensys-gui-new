import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-scenario-setup',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './scenario-setup.component.html',
    styleUrl: './scenario-setup.component.scss',
})
export class ScenarioSetupComponent {
    form: FormGroup = new FormGroup({
        name: new FormControl(null, [Validators.required]),
        simulationPeriod: new FormControl('', [Validators.required]),
        timeStep: new FormControl(null, [Validators.required]),
        sDate: new FormControl(null, [Validators.required]),
        interestRate: new FormControl(null, [Validators.required]),
        userMode: new FormControl('', [Validators.required]),
        simulationYear: new FormControl('', [Validators.required]),

        minimal_renewable_factor_active: new FormControl(true),
        minimal_renewable_factor: new FormControl(
            { value: null, disabled: false },
            [Validators.required]
        ),
        maximum_emissions_active: new FormControl(true),
        maximum_emissions: new FormControl({ value: null, disabled: false }, [
            Validators.required,
        ]),
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

    get interestRate() {
        return this.form.get('interestRate');
    }

    get userMode() {
        return this.form.get('userMode');
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
}
