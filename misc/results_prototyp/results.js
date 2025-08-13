// TODO: Write the correct js-response for the api

response.data.items.forEach(bus => {
    const plotname = bus.name;
    const x = bus.index;
    const y = {};

    bus.data.forEach(lineplot => {
        y[lineplot.name] = lineplot.data;
    });

    const fig = {
        data: Object.keys(y).map(key => ({
            x: x,
            y: y[key],
            type: 'scatter',
            mode: 'lines',
            name: key,
        })),
        layout: {
            title: 'Hallo Welt'
        }
    };


    let plotly_main_div = document.getElementById("plotly_div")
    let plot_heading = document.createElement('h3');
    let plot_div = document.createElement('div');

    plot_heading.innerHTML = bus.name;
    plot_heading.className = 'plot_heading';

    plot_div.id = bus.name;
    plot_div.name = bus.name;

    plotly_main_div.appendChild(plot_heading);
    plotly_main_div.appendChild(plot_div);

    Plotly.newPlot(bus.name, fig.data, fig.layout);
});