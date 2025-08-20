import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ScenarioService } from './scenario.service';

@Injectable({
    providedIn: 'root',
})
export class FlowService {
    private readonly _preDefinedList$ = new BehaviorSubject<any[]>([]);
    private readonly preDefinedList$ = this._preDefinedList$.asObservable();

    private preList: any = {
        source: [
            {
                name: 'Wind power plant',
                value: 'Wind power plant',
            },
            {
                name: 'Ground Mounted Photovoltaic',
                value: 'Ground Mounted Photovoltaic',
            },
            {
                name: 'Roof Mounted Photovoltaic',
                value: 'Roof Mounted Photovoltaic',
            },
            {
                name: 'Import from the power grid',
                value: 'Import from the power grid',
            },
            {
                name: 'Biomass supply',
                value: 'Biomass supply',
            },
            {
                name: 'Solar thermal system',
                value: 'Solar thermal system',
            },
            {
                name: 'Run-of-river power plant',
                value: 'Run-of-river power plant',
            },
            {
                name: 'User Defined',
                value: 'user_defined',
            },
        ],
    };

    constructor(private scenarioService: ScenarioService) {}

    // getPreDefinedList(name: string): Promise<any[]> {
    //     return firstValueFrom(
    //         this.scenarioService.getPreDefinedList(name).pipe(
    //             map((res: any) => (res.success ? res.data!.items! : [])),
    //             map((items) => items.map((s: any) => ({ name: s, value: s })))
    //         )
    //     );
    // }

    loadPreDefinedList(name: string) {
        this.set(this.preList[name]);
    }

    get snapshot(): any[] {
        return this._preDefinedList$.getValue();
    }
    set(items: any[]): void {
        this._preDefinedList$.next(items ?? []);
    }
    update(updater: (prev: any[]) => any[]): void {
        debugger;
        const next = updater(this._preDefinedList$.getValue());
        this._preDefinedList$.next(next ?? []);
    }
}
