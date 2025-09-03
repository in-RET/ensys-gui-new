import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthCoreService } from '../core/auth/auth.service';
import { BaseHttpService } from '../core/base-http/base-http.service';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ToastContainerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'ensys-gui-angular';

    authCoreService = inject(AuthCoreService);
    router = inject(Router);
    httpService = inject(BaseHttpService);

    ngOnInit() {
        this.authCoreService.currentToken.subscribe((res) => {
            res || res === undefined
                ? false
                : this.router.navigate(['auth/login']);
        });

        this.httpService.get(environment.apiUrl + 'admin/').subscribe({
            next(value) {
                alert(value);
            },
            error(err) {
                alert(err.error.detail);
            },
        });
    }
}
