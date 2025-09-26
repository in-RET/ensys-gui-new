import {inject, Injectable} from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BaseHttpService } from '../../../../core/base-http/base-http.service';
import { ResDataModel, ResModel } from '../../../../shared/models/http.model';
import { SimulationResModel } from '../models/simulation.model';

@Injectable({
    providedIn: 'root',
})
export class SimulationService {
    private baseUrl: string = environment.apiUrl + 'simulation';
    baseHttp = inject(BaseHttpService);

    getSimulations(scenarioId: number) {
        return this.baseHttp.get(`${this.baseUrl}s/${scenarioId}`);
    }

    startSimulation(scenarioId: number) {
        return this.baseHttp.post(`${this.baseUrl}/start/${scenarioId}`);
    }

    stoptSimulation(scenarioId: number) {
        return this.baseHttp.post(`${this.baseUrl}/stop/${scenarioId}`);
    }

    loadSimulations(
        scenarioId: number
    ): Observable<ResDataModel<SimulationResModel>> {
        return this.getSimulations(scenarioId).pipe(
            map((res: ResModel<SimulationResModel>) => {
                if (res.success) {
                    res.data.items = res.data.items.sort((a, b) => b.id - a.id);
                    return res.data;
                }
                throw new Error('Unknown API error');
            })
        );
    }

    onStopSimulation(
        scenarioId: number
    ): Observable<ResDataModel<SimulationResModel>> {
        return this.stoptSimulation(scenarioId).pipe(
            map((res: ResModel<SimulationResModel>) => {
                if (res.success) {
                    return res.data;
                }
                throw new Error('Unknown API error');
            })
        );
    }
}
