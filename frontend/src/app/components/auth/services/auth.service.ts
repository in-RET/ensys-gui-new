import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl: string = 'http://localhost:9006/user/auth/';

    constructor(private baseHttp: BaseHttpService) {}

    logIn(username: string, password: string): Observable<any> {
        let formData: FormData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        return this.baseHttp.post(`${this.baseUrl}login`, formData, {});
    }
}
