import { Component } from '@angular/core';
import { AuthenticationService, TokenPayload } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html'
})
export class LoginComponent {
  credentials: TokenPayload = {
    email: '',
    password: ''
  };

  loginStatus = true;

  constructor(private auth: AuthenticationService, private router: Router) { }

  // Called when the user fills out the login form.
  login() {

    this.loginStatus = true;

    // Before attempting to log the user in, we first check the
    // email and password are not empty.
    if (this.credentials.email != '' && this.credentials.password != '') {

      // If non-empty, we then use these credentials to
      // attempt to log the user in.
      this.auth.login(this.credentials).subscribe(() => {
        this.router.navigateByUrl('/profile');
      }, (err) => {

        // If the response was an error, then this means
        // the login details were incorrect, so we set
        // this variable to false and display a message
        // to the user.
        this.loginStatus = false;
      });
    }
  }
}