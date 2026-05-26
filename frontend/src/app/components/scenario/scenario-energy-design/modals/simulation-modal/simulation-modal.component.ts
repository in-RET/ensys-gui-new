import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
    catchError,
    interval,
    of,
    startWith,
    Subscription,
    switchMap,
} from 'rxjs';
import { ResDataModel } from '../../../../../shared/models/http.model';
import {
    SimulationResModel,
    SimulationStatus,
} from '../../../simulation/models/simulation.model';
import { SimulationService } from '../../../simulation/services/simulation.service';
import { SimulationListCardComponent } from '../../../simulation/simulation-list-card/simulation-list-card.component';
import { ModalComponent } from '../../modal/modal.component';

@Component({
    selector: 'app-simulation-modal',
    imports: [CommonModule, ModalComponent, SimulationListCardComponent],
    templateUrl: './simulation-modal.component.html',
    styleUrl: './simulation-modal.component.scss',
})
export class SimulationModalComponent {
    loadSimulationsLoading: boolean = false;
    simulationList!: SimulationResModel[];
    private subscriptionSimulation!: Subscription;

    private _modalInfo!: { scenarioId: number } | null;
    @Input()
    set modalInfo(d: { scenarioId: number } | null) {
        this._modalInfo = d;

        if (d) {
            this.loadSimulations();
        }
    }

    get modalInfo(): { scenarioId: number } | null {
        return this._modalInfo;
    }

    @Output() modalClosed = new EventEmitter<void>();

    simulationService = inject(SimulationService);

    loadSimulations() {
        this.loadSimulationsLoading = true;

        this.subscriptionSimulation = interval(1000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.simulationService
                        .loadSimulations(this.modalInfo!.scenarioId)
                        .pipe(
                            catchError((err) => {
                                console.error(err);
                                return of({
                                    items: [],
                                    totalCount: 0,
                                } as ResDataModel<SimulationResModel>);
                            }),
                        ),
                ),
            )
            .subscribe((value: ResDataModel<SimulationResModel>) => {
                this.simulationList = value.items;
                this.loadSimulationsLoading = false;

                // check if all simulations are in final state, if so, stop subscribe
                if (
                    !this.simulationList.some(
                        (sim) => sim.status === SimulationStatus.STARTED,
                    )
                ) {
                    this.subscriptionSimulation.unsubscribe();
                }
            });
    }

    closeSimulationModal() {
        if (this.subscriptionSimulation)
            this.subscriptionSimulation.unsubscribe();

        this.modalClosed.emit();
    }

    ngOnDestroy() {
        if (this.subscriptionSimulation)
            this.subscriptionSimulation.unsubscribe();
    }
}
