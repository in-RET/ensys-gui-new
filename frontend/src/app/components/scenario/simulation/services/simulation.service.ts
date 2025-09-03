import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class SimulationService {
    private baseUrl: string = 'http://localhost:9006/simulation';
    constructor(private baseHttp: BaseHttpService) {}

    getSimulations(scenarioId: number) {
        return this.baseHttp.get(`${this.baseUrl}/${scenarioId}`);
    }

    startSimulation(scenarioId: number) {
        console.log(`Start Simulations with scenarioId: ${scenarioId}`);
    }
}
