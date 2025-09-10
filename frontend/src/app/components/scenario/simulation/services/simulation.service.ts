import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { BaseHttpService } from '../../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class SimulationService {
    private baseUrl: string = environment.apiUrl + 'simulation';
    constructor(private baseHttp: BaseHttpService) {}

    getSimulations(scenarioId: number) {
        return this.baseHttp.get(`${this.baseUrl}/${scenarioId}`);
    }

    startSimulation(scenarioId: number) {
        return this.baseHttp.post(`${this.baseUrl}/start/${scenarioId}`);
    }
}
