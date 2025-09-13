import { Routes } from '@angular/router';
import { localStorageProjectResolver } from '../shared/resolvers/project.resolver';
import { localStorageScenarioResolver } from '../shared/resolvers/scenario.resolver';

export const routes: Routes = [
    {
        path: 'list/:id',
        loadComponent: () =>
            import(
                '../components/scenario/simulation/simulation-list/simulation-list.component'
            ).then((c) => c.SimulationListComponent),
        resolve: {
            currentProject: localStorageProjectResolver,
            currentScenario: localStorageScenarioResolver,
        },
    },
    {
        path: ':id',
        loadComponent: () =>
            import(
                '../components/scenario/simulation/simulation.component'
            ).then((c) => c.SimulationComponent),
        resolve: {
            currentProject: localStorageProjectResolver,
            currentScenario: localStorageScenarioResolver,
        },
    },
];
