import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

@Injectable({
    providedIn: 'root',
})
export class GoogleAnalyticsService {
    constructor(private router: Router) {}

    init(): void {
        const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (!window.gtag) return;

        window.gtag('config', environment.googleAnalyticsId, {
            debug_mode: isLocalhost,
        });

        this.router.events
            .pipe(
                filter(
                    (event): event is NavigationEnd =>
                        event instanceof NavigationEnd,
                ),
            )
            .subscribe((event) => {
                this.trackPageView(event.urlAfterRedirects);
            });
    }

    setUser(userId: string) {
        window.gtag('config', environment.googleAnalyticsId, {
            user_id: userId,
        });
    }

    trackPageView(page_path: string) {
        window.gtag('event', 'page_view', {
            page_path,
        });
    }

    trackEvent(eventName: string, params?: Record<string, unknown>): void {
        window.gtag('event', eventName, params);
    }
}
