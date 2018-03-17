import { Injectable } from "@angular/core";
import { HttpClient, HttpResponseBase, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";

import { Observable } from "rxjs/Observable";
import { ReplaySubject } from "rxjs/ReplaySubject";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/do";

import * as Constants from "./constants";
import * as Errors from "./errors";

export type UserRole = "god-post";

export interface ReadOnlyUser {
    id: number;
    name: string;
    email: string;
    roles: UserRole[];
}

export interface User extends ReadOnlyUser {
    password: string;
}

export import RedirectQueryParamName = Constants.RedirectQueryParamName;

export function isUserAdmin(user: ReadOnlyUser): boolean {
    return user ? user.roles.indexOf("god-post") !== -1 : false;
}

@Injectable()
export class UserBackendApi {
    private _loggedInUser = new ReplaySubject<ReadOnlyUser>(1);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this._refreshLoggedInUser();
    }

    public login(email: string, password: string): Observable<void> {
        const credentials = {
            email: email,
            password: password
        };
        return this.http.put<void>(`${Constants.Endpoint}/login`, credentials, { withCredentials: true })
            .catch((error) => {
                return Observable.throw(Errors.parseError(error));
            })
            .do((result) => {
                // Refresh logged in user if login was successful
                if (!Errors.isError(result)) {
                    this._refreshLoggedInUser();
                }
            });
    }

    public logout(): Observable<void> {
        return this.http.delete<void>(`${Constants.Endpoint}/login`, { withCredentials: true })
            .catch((error) => {
                return Observable.throw(Errors.parseError(error));
            })
            .do((result) => {
                // If logout was successful, set logged in user to null
                if (!Errors.isError(result)) {
                    this._loggedInUser.next(null);
                }
            });
    }

    public getLoggedInUser(): Observable<ReadOnlyUser> {
        return this._loggedInUser.asObservable();
    }

    public gotoLoginPage(): void {
        const currentUrl = this.router.url;
        this.router.navigate(["/login"], {
            queryParams: {
                [RedirectQueryParamName]: currentUrl
            }
        });
    }

    private _refreshLoggedInUser(): void {
        this.http.get<ReadOnlyUser>(`${Constants.Endpoint}/admin/user/me`, { withCredentials: true })
            .subscribe(
                (user) => {
                    this._loggedInUser.next(user);
                },
                (error) => {
                    const parsedError = Errors.parseError(error);
                    if (parsedError instanceof Errors.UnauthorizedError) {
                        this._loggedInUser.next(null);
                    }
                    else {
                        console.error(parsedError);
                    }
                }
            );
    }
}
