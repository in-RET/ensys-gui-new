import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

export interface ScenarioModel {
    project: {
        id: number;
        name: string;
        scenarioList?: any;
    };
    scenario?: {
        id?: number;
        name: string;
        simulationPeriod: number;
        sDate: string; // ISO date string
        timeStep: number; // minutes or seconds
        simulationYear: number;
        modeling_data?: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl = 'http://localhost:20001/scenario';
    private scenario_localstorage_name = 'scenario_data';
    private scenario_drawflow_localstorage_name = 'CURRENT_DRAWFLOW';

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

    deleteScenario(id: number) {
        return this.baseHttp.delete(`${this.baseUrl}/${id}`);
    }

    // base info
    saveBaseInfo_Storage(data: ScenarioModel) {
        localStorage.setItem(
            this.scenario_localstorage_name,
            JSON.stringify(data)
        );
    }

    removeBaseInfo_Storage() {
        localStorage.removeItem(this.scenario_localstorage_name);
    }

    restoreBaseInfo_Storage(): ScenarioModel | null {
        const BaseInfoData: string | null = localStorage.getItem(
            this.scenario_localstorage_name
        );

        if (BaseInfoData && BaseInfoData.trim() != '')
            return JSON.parse(BaseInfoData);
        else return null;
    }

    saveDrawflow_Storage(data: any, needStringify = true) {
        localStorage.setItem(
            this.scenario_drawflow_localstorage_name,
            needStringify ? JSON.stringify(data) : data
        );
    }

    restoreDrawflow_Storage(
        mustResultString = false
    ): string | false | any {
        const DrawflowData: string | null = localStorage.getItem(
            this.scenario_drawflow_localstorage_name
        );

        if (DrawflowData && DrawflowData.trim() != '')
            return mustResultString ? DrawflowData : JSON.parse(DrawflowData);
        else return false;
    }

    removeDrawflow_Storage() {
        localStorage.removeItem(this.scenario_drawflow_localstorage_name);
    }

    getPreDefinedList(type: string) {
        return this.baseHttp.get(
            `http://localhost:20001/oep/local_schemas/${type}`
        );
    }

    getPreDefinedData(option: string, simulationYear: number) {
        return this.baseHttp.get(
            `http://localhost:20001/oep/local_data/${option}/${simulationYear}`
        );
    }
}
