import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/content/content.component').then(
        (c) => c.ContentComponent
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
