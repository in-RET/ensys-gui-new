import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth-guard.service';
import { LocalStorageProjectResolver } from '../shared/resolvers/project.resolver';
import { regionsResolver } from '../shared/resolvers/regions.resolver';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('../core/layout/index/index.component').then(
                        (c) => c.IndexComponent,
                    ),
            },

            {
                path: 'about',
                loadComponent: () =>
                    import('../components/legal/about/about.component').then(
                        (c) => c.AboutComponent,
                    ),
            },
            {
                path: 'faq',
                loadComponent: () =>
                    import('../components/legal/faq/faq.component').then(
                        (c) => c.FaqComponent,
                    ),
            },
            {
                path: 'license',
                loadComponent: () =>
                    import('../components/legal/license/license.component').then(
                        (c) => c.LicenseComponent,
                    ),
            },
            {
                path: 'imprint',
                loadComponent: () =>
                    import('../components/legal/imprint/imprint.component').then(
                        (c) => c.ImprintComponent,
                    ),
            },
            {
                path: 'privacy',
                loadComponent: () =>
                    import('../components/legal/privacy/privacy.component').then(
                        (c) => c.PrivacyComponent,
                    ),
            },
            {
                path: 'explore',
                canActivate: [AuthGuard],
                loadChildren: () =>
                    import('./explore.routes').then((r) => r.routes),
            },

            {
                path: 'project',
                canActivate: [AuthGuard],
                loadComponent: () =>
                    import('../components/project/project-create/project-create.component').then(
                        (c) => c.ProjectCreateComponent,
                    ),
                resolve: {
                    regionList: regionsResolver,
                },
            },

            {
                path: 'project/:id',
                canActivate: [AuthGuard],
                loadComponent: () =>
                    import('../components/project/project-create/project-create.component').then(
                        (c) => c.ProjectCreateComponent,
                    ),
                resolve: {
                    regionList: regionsResolver,
                },
            },

            {
                path: 'scenario',
                canActivate: [AuthGuard],
                loadComponent: () =>
                    import('../components/scenario/scenario-base/scenario-base.component').then(
                        (c) => c.ScenarioBaseComponent,
                    ),
                resolve: {
                    currentProject: LocalStorageProjectResolver,
                },
            },

            {
                path: 'simulation',
                canActivate: [AuthGuard],
                loadChildren: () =>
                    import('./simulation.routes').then((r) => r.routes),
            },
        ],
    },
];
