import { Component, Inject, OnInit } from "@angular/core";
import {
    FormControl, FormGroup, Validators,
    ControlValueAccessor } from "@angular/forms";
import { MatDialogRef } from "@angular/material";

import { ImageBackendApi } from "../../../core/backend-api/image.backend-api";

@Component({
    templateUrl: "./upload-file.component.html",
    styleUrls: ["./upload-file.component.scss"]
})
export class UploadFileComponent implements OnInit {
    public form: FormGroup;
    public file: any;

    public isUploading = false;

    constructor(
        private dialogRef: MatDialogRef<UploadFileComponent>,
        private imageBackendApi: ImageBackendApi
    ) {}

    public ngOnInit(): void {
        this.form = new FormGroup({
            slug: new FormControl(null, Validators.required),
            description: new FormControl(null, Validators.required)
        });
    }

    public formValid(): boolean {
        return this.form.valid && !!this.file;
    }

    public setFile(event): void {
        const files = event.srcElement.files;
        this.file = files && files.length && files[0];
    }

    public uploadFileAndClose(): void {
        this.isUploading = true;
        this.imageBackendApi.putImage({
            slug: this.form.get("slug").value,
            description: this.form.get("description").value,
            file: this.file
        }).subscribe((image) => {
            this.dialogRef.close(image);
        });
    }
}
