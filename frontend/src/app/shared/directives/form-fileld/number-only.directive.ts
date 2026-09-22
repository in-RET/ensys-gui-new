import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[numberOnly]',
})
export class NumberOnlyDirective {
    @Input() numberOnly?: boolean;
    @Input() numbersArray?: boolean;
    @Input() min?: number;
    @Input() max?: number;

    constructor() {}

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        if (!this.numberOnly) return;

        const input = event.target as HTMLInputElement;
        let raw = input.value;

        const allowNegative = this.min === undefined || this.min < 0;
        const isNegative = allowNegative && raw.startsWith('-');

        // Remove everything except digits, "." and ","
        raw = raw.replace(/[^0-9.,]/g, '');

        // Allow only one decimal separator
        const separatorIndex = raw.search(/[.,]/);

        if (separatorIndex !== -1) {
            raw =
                raw.slice(0, separatorIndex + 1) +
                raw.slice(separatorIndex + 1).replace(/[.,]/g, '');
        }

        // Restore "-" only at the beginning
        raw = (isNegative ? '-' : '') + raw;

        input.value = raw;

        // Valid intermediate states while typing
        if (
            raw === '' ||
            raw === '-' ||
            raw.endsWith('.') ||
            raw.endsWith(',')
        ) {
            return;
        }

        const value = Number(raw.replace(',', '.'));

        if (Number.isNaN(value)) {
            return;
        }

        // Enforce max while typing
        if (this.max !== undefined && value > this.max) {
            input.value = String(this.max);
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.value || input.value === '-') {
            return;
        }

        let value = Number(input.value.replace(',', '.'));

        if (Number.isNaN(value)) {
            input.value = '';
            return;
        }

        // Enforce min/max after user finishes typing
        if (this.min !== undefined) {
            value = Math.max(this.min, value);
        }

        if (this.max !== undefined) {
            value = Math.min(this.max, value);
        }

        input.value = String(value);
    }
}
