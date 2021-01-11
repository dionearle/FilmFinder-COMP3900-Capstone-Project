import { Component } from '@angular/core';
import { AuthenticationService, TokenPayload } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  credentials: TokenPayload = {
    email: '',
    name: '',
    password: ''
  };

  registerStatus = true;

  regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  constructor(private auth: AuthenticationService, private router: Router) { }

  // Called when the user fills out the sign up form.
  register() {

    this.registerStatus = true;

    // Before attempting to sign up using these details, we
    // first check they are not empty.
    if (this.regex.test(this.credentials.email) && this.credentials.name != '' && this.credentials.password != '') {

      // If non-empty, we then use these credentials to
      // attempt to create an account for the user.
      this.auth.register(this.credentials).subscribe(() => {
        this.router.navigateByUrl('/profile');
      }, (err) => {

        // If the response was an error, then this means
        // the email was already taken, so we set
        // this variable to false and display a message
        // to the user.
        this.registerStatus = false;
      });
    }
  }
}