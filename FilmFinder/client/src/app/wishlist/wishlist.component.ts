import { Component, Renderer2 } from '@angular/core';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


@Component({
  templateUrl: './wishlist.component.html'
})

export class WishlistComponent {
  details;
  profileId;

  constructor(public auth: AuthenticationService, private Activatedroute: ActivatedRoute, private http: HttpClient, private renderer: Renderer2, private router: Router) { }

  banlistText = 'Add to BanList';
  inBanlist = false;

  ngOnInit() {

    // The id of the user we are viewing.
    this.profileId = this.Activatedroute.snapshot.queryParamMap.get('user');

    // We first get the details of this user
    let params = new HttpParams();
    params = params.append('userId', this.profileId);
    this.http.get('/api/profile/getDetails', { params: params }).subscribe(user => {
      this.details = user;
    });

    // We then get and display the wishlist of this user.
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

    // If this user is logged in, we also determine
    // whether this user is in their banlist.
    if (this.auth.isLoggedIn()) {

      params = new HttpParams();
      params = params.append('userId', this.auth.getUserDetails()._id);
      this.http.get('/api/banList', { params: params }).subscribe((banlist: string[]) => {

        if (banlist.includes(this.profileId)) {
          this.inBanlist = true;
          this.banlistText = 'Remove from Banlist';
        }
      });
    }
  }

  // Redirects to the details page for the given movie.
  public viewMovieDetails(router, movieId, movieTitle) {
    router.navigate(['/movieDetails'], { queryParams: { id: movieId, title: movieTitle } });
  }

  banlist() {

    // We first setup the parameters for the API call.
    let ban_id = this.Activatedroute.snapshot.queryParamMap.get('user');
    let user_id = this.auth.getUserDetails()._id;

    // Add if not in banlist
    if (!this.inBanlist) {
      this.http.post('/api/profile/addbanList', { u_id: user_id, ban_id: ban_id }).subscribe((results) => {
        this.banlistText = 'Remove from Banlist';
      });
      // Otherwise we want to remove it from the banlist
    } else {
      let params = new HttpParams();
      params = params.append('ban_id', ban_id);
      params = params.append('u_id', user_id);
      this.http.delete('/api/profile/removeBanList', { params: params }).subscribe((results) => {
        this.banlistText = 'Add to BanList';
      });
    }

    // Finally we change the colour of the button.
    this.inBanlist = !this.inBanlist;
  }
}














