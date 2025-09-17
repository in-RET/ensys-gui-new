import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { RegionService } from '../services/region.service';

export const regionsResolver: ResolveFn<boolean> = (route, state) => {
    return inject(RegionService)
        .getAllRegions()
        .pipe(
            map((res: any) => {
                return res ? res : [];
            })
        );
};
