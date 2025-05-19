import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = 'http://localhost:9006/scenario';
    private scenario_localstorage_name = `scenario_data`;

    constructor(private baseHttp: BaseHttpService) {}

    getScenario(id: number) {
        return this.baseHttp.get(`${this.baseUrl}/${id}`);
    }

    getScenarios(projectId: number) {
        return this.baseHttp.get(`${this.baseUrl}s/${projectId}`);
    }

    createScenario(data: any) {
        return this.baseHttp.post(`${this.baseUrl}`, data);
    }

    saveBaseInfo_Storage(data: any) {
        localStorage.setItem(
            this.scenario_localstorage_name,
            JSON.stringify(data)
        );
    }

    removeBaseInfo_Storage() {
        localStorage.removeItem(this.scenario_localstorage_name);
    }

    restoreBaseInfo_Storage(): any {
        const BaseInfoData: string | null = localStorage.getItem(
            this.scenario_localstorage_name
        );

        if (BaseInfoData && BaseInfoData.trim() != '')
            return JSON.parse(BaseInfoData);
        else return false;
    }
}
