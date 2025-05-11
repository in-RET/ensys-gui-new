import {
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { routes } from './app.routes';
import { AuthCoreService } from './core/auth/auth.service';
import { RequestHeaderInterceptor } from './core/interceptors/request-header-interceptor';

function initializeApp() {}
export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        AuthCoreService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: RequestHeaderInterceptor,
            multi: true,
        },
        provideAppInitializer(() => {
            const authService = inject(AuthCoreService);

            return of(authService.getToken()).pipe((res: Observable<any>) => {
                res.subscribe((token: any) => {
                    console.log(token);

                    if (!token || token.trim() == '') {
                        const TOKEN = authService.getTokenFromStorage();

                        // no logged in before
                        if (TOKEN && TOKEN.trim() != '') {
                            authService.saveToken(TOKEN);
                            console.log(TOKEN);
                        }
                    }
                });

                return res;
            });
        }),
    ],
};
