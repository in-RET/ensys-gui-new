import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

@Injectable()
export class AuthCoreService {
    public redirectUrl: string | null = null;

    private readonly _token = new BehaviorSubject<string | undefined | null>(
        undefined
    );
    currentToken: Observable<string | undefined | null> =
        this._token.asObservable();

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

    getToken(): string | undefined | null {
        return this._token.getValue();
    }

    getRefreshToken(): string {
        return localStorage.getItem(REFRESH_TOKEN)!;
    }

    removeRefreshToken() {
        localStorage.removeItem(REFRESH_TOKEN);
    }

    saveTokenToStorage(token: any) {
        localStorage.setItem(ACCESS_TOKEN, token);
    }

    saveToken(token: any) {
        this._token.next(token);
    }

    removeTokenToStorage() {
        localStorage.removeItem(ACCESS_TOKEN);
    }

    removeToken() {
        this._token.next(undefined);
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
}
