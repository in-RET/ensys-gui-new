import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-project-create',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './project-create.component.html',
    styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent {
    form: FormGroup = new FormGroup({
        name: new FormControl(null, []),
        description: new FormControl(null, []),
        country: new FormControl('', []),
        latitude: new FormControl('Click on the map', []),
        longitude: new FormControl('Click on the map', []),
        currency: new FormControl('', []),
        unit_choice: new FormControl('', []),
        unit_choice_co2: new FormControl('', []),
    });
}
