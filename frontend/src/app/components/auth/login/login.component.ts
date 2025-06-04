import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { AuthCoreService } from '../../../core/auth/auth.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    form: FormGroup = new FormGroup({
        user: new FormControl(null, Validators.required),
        pass: new FormControl(null, Validators.required),
    });
    isDevelopingMode = environment.isDevelopingMode;

    get user() {
        return this.form.get('user');
    }

    get pass() {
        return this.form.get('pass');
    }

    error!: { messge: string };

    constructor(
        private authService: AuthService,
        private authCoreService: AuthCoreService,
        private router: Router
    ) {
        if (this.isDevelopingMode) {
            this.form.patchValue({
                user: 'qqq12345678',
                pass: 'qqq12345678!Q',
            });
        }
    }

    logIn() {
        this.authService.logIn(this.user?.value, this.pass?.value).subscribe({
            next: (value: any) => {
                this.authCoreService.saveTokenToStorage(value.access_token);
                this.authCoreService.saveToken(value.access_token);
                this.router.navigate(['/projects']);
            },

            error: (err) => {
                console.error(err);
                this.error = {
                    messge: err.error.detail,
                };
            },
        });
    }
}
