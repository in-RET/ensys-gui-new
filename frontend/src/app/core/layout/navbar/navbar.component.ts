import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthCoreService } from '../../auth/auth.service';
@Component({
    selector: 'app-navbar',
    imports: [CommonModule],
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

    authService = inject(AuthCoreService);

    ngOnInit() {
        this.authService.currentToken.subscribe((res) =>
            res ? (this.user.is_authenticated = true) : false
        );
    }
}
