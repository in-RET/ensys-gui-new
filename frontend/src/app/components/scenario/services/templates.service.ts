import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseHttpService } from '../../../core/base-http/base-http.service';
import { ResModel } from '../../../shared/models/http.model';
import { AlertService } from '../../../shared/services/alert.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
    ScenarioBaseInfoModel,
    ScenarioReqModel,
    ScenarioResModel,
} from '../models/scenario.model';

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
