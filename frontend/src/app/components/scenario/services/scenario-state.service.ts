import { Injectable } from '@angular/core';
import { DrawflowNode } from 'drawflow';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModelingStateModel } from '../models/scenario.model';
import { ConstraintRow } from '../scenario-setup/constraints/models/constraints.model';

export interface ScenarioStateModel {
    project: { id: number; name: string } | null;
    scenario?: {
        id?: number;
        name: string;
        sDate: number;
        timeStep: number;
        interval: number;
        simulationYear: number;
        modeling_data: { [nodeKey: string]: DrawflowNode } | null; // when string: data saved without drawflow data (e: scneario setup)
        constraints: ConstraintRow[];
    } | null;
}

@Injectable({
    providedIn: 'root',
})
export class ScenarioStateService {
    private scenarioState$: BehaviorSubject<ScenarioStateModel | null> =
        new BehaviorSubject<ScenarioStateModel | null>(null);
    get scenarioState(): Observable<ScenarioStateModel | null> {
        return this.scenarioState$.asObservable();
    }

    private userModelingState$: BehaviorSubject<UserModelingStateModel | null> =
        new BehaviorSubject<UserModelingStateModel | null>(null);
    get userModelingState(): Observable<UserModelingStateModel | null> {
        return this.userModelingState$.asObservable();
    }

    private drawflowMovementState$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    get drawflowMovementState(): Observable<boolean> {
        return this.drawflowMovementState$.asObservable();
    }

    setScenarioData(data: ScenarioStateModel) {
        console.log('Set scenario data:', data);
        this.scenarioState$.next(data);
    }

    getScenarioData(): ScenarioStateModel | null {
        return this.scenarioState$.value;
    }

    clearScenarioData() {
        this.scenarioState$.next(null);
    }

    setDrawflowData(data: { [nodeKey: string]: DrawflowNode } | null) {
        console.log('Setting drawflow data:', data);

        if (this.scenarioState$.value)
            this.scenarioState$.next({
                ...this.scenarioState$.value,
                scenario: this.scenarioState$.value.scenario
                    ? {
                          ...this.scenarioState$.value.scenario,
                          modeling_data: data,
                      }
                    : null,
            });
    }

    getDrawflowData(): { [nodeKey: string]: DrawflowNode } | null {
        const scenarioData = this.scenarioState$.value?.scenario;
        if (scenarioData) return scenarioData.modeling_data;
        else return null;
    }

    clearDrawflowData() {
        if (this.scenarioState$.value)
            this.scenarioState$.next({
                ...this.scenarioState$.value,
                scenario: this.scenarioState$.value.scenario
                    ? {
                          ...this.scenarioState$.value.scenario,
                          modeling_data: null,
                      }
                    : null,
            });
    }

    //====================  user_modeling_state  ====================
    setUserModelingState(data: Partial<UserModelingStateModel>) {
        let currentState: UserModelingStateModel =
            this.userModelingState$.value || ({} as UserModelingStateModel);

        const newState = { ...currentState, ...data };
        this.userModelingState$.next(newState);
        console.log('set state: ', newState);
    }

    getUserModelingState(): UserModelingStateModel | null {
        return this.userModelingState$.value;
    }

    clearUserModelingState() {
        this.userModelingState$.next(null);
    }

    setDrawflowMovementState(isMoving: boolean) {
        this.drawflowMovementState$.next(isMoving);
    }
    getDrawflowMovementState(): boolean {
        return this.drawflowMovementState$.value;
    }
}
