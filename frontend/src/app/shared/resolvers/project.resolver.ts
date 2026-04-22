import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { ProjectResModel } from '../../components/project/models/project.model';
import { ProjectService } from '../../components/project/services/project.service';
import { ScenarioBaseInfoModel_project } from '../../components/scenario/models/scenario.model';
import { ScenarioService } from '../../components/scenario/services/scenario.service';
import { ResModel } from '../models/http.model';

export const ProjectsResolver: ResolveFn<ProjectResModel[] | null> = (
    route,
    state,
) => {
    return inject(ProjectService)
        .getProjects()
        .pipe(
            map((res: ResModel<ProjectResModel>) => {
                if (res.data.items) return res.data.items;
                else return null;
            }),
        );
};

export const LocalStorageProjectResolver: ResolveFn<
    ScenarioBaseInfoModel_project | null
> = (route, state) => {
    const project: ScenarioBaseInfoModel_project | undefined =
        inject(ScenarioService).restoreBaseInfo_Storage()?.project;
    return project ? project : null;
};
