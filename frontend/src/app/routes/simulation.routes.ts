import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'list/:id',
        loadComponent: () =>
            import(
                '../components/scenario/simulation/simulation-list/simulation-list.component'
            ).then((c) => c.SimulationListComponent),
    },
    {
        path: ':id',
        loadComponent: () =>
            import(
                '../components/scenario/simulation/simulation.component'
            ).then((c) => c.SimulationComponent),
    },
];
