import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
// import Plotly from 'plotly.js';
declare const Plotly: any;

@Component({
    selector: 'app-simulation',
    imports: [CommonModule],
    templateUrl: './simulation.component.html',
    styleUrl: './simulation.component.scss',
})
export class SimulationComponent {
    loading: boolean = false;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loading = true;

        this.http.get('./static/assets/json_data/response.json').subscribe({
            next: (res: any) => {
                res.forEach((bus: any) => {
                    const plotname: any = bus.name;
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

                    let plotly_main_div: any =
                        document.getElementById('plotly_div');
                    let plot_heading: any = document.createElement('h3');
                    let plot_div: any = document.createElement('div');
                    plot_heading.innerHTML = bus.name;
                    plot_heading.className = 'plot_heading';
                    plot_div.id = bus.name;
                    plot_div.name = bus.name;
                    plotly_main_div.appendChild(plot_heading);
                    plotly_main_div.appendChild(plot_div);

                    this.loading = false;
                    Plotly.newPlot(bus.name, fig.data, fig.layout);
                });
            },
            error: (err) => {
                console.error('Failed to load JSON', err);
            },
        });
    }
}
