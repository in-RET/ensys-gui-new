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
import { finalize, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthCoreService } from '../../../core/auth/auth.service';
import { GoogleAnalyticsService } from '../../../shared/services/google-analytics.service';
import { UserModel } from '../../models/user.model';
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
    private analytics = inject(GoogleAnalyticsService);
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
                        this.authCoreService.saveUserInfoInStorage(
                            res.data.items[0],
                        );
                        this.authCoreService.saveUser(res.data.items[0]);
                    }
                }),
                map((res: any) => {
                    if (res.success) {
                        const d: UserModel = res.data.items[0];
                        return d;
                    } else {
                        throw new Error(res.message);
                    }
                }),
                finalize(() => (this.loading = false)),
            )
            .subscribe({
                next: (value: UserModel) => {
                    this.analytics.setUser(value.id.toString());
                    this.analytics.trackEvent('login', {
                        method: 'email',
                    });
                    this.router.navigate(['/explore']);
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
