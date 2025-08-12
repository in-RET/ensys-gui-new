import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthCoreService } from '../core/auth/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'RET-EnSys-GUI';

    authCoreService = inject(AuthCoreService);
    router = inject(Router);

    ngOnInit() {
        this.authCoreService.currentToken.subscribe((res) => {
            res || res === undefined
                ? false
                : this.router.navigate(['auth/login']);
        });
    }
}
