import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../components/auth/services/auth.service';
import { AuthCoreService } from '../../auth/auth.service';
@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    is_creation_scenario_mode: boolean = false;
    is_signup_mode: boolean = false;

    user: any = {
        is_authenticated: false,
    };

    navbar_class: string = ''; //'navbar--signup' | 'navbar--scenario' ;

    authCoreService = inject(AuthCoreService);
    authService = inject(AuthService);

    ngOnInit() {
        this.authCoreService.currentToken.subscribe((res) => {
            this.user.is_authenticated = res ? true : false;
        });
    }

    logout() {
        this.authService.logOut();
    }
}
