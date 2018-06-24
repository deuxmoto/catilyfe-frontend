import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

import { Observable } from "rxjs";
import { catchError, map } from 'rxjs/operators';

import * as Constants from "./constants";
import * as Errors from "./errors";

export interface AuthorInfo {
    name: string;
    userId: number;
}

export interface PostMetadata {
    title: string;
    description: string;
    id: number;
    slug: string;
    whenPublished: Date;
    tags: Array<string>;
    author: AuthorInfo;
    image: string;
}

export interface Post {
    metadata: PostMetadata;
    rawHtmlThenIGuess: string;
}

export interface FetchPostsOptions {
    /**
     * Number of posts to return.
     */
    top?: number;

    /**
     * Tags used to filter posts.
     */
    tags?: string[];
}

const parseDateObjects = (postMetadata: PostMetadata): void => {
    postMetadata.whenPublished = new Date(postMetadata.whenPublished);
};

@Injectable()
export class PostsBackendApi {
    constructor(
        private http: HttpClient
    ) { }

    public getPostMetadata(top: number): Observable<PostMetadata[]> {
        return this.http.get<PostMetadata[]>(`${Constants.Endpoint}/postmetadata?top=${top}`).pipe(
            map((postMetadata) => {
                // Convert date strings to actual dates
                postMetadata.forEach((metadata) => {
                    parseDateObjects(metadata);
                });

                return postMetadata;
            }));
    }

    public getPosts(options?: FetchPostsOptions): Observable<Post[]> {
        options = options || {};
        const top = options.top;
        const tags = options.tags;

        // Build url parameters
        let params = new HttpParams();

        if (top) {
            params = params.append("top", "" + top);
        }

        if (tags && tags.length) {
            params = tags.reduce((currentParams, currentTag) => {
                return currentTag ? params.append("tags", currentTag) : params;
            }, params);
        }

        return this.http.get<Post[]>(`${Constants.Endpoint}/post`, { params: params }).pipe(
            map((posts) => {
                posts.forEach((post) => {
                    parseDateObjects(post.metadata);
                });

                return posts;
            }));
    }

    public getPost(slug: string): Observable<Post> {
        return this.http.get<Post>(`${Constants.Endpoint}/post/${slug}`).pipe(
            map((post) => {
                parseDateObjects(post.metadata);
                return post;
            }),
            catchError((error) => {
                return Errors.parseAndThrowError(error);
            }));
    }
}
