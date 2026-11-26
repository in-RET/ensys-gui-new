import {
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

export type TimeSeriesSummary = 'avg' | 'sum';

function isNumericArray(value: unknown): value is number[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(
            (item: unknown) =>
                typeof item === 'number' && Number.isFinite(item),
        )
    );
}

@Directive({
    selector: '[timeSeriesSummary]',
})
export class TimeSeriesSummaryDirective implements OnDestroy, OnInit {
    @Input() timeSeriesSummary: TimeSeriesSummary = 'sum';

    private valueChangesSubscription?: Subscription;

    constructor(
        private readonly elementRef: ElementRef<HTMLInputElement>,
        @Self() @Optional() private readonly ngControl: NgControl | null,
    ) { }

    ngOnInit(): void {
        this.valueChangesSubscription = this.ngControl?.valueChanges?.subscribe(
            () => this.updateDisplay(),
        );
        this.updateDisplay();
    }

    ngOnDestroy(): void {
        this.valueChangesSubscription?.unsubscribe();
    }

    private updateDisplay(): void {
        const control = this.ngControl?.control;
        if (!control) return;

        this.elementRef.nativeElement.value = summarizeTimeSeriesValue(
            control.value,
            this.timeSeriesSummary,
        );
    }
}

export function summarizeTimeSeriesValue(
    value: unknown,
    directive: TimeSeriesSummary,
): string {
    if (!isNumericArray(value)) {
        return value == null ? '' : String(value);
    }

    const total = value.reduce((sum, item) => sum + item, 0);
    const result = directive === 'avg' ? total / value.length : total;
    return String(Math.round(result * 100) / 100);
}
