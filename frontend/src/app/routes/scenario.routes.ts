import { Routes } from '@angular/router';
import { localStorageProjectResolver } from '../shared/resolvers/project.resolver';
import { localStorageScenarioResolver } from '../shared/resolvers/scenario.resolver';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import(
                '../components/scenario/scenario-base/scenario-base.component'
            ).then((c) => c.ScenarioBaseComponent),
        resolve: {
            currentProject: localStorageProjectResolver,
            currentScenario: localStorageScenarioResolver,
        },
    },
    {
        path: '**',
        redirectTo: 'explore',
        pathMatch: 'full',
    },
];
