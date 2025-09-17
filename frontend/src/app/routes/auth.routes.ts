import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('../components/auth/login/login.component').then(
                (c) => c.LoginComponent
            ),
    },
    {
        path: 'logout',
        loadComponent: () =>
            import('../components/auth/login/login.component').then(
                (c) => c.LoginComponent
            ),
    },
    {
        path: 'signup',
        loadComponent: () =>
            import('../components/auth/signup/signup.component').then(
                (c) => c.SignupComponent
            ),
    },
    {
        path: 'password_reset',
        loadComponent: () =>
            import(
                '../components/auth/password-reset/password-reset.component'
            ).then((c) => c.PasswordResetComponent),
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];
