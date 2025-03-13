import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'explore',
        loadComponent: () =>
            import('../components/project/explore/explore.component').then(
                (c) => c.ExploreComponent
            ),
    },
];
