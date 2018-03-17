import { Meta, Title } from '@angular/platform-browser';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { NotFoundError } from "../core/backend-api/errors";
import { UserBackendApi, isUserAdmin } from "../core/backend-api/user.backend-api";
import { Post, PostsBackendApi } from "../core/backend-api/posts.backend-api";
import * as Constants from "../shared/constants";

type State = "normal" | "loading";

@Component({
    selector: "app-post",
    templateUrl: "./post.component.html",
    styleUrls: [ "./post.component.scss" ]
})
export class PostComponent implements OnInit, OnDestroy {
    public state: State = "loading";
    public post: Post;

    public isUserAdmin: boolean;

    private metaTagNames: string[] = [];

    constructor(
        private authBackend: UserBackendApi,
        private postsBackend: PostsBackendApi,
        private route: ActivatedRoute,
        private router: Router,
        private meta: Meta,
        private title: Title
    ) { }

    public get postHtml(): string {
        return this.post && this.post.rawHtmlThenIGuess;
    }

    public get editPostUrl(): string {
        const postId = this.post && this.post.metadata.id;
        return postId && `/admin/editpost/${postId}`;
    }

    public ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            this.state = "loading";

            const slug = paramMap.get("slug");
            this.postsBackend.getPost(slug).subscribe(
                (post) => {
                    this.post = post;
                    this.state = "normal";

                    this.title.setTitle(`${this.post.metadata.title} - ${Constants.SiteName}`);

                    // All all of the meta tags to the head
                    this.addMetaTags([
                        // Normal
                        { name: "title", content: this.post.metadata.title },
                        { name: "author", content: this.post.metadata.author.name },
                        { name: "description", content: this.post.metadata.description },
                        { name: "keywords", content: this.post.metadata.tags.join(",")},

                        // Facebooks garbage. Can remove if/when they go under.
                        { name: "og:title", content: this.post.metadata.title },
                        { name: "og:type", content: "article" },
                        { name: "og:url", content: `https://${window.location.hostname}/posts/${this.post.metadata.slug}` },
                        { name: "og:description", content: this.post.metadata.description },
                        { name: "og:site_name", content: Constants.SiteName },
                        { name: "article:tag", content: this.post.metadata.tags.join(",")},
                        { name: "article:published_time", content: this.post.metadata.whenPublished.toISOString()},
                    ]);
                },
                (error) => {
                    if (error instanceof NotFoundError) {
                        this.router.navigateByUrl("notfound", { skipLocationChange: true });
                    }
                    else {
                        console.error(
                            `Unrecognized error:\n`
                            + JSON.stringify(error)
                        );
                    }
                }
            );
        });

        this.authBackend.getLoggedInUser().subscribe((user) => {
            this.isUserAdmin = isUserAdmin(user);
        });
    }

    public ngOnDestroy(): void {
        this.metaTagNames.forEach((tagName) => {
            this.meta.removeTag(`name='${tagName}'`);
        });
    }

    private addMetaTags(tags: {name: string; content: string;}[]): void {
        this.meta.addTags(tags);
        tags.forEach((tag) => {
            this.metaTagNames.push(tag.name);
        });
    }
}
