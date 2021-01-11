import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  movieDetails = {
    plot: '',
    genres: '',
    runtime: '',
    cast: '',
    poster: '',
    title: '',
    released: '',
    directors: '',
    year: ''
  };

  // Used to keep track of whether the attempt to add a movie
  // was successful.
  addMovieStatus = '';

  constructor(private http: HttpClient, private router: Router) { }

  // Called when the admin submits the form to add a movie.
  addMovie() {

    // Since the user submits the release date for the movie,
    // we can extract the year from this
    this.movieDetails.year = this.movieDetails.released.slice(0, 4);

    // Before attempting to add the movie, we first check all
    // of the fields are non-empty.
    if (this.movieDetails.plot != ''
      && this.movieDetails.genres != ''
      && this.movieDetails.runtime != ''
      && this.movieDetails.cast != ''
      && this.movieDetails.poster != ''
      && this.movieDetails.title != ''
      && this.movieDetails.released != ''
      && this.movieDetails.directors != ''
      && this.movieDetails.year != '') {

      // If non-empty, we then use this information to
      // attempt to add the movie to the database.
      this.http.post('/api/movies', {
        plot: this.movieDetails.plot,
        genres: this.movieDetails.genres,
        runtime: this.movieDetails.runtime,
        cast: this.movieDetails.cast,
        poster: this.movieDetails.poster,
        title: this.movieDetails.title,
        released: this.movieDetails.released,
        directors: this.movieDetails.directors,
        year: this.movieDetails.year,
      }).subscribe((result : any) => {

        let castMembers = this.movieDetails.cast.split(',');

        for (let i in castMembers) {

          this.http.post('/api/actors/createActorForMovie', {
            actorName: castMembers[i],
            job: 'cast',
            movieId: result._id
          }).subscribe(() => {});
        }

        let directors = this.movieDetails.directors.split(',');

        for (let i in directors) {

          this.http.post('/api/actors/createActorForMovie', {
            actorName: directors[i],
            job: 'director',
            movieId: result._id
          }).subscribe(() => {});
        }

        // If successful, we display an alert to the
        // user before redirecting to the home page.
        this.addMovieStatus = 'success';
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 1500);

      }, (err) => {

        // Otherwise we display an error alert.
        this.addMovieStatus = 'fail';
      });
    }
  }
} 