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
import { finalize, map, switchMap, tap } from 'rxjs';
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

    error!: { messge: string };
    loading: boolean = false;

    constructor(
        private authService: AuthService,
        private authCoreService: AuthCoreService,
        private router: Router
    ) {}

    logIn() {
        this.loading = true;

        this.authService
            .logIn(this.user?.value, this.pass?.value)
            .pipe(
                tap((res: any) => {
                    this.authCoreService.saveTokenToStorage(res.access_token);
                    this.authCoreService.saveToken(res.access_token);
                }),
                switchMap((logRes: any) =>
                    this.authService.getCurrentUser().pipe(
                        tap((userRes: any) => {
                            this.authCoreService.saveUser(
                                userRes.data.items[0]
                            );
                        }),
                        map((user: any) => user.data.items[0])
                    )
                ),
                finalize(() => (this.loading = false))
            )
            .subscribe({
                next: (user) => {
                    this.authCoreService.saveUserInfoInStorage(
                        JSON.stringify(user)
                    );

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
