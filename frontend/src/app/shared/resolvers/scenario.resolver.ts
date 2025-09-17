import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ScenarioService } from '../../components/scenario/services/scenario.service';

export const scenarioResolver: ResolveFn<boolean> = (route, state) => {
    return true;
};

export const localStorageScenarioResolver: ResolveFn<any | null> = (
    route,
    state
) => {
    const scenario =
        inject(ScenarioService).restoreBaseInfo_Storage()?.scenario;
    return scenario ? scenario : null;
};
