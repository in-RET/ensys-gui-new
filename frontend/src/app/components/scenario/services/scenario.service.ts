import { inject, Injectable } from '@angular/core';
import { DrawflowNode } from 'drawflow';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseHttpService } from '../../../core/base-http/base-http.service';
import { ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioReqModel,
    ScenarioResModel,
    UserModelingStateModel,
} from '../models/scenario.model';
import { ModalStateService } from '../scenario-energy-design/modals/modal-state.service';
import { ScenarioStateService } from './scenario-state.service';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = environment.apiUrl + 'scenario';
    private scenario_localstorage_name = 'scenario_data';
    private scenario_drawflow_localstorage_name = 'CURRENT_DRAWFLOW';
    private user_modeling_state = 'user_modeling_state';

    alertService = inject(AlertService);
    toastService = inject(ToastService);
    baseHttp = inject(BaseHttpService);
    private modalStateService = inject(ModalStateService);
    private scenarioStateService = inject(ScenarioStateService);

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
            JSON.stringify(data),
        );
    }

    replaceBaseInfo_Storage(data: ScenarioBaseInfoModel) {
        this.removeBaseInfo_Storage();
        this.saveBaseInfo_Storage(data);
    }

    removeBaseInfo_Storage() {
        localStorage.removeItem(this.scenario_localstorage_name);
    }

    restoreBaseInfo_Storage(): ScenarioBaseInfoModel | null {
        const BaseInfoData: string | null = localStorage.getItem(
            this.scenario_localstorage_name,
        );

        if (BaseInfoData && BaseInfoData.trim() != '')
            return JSON.parse(BaseInfoData);

        return null;
    }

    //====================  draw flow   ====================
    saveDrawflow_Storage(data: { [nodeKey: string]: DrawflowNode }) {
        if (!data) return;

        localStorage.setItem(
            this.scenario_drawflow_localstorage_name,
            JSON.stringify(data),
        );
    }

    restoreDrawflow_Storage(): { [nodeKey: string]: DrawflowNode } | null {
        const DrawflowData: string | null = localStorage.getItem(
            this.scenario_drawflow_localstorage_name,
        );

        if (DrawflowData && DrawflowData.trim() != '') {
            return JSON.parse(DrawflowData);
        } else return null;
    }

    removeDrawflow_Data() {
        localStorage.removeItem(this.scenario_drawflow_localstorage_name);
        this.scenarioStateService.clearDrawflowData();
    }

    //====================  draw flow   ====================

    getPreDefinedList(type: string) {
        return this.baseHttp.get(
            environment.apiUrl + `oep/local_schemas/${type}`,
        );
    }

    getPreDefinedData_node(option: string, simulationYear: number) {
        return this.baseHttp.get(
            environment.apiUrl +
                `oep/local_data/${option}/${simulationYear}/node_data`,
        );
    }

    getPreDefinedData_ports(option: string, simulationYear: number) {
        return this.baseHttp.get(
            environment.apiUrl +
                `oep/local_data/${option}/${simulationYear}/ports_data`,
        );
    }

    //====================  local  ====================
    saveCurrentScenario(
        scenarioData: ScenarioBaseInfoModel,
    ): Observable<ScenarioResModel> {
        if (!scenarioData || !scenarioData.scenario) {
            return throwError(() => new Error('There is no data to save!'));
        }

        const newScenarioData: ScenarioReqModel = {
            name: scenarioData.scenario.name,
            start_date: scenarioData.scenario.sDate,
            time_steps: scenarioData.scenario.timeStep,
            project_id: scenarioData.project?.id,
            interval: 1,
            modeling_data: scenarioData.scenario.modeling_data
                ? JSON.stringify(scenarioData.scenario.modeling_data)
                : '',
            constraints:
                scenarioData.scenario.constraints &&
                scenarioData.scenario.constraints.length > 0
                    ? JSON.stringify(scenarioData.scenario.constraints)
                    : '',
        };

        return this.createScenario(newScenarioData).pipe(
            map((res: ResModel<ScenarioResModel>) => {
                if (res.success) return res.data.items[0];
                throw new Error('Unknown API error');
            }),
        );
    }

    updateCurrentScenario(
        scenarioData: ScenarioBaseInfoModel,
    ): Observable<ScenarioResModel> {
        if (scenarioData.scenario && scenarioData.scenario.id) {
            const newScenarioData: ScenarioReqModel = {
                name: scenarioData.scenario.name,
                start_date: scenarioData.scenario.sDate,
                time_steps: scenarioData.scenario.timeStep,
                interval: 1,
                modeling_data: scenarioData.scenario.modeling_data
                    ? JSON.stringify(scenarioData.scenario.modeling_data)
                    : '',
                constraints:
                    scenarioData.scenario.constraints &&
                    scenarioData.scenario.constraints.length > 0
                        ? JSON.stringify(scenarioData.scenario.constraints)
                        : '',
            };

            return this.updateScenario(
                newScenarioData,
                scenarioData.scenario.id,
            ).pipe(
                map((res: ResModel<ScenarioResModel>) => {
                    if (res.success) {
                        return res.data.items[0];
                    }
                    throw new Error('Unknown API error');
                }),
            );
        } else {
            return throwError(() => new Error('No scenario data to update!'));
        }
    }

    getEntityInfoUrl(nodeName: string) {
        switch (nodeName) {
            case 'source':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#module-oemof.solph.components._source';

            case 'transformer':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#module-oemof.solph.components._converter';

            case 'genericStorage':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#module-oemof.solph.components._generic_storage';

            case 'sink':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.components.html#oemof.solph.components._sink.Sink';

            case 'bus':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.busses.html';

            case 'flow':
                return 'https://oemof-solph.readthedocs.io/en/v0.5.7/reference/oemof.solph.flow.html#module-oemof.solph.flows';

            default:
                return 'https://oemof-solph.readthedocs.io';
        }
    }

    checkNodeDuplication(nodeName: string, nodeId: number) {
        const currentDrawflowData:
            | string
            | {
                  [nodeKey: string]: DrawflowNode;
              }
            | null = this.scenarioStateService.getDrawflowData();

        if (
            currentDrawflowData == null ||
            Object.keys(currentDrawflowData).length == 0
        )
            return false;

        if (
            !currentDrawflowData ||
            JSON.stringify(currentDrawflowData) === '{}' ||
            Object.keys(currentDrawflowData).length == 0
        ) {
            return false;
        }

        for (const key in currentDrawflowData) {
            if (
                Object.prototype.hasOwnProperty.call(currentDrawflowData, key)
            ) {
                const node = currentDrawflowData[key];

                if (node.id != nodeId || !nodeId) {
                    if (node.name === nodeName || node.data.name === nodeName) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    saveUserModelingState(userModelingState: UserModelingStateModel) {
        localStorage.setItem(
            this.user_modeling_state,
            JSON.stringify(userModelingState),
        );
    }

    updateUserModelingState(updates: Partial<UserModelingStateModel>) {
        const currentStateStr = localStorage.getItem(this.user_modeling_state);
        let currentState: UserModelingStateModel = currentStateStr
            ? JSON.parse(currentStateStr)
            : ({} as UserModelingStateModel);

        const newState = { ...currentState, ...updates };

        localStorage.setItem(
            this.user_modeling_state,
            JSON.stringify(newState),
        );
    }

    removeUserModelingState() {
        localStorage.removeItem(this.user_modeling_state);
    }

    restoreUserModelingState(): UserModelingStateModel | null {
        const stateStr = localStorage.getItem(this.user_modeling_state);

        if (stateStr && stateStr.trim() != '') {
            return JSON.parse(stateStr);
        }

        return null;
    }
}
