import { Component, Inject, OnInit } from "@angular/core";
import {
    FormControl, FormGroup, Validators,
    ControlValueAccessor } from "@angular/forms";
import { MatDialogRef } from "@angular/material";

import { Image, ImageBackendApi, ImageLink } from "../../../core/backend-api/image.backend-api";

interface ExistingImage {
    imageUrl: string;
    title: string;
    description: string;
    image: Image;
    isSelected: boolean;
}

@Component({
    templateUrl: "./image-picker.component.html",
    styleUrls: ["./image-picker.component.scss"]
})
export class ImagePickerComponent implements OnInit {
    // New image fields
    public form: FormGroup;
    public file: any;

    // Existing image fields
    public existingImages: ExistingImage[];
    public selectedImage: Image;

    public isUploading = false;
    public selectedTab = 0;

    constructor(
        private dialogRef: MatDialogRef<ImagePickerComponent>,
        private imageBackendApi: ImageBackendApi
    ) {}

    public ngOnInit(): void {
        this.form = new FormGroup({
            slug: new FormControl(null, Validators.required),
            description: new FormControl(null, Validators.required)
        });

        this.imageBackendApi.getImages().subscribe((images) => {
            this.existingImages = images
                .filter((image) => {
                    return !!image.links.length;
                })
                .map<ExistingImage>((image) => {
                    let smallestLink: ImageLink;
                    image.links.forEach((link) => {
                        if (!smallestLink || link.width * link.height < smallestLink.width * smallestLink.height) {
                            smallestLink = link;
                        }
                    });

                    return {
                        imageUrl: smallestLink.url,
                        title: image.slug,
                        description: image.description,
                        image: image,
                        isSelected: false
                    };
                });
        });
    }

    public setFile(event): void {
        const files = event.target.files;
        this.file = files && files.length && files[0];
    }

    public selectImage(selectedImage: ExistingImage): void {
        // Deselect all other images
        this.existingImages.forEach((existingImage) => {
            existingImage.isSelected = false;
        });

        // Set and save selected image
        selectedImage.isSelected = true;
        this.selectedImage = selectedImage.image;
    }

    public okButtonDisabled(): boolean {
        if (this.selectedTab === 0) {
            // On new image tab
            const formValid = this.form.valid && !!this.file;
            return !formValid || this.isUploading;
        }

        // On existing image tab
        return !this.selectedImage;
    }

    public uploadAndClose(): void {
        if (this.selectedTab === 0) {
            // Uploading new image
            this.isUploading = true;
            this.imageBackendApi.putImage({
                slug: this.form.get("slug").value,
                description: this.form.get("description").value,
                file: this.file
            }).subscribe((image) => {
                this.dialogRef.close(image);
            });
        }

        // Picked existing image
        this.dialogRef.close(this.selectedImage);
    }
}
