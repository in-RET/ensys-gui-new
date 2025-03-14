import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AuthCoreService } from '../../../core/auth/auth.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    form: FormGroup = new FormGroup({
        user: new FormControl(null, Validators.required),
        pass: new FormControl(null, Validators.required),
    });

    get user() {
        return this.form.get('user');
    }

    get pass() {
        return this.form.get('pass');
    }

    constructor(
        private authService: AuthService,
        private authCoreService: AuthCoreService
    ) {}

    logIn() {
        this.authService
            .logIn(this.user?.value, this.pass?.value)
            // .pipe(finalize(() => this.router.navigate(['projects/explore'])))
            .subscribe({
                next: (value: any) => {
                    this.authCoreService.saveToken(value.access_token);
                },

                error: (err) => {
                    console.error(err);
                },
            });
    }
}
