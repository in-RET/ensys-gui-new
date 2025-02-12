import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    constructor(private authService: AuthService) {}

    logIn() {
        this.authService.logIn().subscribe({
            next: (value: any) => {
                console.log(value);
            },

            error(err) {
                console.error(err);
            },
        });
    }
}
