import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'explore',
        loadComponent: () =>
            import(
                '../components/template/template-explore/template-explore.component'
                ).then((c) => c.TemplateExploreComponent),
    },
    {
        path: '**',
        redirectTo: 'explore',
        pathMatch: 'full',
    },
];
