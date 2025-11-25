import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {ToastService} from '../../../../shared/services/toast.service';
import {ScenarioBaseInfoModel, ScenarioModel,} from '../../../scenario/models/scenario.model';
import {TemplateModel} from '../../models/template.model';
import {TemplateService} from '../../services/template.service';
import {ScenarioService} from '../../../scenario/services/scenario.service';

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

    toastService = inject(ToastService);
    templateService = inject(TemplateService);
    scenarioService = inject(ScenarioService);
    router = inject(Router)

    openScenarioTemplate(scenario_id: number) {
        this.templateService.getTemplateScenario(scenario_id).subscribe({
            next: (res) => {
                if (res.success && res.data && res.data.length != 0) {
                    const data = res.data.items[0];

                    this.scenarioService.saveDrawflow_Storage(
                        data.modeling_data,
                        false
                    )

                    // save project,scenario - storage
                    const scenarioData: ScenarioBaseInfoModel = {
                        project: {
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
                    this.toastService.info('Scenario data restored.');
                    this.router.navigate(['/scenario']).then(r => console.log(r));
                } else {
                    this.toastService.error('An error occured while loading scenario data.');
                }
            },
            error: (err) => {
                this.toastService.error(err);
            }
        });
    }
}
