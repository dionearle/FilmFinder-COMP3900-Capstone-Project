import { Component, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { NgForm } from '@angular/forms';
import { PlatformLocation } from '@angular/common';

interface Rating {
  author: string;
  UserName: string;
  content: string;
  favouriteMovie: string;
}

@Component({
  templateUrl: './director-cast.component.html'
})

export class DirectorCastComponent {

  // set up initial fields for the rating
  currentRating: Rating = {
    content: '',
    UserName: '',
    author: '',
    favouriteMovie: ''
  }

  constructor(private http: HttpClient, private Activatedroute: ActivatedRoute, private router: Router, public auth: AuthenticationService, private renderer: Renderer2, private location: PlatformLocation) { }

  // Given the search terms were stored as optional query
  // parameters for this route, we can simply extract them
  // and store them in variables to use.
  name = this.Activatedroute.snapshot.queryParamMap.get('name');
  role = this.Activatedroute.snapshot.queryParamMap.get('role');
  label = this.Activatedroute.snapshot.queryParamMap.get('title');

  stars: number[] = [1, 2, 3, 4, 5];

  actor;
  id;

  associatedMovies = [];
  length;
  rating;

  userDetails;
  joinedGroups = [];

  loaded = false;

  allReviews;
  postReviewText = 'Post your Review';
  selectedFavMovie = false;

  averageRating = 0;
  movieRating;
  counter = 0;
  newRatingResults;
  success = 'false';

  // When the search page is loaded, we run this function.
  ngOnInit() {

    let params = new HttpParams();
    params = params.append('job', this.label);

    this.http.get(`/api/actorName/${this.name}`, { params: params }).subscribe((results) => {
      this.actor = results;
      this.id = this.actor._id;
      this.rating = this.actor.rating;

      this.loaded = true;

      // Then we create the div element in which the
      // movie items will be placed.
      let row = this.renderer.createElement('div');
      row.classList.add('row');

      // We then loop through all movies in the user's
      // wishlist.
      let seen = [];
      let sum = 0;
      for (let i in this.actor.movies) {

        if (seen.includes(this.actor.movies[i])) {
          continue;
        } else {
          seen.push(this.actor.movies[i]);
        }

        // For each movie, we need to fetch the movie
        // details.
        params = new HttpParams();
        params = params.append('movieId', this.actor.movies[i]);

        // We also need to pass in the user's ID if they
        // are logged in, otherwise we pass in null
        if (this.auth.isLoggedIn()) {
          params = params.append('u_id', this.auth.getUserDetails()._id);
        } else {
          params = params.append('u_id', null);
        }

        this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {

          this.associatedMovies.push({
            "id": movie._id,
            "title": movie.title
          });

          this.length = this.associatedMovies.length;

          if (movie.latest_average_rating > 0) {
            this.counter += 1;
            this.movieRating = movie.latest_average_rating;
            sum += movie.latest_average_rating;
            this.averageRating = sum / this.counter;
          }

          params = new HttpParams();
          params = params.append('id', this.id);
          this.http.post(`/api/actors/updateRating/${this.id}/${this.averageRating}`, { params: params }).subscribe((results2) => {
            this.newRatingResults = results2;
            this.rating = this.newRatingResults.rating;
            this.success = 'true';
          });

          // We create the column to place the info in.
          let col = this.renderer.createElement('div');
          col.classList.add('col');
          col.classList.add('wishlist-item');

          // For this movie item, we also want to create a link to the details page
          // if the user clicks on it.
          col.addEventListener('click', this.viewMovieDetails.bind(null, this.router, movie._id, movie.title), false);

          // First we add the movie poster.
          var img = document.createElement('img');

          // If we don't have a poster for this movie
          // stored in the database, then we simply display
          // a placeholder image.
          if (movie.poster == undefined) {
            img.src = 'https://www.atlassearchmovies.com/public/noposter.jpg';
          } else {
            img.src = movie.poster;
          }

          row.classList.add('img-fluid');
          img.height = 200;
          this.renderer.appendChild(col, img);

          // Then we add the movie title.
          var text = document.createElement('a');

          // If the length of the movie title is greater
          // than 25 characters, then we instead display
          // a substring of this title.
          if (movie.title.length > 25) {
            text.innerHTML = movie.title.substr(0, 24) + '...';
          } else {
            text.innerHTML = movie.title;
          }

          text.classList.add('nav-link');
          this.renderer.appendChild(col, text);

          // And we append this movie item to existing row of items.
          this.renderer.appendChild(row, col);
        });
      }

      // Once we have added all movies, we append this to
      // the HTML document.
      var parent = document.getElementById('associatedMovies');
      this.renderer.appendChild(parent, row);

      // call to get the reviews for the movie
      this.getAllReviews();
    });

    // display the correct message for posting a review
    if (!this.auth.isLoggedIn()) {
      this.postReviewText = 'Log in to post a review';
    } else {

      this.auth.profile().subscribe(user => {

        this.userDetails = user;

        this.getJoinedGroups(this.userDetails.groups);
      });
    }
  }

  getJoinedGroups(groupIds) {

    for (let i in groupIds) {

      // given the id of the group, retrieve the group's details from the db.
      let params = new HttpParams();
      params = params.append('id', groupIds[i]);
      this.http.get(`/api/groupById`, { params: params }).subscribe((group: any) => {
        this.joinedGroups.push(group);
      });
    }
  }

  // Allows the user to share this director/cast to a group.
  share(form: NgForm) {

    // First we check the user has selected a group and some text content.
    if (form.value.group != '' && form.value.content != '') {

        // We assign the parameters for the backend request.
        let params = new HttpParams();
        params = params.append('group', form.value.group);
        params = params.append('author', this.auth.getUserDetails()._id);
        params = params.append('text_content', form.value.content);
        params = params.append('share_type', "actor");
        params = params.append('share_content', this.id);

        // And create the shared post.
        this.http.get('/api/sendMessage', { params: params }).subscribe(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/directorCast'], { queryParams: { name: this.name, role: this.role, title: this.label } });
            });
        });
    }
}

  deleteReview(reviewId) {
    // We send a request to the backend API method.
    this.http.delete(`/api/actors/deleteReview/${this.id}/${reviewId}`).subscribe((results) => {
      this.getAllReviews();
    })
  }

  submitRating(reviewForm: NgForm) {

    // first check that the user is logged in
    if (this.auth.isLoggedIn()) {

      // check if the rating and content fields are non-empty
      this.currentRating.author = this.auth.getUserDetails()._id;
      this.currentRating.UserName = this.auth.getUserDetails().name;
      if (this.currentRating.favouriteMovie != '' && this.currentRating.content != '') {

        this.http.post(`/api/actors/addReview/${this.id}`, { userId: this.currentRating.author, UserName: this.currentRating.UserName, content: String(this.currentRating.content), best_movie: this.currentRating.favouriteMovie }).subscribe(() => {

          this.getAllReviews();
          reviewForm.reset();
        });
      }
    }
  }

  // Allows the user to share a review for this movie
  // to one of their joined groups.
  shareReview(reviewId, form: NgForm) {

    // First we check the user has selected a group and some text content.
    if (form.value.shareReviewGroup != '' && form.value.shareReviewText != '') {

      // We assign the parameters for the backend request.
      let params = new HttpParams();
      params = params.append('group', form.value.shareReviewGroup);
      params = params.append('author', this.auth.getUserDetails()._id);
      params = params.append('text_content', form.value.shareReviewText);
      params = params.append('share_type', "review");
      params = params.append('share_content', reviewId);

      // And create the shared post.
      this.http.get('/api/sendMessage', { params: params }).subscribe(() => {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/directorCast'], { queryParams: { name: this.name, role: this.role, title: this.label } });
        });
      });
    }
  }

  // Calls to get the review for the film
  getAllReviews() {

    // get the user id
    if (this.auth.isLoggedIn()) {

      this.http.get(`/api/actors/${this.id}/getReview/${this.auth.getUserDetails()._id}`).subscribe((allReviews: Array<Object>) => {

        this.allReviews = allReviews.slice().reverse();

        for (let i in this.allReviews) {

          let params = new HttpParams();
          params = params.append('movieId', this.allReviews[i].best_movie);
          params = params.append('u_id', this.auth.getUserDetails()._id);

          this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {
            this.allReviews[i].movieTitle = movie.title;
            this.allReviews[i].moviePoster = movie.poster;
          });
        }
      });

    } else {

      this.http.get(`/api/actors/${this.id}/getReview/${null}`).subscribe((allReviews: Array<Object>) => {

        this.allReviews = allReviews.slice().reverse();

        for (let i in this.allReviews) {

          let params = new HttpParams();
          params = params.append('movieId', this.allReviews[i].best_movie);
          params = params.append('u_id', null);

          this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {
            this.allReviews[i].best_movie_title = movie.title;
            this.allReviews[i].best_movie_poster = movie.poster;
          });
        }
      });
    }
  }

  visitShareItem(review) {
    this.router.navigate(['/movieDetails'], { queryParams: { id: review.best_movie, title: review.movieTitle } });
  }

  getUser(author: string) {

    // Go to the user's own profile page if this is their review
    if (this.auth.isLoggedIn() && author == this.auth.getUserDetails()._id) {

      this.router.navigateByUrl('/profile');
      // Otherwise we go to a different user's profile page
    } else {
      this.router.navigate(['/wishlist'], { queryParams: { user: author } });
    }
  }

  updateFavouriteMovie(movie: string) {
    this.currentRating.favouriteMovie = movie;
  }

  // Redirects to the details page for the given movie.
  public viewMovieDetails(router, movieId, movieTitle) {
    router.navigate(['/movieDetails'], { queryParams: { id: movieId, title: movieTitle } });
  }
}