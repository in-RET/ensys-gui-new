import {
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthCoreService } from './core/auth/auth.service';
import { RequestHeaderInterceptor } from './core/interceptors/request-header-interceptor';

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
    ],
};
