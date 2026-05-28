import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
    selector: 'app-simulation',
    imports: [CommonModule],
    templateUrl: './simulation.component.html',
    styleUrl: './simulation.component.scss',
})
export class SimulationComponent implements OnInit {
    loading = false;
    private charts: Chart[] = [];

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

    loadGraphs(value: any) {
        const mainDiv = document.getElementById('plotly_div');

        if (!mainDiv) return;

        this.charts.forEach((chart) => chart.destroy());
        this.charts = [];
        mainDiv.innerHTML = '';

        Chart.register(zoomPlugin);

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

            const allYValues = bus.data.flatMap(
                (lineplot: any) => lineplot.data,
            );

            const minY = Math.min(...allYValues);
            const maxY = Math.max(...allYValues);

            const chart = new Chart(canvas, {
                type: 'line',

                data: {
                    datasets: bus.data.map((lineplot: any) => ({
                        // label: lineplot.name,
                        label: 'Large Dataset',
                        // data: lineplot.data,
                        data: bus.index.map((date: string, i: number) => ({
                            x: date.replace(' ', 'T'),
                            y: lineplot.data[i],
                        })),
                        borderWidth: 1,
                        // fill: false,
                        // tension: 0,
                        // pointRadius: 0,
                        // pointHoverRadius: 0,
                        // hitRadius: 0,
                        radius: 0,
                    })),
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    normalized: true,
                    animation: false,

                    interaction: {
                        mode: 'index',
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

                    hover: {
                        mode: undefined,
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
                            animation: false,

                            backgroundColor: '#111827',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: true,

                            callbacks: {
                                title: (items) => {
                                    const rawX = items[0].raw as any;
                                    const date = new Date(rawX.x);

                                    return date.toLocaleString('en-GB', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                },
                                label: (context) => {
                                    const value = context.parsed.y;
                                    return `${context.dataset.label}: ${value?.toFixed(8)}`;
                                },
                            },
                        },

                        decimation: {
                            enabled: false,
                        },

                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'x',
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                    speed: 0.05,
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
                            type: 'time',
                            time: {
                                tooltipFormat: 'yyyy-MM-dd HH:mm',
                                displayFormats: {
                                    hour: 'HH:mm',
                                    day: 'MMM d',
                                    month: 'MMM',
                                    quarter: 'QQQ',
                                    year: 'yyyy',
                                },
                            },
                            ticks: {
                                autoSkip: true,
                                maxRotation: 0,
                                maxTicksLimit: 12,
                            },
                        },

                        y: {
                            min: minY,
                            max: maxY,

                            grace: 0,

                            bounds: 'ticks',

                            ticks: {
                                callback: (value) => Number(value).toFixed(8),
                            },
                        },
                    },
                },
            });

            this.charts.push(chart);
        });
    }
}
