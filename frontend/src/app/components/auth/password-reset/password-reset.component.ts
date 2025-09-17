import { Component } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-password-reset',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './password-reset.component.html',
    styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent {
    email: FormControl = new FormControl(null, Validators.required);
}
