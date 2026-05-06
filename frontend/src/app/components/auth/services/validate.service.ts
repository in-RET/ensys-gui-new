import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class ValidateService {
    hasLowerCaseCharacters(val: string | null): boolean {
        return val ? /[a-z]/.test(val) : false;
    }

    hasUpperCaseCharacters(val: string | null): boolean {
        return val ? /[A-Z]/.test(val) : false;
    }

    hasNumber(val: string | null): boolean {
        return val ? /[0-9]/.test(val) : false;
    }

    hasSpecialCharacters(val: string | null): boolean {
        return val ? /[!@#$%^&*(),.?":{}|<>]/.test(val) : false;
    }

    passwordLength(val: string | null): boolean {
        return val ? val.length >= 8 : false;
    }

    passwordMatch(password: string, confirmPassword: string): ValidatorFn {
        return (formGroup: AbstractControl): Record<string, any> | null => {
            const passwordControl = formGroup.get(password);
            const confirmPasswordControl = formGroup.get(confirmPassword);

            if (!passwordControl || !confirmPasswordControl) {
                return null;
            }

            if (
                confirmPasswordControl.errors &&
                !confirmPasswordControl.errors['passwordMismatch']
            ) {
                return null;
            }

            if (passwordControl.value !== confirmPasswordControl.value) {
                confirmPasswordControl.setErrors({ passwordMismatch: true });
                return { passwordMismatch: true };
            } else {
                confirmPasswordControl.setErrors(null);
                return null;
            }
        };
    }

    strongPasswordValidator = (control: AbstractControl) => {
        const value = control.value;

        if (!value) return null;

        const errors: any = {};

        if (!this.hasLowerCaseCharacters(value)) {
            errors.noLowerCase = true;
        }

        if (!this.hasUpperCaseCharacters(value)) {
            errors.noUpperCase = true;
        }

        if (!this.hasNumber(value)) {
            errors.noNumber = true;
        }

        if (!this.hasSpecialCharacters(value)) {
            errors.noSpecialChar = true;
        }

        if (!this.passwordLength(value)) {
            errors.tooShort = true;
        }

        return Object.keys(errors).length ? errors : null;
    };
}
