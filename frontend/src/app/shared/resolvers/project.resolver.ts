import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { ProjectService } from '../../components/project/services/project.service';
import { ScenarioService } from '../../components/scenario/services/scenario.service';

export const projectsResolver: ResolveFn<boolean> = (route, state) => {
    return inject(ProjectService)
        .getProjects()
        .pipe(
            map((res: any) => {
                if (res.data.items) return res.data.items;
                else return {};
            })
        );
};

export const localStorageProjectResolver: ResolveFn<any | null> = (
    route,
    state
) => {
    const project = inject(ScenarioService).restoreBaseInfo_Storage()?.project;
    return project ? project : null;
};
