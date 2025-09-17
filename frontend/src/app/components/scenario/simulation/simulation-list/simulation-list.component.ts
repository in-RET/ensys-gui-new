import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ResDataModel } from '../../../../shared/models/http.model';
import { ScenarioBaseInfoModel } from '../../models/scenario.model';
import {
    SimulationResModel,
    SimulationStatus,
} from '../models/simulation.model';
import { SimulationService } from '../services/simulation.service';
import { SimulationListCardComponent } from './simulation-list-card/simulation-list-card.component';

@Component({
    selector: 'app-simulation-list',
    imports: [CommonModule, RouterModule, SimulationListCardComponent],
    templateUrl: './simulation-list.component.html',
    styleUrl: './simulation-list.component.scss',
})
export class SimulationListComponent {
    simulationList!: SimulationResModel[];
    scenarioCount!: number;
    currentScenario!: ScenarioBaseInfoModel;

    @Input() scenarioId!: number;

    route = inject(ActivatedRoute);
    simulationService = inject(SimulationService);
    router = inject(Router);

    SimulationStatus = SimulationStatus;

    ngOnInit() {
        if (!this.scenarioId)
            this.scenarioId = +this.route.snapshot.params['id'];

        this.loadSimulations(this.scenarioId);
        this.checkScenarioBaseDataAvailablity();
    }

    loadSimulations(scenarioId: number) {
        this.simulationService.loadSimulations(scenarioId).subscribe({
            next: (value: ResDataModel<SimulationResModel>) => {
                this.scenarioCount = value.totalCount;
                this.simulationList = value.items;
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    checkScenarioBaseDataAvailablity() {
        this.route.data
            .pipe(
                map((res: any) => {
                    if (res) {
                        const { currentProject, currentScenario } = res;

                        this.currentScenario = {
                            project: currentProject,
                            scenario: currentScenario,
                        };

                        return res;
                    }
                })
            )
            .subscribe();
    }

    onStopSimulation(scenarioId: number) {
        this.simulationService.onStopSimulation(scenarioId).subscribe({
            next: (value: ResDataModel<SimulationResModel>) => {
                debugger;
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
