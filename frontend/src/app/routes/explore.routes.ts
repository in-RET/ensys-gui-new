import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../components/explore/explore/explore.component').then(
                (c) => c.ExploreComponent,
            ),
        children: [
            {
                path: '',
                redirectTo: 'projects',
                pathMatch: 'full',
            },
            {
                path: 'projects',
                loadComponent: () =>
                    import('../components/project/project-explore/project-explore.component').then(
                        (c) => c.ProjectExploreComponent,
                    ),
            },
            {
                path: 'templates',
                loadComponent: () =>
                    import('../components/template/template-explore/template-explore.component').then(
                        (c) => c.TemplateExploreComponent,
                    ),
            },
        ],
    },

    {
        path: '**',
        redirectTo: 'projects',
    },
];
