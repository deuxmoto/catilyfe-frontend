import { NgModule } from "@angular/core";
import {
    MatButtonModule, MatCardModule, MatDatepickerModule,
    MatNativeDateModule, MatFormFieldModule, MatChipsModule,
    MatInputModule, MatOptionModule, MatSelectModule, MatSlideToggleModule,
    MatTableModule, MatDialogModule, MatTabsModule
} from "@angular/material";
import { Route, RouterModule } from "@angular/router";

import { AdminComponent } from "./admin.component";
import { EditPostComponent } from "./edit-post/edit-post.component";
import { DateTimePickerComponent } from "./edit-post/datetime-picker/datetime-picker.component";
import { PadTimePipe } from "./edit-post/datetime-picker/pad-time.pipe";
import { MarkdownPreviewComponent } from "./edit-post/markdown-preview/markdown-preview.component";
import { ImagePickerComponent } from "./edit-post/image-picker/image-picker.component";

import { SharedModule } from "../shared/shared.module";

const adminRoutes: Route[] = [
    {
        path: "admin",
        component: AdminComponent
    },
    {
        path: "admin/editpost/:id",
        component: EditPostComponent
    },
    {
        path: "admin/newpost",
        component: EditPostComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(adminRoutes),
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTabsModule,
        SharedModule
    ],
    declarations: [
        AdminComponent,
        DateTimePickerComponent,
        EditPostComponent,
        MarkdownPreviewComponent,
        PadTimePipe,
        ImagePickerComponent
    ],
    entryComponents: [
        ImagePickerComponent
    ]
})
export class AdminModule { }
