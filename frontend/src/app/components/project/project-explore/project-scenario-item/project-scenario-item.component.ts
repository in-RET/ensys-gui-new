import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import {
    ScenarioModel,
    ScenarioService,
} from '../../../scenario/services/scenario.service';

@Component({
    selector: 'app-project-scenario-item',
    imports: [CommonModule],
    templateUrl: './project-scenario-item.component.html',
    styleUrl: './project-scenario-item.component.scss',
})
export class ProjectScenarioItemComponent {
    @Input() data: any;

    toastService = inject(ToastService);

    constructor(
        private scenarioService: ScenarioService,
        private router: Router
    ) {}

    openScenario(data: any) {
        console.log(data);

        // save project,scenario - storage
        const scenarioData: ScenarioModel = {
            project: {
                id: data.project_id,
                name: data.project_name ?? '_',
            },
            scenario: {
                name: data.name ?? '_',
                sDate: data.start_date,
                timeStep: 60,
                simulationPeriod: 8760,
                simulationYear: data.simulation_year ?? 2025,
            },
        };

        this.scenarioService.saveBaseInfo_Storage(scenarioData);
        this.scenarioService.saveDrawflow_Storage(data.modeling_data, false);

        this.router.navigate(['/scenario']);
        this.toastService.info('Scenario data restored.');
    }
}
