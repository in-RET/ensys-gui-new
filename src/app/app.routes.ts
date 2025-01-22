import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/content/content.component').then(
        (c) => c.ContentComponent
      ),
    loadChildren: () => import('./routes/main.routes').then((r) => r.routes),
  },

  // authentication
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/auth/login/login.component').then(
            (c) => c.LoginComponent
          ),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./components/auth/signup/signup.component').then(
            (c) => c.SignupComponent
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
