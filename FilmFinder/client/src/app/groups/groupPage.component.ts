import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: './groupPage.component.html'
})

export class GroupPageComponent {

    constructor(private http: HttpClient, private Activatedroute: ActivatedRoute, public auth: AuthenticationService, private router: Router) { }

    // store the parameters
    groupName = this.Activatedroute.snapshot.queryParamMap.get('name');

    groupInformation;
    loaded = false;

    joinGroupText = "Join Group";
    inGroup = false;

    groupMembers = [];
    groupPosts = [];

    postContent = '';
    replyContent = '';

    stars: number[] = [1, 2, 3, 4, 5];

    ngOnInit() {
        // need to display the details of the group
        let params = new HttpParams();
        params = params.append('name', this.groupName);

        // given the name of the group, retrieve the group's details from the db
        this.http.get(`/api/groupDetails`, { params: params }).subscribe((results) => {
            this.groupInformation = results;
            if (this.auth.isLoggedIn() && this.groupInformation.members.includes(this.auth.getUserDetails()._id)) {
                this.inGroup = true;
                this.joinGroupText = 'Leave Group';
            }

            this.loaded = true;

            // For each member, we also want to retrieve
            // their username so it can be displayed.
            for (let i in this.groupInformation.members) {
                let id = this.groupInformation.members[i];
                params = new HttpParams();
                params = params.append('u_id', id);
                this.http.get('/api/name', { params: params }).subscribe((name) => {
                    this.groupMembers.push({
                        "id": id,
                        "name": name
                    });
                });
            }

            // Next we retrieve all of the posts made
            // in this group.
            params = new HttpParams();
            params = params.append('group', this.groupInformation._id);
            this.http.get('/api/getPostsFromGroup', { params: params }).subscribe((posts: any) => {

                // We order the posts in order of creation date.
                posts = posts.slice().reverse();

                // We determine whether the current user has
                // liked any of the posts.
                for (let i in posts) {
                    posts[i].liked = 'Like';
                    if (posts[i].reactList.includes(this.auth.getUserDetails()._id)) {
                        posts[i].liked = 'Unlike';
                    }
                }

                let replies = [];

                // For each post in this group, we determine whether
                // it is a parent post or a reply, and add it to the
                // appropriate array. For parent posts
                // we also get the author's name now.
                let parentCounter = 0;
                for (let i in posts) {

                    if (posts[i].reply_on == null) {
                        this.groupPosts.push(posts[i]);
                        this.getPostAuthor(parentCounter);
                        parentCounter++;
                    } else {
                        replies.push(posts[i]);
                    }
                }

                // Now for each parent post, we try and 
                // find any replies.
                for (let i in this.groupPosts) {

                    // While we're looping through the parent
                    // posts, we also check whether any are
                    // shared posts, and if so we need to 
                    // display some extra content.
                    if (this.groupPosts[i].share_type != null) {
                        this.showShareContent(i);
                    }

                    let replyCounter = 0;
                    for (let j in replies) {
                        if (this.groupPosts[i]._id == replies[j].reply_on) {
                            if (this.groupPosts[i].replies == undefined) {
                                this.groupPosts[i].replies = [];
                            }
                            this.groupPosts[i].replies.push(replies[j]);
                            this.getPostReplyAuthor(i, replyCounter);
                            replyCounter++;
                        }
                    }
                }

                // Finally we sort the replies for each parent post
                // in reverse order, so the most recent reply is
                // shown last.
                for (let i in this.groupPosts) {
                    if (this.groupPosts[i].replies != undefined) {
                        this.groupPosts[i].replies = this.groupPosts[i].replies.slice().reverse();
                    }
                }
            });
        });
    }

    // If the post has shared content, we need to display this
    showShareContent(index) {

        // If it's a movie:
        if (this.groupPosts[index].share_type == 'movie') {

            let params = new HttpParams();
            params = params.append('movieId', this.groupPosts[index].shared_content_movie);
            params = params.append('u_id', this.auth.getUserDetails()._id);

            this.http.get('/api/movieDetails', { params: params }).subscribe((movie: any) => {
                this.groupPosts[index].moviePoster = movie.poster;
                this.groupPosts[index].movieTitle = movie.title;
                this.groupPosts[index].displayShare = 'movie';
            });
            // If it's a review
        } else if (this.groupPosts[index].share_type == 'review') {

            this.http.get(`/api/getActorReview/${this.groupPosts[index].shared_content_review}`).subscribe((review: any) => {

                this.groupPosts[index].reviewType = 'actor';
                this.groupPosts[index].reviewText = review.content;
                this.groupPosts[index].reviewUserName = review.UserName;
                this.groupPosts[index].reviewAuthor = review.author;
                this.groupPosts[index].reviewActor = review.actor;
                this.groupPosts[index].displayShare = 'review';

                this.http.get(`/api/actors/${review.actor}`).subscribe((actor: any) => {
                    this.groupPosts[index].reviewActorName = actor.name;
                });

                this.http.get(`/api/movies/${review.best_movie}`).subscribe((movie: any) => {
                    this.groupPosts[index].movieTitle = movie.title;
                    this.groupPosts[index].shared_content_movie = movie._id;
                    this.groupPosts[index].moviePoster = movie.poster;
                });
            }, (err) => {
                let params = new HttpParams();
                params = params.append('reviewId', this.groupPosts[index].shared_content_review);

                this.http.get('/api/getReviewById', { params: params }).subscribe((review: any) => {
                    this.groupPosts[index].reviewType = 'movie';
                    this.groupPosts[index].reviewText = review.content;
                    this.groupPosts[index].reviewRating = review.rating;
                    this.groupPosts[index].reviewUserName = review.UserName;
                    this.groupPosts[index].reviewAuthor = review.author;
                    this.groupPosts[index].displayShare = 'review';

                    this.http.get(`/api/movies/${review.movies}`).subscribe((movie: any) => {
                        this.groupPosts[index].movieTitle = movie.title;
                        this.groupPosts[index].shared_content_movie = movie._id;
                        this.groupPosts[index].moviePoster = movie.poster;
                    });
                });
            });
        } else if (this.groupPosts[index].share_type == 'actor') {

            this.http.get(`/api/actors/${this.groupPosts[index].shared_content_actor}`).subscribe((actor: any) => {
                this.groupPosts[index].actorName = actor.name;
                this.groupPosts[index].actorRole = actor.job;
                if (actor.job == 'director') {
                    this.groupPosts[index].actorJob = 'Director';
                    this.groupPosts[index].displayShare = 'director';
                } else {
                    this.groupPosts[index].actorJob = 'Cast Member';
                    this.groupPosts[index].displayShare = 'cast member';
                }
            });
        }
    }

