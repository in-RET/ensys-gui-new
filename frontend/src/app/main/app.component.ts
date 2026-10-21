import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthCoreService } from '../core/auth/auth.service';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';
import { GoogleAnalyticsService } from '../shared/services/google-analytics.service';

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
    analytics = inject(GoogleAnalyticsService);

    ngOnInit() {
        this.analytics.init();

        this.authCoreService.currentToken.subscribe((res) => {
            if (res || res === undefined) {
                return;
            } else {
                this.router.navigate(['auth/login']);
            }
        });
    }
}
