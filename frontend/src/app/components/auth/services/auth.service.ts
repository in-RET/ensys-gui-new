import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl: string = 'http://localhost:9006/users/auth/';
    private httpOptions = {
        headers: {},
    };

    private defaultHeader: any = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
            'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    };

    constructor(private http: HttpClient) {}

    logIn(): Observable<any> {
        this.httpOptions.headers = new HttpHeaders(this.defaultHeader);
        let formData: FormData = new FormData();

        formData.append('username', '1');
        formData.append('password', '2');

        return this.http.post<any>(
            `${this.baseUrl}login`,
            formData,
            this.httpOptions
        );
    }
}
