import {CommonModule} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AuthService} from '../../../components/auth/services/auth.service';
import {AuthCoreService} from '../../auth/auth.service';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
    is_creation_scenario_mode = false;

    user: any = {
        is_authenticated: false,
    };

    navbar_class = ''; //'navbar--signup' | 'navbar--scenario' ;

    authCoreService = inject(AuthCoreService);
    authService = inject(AuthService);

    ngOnInit() {
        this.authCoreService.currentToken.subscribe((res) => {
            this.user.is_authenticated = !!res;
        });
    }

    logout() {
        this.authService.logOut();
    }
}
