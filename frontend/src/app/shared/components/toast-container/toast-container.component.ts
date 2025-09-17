import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import {
    Toast,
    ToastPosition,
    ToastService,
} from '../../services/toast.service';

@Component({
    selector: 'app-toast-container',
    imports: [CommonModule],
    templateUrl: './toast-container.component.html',
    styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
    toasts: Toast[] = [];
    private sub!: Subscription;
    private timers = new Map<string, any>();

    constructor(private toastSvc: ToastService) {}

    ngOnInit(): void {
        this.sub = this.toastSvc.actions$.subscribe((action) => {
            if (action.type === 'show') {
                this.toasts = [...this.toasts, action.toast];
                if (action.toast.autoClose) {
                    const t = setTimeout(
                        () => this.remove(action.toast.id),
                        action.toast.delay
                    );
                    this.timers.set(action.toast.id, t);
                }
            } else if (action.type === 'hide') {
                this.remove(action.id);
            }
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        this.timers.forEach((t) => clearTimeout(t));
        this.timers.clear();
    }

    remove(id: string) {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }
        this.toasts = this.toasts.filter((t) => t.id !== id);
    }

    byPosition(pos: ToastPosition) {
        return this.toasts.filter((t) => t.position === pos);
    }
}
