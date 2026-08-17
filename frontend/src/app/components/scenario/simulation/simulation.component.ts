import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../shared/services/alert.service';

declare const Plotly: any;

@Component({
    selector: 'app-simulation',
    imports: [CommonModule],
    templateUrl: './simulation.component.html',
    styleUrl: './simulation.component.scss',
})
export class SimulationComponent implements OnInit {
    loading = false;

    router = inject(Router);
    route = inject(ActivatedRoute);
    alertService = inject(AlertService);
    httpService = inject(HttpClient);

    ngOnInit() {
        const simulationId = +this.route.snapshot.params['id'];

        if (simulationId) {
            this.loading = true;

            this.httpService
                .get(environment.apiUrl + 'results/' + simulationId)
                .pipe(tap(() => (this.loading = false)))
                .subscribe({
                    next: (value: any) => {
                        this.loadStatic(value.data.items[0].static);
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

    loadStatic(value: any) {
        value.forEach((static_data: any) => {
            let static_data_table: HTMLElement | null = null;

            if (static_data.type == 'Power') {
                static_data_table = document.getElementById('power_table');

                const power_table = document.getElementById('power_div');
                if (power_table != null) {
                    power_table.hidden = false;
                }

                const power_heading = document.getElementById('power_heading');
                if (power_heading != null) {
                    power_heading.hidden = false;
                }
            } else if (static_data.type == 'Energy') {
                static_data_table = document.getElementById('energy_table');

                const energy_table = document.getElementById('energy_div');
                if (energy_table != null) {
                    energy_table.hidden = false;
                }

                const energy_heading =
                    document.getElementById('energy_heading');
                if (energy_heading != null) {
                    energy_heading.hidden = false;
                }
            } else if (
                static_data.type == 'Costs' ||
                static_data.type == 'Emissions'
            ) {
                static_data_table = document.getElementById('cost_table');

                if (static_data.value > 0) {
                    const cost_table = document.getElementById('cost_div');
                    if (cost_table != null) {
                        cost_table.hidden = false;
                    }

                    const cost_heading =
                        document.getElementById('cost_heading');
                    if (cost_heading != null) {
                        cost_heading.hidden = false;
                    }
                }
            } else {
                console.log('Unknown static data type: ' + static_data.type);
            }

            const data_row: HTMLTableRowElement = document.createElement('tr');

            const data_cell_name: HTMLTableCellElement =
                document.createElement('td');
            const data_cell_value: HTMLTableCellElement =
                document.createElement('td');
            const data_cell_unit: HTMLTableCellElement =
                document.createElement('td');

            data_cell_name.innerHTML = static_data.name;
            data_cell_value.innerHTML = static_data.value;
            data_cell_unit.innerHTML = static_data.unit;

            data_row.appendChild(data_cell_name);
            data_row.appendChild(data_cell_value);
            data_row.appendChild(data_cell_unit);

            if (static_data_table != null) {
                static_data_table.appendChild(data_row);
            }
        });
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

    protected downloadDump() {
        return this.httpService
            .get(
                environment.apiUrl +
                    'results/' +
                    this.route.snapshot.params['id'] +
                    '/dump',
                { responseType: 'blob' },
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
