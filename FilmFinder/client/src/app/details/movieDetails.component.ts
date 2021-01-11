import { Component, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthenticationService } from '../authentication.service';
import { NgForm } from '@angular/forms';
import { PlatformLocation } from '@angular/common';

interface Rating {
    author: string;
    UserName: string;
    content: string;
    rating: number;
    movies: string;
}

class Member {
    name: string;
    rating: number;

    constructor(name: string, rating: number) {
        this.name = name;
        this.rating = rating;
    }
    updateRating(rating: number): void {
        this.rating = rating;
    }
}

@Component({
    templateUrl: './movieDetails.component.html'
})

export class MovieDetailsComponent {

    // set up initial fields for the rating
    currentRating: Rating = {
        content: '',
        rating: null,
        UserName: '',
        author: '',
        movies: ''
    }

    constructor(private http: HttpClient, private Activatedroute: ActivatedRoute, public auth: AuthenticationService, private router: Router, private renderer: Renderer2, private location: PlatformLocation) { }

    movieId = this.Activatedroute.snapshot.queryParamMap.get('id');
    movieTitle = this.Activatedroute.snapshot.queryParamMap.get('title');

    // Used to ensure the page doesn't try to load movie 
    // data before it has been retrieved.
    loaded = false;

    // Stores all of the information for the current movie.
    movieInfo;

    // Used to control how the add/remove from wishlist
    // button appears.
    inWishlist = false;
    wishlistText = 'Add to Wishlist';

    // Used to display a success message if an admin
    // deletes the movie.
    deletedMovie = false;
    deletedReview = false;
    title = this.Activatedroute.snapshot.queryParamMap.get('title');

    postReviewText = 'Post your Review';

    allReviews;

    user_id;

    stars: number[] = [1, 2, 3, 4, 5];
    tmpStars = 0;

    directors;
    allcast;
    genres;

    job1 = "Cast Member";
    label1 = "cast";

    job2 = "Director";
    label2 = "director";

    userDetails;
    joinedGroups = [];

    shareContent = '';
    shareSelectedGroup = '';
    tempname = '';
    temprating = 0;
    Info;
    DirectorsArray = [];
    CastArray = [];

    ngOnInit() {

        // We first add the movie's ID as a parameter.
        let params = new HttpParams();
        params = params.append('movieId', this.movieId);

        // We also need to pass in the user's ID if they
        // are logged in, otherwise we pass in null
        if (this.auth.isLoggedIn()) {
            params = params.append('u_id', this.auth.getUserDetails()._id);
        } else {
            params = params.append('u_id', null);
        }

        // Given the movie ID and user ID, we retreive all 
        // of the movie's details from the database.
        this.http.get('/api/movieDetails', { params: params }).subscribe((results) => {

            this.movieInfo = results;
            this.directors = this.movieInfo.directors;
            this.allcast = this.movieInfo.cast;
            this.genres = this.movieInfo.genres;
            this.loaded = true;

            this.getRecommendations();

            // call to get the reviews for the movie
            this.getAllReviews();

            // If this user is logged in, we also determine
            // whether this movie is in their wishlist.
            if (this.auth.isLoggedIn()) {

                // We first need to retreive this user's wishlist.
                // Note we can't simply retreive the info from the getUserDetails
                // method as this only stores the wishlist at the time
                // the user logged in.
                params = new HttpParams();
                params = params.append('userId', this.auth.getUserDetails()._id);
                this.http.get('/api/getWishlist', { params: params }).subscribe((wishlistResult: string[]) => {

                    // If the movie ID is found in the wishlist,
                    // we change the appearance of the add/remove
                    // from wishlist button.
                    let wishlist = wishlistResult;
                    if (wishlist.includes(this.movieId)) {
                        this.inWishlist = true;
                        this.wishlistText = 'Remove from Wishlist';
                    }
                });

                // Finally we get all of the groups this user has joined.
                this.auth.profile().subscribe(user => {
                    this.userDetails = user;
              
                    this.getJoinedGroups(this.userDetails.groups);
                });

            } else {
                this.postReviewText = 'Log in to post a review';
            }

            this.updateDirectorRatings();

            this.updateCastRatings();
        });
    }

    // For each group the user has joined, we retrieve the information for it.
    getJoinedGroups(groupIds) {
        for (let i in groupIds) {

            let params = new HttpParams();
            params = params.append('id', groupIds[i]);

            // given the id of the group, retrieve the group's details from the db
            this.http.get(`/api/groupById`, { params: params }).subscribe((group: any) => {
                this.joinedGroups.push(group);
            });
        }
    }

