import {
    ModuleWithProviders, NgModule, Provider,
    Optional, SkipSelf
} from "@angular/core";

import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AdminBackendApi } from "./backend-api/admin.backend-api";
import { UserBackendApi } from "./backend-api/user.backend-api";
import { ImageBackendApi } from "./backend-api/image.backend-api";
import { PostsBackendApi } from "./backend-api/posts.backend-api";
import { TagsBackendApi } from "./backend-api/tags.backend-api";
import { BackendApiService } from "./backend-api.service";
import { OfflineInterceptor } from "./offline/offline.interceptor";
import { environment } from "../../environments/environment";

const coreProviders: Provider[] = [
    AdminBackendApi,
    UserBackendApi,
    BackendApiService,
    ImageBackendApi,
    PostsBackendApi,
    TagsBackendApi
];
if (environment.offlineRouting) {
    coreProviders.push({
        provide: HTTP_INTERCEPTORS,
        useClass: OfflineInterceptor,
        multi: true
    });
}

@NgModule({
    imports: [ CommonModule, HttpClientModule ],
    providers: coreProviders
})
export class CoreModule {

    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                "CoreModule is already loaded. Import it in the AppModule only");
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: coreProviders
        };
    }
}
