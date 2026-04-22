import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PublicService {
    constructor() {}

    getCurrentDateTimeString(): string {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}${month}${day}_${hours}${minutes}`;
    }

    normalizeString(v: string): string | null {
        if (v === null || v === undefined) return null;

        const s = v.trim();
        return !s || s.toLowerCase() === 'null' ? null : s;
    }
}
