import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private baseUrl: string = 'http://localhost:9006/projects/';

    constructor(private baseHttp: BaseHttpService) {}

    getProjects() {
        return this.baseHttp.get(`${this.baseUrl}read`);
    }
}
