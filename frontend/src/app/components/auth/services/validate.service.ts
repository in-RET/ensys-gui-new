import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class ValidateService {
    constructor() {}

    private hasLowerCaseUpperCaseNumCharacters(val: string): boolean {
        let uppercaseRegex = /[A-Z]/g;
        let lowercaseRegex = /[a-z]/g;
        let numbersRegex = /[0-9]/g;

        return val.match(lowercaseRegex) &&
            val.match(uppercaseRegex) &&
            val.match(numbersRegex)
            ? true
            : false;
    }

    passwordMinLowerCaseLettersValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
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
        return (formGroup: AbstractControl): { [key: string]: any } | null => {
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
