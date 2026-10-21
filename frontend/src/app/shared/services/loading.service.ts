import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private activeRequests = 0;
    private readonly loadingSubject = new BehaviorSubject<boolean>(false);

    readonly loading$ = this.loadingSubject.asObservable();

    start(): void {
        this.activeRequests += 1;
        this.loadingSubject.next(true);
    }

    stop(): void {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.loadingSubject.next(this.activeRequests > 0);
    }
}
