import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { GeneralService } from '../../../shared/services/general.service';
import { ScenarioService } from './scenario.service';

@Injectable({
    providedIn: 'root',
})
export class FlowService {
    private readonly _preDefinedList$ = new BehaviorSubject<any>({});
    readonly preDefinedList$ = this._preDefinedList$.asObservable();

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

    constructor(
        private scenarioService: ScenarioService,
        private generalService: GeneralService
    ) {}

    private getPreDefinedList(name: string): Observable<any[]> {
        return this.scenarioService.getPreDefinedList(name).pipe(
            map((res: any) => (res.success ? res.data!.items! : [])),
            map((items) =>
                items.map((s: any) => ({
                    name: this.generalService.convertText_uppercaseAt0(s),
                    value: s,
                }))
            )
        );
    }

    private async loadPreDefinedList(name: string): Promise<void> {
        // const items = await firstValueFrom(this.getPreDefinedList(name));
        return new Promise((resolve, reject) => {
            this.getPreDefinedList(name).subscribe((res) => {
                // const currentItems = this._preDefinedList$.getValue() ?? {};
                // add user_defined option, as a default option
                const userDefined_option = 'user_defined';
                res.push({
                    name: this.generalService.convertText_uppercaseAt0(
                        userDefined_option
                    ),
                    value: userDefined_option,
                });
                this.set_preDefined(name, res);
                resolve();
            });
        });
    }

    private get_preDefined(name: string): string[] {
        const map = this._preDefinedList$.getValue() ?? {};
        return map[name] ?? [];
    }

    private set_preDefined(name: string, items: any[]): void {
        let preDefinedObj = this._preDefinedList$.getValue() ?? {};
        preDefinedObj[name] = items;
        this._preDefinedList$.next(preDefinedObj);
    }

    async getPreDefinedsByName(name: string): Promise<string[]> {
        const cached = this.get_preDefined(name);

        // check wether loaded data before
        if (cached.length > 0) {
            return cached;
        } else {
            await this.loadPreDefinedList(name);
            return this.getPreDefinedsByName(name);
        }
    }

    getPreDefinedValue(option: string, simulationYear: number) {
        return this.scenarioService
            .getPreDefinedData(option, simulationYear)
            .pipe(map((res: any) => (res.success ? res.data : {})));
    }
}
