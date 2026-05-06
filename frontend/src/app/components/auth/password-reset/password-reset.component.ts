import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-password-reset',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './password-reset.component.html',
    styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent {
    errMsg: string = '';
    loading: boolean = false;

    authService = inject(AuthService);
    router = inject(Router);

    email: FormControl = new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        Validators.email,
    ]);

    onSubmit() {
        this.loading = true;
        this.errMsg = '';

        if (this.email.valid) {
            this.authService
                .resetPassword(this.email.value)
                .pipe(finalize(() => (this.loading = false)))
                .subscribe({
                    next: () => {
                        this.goLogin();
                    },

                    error: (err) => {
                        console.error(err);

                        if (err.error.detail) {
                            this.errMsg = err.error.detail;
                        }
                    },
                });
        }
    }

    goLogin() {
        this.router.navigate(['/auth/login']);
    }
}
