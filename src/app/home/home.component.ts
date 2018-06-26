import { Component, OnInit } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { Router } from "@angular/router";

import { fromEvent as observableFromEvent, Observable } from 'rxjs';
import { throttleTime, delay } from 'rxjs/operators';

import { BackendApiService, PostMetadata } from "../core/backend-api.service";
import * as Constants from "../shared/constants";

const scrollDebounceIntervalMs = 200;

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: [ "./home.component.scss" ]
})
export class HomeComponent implements OnInit {
    public recentPosts: Observable<PostMetadata[]>;

    public titleBarTheme: string = "transparent-light";
    public showingTitleBarBranding = false;

    constructor(
        private backend: BackendApiService,
        private router: Router,
        private title: Title,
    ) { }

    public ngOnInit(): void {
        this.title.setTitle(Constants.SiteName);
        this.recentPosts = this.backend.getRecentPostMetadata(10);

        // Listen to scroll events
        observableFromEvent(window, "scroll")
            .pipe(
                delay(scrollDebounceIntervalMs / 2),
                throttleTime(scrollDebounceIntervalMs / 2)
            )
            .subscribe(this.onScroll.bind(this));
    }

    public navigateToPost(postSlug: string): void {
        this.router.navigate([ "posts", postSlug ]);
    }

    public navigateToTag(tag: string): void {
        this.router.navigate([ "/" ]);
    }

    public onScroll(): void {
        const mostOfIntroOffscreen = window.scrollY > 400;
        this.titleBarTheme = mostOfIntroOffscreen ? "light" : "transparent-light";
        this.showingTitleBarBranding = mostOfIntroOffscreen;
    }
}
