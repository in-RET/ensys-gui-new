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
    path: 'signup',
    loadComponent: () =>
      import('../components/auth/signup/signup.component').then(
        (c) => c.SignupComponent
      ),
  },
];
