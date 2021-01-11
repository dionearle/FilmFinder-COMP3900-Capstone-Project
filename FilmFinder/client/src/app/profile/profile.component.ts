import { Component, Renderer2 } from '@angular/core';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  details: UserDetails;
  userReviews;
  stars: number[] = [1, 2, 3, 4, 5];
  reviewMovies;

  constructor(private auth: AuthenticationService, private http: HttpClient, private renderer: Renderer2, private router: Router) { }

  joinedGroups = [];

  ngOnInit() {

    // We first grab the user's details.
    this.auth.profile().subscribe(user => {

      this.details = user;

      this.getJoinedGroups(this.details.groups);

      // We also want to retreive this user's wishlist.
      let params = new HttpParams();
      params = params.append('userId', this.auth.getUserDetails()._id);
      this.http.get('/api/getWishlist', { params: params }).subscribe((wishlist: string[]) => {

        // Then we create the div element in which the
        // movie items will be placed.
        let row = this.renderer.createElement('div');
        row.classList.add('row');

        // We then loop through all movies in the user's
        // wishlist.
        for (let i in wishlist) {

          // For each movie, we need to fetch the movie
          // details.
          params = new HttpParams();
          params = params.append('movieId', wishlist[i]);

          // We also need to pass in the user's ID if they
          // are logged in, otherwise we pass in null
          if (this.auth.isLoggedIn()) {
            params = params.append('u_id', this.auth.getUserDetails()._id);
          } else {
            params = params.append('u_id', null);
          }

          this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {

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
              img.src = '../assets/noposter.jpg';
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
        var parent = document.getElementById('wishlist');
        this.renderer.appendChild(parent, row);
      });

      // Next we need to retrieve the banlist for this user.
      params = new HttpParams();
      params = params.append('userId', this.auth.getUserDetails()._id);
      this.http.get('/api/banList', { params: params }).subscribe((banlist: string[]) => {

        // Then we create the div element in which the
        // movie items will be placed.
        let row = this.renderer.createElement('div');
        row.classList.add('row');

        // We then loop through all movies in the user's
        // banlist.
        for (let i in banlist) {

          // For each movie, we need to fetch the movie
          // details.
          params = new HttpParams();
          params = params.append('u_id', banlist[i]);
          this.http.get('/api/name', { params: params }).subscribe((name_user: string) => {

            let col = this.renderer.createElement('div');
            col.classList.add('col');
            col.classList.add('banlist-user');

            // For this banned user, we also want to create a link to their profile page
            // if the user clicks on it.
            col.addEventListener('click', this.viewBannedUser.bind(null, this.router, banlist[i]));

            // Then we add the movie title.
            var text = document.createElement('a');
            // Not sure how to display their name
            text.innerHTML = name_user;
            text.classList.add('nav-link');
            this.renderer.appendChild(col, text);

            // And we append this movie item to existing row of items.
            this.renderer.appendChild(row, col);
          });
        }

        var parent = document.getElementById('banlist');
        this.renderer.appendChild(parent, row);
      });
    }, (err) => {
    });

    // Get the reviews for movies written by the user
    let reviewParams = new HttpParams();
    reviewParams = reviewParams.append('author', this.auth.getUserDetails()._id);
    this.http.get('/api/searchReviews', { params: reviewParams }).subscribe((results: Array<Object>) => {

      this.userReviews = results.slice();

      // create a div element to place the reviews
      let row = this.renderer.createElement('div');
      row.classList.add('row');

      for (let m in this.userReviews) {

        // then call to movie details and store the result somewhere
        let params = new HttpParams();
        params = params.append('movieId', this.userReviews[m].movies);

        // We also need to pass in the user's ID if they
        // are logged in, otherwise we pass in null
        if (this.auth.isLoggedIn()) {
          params = params.append('u_id', this.auth.getUserDetails()._id);
        } else {
          params = params.append('u_id', null);
        }

        this.http.get('/api/movieDetails', { params: params }).subscribe((movieResults: any) => {

          // We create the column to place the info in.
          let col = this.renderer.createElement('div');
          col.classList.add('col');
          col.classList.add('wishlist-item');

          // add a listener to be able to navigate to movie details 
          col.addEventListener('click', this.viewMovieDetails.bind(null, this.router, movieResults._id, movieResults.title), false);

          // First we add the movie poster.
          var img = document.createElement('img');

          // If we don't have a poster for this movie
          // stored in the database, then we simply display
          // a placeholder image.
          if (movieResults.poster == undefined) {
            img.src = '../assets/noposter.jpg';
          } else {
            img.src = movieResults.poster;
          }

          row.classList.add('img-fluid');
          img.height = 200;
          this.renderer.appendChild(col, img);

          // Then we add the movie title.
          var text = document.createElement('a');

          // If the length of the movie title is greater
          // than 25 characters, then we instead display
          // a substring of this title.
          if (movieResults.title.length > 25) {
            text.innerHTML = movieResults.title.substr(0, 24) + '...';
          } else {
            text.innerHTML = movieResults.title;
          }

          text.classList.add('nav-link');
          this.renderer.appendChild(col, text);

          // add the star rating
          var starRating = document.createElement('ul');
          starRating.className = "list-inline showRatings"

          for (let i = (this.userReviews[m].rating + 1); i <= 5; i++) {

            var unselectedStar = document.createElement('li');

            unselectedStar.className = "fa fa-star";

            starRating.appendChild(unselectedStar);
          }
          for (let i = 1; i <= this.userReviews[m].rating; i++) {

            var selectedStar = document.createElement('li');

            selectedStar.className = "selected fa fa-star";

            starRating.appendChild(selectedStar);
          }

          this.renderer.appendChild(col, starRating);
          var addBreak = document.createElement('br');
          this.renderer.appendChild(col, addBreak);

          // add the review for the movie
          // only add the content if the review was not a star rating
          if (this.userReviews[m].content != 'Star rating only') {

            var reviewContent = document.createElement('a');

            reviewContent.textContent = this.userReviews[m].content;

            this.renderer.appendChild(col, reviewContent);
          }

          // And we append this movie item to existing row of items.
          this.renderer.appendChild(row, col);
        });

      }
      // Once we have added all movies, we append this to
      // the HTML document.
      var parent = document.getElementById('allReviews');
      this.renderer.appendChild(parent, row);
    });
  }

  public getJoinedGroups(groupIds) {

    for (let i in groupIds) {

      let params = new HttpParams();
      params = params.append('id', groupIds[i]);

      // given the id of the group, retrieve the group's details from the db
      this.http.get(`/api/groupById`, { params: params }).subscribe((group: any) => {
        this.joinedGroups.push(group);
      });
    }
  }

  public viewGroup(name) {
    this.router.navigate(['/groupPage'], { queryParams: { name: name } });
  }

  // Redirects to the details page for the given movie.
  public viewMovieDetails(router, movieId, movieTitle) {
    router.navigate(['/movieDetails'], { queryParams: { id: movieId, title: movieTitle } });
  }

  // Redirects to the profile page for the given user.
  public viewBannedUser(router, bannedUser) {
    router.navigate(['/wishlist'], { queryParams: { user: bannedUser } });
  }

}

