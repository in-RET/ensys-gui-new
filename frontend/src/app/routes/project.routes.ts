import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'explore',
        loadComponent: () =>
            import(
                '../components/project/project-explore/project-explore.component'
            ).then((c) => c.ProjectExploreComponent),
    },
    {
        path: 'create',
        loadComponent: () =>
            import(
                '../components/project/project-create/project-create.component'
            ).then((c) => c.ProjectCreateComponent),
    },
    {
        path: 'update/:id',
        loadComponent: () =>
            import(
                '../components/project/project-create/project-create.component'
            ).then((c) => c.ProjectCreateComponent),
    },
    {
        path: '**',
        redirectTo: 'explore',
        pathMatch: 'full',
    },
];
