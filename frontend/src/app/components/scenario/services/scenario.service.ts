import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseHttpService } from '../../../core/base-http/base-http.service';
import { ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioReqModel,
    ScenarioResModel,
} from '../models/scenario.model';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = environment.apiUrl + 'scenario';
    private scenario_localstorage_name = 'scenario_data';
    private scenario_drawflow_localstorage_name = 'CURRENT_DRAWFLOW';

    private readonly _isDrawflowEmpty$ = new BehaviorSubject<boolean>(true);
    readonly isDrawflowEmpty$ = this._isDrawflowEmpty$.asObservable();

    alertService = inject(AlertService);
    toastService = inject(ToastService);

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

    duplicateScenario(id: number) {
        return this.baseHttp.post(`${this.baseUrl}/duplicate/${id}`);
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

        return null;
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

    //====================  local  ====================
    onSaveScenario(): Observable<ScenarioResModel> | undefined {
        const scenarioData: ScenarioBaseInfoModel | null =
            this.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return;
        }

        const drawflowData = this.restoreDrawflow_Storage(true);

        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return;
        }

        const newScenarioData: ScenarioReqModel = {
            name: scenarioData.scenario?.name,
            start_date: scenarioData.scenario?.sDate,
            time_steps: scenarioData.scenario.timeStep,
            project_id: scenarioData.project.id,
            interval: 1,
            modeling_data: drawflowData,
        };

        return this.createScenario(newScenarioData).pipe(
            map((res: ResModel<ScenarioResModel>) => {
                if (res.success) return res.data.items[0];

                //  if (res.error.status == 409) {
                //                 const confirmed = await this.alertService.confirm(
                //                     'Do you want change the name? Or Update current?',
                //                     'Duplicate Scenario!',
                //                     '< Step',
                //                     'Update',
                //                     'error'
                //                 );

                //                 if (confirmed) {
                //                     this.prevtStep();
                //                 } else {
                //                     this.updateScenario();
                //                 }
                //             } else
                // this.alertService.error(err.message || 'Save failed');
                throw new Error('Unknown API error');
            })
        );
    }

    onUpdateScenario(): Observable<ScenarioResModel> | undefined {
        const scenarioData: ScenarioBaseInfoModel | null =
            this.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return;
        }

        if (!scenarioData.scenario.id) {
            this.alertService.warning('Error: Id not found!');
            return;
        }

        const newScenarioData: ScenarioReqModel = {
            name: scenarioData.scenario?.name,
            start_date: scenarioData.scenario?.sDate,
            time_steps: scenarioData.scenario?.timeStep,
            interval: 1,
            modeling_data: this.restoreDrawflow_Storage(true),
        };

        const drawflowData = this.restoreDrawflow_Storage();

        if (!drawflowData) {
            this.alertService.warning('Drawflow data missing!');
            return;
        }

        return this.updateScenario(
            newScenarioData,
            scenarioData.scenario.id
        ).pipe(
            map((res: ResModel<ScenarioResModel>) => {
                if (res.success) {
                    return res.data.items[0];
                }
                throw new Error('Unknown API error');
            })
        );
    }
}
