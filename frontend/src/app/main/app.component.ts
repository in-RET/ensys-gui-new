import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthCoreService } from '../core/auth/auth.service';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ToastContainerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
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
