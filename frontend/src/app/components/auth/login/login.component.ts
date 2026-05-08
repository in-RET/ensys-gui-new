import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
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

    error!: { message: string };
    loading = false;

    private authService = inject(AuthService);
    private authCoreService = inject(AuthCoreService);
    private router = inject(Router);

    logIn() {
        this.loading = true;

        this.authService
            .logIn(this.user?.value, this.pass?.value)
            .pipe(
                tap((res: any) => {
                    if (res.success) {
                        this.authCoreService.saveTokenToStorage(
                            res.access_token,
                        );
                        this.authCoreService.saveToken(res.access_token);

                        res = res.data.items[0];
                        this.authCoreService.saveUserInfoInStorage(res);
                        this.authCoreService.saveUser(res);
                    } else {
                        throw new Error(res.message);
                    }
                }),

                finalize(() => (this.loading = false)),
            )
            .subscribe({
                next: () => {
                    this.router.navigate(['/projects']);
                },

                error: (err) => {
                    console.error(err);
                    this.error = {
                        message: err.error.detail,
                    };
                },
            });
    }
}
