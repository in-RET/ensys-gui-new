import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../components/auth/services/auth.service';
import { AuthCoreService } from '../../auth/auth.service';
@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
    is_creation_scenario_mode: boolean = false;

    user: any = {
        is_authenticated: false,
    };

    navbar_class: string = ''; //'navbar--signup' | 'navbar--scenario' ;

    authCoreService = inject(AuthCoreService);
    authService = inject(AuthService);
    cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        this.authCoreService.currentToken.subscribe((res) => {
            this.user.is_authenticated = res ? true : false;
            this.cdr.markForCheck();
        });
    }

    logout() {
        this.authService.logOut();
    }
}
