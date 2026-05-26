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
import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

import {
    ScenarioStateModel,
    ScenarioStateService,
} from '../../services/scenario-state.service';
import { ScenarioService } from '../../services/scenario.service';
import { ModalComponent } from '../modal/modal.component';

export interface ModeOption {
    value: 'list' | 'file' | 'number';
    label: string;
}

@Component({
    selector: 'app-time-series',
    imports: [CommonModule, FormsModule, ModalComponent, NgbCollapseModule],
    templateUrl: './time-series.component.html',
    styleUrl: './time-series.component.scss',
})
export class TimeSeriesComponent {
    modalInfo: {
        showPlot: boolean;
        title: string;
        selectedType?: 'list' | 'file' | 'number';
        data: undefined | number | number[];
    } = {
        showPlot: false,
        title: 'Time Series Data',
        selectedType: undefined, // types: list , file, number
        data: undefined,
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
    formError: { msg: string | null; isShow: boolean } = {
        msg: '',
        isShow: false,
    };

    @Input() maxRecords_TimeSeries: number = 8760;
    private readonly defaultModes: ModeOption[] = [
        { value: 'list', label: 'Options' },
        { value: 'file', label: 'CSV File' },
        { value: 'number', label: 'Single Value' },
    ] as const;

    private _modes!: ModeOption[];
    @Input()
    set modes(d: ModeOption[] | null) {
        this._modes = d && d?.length ? d : [...this.defaultModes];
    }
    get modes() {
        return this._modes;
    }

    @Output()
    dataSubmit: EventEmitter<number | number[]> = new EventEmitter<
        number | number[]
    >();
    @Output()
    closeModal_TimeSeries: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('optionInput') optionInput!: ElementRef<HTMLInputElement>;
    @ViewChild('numInput') numInput!: ElementRef<HTMLInputElement>;

    scenarioService = inject(ScenarioService);
    scenarioStateService = inject(ScenarioStateService);

    constructor(private cdr: ChangeDetectorRef) {}

    private setFormError(status: boolean, msg: string) {
        this.formError = {
            msg: msg,
            isShow: status,
        };
    }

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
                    (_, i) => `Column ${i + 1}`,
                );
            }

            if (this.timeSeries_table.hasHeader) rows.shift(); // Remove header row if present

            // clean each cell
            const clearedData: any[] = rows.slice(0).map((row) => {
                const rowData: any = {};

                headers.forEach((h, index) => {
                    if (row[index] !== undefined)
                        rowData[index] = row[index].trim();
                    else rowData[index] = '';
                });
                return rowData;
            });

            // convert each cell to number
            const data: any[] = clearedData.map((row) => {
                const rowData: any = {};

                headers.forEach((h, index) => {
                    // check whether the cell value can be converted to a number, if yes convert it, if not keep the original value
                    const numValue = parseFloat(row[index]);
                    rowData[index] = isNaN(numValue) ? row[index] : numValue;
                });
                return rowData;
            });

            // remove the last row if it's empty
            while (true) {
                if (data.length > 0) {
                    const lastRow = data[data.length - 1];
                    const isEmptyRow = Object.values(lastRow).every(
                        (value) =>
                            value === null ||
                            value === undefined ||
                            value === '',
                    );
                    if (isEmptyRow) data.pop();
                    else break;
                }
            }

            this.timeSeries_table.data = data;
            this.timeSeries_table.columns = headers.map((header: string) => ({
                name: header,
                selected: false,
            }));
            this.timeSeries_table.columns_list = headers.map(
                (header) => (header = header.trim()),
            );
            this.timeSeries_table.emptyRows = [];
            this.timeSeries_table.loading = false;

            this.cdr.detectChanges();
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
                },
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

            let time = Date.UTC(year, 0, 1, 0, 0, 0); // Jan 1, 00:00
            const end = Date.UTC(year + 1, 0, 1, 0, 0, 0); // Jan 1 next year

            while (time < end) {
                const date = new Date(time);

                const y = date.getUTCFullYear();
                const m = String(date.getUTCMonth() + 1).padStart(2, '0');
                const d = String(date.getUTCDate()).padStart(2, '0');
                const h = String(date.getUTCHours()).padStart(2, '0');

                result.push(`${y}-${m}-${d} ${h}:00`);

                time += 60 * 60 * 1000;
            }

            return result;
        };

        const scenarioData: ScenarioStateModel | null =
            this.scenarioStateService.getScenarioData();

        if (scenarioData && scenarioData.scenario) {
            const curentScenario = scenarioData.scenario;
            const xVal = generateHourlyList(curentScenario.simulationYear);
            const yVal: number[] = [];

            switch (this.modalInfo.selectedType) {
                case 'list':
                    break;

                case 'file':
                    yVal.push(...this.timeSeries_table.selectedData);
                    break;

                case 'number':
                    const numValue = parseFloat(
                        this.numInput.nativeElement.value,
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

    chart_timeSeries_initial(xVal: string[], yVal: number[]) {
        this.modalInfo.showPlot = true;
        Chart.register(zoomPlugin);

        setTimeout(() => {
            const canvas: any = document.getElementById('plot_timeSeries');

            if (!canvas) return;

            new Chart(canvas, {
                type: 'line',
                data: {
                    labels: xVal,
                    datasets: [
                        {
                            label: 'Value',
                            data: yVal,

                            borderColor: '#1f77b4',
                            backgroundColor: 'rgba(31, 119, 180, 0.3)',

                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            borderWidth: 1,
                            tension: 0,
                        },
                    ],
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

            this.modalInfo.data = yVal;
        }, 0);
    }

    collapseTable(val: boolean) {
        this.modalInfo.showPlot = !val;
        this.isCollapsed_timeSeriesTable = val;
        this.isCollapsed_timeSeriesPlot = !val;
    }

    collapsePlot(val: boolean) {
        this.modalInfo.showPlot = val;
        this.isCollapsed_timeSeriesTable = !val;
        this.isCollapsed_timeSeriesPlot = val;
    }

    changeMode(type: 'list' | 'file' | 'number') {
        if (this.modalInfo.selectedType) this.resetData();

        this.modalInfo.selectedType = type;
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
        this.modalInfo.showPlot = false;
    }

    submitData() {
        if (this.modalInfo.selectedType === 'number') {
            this.modalInfo.data = parseFloat(this.numInput.nativeElement.value);
        }

        if (this.modalInfo.data) {
            this.dataSubmit.emit(this.modalInfo.data);
        } else this.setFormError(true, ' * The Data is not completed!');
    }

    closeModal(approved: any) {
        this.closeModal_TimeSeries.emit(approved);
    }
}
