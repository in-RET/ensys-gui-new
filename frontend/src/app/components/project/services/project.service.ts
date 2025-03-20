import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private baseUrl: string = 'http://localhost:9006/project/';

    constructor(private baseHttp: BaseHttpService) {}

    getProjects() {
        return this.baseHttp.get(`${this.baseUrl}read_all`, null, {});
    }

    createProject(data: any) {
        return this.baseHttp.post(`${this.baseUrl}create`, data);
    }
}
