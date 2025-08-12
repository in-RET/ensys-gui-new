import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class ValidateService {
    constructor() {}

    private hasLowerCaseUpperCaseNumCharacters(val: string): boolean {
        const uppercaseRegex = /[A-Z]/g;
        const lowercaseRegex = /[a-z]/g;
        const numbersRegex = /[0-9]/g;

        return val.match(lowercaseRegex) &&
            val.match(uppercaseRegex) &&
            val.match(numbersRegex)
            ? true
            : false;
    }

    passwordMinLowerCaseLettersValidator(): ValidatorFn {
        return (control: AbstractControl): Record<string, any> | null => {
            if (!control.value) {
                return null;
            }

            const valid = this.hasLowerCaseUpperCaseNumCharacters(
                control.value
            );

            return valid ? null : { invalidPasswordLetters: true };
        };
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
}
