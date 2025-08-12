import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class RegionService {
    private baseUrl = './static/assets/json_data/regions.json';

    constructor(private baseHttp: BaseHttpService) {}

    getAllRegions() {
        return this.baseHttp.get(`${this.baseUrl}`);
    }
}
