import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {BaseHttpService} from '../../../core/base-http/base-http.service';
import {AlertService} from '../../../shared/services/alert.service';
import {ToastService} from '../../../shared/services/toast.service';

@Injectable({
    providedIn: 'root',
})
export class ScenarioService {
    private baseUrl: string = environment.apiUrl + 'templates';

    alertService = inject(AlertService);
    toastService = inject(ToastService);
    baseHttp = inject(BaseHttpService);

    getTemplates() {
        return this.baseHttp.get(`${this.baseUrl}s/`);
    }

    createScenarioFromTemplate(data: any) {
        return this.baseHttp.post(`${this.baseUrl}`, data);

        // lies die Liste
    }

}
