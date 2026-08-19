import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { tap } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { EnergyResultModel, ResultGroup } from './models/simulation.model';
import { SimulationService } from './services/simulation.service';

declare const Plotly: any;

@Component({
    selector: 'app-simulation',
    imports: [CommonModule],
    templateUrl: './simulation.component.html',
    styleUrl: './simulation.component.scss',
})
export class SimulationComponent implements OnInit {
    staticList!: ResultGroup[];
    loading: { page: boolean; downloading: boolean } = {
        page: false,
        downloading: false,
    };

    router = inject(Router);
    route = inject(ActivatedRoute);
    alertService = inject(AlertService);
    httpService = inject(HttpClient);
    simulationService = inject(SimulationService);

    ngOnInit() {
        const simulationId = +this.route.snapshot.params['id'];

        if (simulationId) {
            this.loading.page = true;

            this.simulationService
                .getResult(simulationId)
                .pipe(tap(() => (this.loading.page = false)))
                .subscribe({
                    next: (value: any) => {
                        const statics: EnergyResultModel[] =
                            value.data.items[0].static;

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

                        this.loadGraphs(value.data.items[0].graphs);
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
            plotly_main_div.appendChild(plot_heading);
            plotly_main_div.appendChild(plot_div);

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

                margin: {
                    t: 50,
                    l: 60,
                    r: 20,
                    b: 50,
                },

                hovermode: 'x unified',
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
}
