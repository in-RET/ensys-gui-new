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
}
