import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Output,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import * as Plotly from 'plotly.js-dist-min';
import { ScenarioBaseInfoModel } from '../../models/scenario.model';
import { ScenarioService } from '../../services/scenario.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-time-series',
    imports: [CommonModule, FormsModule, ModalComponent, NgbCollapseModule],
    templateUrl: './time-series.component.html',
    styleUrl: './time-series.component.scss',
})
export class TimeSeriesComponent {
    timeSeriesModal: any = {
        showPlot: false,
        title: 'Time Series Data',
        action: {
            label: 'Import',
            fn: undefined,
        },
        selectedType: 'file', // types: list , file, number
        data: [],
    };
    timeSeries_table: any = {
        data: [],
        columns: [],
        columns_list: [],
        emptyRows: [],
        loading: false,
        selectedCol: -1,
        selectedData: [],
    };
    isCollapsed_timeSeriesTable: boolean = false;
    isCollapsed_timeSeriesPlot: boolean = true;

    @Output() closeModal_TimeSeries: EventEmitter<any> =
        new EventEmitter<any>();

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('optionInput') optionInput!: ElementRef<HTMLInputElement>;
    @ViewChild('numInput') numInput!: ElementRef<HTMLInputElement>;

    scenarioService = inject(ScenarioService);

    constructor(private cdr: ChangeDetectorRef) {}

    onSelectFile_TimeSeries(event: Event): void {
        this.timeSeries_table.loading = true;
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            input.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const csvText = reader.result as string;
            const rows = csvText.split('\n').map((r) => r.split(','));
            const headers = rows[0];

            const data = rows.slice(1).map((row) => {
                const rowData: any = {};

                headers.forEach((header, index) => {
                    if (row[index] !== undefined)
                        rowData[index] = row[index].trim();
                    else rowData[index] = '';
                });
                return rowData;
            });

            this.timeSeries_table.data = data;
            this.timeSeries_table.columns = headers.map((header) => ({
                name: header,
                selected: false,
            }));
            this.timeSeries_table.columns_list = headers.map(
                (header) => (header = header.trim())
            );
            this.timeSeries_table.emptyRows = [];
            this.timeSeries_table.loading = false;

            this.cdr.detectChanges();
            // this.collapseTable(false);
        };

        reader.readAsText(file);
    }

    selectCol(colIndex: number) {
        this.timeSeries_table.selectedCol = colIndex;
        this.checkEmptyRows(colIndex);

        this.timeSeries_table.selectedData = this.timeSeries_table.data.map(
            (row: any) => {
                return row[colIndex];
            }
        );
    }

    checkEmptyRows(colIndex: number) {
        this.timeSeries_table.emptyRows = [];

        this.timeSeries_table.data.forEach((row: any, index: number) => {
            const value = row[colIndex];

            if (value === null || value === undefined || value === '') {
                this.timeSeries_table.emptyRows.push(index);
            }
        });
    }

    setDataAndShowPlot() {
        const generateHourlyList = (year: number): string[] => {
            const result: string[] = [];

            const date = new Date(year, 0, 1, 0, 0, 0); // Jan 1, 00:00
            const end = new Date(year + 1, 0, 1, 0, 0, 0); // Jan 1 next year

            while (date < end) {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                const h = String(date.getHours()).padStart(2, '0');

                result.push(`${y}-${m}-${d} ${h}:00`);

                date.setHours(date.getHours() + 1);
            }

            return result;
        };

        const scenarioData: ScenarioBaseInfoModel | null =
            this.scenarioService.restoreBaseInfo_Storage();

        if (scenarioData && scenarioData.scenario) {
            const curentScenario = scenarioData.scenario;
            const xVal = generateHourlyList(curentScenario.simulationYear);
            this.chart_timeSeries_initial(
                xVal,
                this.timeSeries_table.selectedData
            );
        }
    }

    chart_timeSeries_initial(xVal: any, yVal: any) {
        const timeSeriesData: any = {
            x: xVal, // 8760 time: 2025-01-01 to 2025-12-31
            y: yVal, // 8760 values
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            line: { color: '#1f77b4' },
            fillcolor: 'rgba(31, 119, 180, 0.3)',
        };

        const layout: any = {
            title: 'Time Series (Filled Area)',
            xaxis: {
                type: 'date',
                title: 'Date',
            },
            yaxis: {
                title: 'Value',
            },
            margin: { t: 50, l: 50, r: 20, b: 50 },
            responsive: true,
        };

        const config = {
            displayModeBar: false,
            responsive: true,
        };

        this.timeSeriesModal.showPlot = true;

        setTimeout(() => {
            Plotly.newPlot('plot_timeSeries', [timeSeriesData], layout, config);
            // this.collapsePlot(true);
            this.timeSeriesModal.showPlot = true;
        }, 0);
    }

    collapseTable(val: boolean) {
        this.timeSeriesModal.showPlot = !val;
        this.isCollapsed_timeSeriesTable = val;
        this.isCollapsed_timeSeriesPlot = !val;
    }

    collapsePlot(val: boolean) {
        this.timeSeriesModal.showPlot = val;
        this.isCollapsed_timeSeriesTable = !val;
        this.isCollapsed_timeSeriesPlot = val;
    }

    generateRandomData() {
        const data = [];
        for (let i = 0; i < 190; i++) {
            data.push(Math.random() * 100);
        }
        this.timeSeries_table.selectedData = data;
    }

    changeMode(type: 'list' | 'file' | 'number') {
        if (this.timeSeriesModal.selectedType) this.resetData();

        this.timeSeriesModal.selectedType = type;
    }

    resetData() {
        this.timeSeries_table = {
            data: [],
            columns: [],
            columns_list: [],
            emptyRows: [],
            loading: false,
            selectedCol: -1,
            selectedData: [],
        };
        this.timeSeriesModal.showPlot = false;

        const resetFileInput = () => {
            this.fileInput.nativeElement.value = '';
        };
    }
    resetFileInput() {
        this.fileInput.nativeElement.value = '';
    }

    closeModal() {
        this.closeModal_TimeSeries.emit();
    }
}