    // Allows the user to share this movie to a group.
    share(form: NgForm) {

        // First we check the user has selected a group and some text content.
        if (form.value.group != '' && form.value.content != '') {

            // We assign the parameters for the backend request.
            let params = new HttpParams();
            params = params.append('group', form.value.group);
            params = params.append('author', this.auth.getUserDetails()._id);
            params = params.append('text_content', form.value.content);
            params = params.append('share_type', "movie");
            params = params.append('share_content', this.movieId);

            // And create the shared post.
            this.http.get('/api/sendMessage', { params: params }).subscribe(() => {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/movieDetails'], { queryParams: { id: this.movieId, title: this.movieTitle } });
                });
            });
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
                    this.router.navigate(['/movieDetails'], { queryParams: { id: this.movieId, title: this.movieTitle } });
                });
            });
        }
    }

    // Called when the add/remove from wishlist button is clicked.
    wishlist() {

        // We first setup the parameters for the API call.
        let params = new HttpParams();
        params = params.append('movieId', this.movieId);
        params = params.append('userId', this.auth.getUserDetails()._id);

        // If the movie isn't in the wishlist, then we want to add it.
        if (!this.inWishlist) {
            this.http.get('/api/addWishlist', { params: params }).subscribe((results) => {
                this.wishlistText = 'Remove from Wishlist';
            });
            // Otherwise we want to remove it from the wishlist.
        } else {
            this.http.get('/api/removeWishlist', { params: params }).subscribe((results) => {
                this.wishlistText = 'Add to Wishlist';
            });
        }

        // Finally we change the colour of the button.
        this.inWishlist = !this.inWishlist;
    }

    // Called if a user attempts to delete the current movie.
    deleteMovie() {

        // We send a request to the backend API method.
        this.http.delete(`/api/movies/${this.movieId}`).subscribe((results) => {

            // If successful, we display an alert to the
            // user before redirecting to the homepage.
            this.deletedMovie = true;
            setTimeout(() => {
                this.router.navigateByUrl('/');
            }, 1500);
        })
    }

    // Called if an admin attempts to delete a review for this movie.
    deleteReview(reviewId) {

        // We send a request to the backend API method.
        this.http.delete(`/api/movies/${this.movieId}/deleteReview/${reviewId}`).subscribe((results) => {

            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/movieDetails'], { queryParams: { id: this.movieId, title: this.movieTitle } });
            });
        });
    }

    // Called when a user attempts to post a review
    submitRating(reviewForm: NgForm) {

        // first check that the user is logged in
        if (this.auth.isLoggedIn()) {

            // check if the rating and content fields are non-empty
            if (!this.empty()) {

                // obtain the id of the user and fill out the fields of the rating
                this.currentRating.author = this.auth.getUserDetails()._id;
                this.currentRating.UserName = this.auth.getUserDetails().name;
                this.currentRating.movies = this.movieInfo._id;

                if (this.currentRating.content == '') {
                    this.currentRating.content = 'Star rating only';
                }

                // use these rating details to add a review 
                this.http.post(`/api/movies/${this.movieId}/addReview`, this.currentRating).subscribe(() => { // if the post was successful

                    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['/movieDetails'], { queryParams: { id: this.movieId, title: this.movieTitle } });
                    });
                }
                )
            }
        }
    }

    // Updates the latest average ratings for all directors for this movie.
    async updateDirectorRatings() {

        let counters = [];
        let averageRatings = [];

        for (let i in this.movieInfo.directors) {

            counters[i] = 0;
            averageRatings[i] = 0;

            let params = new HttpParams();
            params = params.append('job', 'director');
            this.http.get(`/api/actorName/${this.movieInfo.directors[i]}`, { params: params }).subscribe(async (actor: any) => {

                let seen = [];
                let sum = 0;
                for (let j in actor.movies) {

                    await new Promise(resolve => {

                        if (seen.includes(actor.movies[j])) {
                            resolve();
                        } else {
                            seen.push(actor.movies[j]);
                        }

                        params = new HttpParams();
                        params = params.append('movieId', actor.movies[j]);

                        // We also need to pass in the user's ID if they
                        // are logged in, otherwise we pass in null
                        if (this.auth.isLoggedIn()) {
                            params = params.append('u_id', this.auth.getUserDetails()._id);
                        } else {
                            params = params.append('u_id', null);
                        }

                        this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {
                            if (movie.latest_average_rating > 0) {
                                counters[i] += 1;
                                sum += movie.latest_average_rating;
                                averageRatings[i] = sum / counters[i];
                            }
                            resolve();
                        });
                    });
                }

                params = new HttpParams();
                params = params.append('id', actor._id);

                this.http.post(`/api/actors/updateRating/${actor._id}/${averageRatings[i]}`, { params: params }).subscribe((results: any) => {
                    this.DirectorsArray.push(new Member(this.movieInfo.directors[i], averageRatings[i]));
                });

            });
        }
    }

    // Updates the latest average ratings for all cast members of this movie.
    async updateCastRatings() {

        let counters = [];
        let averageRatings = [];

        for (let i in this.movieInfo.cast) {

            counters[i] = 0;
            averageRatings[i] = 0;

            let params = new HttpParams();
            params = params.append('job', 'cast');
            this.http.get(`/api/actorName/${this.movieInfo.cast[i]}`, { params: params }).subscribe(async (actor: any) => {

                let seen = [];
                let sum = 0;
                for (let j in actor.movies) {

                    await new Promise(resolve => {

                        if (seen.includes(actor.movies[j])) {
                            resolve();
                        } else {
                            seen.push(actor.movies[j]);
                        }

                        params = new HttpParams();
                        params = params.append('movieId', actor.movies[j]);

                        // We also need to pass in the user's ID if they
                        // are logged in, otherwise we pass in null
                        if (this.auth.isLoggedIn()) {
                            params = params.append('u_id', this.auth.getUserDetails()._id);
                        } else {
                            params = params.append('u_id', null);
                        }

                        this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {
                            if (movie.latest_average_rating > 0) {
                                counters[i] += 1;
                                sum += movie.latest_average_rating;
                                averageRatings[i] = sum / counters[i];
                            }
                            resolve();
                        });
                    });
                }

                params = new HttpParams();
                params = params.append('id', actor._id);

                this.http.post(`/api/actors/updateRating/${actor._id}/${averageRatings[i]}`, { params: params }).subscribe((results: any) => {
                    this.CastArray.push(new Member(this.movieInfo.cast[i], averageRatings[i]));
                });

            });
        }
    }

    empty(): boolean {
        if (this.currentRating.rating != null) {
            return false;
        }
        return true;
    }

    checkContent(reviewContent: string): boolean {
        if (reviewContent != 'Star rating only') {
            return true;
        }
        return false;
    }

    // Calls to get the review for the film.
    getAllReviews() {

        if (this.auth.isLoggedIn()) {
            
            this.http.get(`/api/movies/${this.movieId}/review/${this.auth.getUserDetails()._id}`).subscribe((allReviews: Array<Object>) => {
                this.allReviews = allReviews.slice().reverse();
            });

        } else {

            this.http.get(`/api/movies/${this.movieId}/review/${null}`).subscribe((allReviews: Array<Object>) => {
                this.allReviews = allReviews.slice().reverse();
            });
        }
    }

    // Called when the user clicks on the name of a user who left a review.
    getUser(author: string) {

        // Go to the user's own profile page if this is their review
        if (this.auth.isLoggedIn() && author == this.auth.getUserDetails()._id) {

            this.router.navigateByUrl('/profile');

        // Otherwise we go to a different user's profile page
        } else {
            this.router.navigate(['/wishlist'], { queryParams: { user: author } });
        }
    }

    // Gets movie recommendations based on the movie for this page.
    getRecommendations() {

        // We first setup the parameters for the API call.
        let params = new HttpParams();
        params = params.append('genres', this.movieInfo.genres);
        params = params.append('directors', this.movieInfo.directors);
        params = params.append('cast', this.movieInfo.cast);
        params = params.append('movieId', this.movieId);

        if (this.auth.isLoggedIn()) {
            params = params.append('u_id', this.auth.getUserDetails()._id);
        } else {
            params = params.append('u_id', null);
        }

        this.http.get('/api/recommendations', { params: params }).subscribe((recommendations) => {

            // Then we create the div element in which the
            // movie items will be placed.
            let row = this.renderer.createElement('div');
            row.classList.add('row');

            // We then loop through all movies in the user's
            // wishlist.
            for (let i in recommendations) {

                let movie = recommendations[i];

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
            }

            // Once we have added all movies, we append this to
            // the HTML document.
            var parent = document.getElementById('recommendations');
            this.renderer.appendChild(parent, row);
        });
    }

    // Redirects to the details page for the given movie.
    public viewMovieDetails(router, movieId, movieTitle) {

        router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            router.navigate(['/movieDetails'], { queryParams: { id: movieId, title: movieTitle } });
        });
    }

    recordStars(star: number) {
        this.currentRating.rating = star;
    }

    public details(person: string, job: string, label: string) {
        // When title of movie is clicked, the string passed into details() and we navigate
        // to the details page
        this.router.navigate(['/directorCast'], { queryParams: { name: person, role: job, title: label } });
    }

    searchGenre(genre) {
        this.router.navigate(['/search'], { queryParams: { genre: genre } });
    }
}

