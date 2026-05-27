import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Chart} from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

import {tap} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {AlertService} from '../../../shared/services/alert.service';

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
            const static_data_table: HTMLElement | null =
                document.getElementById('static_table');

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

            if (static_data_table === null) {
                return;
            } else {
                static_data_table.appendChild(data_row);
            }
        });
    }

    _loadGraphs(value: any) {
        // value.forEach((bus: any) => {
        //     const x: any = bus.index;
        //     const y: any = {};
        //     if (bus.data.length === 0) return;
        //     bus.data.forEach((lineplot: any) => {
        //         y[lineplot.name] = lineplot.data;
        //     });
        //     const fig: any = {
        //         data: Object.keys(y).map((key) => ({
        //             x: x,
        //             y: y[key],
        //             type: 'scatter',
        //             mode: 'lines',
        //             name: key,
        //         })),
        //         layout: {
        //             title: 'Hallo Welt',
        //             autosize: true,
        //         },
        //     };
        //     const plotly_main_div: any = document.getElementById('plotly_div');
        //     const plot_heading: any = document.createElement('h3');
        //     const plot_div: any = document.createElement('div');
        //     plot_heading.innerHTML = bus.name;
        //     plot_heading.className = 'plot_heading';
        //     plot_div.id = bus.name;
        //     plot_div.name = bus.name;
        //     plotly_main_div.appendChild(plot_heading);
        //     plotly_main_div.appendChild(plot_div);
        //     Plotly.newPlot(bus.name, fig.data, fig.layout, {
        //         responsive: true,
        //     });
        // });
    }

    async __loadGraphs(value: any) {
        Chart.register(zoomPlugin);

        value.forEach((bus: any) => {
            const x: any = bus.index;

            if (bus.data.length === 0) return;

            const datasets = bus.data.map((lineplot: any) => ({
                label: lineplot.name,
                data: lineplot.data,
                borderWidth: 2,
                fill: false,
                tension: 0.2,
            }));

            const plotly_main_div: any = document.getElementById('plotly_div');
            const plot_heading: any = document.createElement('h3');
            const canvas: any = document.createElement('canvas');

            plot_heading.innerHTML = bus.name;
            plot_heading.className = 'plot_heading';

            canvas.id = bus.name;

            plotly_main_div.appendChild(plot_heading);
            plotly_main_div.appendChild(canvas);

            new Chart(canvas, {
                type: 'line',

                data: {
                    labels: x,
                    datasets: datasets,
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 600,
                        easing: 'easeOutQuart',
                    },
                    interaction: {
                        mode: 'nearest',
                        intersect: false,
                        axis: 'x',
                    },
                    elements: {
                        point: {
                            radius: 0,
                            hoverRadius: 0,
                            hitRadius: 0,
                        },
                        line: {
                            tension: 0,
                            borderWidth: 1,
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Time Series (Filled Area)',
                        },
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false,
                        },
                        decimation: {
                            enabled: true,
                            algorithm: 'lttb',
                            samples: 800,
                        },
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'x',
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true,
                                },
                                mode: 'x',
                            },
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: false,
                                text: 'Date',
                            },
                            display: false,
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Value',
                            },
                        },
                    },
                },
            });
        });
    }

    private charts: Chart[] = [];
    async loadGraphs(value: any) {
        const mainDiv = document.getElementById('plotly_div');

        if (!mainDiv) return;

        this.charts.forEach((chart) => chart.destroy());
        this.charts = [];
        mainDiv.innerHTML = '';

        value.forEach((bus: any, index: number) => {
            if (!bus.data?.length) return;

            const card = document.createElement('div');
            const title = document.createElement('h3');
            const chartContainer = document.createElement('div');
            const canvas = document.createElement('canvas');

            card.className = 'chart-card';
            title.className = 'chart-title';
            chartContainer.className = 'chart-container';

            title.textContent = bus.name;
            canvas.id = `chart_${index}_${bus.name}`;

            chartContainer.appendChild(canvas);
            card.appendChild(title);
            card.appendChild(chartContainer);
            mainDiv.appendChild(card);

            const chart = new Chart(canvas, {
                type: 'line',

                data: {
                    labels: bus.index,
                    datasets: bus.data.map((lineplot: any) => ({
                        label: lineplot.name,
                        data: lineplot.data,
                        borderWidth: 1,
                        fill: false,
                        tension: 0,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        hitRadius: 0,
                    })),
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    animation: {
                        duration: 500,
                        easing: 'easeOutQuart',
                    },

                    interaction: {
                        mode: 'index',
                        intersect: false,
                        axis: 'x',
                    },

                    plugins: {
                        title: {
                            display: false,
                        },

                        legend: {
                            display: bus.data.length > 1,
                        },

                        tooltip: {
                            enabled: true,
                            mode: 'index',
                            intersect: false,
                        },

                        decimation: {
                            enabled: true,
                            algorithm: 'lttb',
                            samples: 800,
                        },

                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'x',
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true,
                                },
                                mode: 'x',
                            },
                        },
                    },

                    scales: {
                        x: {
                            display: false,
                        },
                    },
                },
            });

            this.charts.push(chart);
        });
    }

    protected downloadDump() {
        return this.httpService
            .get(environment.apiUrl + 'results/' + this.route.snapshot.params['id'] + '/dump', {responseType: 'blob'})
            .subscribe(blob => {
                const url = URL.createObjectURL(blob)
                const anchor = document.createElement('a')
                anchor.href = url
                anchor.download = 'simulation_' + this.route.snapshot.params['id'] + '.zip';
                anchor.click()
                URL.revokeObjectURL(url)
            });
    }
}
