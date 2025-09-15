import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ScenarioBaseInfoModel } from '../../../models/scenario.model';
import {
    SimulationResModel,
    SimulationStatus,
} from '../../models/simulation.model';

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

    router = inject(Router);

    openSimulation(simId: number) {
        const url = this.router.serializeUrl(
            this.router.createUrlTree(['/simulation', simId])
        );
        window.open(url, '_blank');
    }
}
