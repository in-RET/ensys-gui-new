import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthCoreService } from '../../../core/auth/auth.service';
import { BaseHttpService } from '../../../core/base-http/base-http.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = 'http://localhost:20001/user/auth/';

    constructor(
        private baseHttp: BaseHttpService,
        private authCoreService: AuthCoreService
    ) {}

    logIn(username: string, password: string): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        return this.baseHttp.post(`${this.baseUrl}login`, formData, {});
    }

    logOut() {
        // clear authorizition data
        this.authCoreService.removeTokenToStorage();
        this.authCoreService.removeToken();
    }

    signup(
        username: string,
        firstname: string,
        lastname: string,
        password: string,
        mail: string
    ): Observable<any> {
        const data = { username, firstname, lastname, password, mail };
        return this.baseHttp.post(`${this.baseUrl}register`, data);
    }
}
