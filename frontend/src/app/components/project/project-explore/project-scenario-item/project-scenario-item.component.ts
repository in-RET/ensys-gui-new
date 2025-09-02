import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import {
    ScenarioModel,
    ScenarioService,
} from '../../../scenario/services/scenario.service';

@Component({
    selector: 'app-project-scenario-item',
    imports: [CommonModule, RouterModule],
    templateUrl: './project-scenario-item.component.html',
    styleUrl: './project-scenario-item.component.scss',
})
export class ProjectScenarioItemComponent {
    @Input() data: any;

    @Output() deleteScenario: EventEmitter<any> = new EventEmitter<any>();

    toastService = inject(ToastService);

    constructor(
        private scenarioService: ScenarioService,
        private router: Router
    ) {}

    openScenario(data: any) {
        // save project,scenario - storage
        const scenarioData: ScenarioModel = {
            project: {
                id: data.project_id,
                name: data.project_name ?? '_',
            },
            scenario: {
                id: data.id,
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

    onDeleteScenario(scenarioId: number) {
        this.scenarioService.deleteScenario(scenarioId).subscribe({
            next: (value) => {
                if (value.success) {
                    this.toastService.success('Scenario deleted.');
                    this.deleteScenario.emit(scenarioId);
                } else this.toastService.error('An error occured.');
            },
            error: (err) => {
                this.toastService.error(err);
            },
        });
    }
}
