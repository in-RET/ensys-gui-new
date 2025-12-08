import {Injectable} from '@angular/core';
import {AbstractControl, ValidatorFn} from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class ValidateService {
    constructor() { /* empty */
    }

    hasLowerCaseCharacters(val: string | null): boolean {
        const lowercaseRegex = /[a-z]/g;

        return val ? !!val.match(lowercaseRegex) : false;
    }

    hasUpperCaseCharacters(val: string | null): boolean {
        const uppercaseRegex = /[A-Z]/g;

        return val ? !!val.match(uppercaseRegex) : false;
    }

    hasNumber(val: string | null): boolean {
        const numbersRegex = /[0-9]/g;
        return val ? !!val.match(numbersRegex) : false;
    }

    hasSpecialCharacters(val: string | null): boolean {
        const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;

        return val ? !!val.match(specialCharactersRegex) : false;
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
                confirmPasswordControl.setErrors({passwordMismatch: true});
                return {passwordMismatch: true};
            } else {
                confirmPasswordControl.setErrors(null);
                return null;
            }
        };
    }
}
