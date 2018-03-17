import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Params, ActivatedRoute, Router } from "@angular/router";

import { Tag, TagsBackendApi } from "../core/backend-api/tags.backend-api";
import * as Constants from "../shared/constants";

const topicQueryParamKey = "topic";

@Component({
    selector: "topics",
    templateUrl: "./topics.component.html",
    styleUrls: ["./topics.component.scss"]
})
export class TopicsComponent implements OnInit {
    public selectedTag: string;
    public tags: string[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tagsBackendApi: TagsBackendApi,
        private title: Title,
    ) { }

    public ngOnInit(): void {
        this.title.setTitle(`Topics - ${Constants.SiteName}`);

        // Subscribe to query params on this page to determine what topic
        // is passed through query params, if any
        this.route.queryParamMap.subscribe((queryParams) => {
            const topic = queryParams.get(topicQueryParamKey);
            if (topic == this.selectedTag) {
                return;
            }

            this.selectedTag = topic;

            if (!this.tags.length) {
                this.setTags([topic]);
            }
        });

        this.tagsBackendApi.getTags().subscribe((tags) => {
            this.setTags(tags.map((tag) => tag.tag));
        });
    }

    /**
     * When the selected tag changes, update the query parameters
     * to reflect this (and add a frame on the browser history stack).
     */
    public onSelectedTagChange(): void {
        let params: Params = {};
        if (this.selectedTag) {
            params[topicQueryParamKey] = this.selectedTag;
        }

        this.router.navigate([], {
            queryParams: params
        });
    }

    private setTags(tags: string[]): void {
        tags.sort((tag1, tag2) => {
            return -(tag1 < tag2) + +(tag1 > tag2);
        });
        this.tags = tags;
    }
}
