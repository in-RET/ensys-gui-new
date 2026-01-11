import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../components/auth/services/auth.service';
import { AuthCoreService } from '../../auth/auth.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ContentLayoutService } from '../services/content-layout.service';

@Component({
    selector: 'app-content',
    imports: [RouterOutlet, NavbarComponent, CommonModule, FooterComponent],
    templateUrl: './content.component.html',
    styleUrl: './content.component.scss',
    standalone: true,
})
export class ContentComponent implements OnInit {
    isFullscreen: boolean | undefined = true;
    user: any = {
        is_authenticated: false,
        info: null,
    };

    contentLayoutService = inject(ContentLayoutService);
    authCoreService = inject(AuthCoreService);
    authService = inject(AuthService);

    ngOnInit() {
        this.contentLayoutService.fullscreenStatus.subscribe(
            (status: boolean | undefined) => (this.isFullscreen = status)
        );

        this.checkCurrentUerStatus();
    }

    checkCurrentUerStatus() {
        this.authCoreService.currentToken
            .pipe(
                switchMap((token: any) => {
                    if (token) {
                        this.user.is_authenticated = true;
                        return this.authCoreService.currentUser;
                    } else {
                        return [null];
                    }
                })
            )
            .subscribe((user: any) => {
                this.user.info = user;
            });
    }
}
