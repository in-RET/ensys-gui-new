import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[numberOnly]',
})
export class NumberOnlyDirective {
    @Input() numberOnly: boolean = true;
    @Input() numbersArray: boolean = true;

    constructor() {}

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        const input = event.target as HTMLInputElement;

        // Remove characters not allowed at all
        if (!this.numbersArray)
            input.value = input.value.replace(/[^0-9.,\-]/g, '');
        else input.value = input.value.replace(/[^0-9.,;\-]/g, '');

        // Prevent multiple separators like ".." or ",,"
        input.value = input.value.replace(/([.,])\1+/g, '$1');

        if (this.numbersArray) {
            // Prevent multiple negative signs in a single number
            input.value = input.value.replace(/(\d*;?)-+/g, '$1-');
            // Prevent multiple semicolons
            input.value = input.value.replace(/;{2,}/g, ';');

            // Trim leading semicolon
            input.value = input.value.replace(/^;/, '');

            // Validate against full correct pattern
            // const validPattern = /^([0-9]+([.,][0-9]*)?)([0-9]+([.,][0-9]*)?)*$/;

            // if (input.value && !validPattern.test(input.value)) {
            //     // If last char breaks the pattern, remove it
            //     input.value = input.value.slice(0, -1);
            // }
        }
    }
}
