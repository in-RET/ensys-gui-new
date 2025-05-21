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

    constructor() {}

    toggleScreenFull() {
        const currentValue = this._fullscreenStatus.getValue();
        this._fullscreenStatus.next(!currentValue);
    }
}
