import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs/Observable";

import * as Constants from "./constants";

export interface Tag {
    tag: string;
    weight: number;
}

@Injectable()
export class TagsBackendApi {
    constructor (
        private http: HttpClient
    ) {}

    public getTags(): Observable<Tag[]> {
        return this.http.get<Tag[]>(`${Constants.Endpoint}/tags`);
    }
}
