import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    EditFormModalInfo,
    FormModalInfo,
} from '../models/scenario-energy-design.model';
import { ModeOption } from '../time-series/time-series.component';

export interface ModalState {
    nodeForm: FormModalInfo | null;
    flowForm: EditFormModalInfo | null;
    calculator: any | null;
    timeSeries: {
        groupName: string;
        controlName: string;
        modes: ModeOption[] | null;
    } | null;
    simulation: any | null;
}

@Injectable({
    providedIn: 'root',
})
export class ModalStateService {
    private modalState$ = new BehaviorSubject<ModalState>({
        nodeForm: null,
        flowForm: null,
        calculator: null,
        timeSeries: null,
        simulation: null,
    });

    get modalState(): Observable<ModalState> {
        return this.modalState$.asObservable();
    }

    openNodeForm(info: FormModalInfo) {
        this.modalState$.next({
            ...this.modalState$.value,
            nodeForm: info,
        });
    }

    closeNodeForm() {
        this.modalState$.next({
            ...this.modalState$.value,
            nodeForm: null,
        });
    }

    toggleNodeForm() {
        if (this.modalState$.value.nodeForm)
            this.modalState$.value.nodeForm.show =
                !this.modalState$.value.nodeForm.show;

        this.modalState$.next({
            ...this.modalState$.value,
        });
    }

    openFlowForm(info: EditFormModalInfo) {
        this.modalState$.next({
            ...this.modalState$.value,
            flowForm: info,
        });
    }

    closeFlowForm() {
        this.modalState$.next({
            ...this.modalState$.value,
            flowForm: null,
        });
    }

    toggleFlowForm() {
        if (this.modalState$.value.flowForm)
            this.modalState$.value.flowForm.show =
                !this.modalState$.value.flowForm.show;

        this.modalState$.next({
            ...this.modalState$.value,
        });
    }

    openCalculator(info: any) {
        this.modalState$.next({
            ...this.modalState$.value,
            calculator: info,
        });
    }

    closeCalculator() {
        this.modalState$.next({
            ...this.modalState$.value,
            calculator: null,
        });
    }

    openTimeSeries(info: {
        groupName: string;
        controlName: string;
        modes: ModeOption[] | null;
    }) {
        this.modalState$.next({
            ...this.modalState$.value,
            timeSeries: info,
        });
    }

    closeTimeSeries() {
        this.modalState$.next({
            ...this.modalState$.value,
            timeSeries: null,
        });
    }

    openSimulation(d: { scenarioId: number }) {
        this.modalState$.next({
            ...this.modalState$.value,
            simulation: d,
        });
    }

    closeSimulation() {
        this.modalState$.next({
            ...this.modalState$.value,
            simulation: null,
        });
    }
}
