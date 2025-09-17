import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastPosition =
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left';
export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
    id: string;
    text: string;
    title?: string;
    variant: ToastVariant;
    position: ToastPosition;
    autoClose: boolean;
    delay: number; // ms
}

type ToastAction =
    | { type: 'show'; toast: Toast }
    | { type: 'hide'; id: string };

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    constructor() {}

    private _actions$ = new Subject<ToastAction>();
    readonly actions$ = this._actions$.asObservable();

    show(text: string, opts: Partial<Omit<Toast, 'id' | 'text'>> = {}) {
        const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        const toast: Toast = {
            id,
            text,
            title: opts.title,
            variant: opts.variant ?? 'info',
            position: opts.position ?? 'top-right',
            autoClose: opts.autoClose ?? true,
            delay: opts.delay ?? 3000,
        };
        this._actions$.next({ type: 'show', toast });
        return id;
    }

    success(text: string, opts: Partial<Omit<Toast, 'id' | 'text'>> = {}) {
        return this.show(text, { ...opts, variant: 'success' });
    }

    error(text: string, opts: Partial<Omit<Toast, 'id' | 'text'>> = {}) {
        return this.show(text, { ...opts, variant: 'danger' });
    }

    warning(text: string, opts: Partial<Omit<Toast, 'id' | 'text'>> = {}) {
        return this.show(text, { ...opts, variant: 'warning' });
    }

    info(text: string, opts: Partial<Omit<Toast, 'id' | 'text'>> = {}) {
        return this.show(text, { ...opts, variant: 'info' });
    }
}
