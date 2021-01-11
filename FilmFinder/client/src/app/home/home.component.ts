import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent {

  constructor(public auth: AuthenticationService, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  // The movie, director or genre queries are stored here
  // from the search form on the home page.
  title: string
  director: string
  name: string

  // When the the search form is submitted, this function
  // is ran.
  searchTitle() {
    // We redirect to the 'search' route, and pass it the
    // optional query parameters.
    this.router.navigate(['/search'], { queryParams: { title: this.title } });
  }

  searchDirector() {
    this.router.navigate(['/search'], { queryParams: { director: this.director } });
  }

  searchGenre(genre) {
    this.router.navigate(['/search'], { queryParams: { genre: genre } });
  }

  searchGroup() {
    this.router.navigate(['/searchGroup'], { queryParams: { name: this.name } })
  }
}


