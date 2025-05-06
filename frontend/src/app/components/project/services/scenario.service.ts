import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = 'http://localhost:9006/Scenario';

    constructor(private baseHttp: BaseHttpService) {}

    getScenario(id: number) {
        return this.baseHttp.get(`${this.baseUrl}/${id}`);
    }

    getScenarios(projectId: number) {
        return this.baseHttp.get(`${this.baseUrl}s/${projectId}`);
    }
}
