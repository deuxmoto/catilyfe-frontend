import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable } from "rxjs/Observable";

import * as Constants from "./constants";

export interface ImageLink {
    width: number;
    height: number;
    url: string;
}

export interface Image {
    id: number;
    description: string;
    slug: string;
    links: ImageLink[];
}

export interface PutImageOptions {
    id?: number;
    file: any;
    slug: string;
    description: string;
}

@Injectable()
export class ImageBackendApi {
    constructor (
        private http: HttpClient
    ) {}

    public putImage(options: PutImageOptions): Observable<Image> {
        const formData = new FormData();
        formData.append("file", options.file);

        const headers = new HttpHeaders()
            .append("cati-image-slug", options.slug)
            .append("cati-image-description", options.description);

        return this.http.post<Image>(`${Constants.Endpoint}/image`, formData, {
            headers: headers
        });
    }
}
