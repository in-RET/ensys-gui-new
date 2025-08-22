import { Injectable } from '@angular/core';

export interface Toast {
    text: string;
    type?: 'success' | 'danger' | 'warning' | 'info';
    delay?: number; // ms
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    constructor() {}

    toasts: Toast[] = [];

    show(text: string, opts: Partial<Toast> = {}) {
        this.toasts.push({
            text,
            type: opts.type || 'info',
            delay: opts.delay || 3000,
            position: opts.position || 'top-right',
        });
    }

    remove(toast: Toast) {
        this.toasts = this.toasts.filter((t) => t !== toast);
    }
}
