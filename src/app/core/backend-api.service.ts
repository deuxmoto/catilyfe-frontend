import { Injectable } from "@angular/core";
import { ActivatedRoute, Router, Params as QueryParams } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import * as Errors from "./backend-api/errors";

export * from "./backend-api/errors";

export interface AdminPostMetadata {
    id?: number;
    whenCreated?: Date;
    revision?: number;
    authorId: number;
    slug: string;
    title: string;
    whenPublished: Date;
    description: string;
    tags: string[];
    isReserved: boolean;
    isPublished: boolean;
}

export interface AdminPost {
    metadata: AdminPostMetadata;
    markdownContent: string;
}

export interface PostMetadata {
    title: string;
    description: string;
    id: number;
    slug: string;
    whenPublished: Date;
    tags: Array<string>;
}

export interface Post {
    metadata: PostMetadata;
    rawHtmlThenIGuess: string;
}

export interface MarkdownPreview {
    content: string;
}


export const RedirectQueryParamName = "redirectUrl";

export const BackendHostName = "caticake.azurewebsites.net";
export const BackendProtocol = "https";

const BackendEndpoint = `${BackendProtocol}://${BackendHostName}`;

const convertDateStringsToObjects = <T>(obj: T): T => {
    let anyObj = <any>obj;
    if (anyObj.whenCreated) {
        anyObj.whenCreated = new Date(anyObj.whenCreated);
    }
    if (anyObj.whenPublished) {
        anyObj.whenPublished = new Date(anyObj.whenPublished);
    }
    return anyObj;
};

@Injectable()
export class BackendApiService {
    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    public getRecentPostMetadata(count: number): Observable<PostMetadata[]> {
        return this.http.get<PostMetadata[]>(`${BackendEndpoint}/postmetadata?top=${count}`).pipe(
            map((postMetadata) => {
                // Convert date strings to actual dates
                postMetadata.forEach((metadata) => {
                    convertDateStringsToObjects(metadata);
                });

                return postMetadata;
            }));
    }

    public getPost(slug: string): Observable<Post> {
        return this.http.get<Post>(`${BackendEndpoint}/post/${slug}`).pipe(
            map((post) => {
                convertDateStringsToObjects(post.metadata);
                return post;
            }),
            catchError((error) => {
                return observableThrowError(this._handleFetchError(error));
            }));
    }

    public getAdminPostMetadata(count = 1000): Observable<AdminPostMetadata[]> {
        return this.http.get<AdminPostMetadata[]>(`${BackendEndpoint}/admin/post?top=${count}&includeUnpublished=true`, {
            withCredentials: true
        }).pipe(
            map((postMetadata) => {
                postMetadata.forEach((metadata) => {
                    convertDateStringsToObjects(metadata);
                });
                return postMetadata;
            }),
            catchError((error) => {
                return observableThrowError(this._handleFetchError(error));
            }));
    }

    public getAdminPost(id: string): Observable<AdminPost> {
        return this.http.get<AdminPost>(`${BackendEndpoint}/admin/post/${id}`, {
            withCredentials: true
        }).pipe(
            map((adminPost) => {
                convertDateStringsToObjects(adminPost.metadata);
                return adminPost;
            }),
            catchError((error) => {
                return observableThrowError(this._handleFetchError(error));
            }));
    }

    public setAdminPost(post: AdminPost): Observable<AdminPost> {
        return this.http.post<AdminPost>(`${BackendEndpoint}/admin/post`, post, {
            withCredentials: true
        }).pipe(
            catchError((error) => {
                return observableThrowError(this._handleFetchError(error));
            }));
    }

    public getMarkdownPreview(markdown: string): Observable<MarkdownPreview> {
        return this.http.post<MarkdownPreview>(`${BackendEndpoint}/admin/previewmarkdown`, { markdown }, {
            withCredentials: true
        }).pipe(
            catchError((error) => {
                return observableThrowError(this._handleFetchError(error));
            }));
    }

    public loginUser(email: string, password: string): Observable<void> {
        const credentials = {
            email: email,
            password: password
        };
        return this.http.put<void>(`${BackendEndpoint}/login`, credentials, { withCredentials: true });
    }

    private _handleFetchError(error: any): Errors.BaseError {
        if (error instanceof HttpErrorResponse) {
            switch (error.status) {
                case 404:
                    return new Errors.NotFoundError();
                case 401:
                    const redirectUrl = this.router.url;
                    this.router.navigate([ "/login" ], {
                        queryParams: {
                            [ RedirectQueryParamName ]: redirectUrl
                        }
                    });
                    return new Errors.UnauthorizedError();
            }
        }

        const unknownError = new Errors.OtherError(error);
        console.error(`${unknownError.errorMessage} %o`, error);
        return unknownError;
    }
}
