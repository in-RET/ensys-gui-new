import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {BaseHttpService} from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class TemplateService {
    private baseUrl: string = environment.apiUrl + 'templates';

    constructor(private baseHttp: BaseHttpService) {
    }

    getTemplates() {
        return this.baseHttp.get(`${this.baseUrl}`);
    }

    getTemplateScenario(id: number) {
        return this.baseHttp.get(`${this.baseUrl}/scenario/${id}`);
    }

    createProjectFromTemplate(id: number) {
        return this.baseHttp.post(`${this.baseUrl}/${id}`);
    }
}
