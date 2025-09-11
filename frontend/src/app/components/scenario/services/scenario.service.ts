import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseHttpService } from '../../../core/base-http/base-http.service';
import { ScenarioBaseInfoModel } from '../models/scenario.model';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = environment.apiUrl + 'scenario';
    private scenario_localstorage_name = 'scenario_data';
    private scenario_drawflow_localstorage_name = 'CURRENT_DRAWFLOW';

    private readonly _isDrawflowEmpty$ = new BehaviorSubject<boolean>(true);
    readonly isDrawflowEmpty$ = this._isDrawflowEmpty$.asObservable();

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

    updateScenario(data: any, id: number) {
        return this.baseHttp.patch(`${this.baseUrl}/${id}`, data);
    }

    deleteScenario(id: number) {
        return this.baseHttp.delete(`${this.baseUrl}/${id}`);
    }

    // base info
    saveBaseInfo_Storage(data: ScenarioBaseInfoModel) {
        localStorage.setItem(
            this.scenario_localstorage_name,
            JSON.stringify(data)
        );
    }

    removeBaseInfo_Storage() {
        localStorage.removeItem(this.scenario_localstorage_name);
    }

    restoreBaseInfo_Storage(): ScenarioBaseInfoModel | null {
        const BaseInfoData: string | null = localStorage.getItem(
            this.scenario_localstorage_name
        );

        if (BaseInfoData && BaseInfoData.trim() != '')
            return JSON.parse(BaseInfoData);
        else return null;
    }

    updateBaseInfo_Scenario(d: ScenarioBaseInfoModel) {
        localStorage.setItem(
            `${this.scenario_localstorage_name}`,
            JSON.stringify(d)
        );
    }

    //====================  draw flow   ====================
    saveDrawflow_Storage(data: any, needStringify = true) {
        localStorage.setItem(
            this.scenario_drawflow_localstorage_name,
            needStringify ? JSON.stringify(data) : data
        );

        this._isDrawflowEmpty$.next(false);
    }

    restoreDrawflow_Storage(mustResultString = false): string | false | any {
        const DrawflowData: string | null = localStorage.getItem(
            this.scenario_drawflow_localstorage_name
        );

        if (DrawflowData && DrawflowData.trim() != '') {
            this._isDrawflowEmpty$.next(false);
            return mustResultString ? DrawflowData : JSON.parse(DrawflowData);
        } else return false;
    }

    removeDrawflow_Storage() {
        localStorage.removeItem(this.scenario_drawflow_localstorage_name);
        this._isDrawflowEmpty$.next(true);
    }

    //====================  draw flow   ====================

    getPreDefinedList(type: string) {
        return this.baseHttp.get(
            environment.apiUrl + `oep/local_schemas/${type}`
        );
    }

    getPreDefinedData(option: string, simulationYear: number) {
        return this.baseHttp.get(
            environment.apiUrl + `oep/local_data/${option}/${simulationYear}`
        );
    }
}
