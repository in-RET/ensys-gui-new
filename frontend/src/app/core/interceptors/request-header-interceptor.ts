import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';

import {inject, Injectable} from '@angular/core';

import { Observable } from 'rxjs';

import { Router } from '@angular/router';
import { AuthCoreService } from '../auth/auth.service';

@Injectable()
export class RequestHeaderInterceptor implements HttpInterceptor {

    authService = inject(AuthCoreService);
    router = inject(Router);

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const hasAccess = this.authService.getHasAccess();
        const token = this.authService.getToken();

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + token,
                },
            });
        }

        // if (!request?.headers?.has('Content-Type')) {
        //     request = request.clone({
        //         setHeaders: {
        //             'content-type': 'application/json',
        //         },
        //     });
        // }

        request = request.clone({
            headers: request.headers.set('Accept', 'application/json'),
        });

        return next.handle(this.addHeaders(request));
    }

    private addHeaders(request: HttpRequest<any>): HttpRequest<any> {
        return request;
    }
}
