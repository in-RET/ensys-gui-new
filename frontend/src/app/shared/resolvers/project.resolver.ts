import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { ProjectService } from '../../components/project/services/project.service';

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
