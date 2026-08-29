import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { finalize, map, tap } from 'rxjs';
import {
    loadingModel,
    PdfGeneratorComponent,
} from '../../../shared/components/pdf-generator/pdf-generator.component';
import { ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { GeneralService } from '../../../shared/services/general.service';
import { ScenarioBaseInfoModel } from '../models/scenario.model';
import {
    ScenarioStateModel,
    ScenarioStateService,
} from '../services/scenario-state.service';
import { ScenarioService } from '../services/scenario.service';
import {
    ResultGroup,
    SimulationResultModel,
    StaticResultModel,
} from './models/simulation.model';
import { SimulationService } from './services/simulation.service';

declare const Plotly: any;

@Component({
    selector: 'app-simulation',
    imports: [
        CommonModule,
        NgbDropdown,
        NgbDropdownToggle,
        NgbDropdownMenu,
        NgbDropdownItem,
        PdfGeneratorComponent,
    ],
    templateUrl: './simulation.component.html',
    styleUrl: './simulation.component.scss',
})
export class SimulationComponent implements OnInit {
    staticList!: ResultGroup[];
    loading: { page: boolean; downloading: boolean } = {
        page: false,
        downloading: false,
    };
    saveOptions: string[] = ['Print', 'PDF'];

    router = inject(Router);
    route = inject(ActivatedRoute);
    alertService = inject(AlertService);
    httpService = inject(HttpClient);
    simulationService = inject(SimulationService);
    generalService = inject(GeneralService);
    scenarioService = inject(ScenarioService);
    scenarioStateService = inject(ScenarioStateService);

    ngOnInit() {
        this.loadCurrentScenarioData();

        const simulationId = +this.route.snapshot.params['id'];

        if (simulationId) {
            this.loading.page = true;

            this.simulationService
                .getResult(simulationId)
                .pipe(
                    map((res: ResModel<SimulationResultModel>) => {
                        if (res.success) {
                            return res.data.items[0];

                            // const result = res.data.items[0];
                            // return {
                            //     ...result,
                            //     static: Array.from({ length: 2 }, () =>
                            //         structuredClone(result.static),
                            //     ).flat(),
                            // };
                        }

                        throw new Error('Unknown API error');
                    }),
                    finalize(() => (this.loading.page = false)),
                )
                .subscribe({
                    next: (data: SimulationResultModel) => {
                        const statics: StaticResultModel[] = data.static;

                        this.staticList = Object.values(
                            statics.reduce<Record<string, ResultGroup>>(
                                (acc, item) => {
                                    if (
                                        item.type.toLowerCase() == 'costs' ||
                                        item.type.toLowerCase() == 'emissions'
                                    ) {
                                        if (!acc['costs_emissions']) {
                                            acc['costs_emissions'] = {
                                                type: 'costs_emissions',
                                                items: [],
                                            };
                                        }
                                    } else if (!acc[item.type.toLowerCase()]) {
                                        acc[item.type.toLowerCase()] = {
                                            type: item.type.toLowerCase(),
                                            items: [],
                                        };
                                    }

                                    if (
                                        item.type.toLowerCase() == 'costs' ||
                                        item.type.toLowerCase() == 'emissions'
                                    )
                                        acc['costs_emissions'].items.push(item);
                                    else
                                        acc[item.type.toLowerCase()].items.push(
                                            item,
                                        );

                                    return acc;
                                },
                                {},
                            ),
                        );

                        this.loadGraphs(data.graphs);
                    },
                    error: (err) => {
                        console.error('Failed to load JSON', err);
                        this.alertService.error(
                            err.error.detail ||
                                'Failed to load simulation results! Check Logs for more details.',
                        );
                    },
                });
        }
    }

    private loadCurrentScenarioData() {
        const currentScenarioData: ScenarioStateModel | null =
            this.scenarioStateService.getScenarioData();

        if (!currentScenarioData) {
            const currentScenarioData_storage: ScenarioBaseInfoModel | null =
                this.scenarioService.restoreBaseInfo_Storage();

            if (currentScenarioData_storage) {
                let scenarioStateData: ScenarioBaseInfoModel | null = null;

                if (currentScenarioData_storage.project) {
                    scenarioStateData = {
                        project: {
                            id: currentScenarioData_storage.project.id,
                            name: currentScenarioData_storage.project?.name,
                        },
                    };

                    if (currentScenarioData_storage.scenario) {
                        scenarioStateData.scenario = {
                            id: currentScenarioData_storage.scenario.id,
                            name: currentScenarioData_storage.scenario.name,
                            sDate: currentScenarioData_storage.scenario.sDate,
                            timeStep:
                                currentScenarioData_storage.scenario.timeStep,
                            interval:
                                currentScenarioData_storage.scenario.interval,
                            simulationYear:
                                currentScenarioData_storage.scenario
                                    .simulationYear,
                            modeling_data:
                                currentScenarioData_storage.scenario
                                    .modeling_data,
                            constraints:
                                currentScenarioData_storage.scenario
                                    .constraints,
                        };
                    }
                }

                if (scenarioStateData)
                    this.scenarioStateService.setScenarioData(
                        scenarioStateData,
                    );
            }
        }
    }

    loadGraphs(value: any) {
        value.forEach((bus: any) => {
            const x: any = bus.index;
            const y: any = {};

            if (bus.data.length === 0) return;

            bus.data.forEach((lineplot: any) => {
                y[lineplot.name] = lineplot.data;
            });

            const fig: any = {
                data: Object.keys(y).map((key) => ({
                    x: x,
                    y: y[key],
                    type: 'scatter',
                    mode: 'lines',
                    name: key,
                })),
                layout: {
                    title: 'Hallo Welt',
                    autosize: true,
                },
            };

            const plotly_main_div: any = document.getElementById('plotly_div');
            const plot_heading: any = document.createElement('h3');
            const plot_div: any = document.createElement('div');

            plot_heading.innerHTML = bus.name;
            plot_heading.className = 'plot_heading';
            plot_div.id = bus.name;
            plot_div.name = bus.name;

            const chartBlock = document.createElement('div');
            chartBlock.className = 'chart-block';

            chartBlock.appendChild(plot_heading);
            chartBlock.appendChild(plot_div);
            plotly_main_div.appendChild(chartBlock);

            const layout = {
                title: bus.name,
                autosize: true,

                xaxis: {
                    type: 'date',
                    title: 'Time',
                },

                yaxis: {
                    title: 'Value',
                },

                hovermode: 'x unified',

                legend: {
                    orientation: 'h',

                    x: 0.5,
                    xanchor: 'center',

                    y: 1.1,
                    yanchor: 'top',
                },

                paper_bgcolor: '#f8f9fa',

                // Background only inside x/y plotting area
                plot_bgcolor: '#ffffff',
            };

            const config = {
                responsive: true,
                displaylogo: false,
            };

            Plotly.newPlot(bus.name, fig.data, layout, config);
        });
    }

    downloadDump() {
        this.loading.downloading = true;

        this.simulationService
            .downloadScenarioDump(this.route.snapshot.params['id'])
            .pipe(
                tap(() => {
                    this.loading.downloading = false;
                }),
            )
            .subscribe((blob) => {
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download =
                    'simulation_' + this.route.snapshot.params['id'] + '.zip';
                anchor.click();
                URL.revokeObjectURL(url);
            });
    }

    onPrint() {
        this.generalService.print();
    }

    setLoading(e: loadingModel) {
        this.loading[e.key] = e.status;
    }

    ngOnDestroy() {
        this.scenarioService.removeBaseInfo_Storage();
        this.scenarioStateService.clearScenarioData();

        this.scenarioService.removeUserModelingState();
        this.scenarioStateService.clearUserModelingState();

        this.scenarioService.removeDrawflow_Data();
    }
}
