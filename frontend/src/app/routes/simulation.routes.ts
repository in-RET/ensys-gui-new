import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: ':id',
        loadComponent: () =>
            import('../components/scenario/simulation/simulation.component').then(
                (c) => c.SimulationComponent,
            ),
    },
];
