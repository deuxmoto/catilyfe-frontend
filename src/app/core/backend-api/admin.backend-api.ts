import { Injectable } from "@angular/core";
import { HttpClient, HttpResponseBase, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";

import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserBackendApi, ReadOnlyUser } from "./user.backend-api";
import * as Constants from "./constants";
import * as Errors from "./errors";

@Injectable()
export class AdminBackendApi {
    constructor(
        private userBackendApi: UserBackendApi,
        private http: HttpClient
    ) { }

    public getAllUsers(): Observable<ReadOnlyUser[]> {
        return this.http.get<ReadOnlyUser[]>(`${Constants.Endpoint}/admin/user`, { withCredentials: true }).pipe(
            catchError((error) => {
                const parsedError = Errors.parseError(error);
                if (parsedError instanceof Errors.UnauthorizedError) {
                    this.userBackendApi.gotoLoginPage();
                }

                return observableThrowError(parsedError);
            }));
    }
}
