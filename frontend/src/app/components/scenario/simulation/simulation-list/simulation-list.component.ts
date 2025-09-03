import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { SimulationService } from '../services/simulation.service';

export interface SimulationStatus {
    status: string;
    end_date: string | null;
    id: number;
    sim_token: string;
    start_date: string;
    scenario_id: number;
}

@Component({
    selector: 'app-simulation-list',
    imports: [CommonModule],
    templateUrl: './simulation-list.component.html',
    styleUrl: './simulation-list.component.scss',
})
export class SimulationListComponent {
    scenarioId!: number;
    scenarioList!: SimulationStatus[];
    scenarioCount!: number;

    route = inject(ActivatedRoute);
    simulationService = inject(SimulationService);
    router = inject(Router);

    ngOnInit() {
        if (this.route.snapshot.params) {
            this.scenarioId = this.route.snapshot.params['id'];
            this.loadScenarios(this.scenarioId);
        }
    }

    loadScenarios(scenarioId: number) {
        this.scenarioList = [];
        this.scenarioCount = 0;

        this.simulationService
            .getSimulations(scenarioId)
            .pipe(
                map((res: any) => {
                    if (res.success) return res.data;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.scenarioCount = value.totalCount;
                    this.scenarioList = value.items;

                    this.loadMockData();
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

    loadMockData() {
        const arr = [];
        this.scenarioList.forEach((element: SimulationStatus) => {
            let elm = { ...element };
            elm.status = 'Stopped';
            this.scenarioList.push(elm);
        });
    }
}
