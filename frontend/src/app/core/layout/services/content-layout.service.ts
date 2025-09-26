import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContentLayoutService {
    private readonly _fullscreenStatus = new BehaviorSubject<
        boolean | undefined
    >(false);
    fullscreenStatus: Observable<boolean | undefined> =
        this._fullscreenStatus.asObservable();

    setScreenFull(status: boolean) {
        this._fullscreenStatus.next(status);
    }
}
