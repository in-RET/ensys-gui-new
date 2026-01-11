import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../components/auth/services/auth.service';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule, NgbDropdownModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    is_creation_scenario_mode: boolean = false;

    @Input() user: any = {
        is_authenticated: false,
        info: null,
    };
    // array of links with title+href
    navLinks: { title: string; href: string; _blank?: boolean }[] = [
        { title: 'About', href: '/about' },
        {
            title: 'Documentation',
            href: 'https://in-ret.github.io/ensys-gui-new/',
            _blank: true,
        },
        {
            title: 'Github',
            href: 'https://github.com/in-RET/ensys-gui-new/',
            _blank: true,
        },

        { title: 'License', href: '/license' },
        { title: 'Imprint', href: '/imprint' },
        { title: 'Privacy', href: '/privacy' },
    ];

    authService = inject(AuthService);
    cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        this.cdr.markForCheck();
    }

    logout() {
        this.authService.logOut();
    }
}
