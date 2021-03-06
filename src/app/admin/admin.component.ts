import { Component, HostBinding, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from '@angular/platform-browser';
import { DataSource } from "@angular/cdk/collections";
import { MatSort } from "@angular/material";

import { Observable, Subject } from "rxjs";

import { BackendApiService, AdminPostMetadata } from "../core/backend-api.service";
import * as Constants from "../shared/constants";

@Component({
    selector: "app-admin",
    templateUrl: "./admin.component.html",
    styleUrls: [ "./admin.component.scss" ]
})
export class AdminComponent implements OnInit {
    public dataSource: AdminPostMetadataDatasource;
    public displayedColumns = [
        "postId",
        "postSlug",
        "postTitle",
        "postWhenCreated"
    ];

    constructor(
        private backend: BackendApiService,
        private route: ActivatedRoute,
        private router: Router,
        private title: Title,
    ) { }

    public ngOnInit(): void {
        this.dataSource = new AdminPostMetadataDatasource(this.backend);
        this.title.setTitle(`Admin - ${Constants.SiteName}`);
    }

    public editPost(id: string): void {
        this.router.navigate(["editpost", id], { relativeTo: this.route });
    }
}

export class AdminPostMetadataDatasource extends DataSource<AdminPostMetadata> {
    private adminPostMetadata = new Subject<AdminPostMetadata[]>();

    constructor(
        private backend: BackendApiService
    ) {
        super();
    }

    public connect(): Observable<AdminPostMetadata[]> {
        this.refresh();
        return this.adminPostMetadata.asObservable();
    }

    public disconnect(): void { }

    public refresh(): void {
        this.backend.getAdminPostMetadata()
            .subscribe((adminPostMetadata) => {
                this.adminPostMetadata.next(adminPostMetadata);
            });
    }
}
