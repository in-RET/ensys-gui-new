import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/content/content.component').then(
        (c) => c.ContentComponent
      ),
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

  // footer elements
  {
    path: 'about',
    loadComponent: () =>
      import('./components/legal/about/about.component').then(
        (c) => c.AboutComponent
      ),
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./components/legal/faq/faq.component').then(
        (c) => c.FaqComponent
      ),
  },
  {
    path: 'license',
    loadComponent: () =>
      import('./components/legal/license/license.component').then(
        (c) => c.LicenseComponent
      ),
  },
  {
    path: 'imprint',
    loadComponent: () =>
      import('./components/legal/imprint/imprint.component').then(
        (c) => c.ImprintComponent
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./components/legal/privacy/privacy.component').then(
        (c) => c.PrivacyComponent
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
