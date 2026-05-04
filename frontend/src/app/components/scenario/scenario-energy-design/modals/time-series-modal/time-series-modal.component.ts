import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    ModeOption,
    TimeSeriesComponent,
} from '../../time-series/time-series.component';

@Component({
    selector: 'app-time-series-modal',
    imports: [CommonModule, TimeSeriesComponent],
    templateUrl: './time-series-modal.component.html',
    styleUrl: './time-series-modal.component.scss',
})
export class TimeSeriesModalComponent {
    @Input() modalInfo!: {
        controlName: string;
        modes: ModeOption[] | null;
    } | null;
    @Output() dataSubmitted = new EventEmitter<{
        controlName: string;
        data: number | number[];
    }>();
    @Output() modalClosed = new EventEmitter<boolean>();

    onDataSubmitted(data: number | number[]) {
        if (!this.modalInfo) return;

        this.dataSubmitted.emit({
            controlName: this.modalInfo.controlName,
            data,
        });
        this.closeModal(true);
    }

    closeModal(approve: boolean) {
        this.modalClosed.emit(approve);
    }
}
