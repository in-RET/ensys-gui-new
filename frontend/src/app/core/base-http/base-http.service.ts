import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BaseHttpService {
    httpOptions = {
        headers: {},
    };

    defaultHeader: any = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    };

    constructor(private http: HttpClient) {}

    private setHeader(data: any) {
        if (data) {
            for (const i in data) {
                this.defaultHeader[i] = data[i];
            }
        }

        this.httpOptions.headers = new HttpHeaders(this.defaultHeader);
    }

    get(url: string, params?: any, headerOption?: any): Observable<any> {
        this.setHeader(headerOption);

        if (params) {
            const queryParams = new URLSearchParams();

            for (const key in params) {
                queryParams.set(key, params[key]);
            }

            url = url + '?' + queryParams.toString();
        }

        return this.http.get<any>(url, this.httpOptions).pipe(
            map((response: any) => {
                return response;
            }),
            catchError(this.errorHandler)
        );
    }

    public post(
        url: string,
        params?: any,
        headerOption?: any
    ): Observable<any> {
        this.setHeader(headerOption);

        return this.http.post<any>(url, params, this.httpOptions).pipe(
            map((response: any) => {
                return response;
            }),
            catchError(this.errorHandler)
        );
    }

    public patch(
        url: string,
        params?: any,
        headerOption?: any
    ): Observable<any> {
        this.setHeader(headerOption);

        return this.http.patch<any>(url, params, this.httpOptions).pipe(
            map((response: any) => {
                return response;
            }),
            catchError(this.errorHandler)
        );
    }

    public delete(url: string, headerOption?: any): Observable<any> {
        this.setHeader(headerOption);
        return this.http.delete<any>(url, this.httpOptions).pipe(
            map((response) => {
                return response;
            }),
            catchError(this.errorHandler)
        );
    }

    private errorHandler(error: any) {
        return throwError(() => error);
    }
}
