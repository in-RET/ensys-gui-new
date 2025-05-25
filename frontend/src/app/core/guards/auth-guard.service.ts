import { inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { AuthCoreService } from '../auth/auth.service';

export const AuthGuard = async (route: Route) => {
    const authCoreService = inject(AuthCoreService);
    const hasAccess: boolean = authCoreService.getHasAccess();
    const isDevelopingMode = environment.isDevelopingMode;

    if (isDevelopingMode || hasAccess) {
        return true;
    } else {
        const router = inject(Router);
        router.navigate(['./auth/login']);
        return false;
    }
};
