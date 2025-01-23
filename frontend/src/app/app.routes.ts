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
    loadChildren: () => import('./routes/auth.routes').then((r) => r.routes),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
