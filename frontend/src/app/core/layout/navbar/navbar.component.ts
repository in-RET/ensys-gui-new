import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

    ngOnInit() {
        console.log(1);
    }
}
