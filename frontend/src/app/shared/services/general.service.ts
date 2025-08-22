import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GeneralService {
    constructor() {}

    convertText_uppercaseAt0(text: string): string {
        return text
            .split(/[-_]/g)
            .map(
                (word: string) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLocaleLowerCase()
            )
            .join(' ')
            .trim();
    }
}
