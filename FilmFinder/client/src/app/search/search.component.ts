import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  templateUrl: './search.component.html'
})
export class SearchComponent {

  constructor(private http: HttpClient, private Activatedroute: ActivatedRoute, private router: Router, public auth: AuthenticationService) { }

  // Given the search terms were stored as optional query
  // parameters for this route, we can simply extract them
  // and store them in variables to use.
  title = this.Activatedroute.snapshot.queryParamMap.get('title');
  director = this.Activatedroute.snapshot.queryParamMap.get('director');
  genre = this.Activatedroute.snapshot.queryParamMap.get('genre');

  // We will store all of the search results in this variable.
  results;

  u_id;

  stars: number[] = [1, 2, 3, 4, 5];

  // When the search page is loaded, we run this function.
  ngOnInit() {

    // We take note of the user's ID (if they aren't logged
    // in this is simply null)
    if (this.auth.isLoggedIn()) {
      this.u_id = this.auth.getUserDetails()._id;
    } else {
      this.u_id = null;
    }

    // We assign the search terms as query parameters.
    // We then send a HTTP get request with these parameters.
    // Upon receiving a response, we assign the results to
    // our results variable.
    if (this.title != null) {
      this.http.get('/api/searchTitle', { params: { title: this.title, u_id: this.u_id } }).subscribe((results) => {
        this.results = results;
      });
    } else if (this.director != null) {
      this.http.get('/api/searchDirector', { params: { director: this.director, u_id: this.u_id } }).subscribe((results) => {
        this.results = results;
      });
    } else if (this.genre != null) {
      this.http.get('/api/searchGenre', { params: { genre: this.genre, u_id: this.u_id } }).subscribe((results) => {
        this.results = results;
      });
    }
  }

  public details(movieId: string, movieTitle: string) {
    // When title of movie is clicked, the string passed into details() and we navigate
    // to the details page
    this.router.navigate(['/movieDetails'], { queryParams: { id: movieId, title: movieTitle } });
  }
}