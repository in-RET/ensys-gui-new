import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private baseUrl: string = environment.apiUrl + 'project';

    constructor(private baseHttp: BaseHttpService) {}

    getProject(id: number) {
        return this.baseHttp.get(`${this.baseUrl}/${id}`);
    }

    getProjects() {
        return this.baseHttp.get(`${this.baseUrl}s`);
    }

    createProject(data: any) {
        return this.baseHttp.post(`${this.baseUrl}`, data);
    }

    updateProject(data: any) {
        return this.baseHttp.patch(`${this.baseUrl}/${data.id}`, data);
    }

    deleteProject(id: number) {
        return this.baseHttp.delete(`${this.baseUrl}/${id}`);
    }
}