    // Given a shared post, clicking the link should view the
    // details page for this shared content.
    visitShareItem(post) {

        if (post.share_type == 'movie' || post.share_type == 'review') {
            this.router.navigate(['/movieDetails'], { queryParams: { id: post.shared_content_movie, title: post.movieTitle } });
        } else if (post.share_type == 'actor') {
            this.router.navigate(['/directorCast'], { queryParams: { name: post.actorName, role: post.actorJob, title: post.actorRole } });
        }
    }

    getPostAuthor(index) {
        let params = new HttpParams();
        params = params.append('u_id', this.groupPosts[index].author);
        this.http.get('/api/name', { params: params }).subscribe((name) => {
            this.groupPosts[index].authorName = name;
        });
    }

    getPostReplyAuthor(parentIndex, replyIndex) {
        let params = new HttpParams();
        params = params.append('u_id', this.groupPosts[parentIndex].replies[replyIndex].author);
        this.http.get('/api/name', { params: params }).subscribe((name) => {
            this.groupPosts[parentIndex].replies[replyIndex].authorName = name;
        });
    }

    // Called after a user clicks the join/remove button
    join() {
        // set up the parameters for the API call
        let params = new HttpParams();
        params = params.append('groupId', this.groupInformation._id);
        params = params.append('userId', this.auth.getUserDetails()._id);

        // if the user is not in the group then they can join it
        if (!this.inGroup) {
            this.http.get('/api/addMember', { params: params }).subscribe((results) => {
                this.joinGroupText = 'Leave Group';
            });
        } else { // Otherwise, remove member from group
            this.http.get('/api/removeMember', { params: params }).subscribe((results) => {
                this.joinGroupText = 'Join Group';
            });
        }
        // change the button
        this.inGroup = !this.inGroup;
    }

    isCreator(): boolean {
        if (this.auth.getUserDetails()._id == this.groupInformation.creator) {
            return true;
        }
        return false;
    }

    // Called when the user clicks on the name of a user who left a review
    getUser(author: string) {
        // Go to the user's own profile page if this is their review
        if (this.auth.isLoggedIn() && author == this.auth.getUserDetails()._id) {
            this.router.navigateByUrl('/profile');
            // Otherwise we go to a different user's profile page
        } else {
            this.router.navigate(['/wishlist'], { queryParams: { user: author } });
        }

    }

    getName(id) {
        let params = new HttpParams();
        params = params.append('u_id', id);
        this.http.get('/api/name', { params: params }).subscribe((name) => {
            return name;
        });
    }

    createPost() {

        // First we check the user has entered something to post.
        if (this.postContent != '') {

            // We assign the parameters for the backend request.
            let params = new HttpParams();
            params = params.append('group', this.groupInformation._id);
            params = params.append('author', this.auth.getUserDetails()._id);
            params = params.append('text_content', this.postContent);

            // And create the post.
            this.http.get('/api/sendMessage', { params: params }).subscribe(() => {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/groupPage'], { queryParams: { name: this.groupName } });
                });
            });

        }
    }

    // Given a parent post and reply content, creates a reply to a post.
    replyPost(post, form: NgForm) {

        // First we check the user has entered something to reply.
        if (form.value.replyContent != '') {

            // We assign the parameters for the backend request.
            let params = new HttpParams();
            params = params.append('group', post.group);
            params = params.append('author', this.auth.getUserDetails()._id);
            params = params.append('text_content', form.value.replyContent);
            params = params.append('reply_on', post._id);

            // And create the reply.
            this.http.get('/api/sendMessage', { params: params }).subscribe(() => {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/groupPage'], { queryParams: { name: this.groupName } });
                });
            });

        }
    }

    // Given a post, we want to either like or unlike it.
    likeUnlikePost(post) {

        // We first make the backend API call to like or
        // unlike the post.
        let params = new HttpParams();
        params = params.append('messageId', post._id);
        params = params.append('userId', this.auth.getUserDetails()._id);
        this.http.get('/api/reactMessage', { params: params }).subscribe((result: any) => {
            // Given this result, we update the react list for this post.
            post.reactList = result.reactList;
        });

        // If the user hasn't liked the post, then we like it.
        if (post.liked == 'Like') {
            post.liked = 'Unlike';
            // Otherwise we unlike the post.
        } else {
            post.liked = 'Like';
        }
    }
}