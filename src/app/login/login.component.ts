import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from "@angular/router";

import { UserBackendApi, RedirectQueryParamName} from "../core/backend-api/user.backend-api";
import * as Constants from "../shared/constants";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: [ "./login.component.scss" ]
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    private redirectUrl: string;

    constructor(
        private authBackendApi: UserBackendApi,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private title: Title,
    ) { }

    public ngOnInit() {
        this.loginForm = this.fb.group({
            email: ["", Validators.required],
            password: ["", Validators.required]
        });

        this.route.queryParams.subscribe((queryParams) => {
            this.redirectUrl = queryParams[RedirectQueryParamName];
        });

        this.title.setTitle(`Login - ${Constants.SiteName}`);
    }

    public onSubmit(): void {
        let email = this.loginForm.get("email").value;
        let password = this.loginForm.get("password").value;
        this.authBackendApi.login(email, password).subscribe(
            () => {
                let redirectUrl = this.redirectUrl ? this.redirectUrl : "";
                this.router.navigateByUrl(redirectUrl);
            },
            (error) => {
                console.error(error);
            }
        );
    }
}
