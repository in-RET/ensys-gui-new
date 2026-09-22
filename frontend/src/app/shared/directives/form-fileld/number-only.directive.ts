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
        if (!this.numberOnly && !this.numbersArray) return;

        const input = event.target as HTMLInputElement;

        // Remove characters not allowed at all
        if (!this.numbersArray) {
            // Allow numbers, "." and ","
            input.value = input.value.replace(/[^0-9.,\-]/g, '');

            // Prevent multiple decimal separators
            const separatorIndex = input.value.search(/[.,]/);

            if (separatorIndex !== -1) {
                input.value =
                    input.value.slice(0, separatorIndex + 1) +
                    input.value.slice(separatorIndex + 1).replace(/[.,]/g, '');
            }

            // Allow intermediate values while typing
            if (
                input.value === '' ||
                input.value === '-' ||
                input.value.endsWith('.') ||
                input.value.endsWith(',')
            ) {
                return;
            }

            const value = Number(input.value.replace(',', '.'));

            if (Number.isNaN(value)) return;

            // Dynamic min
            if (this.min !== undefined && value < this.min) {
                input.value = String(this.min);
                return;
            }

            // Dynamic max
            if (this.max !== undefined && value > this.max) {
                input.value = String(this.max);
            }
        } else input.value = input.value.replace(/[^0-9.,;\-]/g, '');

        // Prevent multiple separators like ".." or ",,"
        input.value = input.value.replace(/([.,])\1+/g, '$1');

        if (this.numbersArray) {
            // Prevent multiple negative signs in a single number
            input.value = input.value.replace(/(\d*;?)-+/g, '$1-');
            // Prevent multiple semicolons
            input.value = input.value.replace(/;{2,}/g, ';');

            // Trim leading semicolon
            input.value = input.value.replace(/^;/, '');
        }
    }
}
