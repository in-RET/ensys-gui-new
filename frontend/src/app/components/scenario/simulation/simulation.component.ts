import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../shared/services/alert.service';
import {environment} from '../../../../environments/environment';
// import Plotly from 'plotly.js';
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

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loading = true;

        const simulationId = +this.route.snapshot.params['id'];

        if (simulationId) this.loadSimulation(simulationId);
    }

    loadSimulation(simulationId: number) {
        this.http
            .get(environment.apiUrl + 'results/' + simulationId)
            .subscribe({
                next: (value: any) => {
                    this.loadGrapghs(value.data.items);
                },
                error: (err) => {
                    console.error('Failed to load JSON', err);

                    this.alertService.error(err.detail);
                },
            });
    }

    loadGrapghs(value: any) {
        value.forEach((bus: any) => {
            // const plotname: any = bus.name;
            const x: any = bus.index;
            const y: any = {};
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

            this.loading = false;
            Plotly.newPlot(bus.name, fig.data, fig.layout);
        });
    }
}
