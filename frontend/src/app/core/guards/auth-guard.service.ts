import { inject } from '@angular/core';
import { Route } from '@angular/router';
import { AuthCoreService } from '../auth/auth.service';

export const AuthGuard = (route: Route) => {
    const authCoreService = inject(AuthCoreService);
    const hasAccess: boolean = authCoreService.getHasAccess();

    if (hasAccess) {
        return true;
    } else {
        return false;
    }
};
