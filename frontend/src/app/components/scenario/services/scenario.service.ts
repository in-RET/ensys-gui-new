import { inject, Injectable } from '@angular/core';
import { DrawflowNode } from 'drawflow';
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
import { ModalStateService } from '../scenario-energy-design/modals/modal-state.service';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = environment.apiUrl + 'scenario';
    private scenario_localstorage_name = 'scenario_data';
    private scenario_drawflow_localstorage_name = 'CURRENT_DRAWFLOW';

    private _drawflowData$ = new BehaviorSubject<{
        [nodeKey: string]: DrawflowNode;
    } | null>(null);
    readonly drawflowData$ = this._drawflowData$.asObservable();

    readonly isDrawflowEmpty$: Observable<boolean> = this._drawflowData$.pipe(
        map((data) => data === null),
    );

    alertService = inject(AlertService);
    toastService = inject(ToastService);
    baseHttp = inject(BaseHttpService);
    private modalStateService = inject(ModalStateService);

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

    updateBaseInfo_Scenario(d: ScenarioBaseInfoModel) {
        localStorage.setItem(
            `${this.scenario_localstorage_name}`,
            JSON.stringify(d),
        );
    }

    //====================  draw flow   ====================
    saveDrawflow_Storage(data: { [nodeKey: string]: DrawflowNode }) {
        localStorage.setItem(
            this.scenario_drawflow_localstorage_name,
            JSON.stringify(data),
        );
    }

    setDrawflowData(data: { [nodeKey: string]: DrawflowNode }) {
        this._drawflowData$.next(data);
    }

    private clearDrawflowData() {
        console.log(3);

        this._drawflowData$.next(null);
    }

    restoreDrawflow_Storage(mustResultString = false): string | false | any {
        const DrawflowData: string | null = localStorage.getItem(
            this.scenario_drawflow_localstorage_name,
        );

        if (DrawflowData && DrawflowData.trim() != '') {
            return mustResultString ? DrawflowData : JSON.parse(DrawflowData);
        } else return false;
    }

    removeDrawflow_Data() {
        localStorage.removeItem(this.scenario_drawflow_localstorage_name);
        this.clearDrawflowData();
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
            project_id: scenarioData.project?.id,
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
            }),
        );
    }

    onUpdateScenario(): Observable<ScenarioResModel> | undefined {
        const scenarioData: ScenarioBaseInfoModel | null =
            this.restoreBaseInfo_Storage();

        if (!scenarioData || !scenarioData.scenario) {
            this.alertService.warning('There is no data to save!');
            return;
        }

        if (!scenarioData.scenario?.id) {
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
            scenarioData.scenario.id,
        ).pipe(
            map((res: ResModel<ScenarioResModel>) => {
                if (res.success) {
                    return res.data.items[0];
                }
                throw new Error('Unknown API error');
            }),
        );
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
        const currentDrawflowData = this._drawflowData$.getValue();

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
}
