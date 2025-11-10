import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {AlertService} from '../../../../shared/services/alert.service';
import {ToastService} from '../../../../shared/services/toast.service';
import {ScenarioBaseInfoModel, ScenarioModel,} from '../../../scenario/models/scenario.model';
import {ScenarioService} from '../../../scenario/services/scenario.service';
import {TemplateModel} from '../../models/template.model';

@Component({
    selector: 'app-template-scenario-item',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './template-scenario-item.component.html',
    styleUrl: './template-scenario-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateScenarioItemComponent {
    @Input() template!: TemplateModel;
    @Input() scenario!: ScenarioModel;

    @Output() deleteScenario: EventEmitter<any> = new EventEmitter<any>();
    @Output() duplicateScenario: EventEmitter<any> = new EventEmitter<any>();

    toastService = inject(ToastService);
    alertService = inject(AlertService);
    scenarioService = inject(ScenarioService)
    router = inject(Router)

    openScenario(data: ScenarioModel) {
        if (data.modeling_data)
            this.scenarioService.saveDrawflow_Storage(
                data.modeling_data,
                false
            );

        // save template,scenario - storage
        const scenarioData: ScenarioBaseInfoModel = {
            template: {
                id: this.template.id,
                name: this.template.name ?? '_',
                scenarioList: this.template.scenarioList ?? [],
            },
            scenario: {
                id: data.id,
                name: data.name,
                sDate: data.sDate,
                timeStep: 8760,
                interval: data.interval,
                simulationYear: 2025,
            },
        };

        this.scenarioService.saveBaseInfo_Storage(scenarioData);
        this.router.navigate(['/scenario']);
        this.toastService.info('Scenario data restored.');
    }

    async onDeleteScenario(scenarioId: number) {
        const confirmed = await this.alertService.confirm(
            `Are you sure delete scenario ${this.scenario.name}?`,
            'Delete'
        );

        if (confirmed) {
            this.scenarioService.deleteScenario(scenarioId).subscribe({
                next: (value) => {
                    if (value.success) {
                        this.toastService.success(
                            `Scenario ${this.scenario.name} deleted.`
                        );
                        this.deleteScenario.emit(scenarioId);
                    } else this.toastService.error('An error occured.');
                },
                error: (err) => {
                    this.toastService.error(err);
                },
            });
        }
    }

    async onDuplicateScenario(scenarioId: number) {
        const confirmed = await this.alertService.confirm(
            `Are you sure duplicate scenario ${this.scenario.name}?`,
            'Duplicate'
        );

        if (confirmed) {
            this.scenarioService.duplicateScenario(scenarioId).subscribe({
                next: (value) => {
                    if (value.success) {
                        this.toastService.success(
                            `Scenario ${this.scenario.name} duplicated.`
                        );
                        this.duplicateScenario.emit(this.scenario.template_id);
                    } else this.toastService.error('An error occured.');
                },
                error: (err) => {
                    this.toastService.error(err);
                },
            });
        }
    }
}
