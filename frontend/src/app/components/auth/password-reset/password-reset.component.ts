import { Component } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-password-reset',
    imports: [FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './password-reset.component.html',
    styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent {
    email: FormControl = new FormControl(null, Validators.required);
}
