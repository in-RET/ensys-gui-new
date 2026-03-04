import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, inject, Input} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {ResDataModel} from '../../../../../shared/models/http.model';
import {ScenarioBaseInfoModel} from '../../../models/scenario.model';
import {SimulationResModel, SimulationStatus,} from '../../models/simulation.model';
import {SimulationService} from '../../services/simulation.service';
import {AlertService} from '../../../../../shared/services/alert.service';
import {environment} from '../../../../../../environments/environment';

@Component({
    selector: 'app-simulation-list-card',
    imports: [CommonModule, RouterModule],
    templateUrl: './simulation-list-card.component.html',
    styleUrl: './simulation-list-card.component.scss',
})
export class SimulationListCardComponent {
    currentScenario!: ScenarioBaseInfoModel;
    SimulationStatus = SimulationStatus;

    @Input() data!: SimulationResModel[];
    @Input() loading!: boolean;

    router = inject(Router);
    simulationService = inject(SimulationService);
    alertService = inject(AlertService);
    cdr = inject(ChangeDetectorRef);

    identify(index: any, item: any) {
        return item.name;
    }

    openSimulation(simId: number) {
        if (environment.dev_on_server_build) {
            const url = this.router.serializeUrl(
                this.router.createUrlTree(['/dev/simulation', simId])
            );
            console.log("URL:", url);
            window.open(url, '_blank');
        } else {
            const url = this.router.serializeUrl(
                this.router.createUrlTree(['/simulation', simId])
            );

            console.log("URL:", url);
            window.open(url, '_blank');
        }
    }

    stopSimulation(scenarioId: number) {
        this.simulationService.onStopSimulation(scenarioId).subscribe({
            next: (value: ResDataModel<SimulationResModel>) => {
                this.data[
                    this.data.findIndex((sim) => sim.id === scenarioId)
                ].status = SimulationStatus.STOPPED;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
