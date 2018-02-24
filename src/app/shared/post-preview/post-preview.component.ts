import { Component, Input, OnChanges } from "@angular/core";
import { Router } from "@angular/router";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";

import { PostsBackendApi, Post } from "../../core/backend-api/posts.backend-api";

interface PostForUi extends Post {
    /**
     * The uri of the preview image for the post.
     */
    previewImageUri: string;

    /**
     * The deuxmoto uri at which the post resides.
     */
    postUri: string;
}

const mergeObjects = <T, R>(obj1: T, obj2: R): T & R => {
    let mergedObject: any = obj1;
    Object.keys(obj2).forEach((obj2Key) => {
        mergedObject[obj2Key] = obj2[obj2Key];
    });
    return mergedObject;
};

@Component({
    selector: "post-preview",
    templateUrl: "./post-preview.component.html",
    styleUrls: [ "./post-preview.component.scss" ]
})
export class PostPreviewComponent implements OnChanges {
    @Input()
    public top: number;

    @Input()
    public tag: string;

    public posts: Observable<PostForUi[]>;
    public loading = true;

    constructor(
        private postsBackendApi: PostsBackendApi,
        private router: Router
    ) { }

    public ngOnChanges(): void {
        this.loading = true;
        this.posts = this.postsBackendApi.getPosts({
            top: this.top,
            tags: [this.tag]
        })
            .do(() => {
                this.loading = false;
            })
            .map((posts) => {
                return posts.map<PostForUi>((post) => {
                    // Add extra properties to post object for ui
                    return mergeObjects(post, {
                        postUri: "/posts/" + post.metadata.slug,
                        previewImageUri: "url(assets/placeholder.svg)"
                    });
                })
            });
    }
}
