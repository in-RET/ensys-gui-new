import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseHttpService } from '../base-http/base-http.service';
const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

@Injectable()
export class AuthCoreService {
    public redirectUrl: string | null = null;

    private readonly _token = new BehaviorSubject<string | undefined>(
        undefined
    );
    currentToken: Observable<string | undefined> = this._token.asObservable();

    constructor(private httpService: BaseHttpService, private router: Router) {}

    /** Return token if exists */
    public getAuthorizationToken(): string {
        const sessionStorageToken = localStorage.getItem('loginData');
        const localStorageToken = localStorage.getItem(ACCESS_TOKEN);

        return sessionStorageToken || localStorageToken || '';
    }

    /** Return token and menu if exists */
    public getHasAccess(): boolean {
        // return localStorage.getItem(ACCESS_TOKEN) ? true : false;
        return this.getToken() ? true : false;
    }

    getTokenFromStorage(): string | null {
        const localStorageToken = localStorage.getItem(ACCESS_TOKEN);
        return localStorageToken;
    }

    getToken(): string | undefined {
        return this._token.getValue();
    }

    getRefreshToken(): string {
        return localStorage.getItem(REFRESH_TOKEN)!;
    }

    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN);
    }

    saveTokenToStorage(token: any): void {
        localStorage.setItem(ACCESS_TOKEN, token);
    }

    saveToken(token: any): void {
        this._token.next(token);
    }

    refreshToken(refreshData: any): Observable<any> {
        this.removeToken();
        this.removeRefreshToken();
        const body = new HttpParams()
            .set('refresh_token', refreshData.refresh_token)
            .set('grant_type', 'refresh_token');
        return of(true);
    }

    getQueryParameterByName(name: string) {
        const pairStrings = window.location.search.slice(1).split('&');
        const pairs: any = pairStrings.map(function (pair) {
            return pair.split('=');
        });
        return pairs.reduce(function (value: any, pair: any) {
            if (value) return value;
            return pair[0] === name ? decodeURIComponent(pair[1]) : null;
        }, null);
    }

    removeToken(): void {
        localStorage.removeItem(ACCESS_TOKEN);
    }

    navigateToHome() {
        this.router.initialNavigation();
        this.router.navigate(['manageOrganization/organization/list']);
    }
}
