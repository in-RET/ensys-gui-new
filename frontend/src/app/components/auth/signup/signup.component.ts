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
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ValidateService } from '../services/validate.service';

@Component({
    selector: 'app-signup',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss',
})
export class SignupComponent {
    validateService = inject(ValidateService);

    form: FormGroup = new FormGroup(
        {
            email: new FormControl(null, Validators.required),
            fName: new FormControl(null, Validators.required),
            lName: new FormControl(null, Validators.required),
            user: new FormControl(null, Validators.required),
            pass: new FormControl(null, Validators.required),
            confirmPass: new FormControl(
                null,
                Validators.compose([Validators.required])
            ),
            consentOpt: new FormControl(false, Validators.required),
        },
        this.validateService.passwordMatch('pass', 'confirmPass')
    );

    get email() {
        return this.form.get('email');
    }

    get fName() {
        return this.form.get('fName');
    }

    get lName() {
        return this.form.get('lName');
    }

    get user() {
        return this.form.get('user');
    }

    get pass() {
        return this.form.get('pass');
    }

    get confirmPass() {
        return this.form.get('confirmPass');
    }

    get consentOpt() {
        return this.form.get('consentOpt');
    }

    errorList: string[] = [];
    loading: boolean = false;

    authService = inject(AuthService);
    router = inject(Router);

    signup() {
        this.loading = true;

        this.authService
            .signup(
                this.user?.value,
                this.fName?.value,
                this.lName?.value,
                this.pass?.value,
                this.email?.value
            )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: () => {
                    this.goLogin();
                },

                error: (err) => {
                    console.error(err);

                    if (err.error.detail) {
                        this.errorList.push(err.error.detail);
                    }
                },
            });
    }

    goLogin() {
        this.router.navigate(['/auth/login']);
    }
}
