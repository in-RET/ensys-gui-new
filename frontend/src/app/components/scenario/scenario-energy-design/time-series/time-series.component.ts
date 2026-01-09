import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
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
        selectedType: undefined, // types: list , file, number
        data: [],
    };
    timeSeries_table: {
        data: undefined | null | any[];
        columns: { name: string; selected: boolean }[];
        columns_list: string[];
        emptyRows: number[];
        loading: boolean;
        selectedCol: number;
        selectedData: number[];
        noRecordsCnt: number;
        hasHeader?: boolean;
    } = {
        data: undefined,
        columns: [],
        columns_list: [],
        emptyRows: [],
        loading: false,
        selectedCol: -1,
        selectedData: [],
        noRecordsCnt: 0,
        hasHeader: true,
    };
    isCollapsed_timeSeriesTable: boolean = false;
    isCollapsed_timeSeriesPlot: boolean = true;

    @Input() maxRecords_TimeSeries: number = 8760;
    @Output()
    closeModal_TimeSeries: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('optionInput') optionInput!: ElementRef<HTMLInputElement>;
    @ViewChild('numInput') numInput!: ElementRef<HTMLInputElement>;

    scenarioService = inject(ScenarioService);

    constructor(private cdr: ChangeDetectorRef) {}

    onSelectFile_TimeSeries(event: Event): void {
        // check any file selected before
        if (this.timeSeries_table.selectedCol !== -1) this.resetData();

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
            let headers: string[] = [];

            if (this.timeSeries_table.hasHeader) headers = rows[0];
            else {
                // Generate default headers if none exist
                const colCount = rows[0].length;
                headers = Array.from(
                    { length: colCount },
                    (_, i) => `Column ${i + 1}`
                );
            }

            if (this.timeSeries_table.hasHeader) rows.shift(); // Remove header row if present

            const data = rows.slice(0).map((row) => {
                const rowData: any = {};

                headers.forEach((header, index) => {
                    if (row[index] !== undefined)
                        rowData[index] = row[index].trim();
                    else rowData[index] = '';
                });
                return rowData;
            });

            this.timeSeries_table.data = data;
            this.timeSeries_table.columns = headers.map((header: string) => ({
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
        this.checkNoRecordsCnt(colIndex);
        this.checkEmptyRows(colIndex);

        if (this.timeSeries_table.data)
            this.timeSeries_table.selectedData = this.timeSeries_table.data.map(
                (row: any) => {
                    return row[colIndex];
                }
            );
    }

    checkNoRecordsCnt(colIndex: number) {
        if (this.timeSeries_table.data) {
            this.timeSeries_table.noRecordsCnt = 0;
            this.timeSeries_table.noRecordsCnt =
                this.maxRecords_TimeSeries -
                this.timeSeries_table.data.map((row: any) => row[colIndex])
                    .length;
        }
    }

    checkEmptyRows(colIndex: number) {
        this.timeSeries_table.emptyRows = [];

        if (this.timeSeries_table.data)
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

            const yVal: number[] = [];

            switch (this.timeSeriesModal.selectedType) {
                case 'list':
                    break;

                case 'file':
                    yVal.push(...this.timeSeries_table.selectedData);
                    break;

                case 'number':
                    const numValue = parseFloat(
                        this.numInput.nativeElement.value
                    );

                    if (numValue)
                        for (let i = 0; i < xVal.length; i++) {
                            yVal.push(numValue);
                        }
                    break;
            }

            if (
                yVal.length > 0 &&
                (yVal.length === xVal.length || yVal.length === xVal.length + 1)
            )
                this.chart_timeSeries_initial(xVal, yVal);
        }
    }

    chart_timeSeries_initial(xVal: any, yVal: any) {
        this.timeSeriesModal.showPlot = true;

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

        setTimeout(() => {
            Plotly.newPlot('plot_timeSeries', [timeSeriesData], layout, config)
                .then(() => {
                    // this.collapsePlot(true);
                })
                .catch((error) => {
                    console.error('Error creating plot:', error);
                });
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

    changeMode(type: 'list' | 'file' | 'number') {
        if (this.timeSeriesModal.selectedType) this.resetData();

        this.timeSeriesModal.selectedType = type;
    }

    resetData() {
        this.timeSeries_table = {
            data: null,
            columns: [],
            columns_list: [],
            emptyRows: [],
            loading: false,
            selectedCol: -1,
            selectedData: [],
            noRecordsCnt: 0,
        };
        this.timeSeries_table.hasHeader = true;
        this.timeSeriesModal.showPlot = false;
    }

    // resetFileInput() {
    //     this.fileInput.nativeElement.value = '';
    // }

    toggleHasHeader() {}

    submitData() {
        // show notif of import success
        this.closeModal();
    }

    closeModal() {
        this.closeModal_TimeSeries.emit();
    }
}
