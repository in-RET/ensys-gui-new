import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ResDataModel } from '../../../../shared/models/http.model';
import { ScenarioBaseInfoModel } from '../../models/scenario.model';
import {
    SimulationResModel,
    SimulationStatus,
} from '../models/simulation.model';
import { SimulationService } from '../services/simulation.service';

@Component({
    selector: 'app-simulation-list',
    imports: [CommonModule, RouterModule],
    templateUrl: './simulation-list.component.html',
    styleUrl: './simulation-list.component.scss',
})
export class SimulationListComponent {
    scenarioId!: number;
    scenarioList!: SimulationResModel[];
    scenarioCount!: number;
    currentScenario!: ScenarioBaseInfoModel;

    route = inject(ActivatedRoute);
    simulationService = inject(SimulationService);
    router = inject(Router);

    SimulationStatus = SimulationStatus;

    ngOnInit() {
        if (this.route.snapshot.params) {
            this.scenarioId = +this.route.snapshot.params['id'];
            this.loadSimulations(this.scenarioId);
            this.checkScenarioBaseDataAvailablity();
        }
    }

    loadSimulations(scenarioId: number) {
        this.simulationService.loadSimulations(scenarioId).subscribe({
            next: (value: ResDataModel<SimulationResModel>) => {
                this.scenarioCount = value.totalCount;
                this.scenarioList = value.items;
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    openSimulation(simId: number) {
        // this.router.navigate(['/simulation/', simId,]);
        const url = this.router.serializeUrl(
            this.router.createUrlTree(['/simulation', simId])
        );
        window.open(url, '_blank');
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
