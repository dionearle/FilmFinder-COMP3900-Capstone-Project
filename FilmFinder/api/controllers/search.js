var mongoose = require('mongoose');
var Movie = mongoose.model('movies');
var movieData = require('../controllers/modifyMovieData');
var Group = mongoose.model('Group');
var Review = mongoose.model('Reviews');
var DCReview = mongoose.model('ReviewForActor');

module.exports = {

    // Given a movie title as a query parameter, search
    // for any movies that match.
    title: function(req, res) {

        Movie.aggregate([{
            $search: {
                "text": {
                    "query": req.query.title,
                    "path": "title"
                }
            }
        }]).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            updateRating(results, req.query.u_id).then(() => {

                // We sort the results by average rating.
                results.sort(compare);

                // We then return the results found in the movie
                // database.
                res.status(200).json(results.slice(0, 10));
            });
        });
    },

    // Given a director's name as a query parameter, search
    // for any movies with that director.
    director: function(req, res) {

        Movie.aggregate([{
            $search: {
                "text": {
                    "query": req.query.director,
                    "path": "directors"
                }
            }
        }]).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            updateRating(results, req.query.u_id).then(() => {

                // We sort the results by average rating.
                results.sort(compare);

                // We then return the results found in the movie
                // database.
                res.status(200).json(results.slice(0, 10));
            });
        });
    },

    // Given a genre as a query parameter, search
    // for any movies with that genre.
    genre: function(req, res) {

        Movie.find({
            genres: req.query.genre
        }).sort({ latest_average_rating: -1 }).limit(10).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            updateRating(results, req.query.u_id).then(() => {

                // We sort the results by average rating.
                results.sort(compare);

                // We then return the results found in the movie
                // database.
                res.status(200).json(results);
            });
        });
    },

    // Given a group as a query parameter, search
    // for any groups with this keyword in the title
    // or description.
    group: function(req, res) {

        Group.aggregate([{
            $search: {
                "text": {
                    "query": req.query.name,
                    "path": ["name", "description"]
                }
            }
        }]).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            // Then return the results found in the db.
            return res.status(200).json(results.slice(0, 10));
        });
    },

    // Get the details of a movie via a query.
    findDetails: function(req, res) {

        Movie.findOne({
            _id: req.query.movieId
        }).exec(function(err, results) {

            if (err) {
                return res.status(200).json(err);
            }

            if (!results) {
                return res.status(404).json("not found by id" + req.query.movieId);
            }

            let resultlist = [results];

            updateRating(resultlist, req.query.u_id).then(() => {
                return res.status(200).json(results);
            });
        });
    },

    // Find all reviews written by a user.
    reviewsByUser: function(req, res) {

        Review.find({ author: req.query.author }).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            // Then return the results found in the db.
            return res.status(200).json(results);
        });
    },

    // Get all director reviews by a user.
    directorReviewsByUser: function(req, res) {

        DCReview.find({ author: req.query.author }).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            // Return the results found in the db.
            return res.status(200).json(results);
        });
    },

    // Deletes a property from all movie entries.
    deleteProterty: function(req, res) {

        Movie.updateMany({}, [{
                $addFields: {
                    latest_average_rating: 0,
                    reviews: [],
                }
            },
            { $unset: ["rated"] },
        ], {
            upsert: true,
        }).exec((err) => {

            if (err) {
                res.status(400).json(err);
            }

            res.status(200).json("done");
        });
    },

    // Gets recommendations for a given movie based on
    // genre, cast, directors and ratings.
    Recommendations: async function(req, res) {

        // Array used to store and eventually return the list
        // of movie recommendations.
        let result = [];

        // To ensure we don't get duplicate recommendations
        // or recommend the current movie, we implement
        // a list of seen movie IDs.
        let seen = [req.query.movieId];

        // To loop through these values, they need to be
        // converted from a comma separated string into an array.
        let genres = req.query.genres.split(',');
        let directors = req.query.directors.split(',');
        let cast = req.query.cast.split(',');

        // We first loop through all the genres for this movie.
        for (var i = 0; i < genres.length; i++) {

            // We extract the current genre.
            let genre = genres[i];
            try {

                // Given this genre, we retrieve all movies
                // that also have this same genre.
                let answer = await getGenreMovies(genre, req.query.u_id);

                // These results are then sorted by latest
                // average rating.
                answer.sort(compare);

                // Since we only want to add at most 5
                // movies from this category, we set this
                // as the max value for the loop.
                let max = Math.min(answer.length, 5);
                for (let j = 0; j < max; j++) {

                    // Before adding this movie as a
                    // recommendation, we need to check the
                    // seen array to ensure we haven't
                    // already added this.
                    let seenBool = false;
                    for (let k = 0; k < seen.length; k++) {

                        // If we have, we set the boolean
                        // to true and exit the loop.
                        if (answer[j]._id.equals(seen[k])) {
                            seenBool = true;
                            break;
                        }
                    }

                    // If this movie hasn't yet been added,
                    // then we do so now.
                    if (!seenBool) {
                        result.push(answer[j]);
                        seen.push(answer[j]._id);
                    }
                }

            } catch (err) {
                res.status(400).json(err);
            }
        }

        // Next we loop through all the directors of this movie.
        for (var a = 0; a < directors.length; a++) {

            // We extract the current director.
            let director = directors[a];
            try {

                // Given this director, we retrieve all movies
                // that also have this same director.
                let answer = await getDirectorMovies(director, req.query.u_id);

                // These results are then sorted by latest
                // average rating.
                answer.sort(compare);

                // Since we only want to add at most 5
                // movies from this category, we set this
                // as the max value for the loop.
                let max = Math.min(answer.length, 5);
                for (let j = 0; j < max; j++) {

                    // Before adding this movie as a
                    // recommendation, we need to check the
                    // seen array to ensure we haven't
                    // already added this.
                    let seenBool = false;
                    for (let k = 0; k < seen.length; k++) {

                        // If we have, we set the boolean
                        // to true and exit the loop.
                        if (answer[j]._id.equals(seen[k])) {
                            seenBool = true;
                            break;
                        }
                    }

                    // If this movie hasn't yet been added,
                    // then we do so now.
                    if (!seenBool) {
                        result.push(answer[j]);
                        seen.push(answer[j]._id);
                    }
                }
            } catch (err) {
                res.status(400).json(err);
            }
        }

        // Finally we loop through the cast members of this movie.
        for (var b = 0; b < cast.length; b++) {

            // We extract the current cast member.
            let castMember = cast[b];
            try {

                // Given this cast member, we retrieve all movies
                // that also star this same cast member..
                let answer = await getCastMemberMovies(castMember, req.query.u_id);

                // These results are then sorted by latest
                // average rating.
                answer.sort(compare);

                // Since we only want to add at most 5
                // movies from this category, we set this
                // as the max value for the loop.
                let max = Math.min(answer.length, 5);
                for (let j = 0; j < max; j++) {

                    // Before adding this movie as a
                    // recommendation, we need to check the
                    // seen array to ensure we haven't
                    // already added this.
                    let seenBool = false;
                    for (let k = 0; k < seen.length; k++) {

                        // If we have, we set the boolean
                        // to true and exit the loop.
                        if (answer[j]._id.equals(seen[k])) {
                            seenBool = true;
                            break;
                        }
                    }

                    // If this movie hasn't yet been added,
                    // then we do so now.
                    if (!seenBool) {
                        result.push(answer[j]);
                        seen.push(answer[j]._id);
                    }
                }
            } catch (err) {
                res.status(400).json(err);
            }
        }

        // Now that we have all of the recommendations in
        // the result array, we can do a final sort by
        // average rating.
        result.sort(compare);

        // Finally the array of recommendations is returned.
        res.status(200).json(result);
    }
}

// Given a movie genre, gets all movies with this same genre.
async function getGenreMovies(genre, userId) {

    // Since this is an async function, we want to return 
    // a promise.
    return new Promise((resolve, reject) => {

        // We search the database for any movies with
        // a matching genre value.
        Movie.find({
            genres: genre
        }).sort({ latest_average_rating: -1 }).limit(10).exec(function(err, results) {

            if (err) {
                reject(err);
            }

            // The rating of this movie is then updated
            // based on the user logged in.
            updateRating(results, userId).then(() => {

                // We sort the results by average rating.
                results.sort(compare);

                // We then return the results found in the movie
                // database.
                resolve(results);
            });
        });
    });
}

// Given a director, gets all movies with this same director.
async function getDirectorMovies(director, userId) {

    // Since this is an async function, we want to return 
    // a promise.
    return new Promise((resolve, reject) => {

        // We search the database for any movies with
        // a matching director value.
        Movie.find({
            directors: director
        }).exec(function(err, results) {

            if (err) {
                reject(err);
            }

            // The rating of this movie is then updated
            // based on the user logged in.
            updateRating(results, userId).then(() => {

                // We sort the results by average rating.
                results.sort(compare);

                // We then return the results found in the movie
                // database.
                resolve(results);
            });
        });
    });
}

// Given a cast member, gets all movies starring this cast member.
async function getCastMemberMovies(castMember, userId) {

    // Since this is an async function, we want to return 
    // a promise.
    return new Promise((resolve, reject) => {

        // We search the database for any movies with
        // a matching cast value.
        Movie.find({
            cast: castMember
        }).exec(function(err, results) {

            if (err) {
                reject(err);
            }

            // The rating of this movie is then updated
            // based on the user logged in.
            updateRating(results, userId).then(() => {

                // We sort the results by average rating.
                results.sort(compare);

                // We then return the results found in the movie
                // database.
                resolve(results);
            });
        });
    });
}

// Used to sort a list of movie results by average rating.
function compare(a, b) {

    if (a.latest_average_rating > b.latest_average_rating) {
        return -1;
    } else if (a.latest_average_rating < b.latest_average_rating) {
        return 1;
    }

    return 0;
}

/**
 * Function to update the rating based on current user
 * @param {*} movielist lis of movie to update tge rating
 * @param {*} u_id the current user
 */
async function updateRating(movielist, u_id) {

    for (var i = 0; i < movielist.length; i++) {

        try {
            // Gets latest average rating for a movie in the movie list.
            let result = await getRating(movielist[i], u_id);

            movielist[i].latest_average_rating = result;

            updateMongoRating(movielist[i], result);

        } catch (err) {
            return err
        }
    }
}

function updateMongoRating(myMovie, rating) {

    Movie.findOne({ _id: myMovie._id }, function(err, movie) {

        movie.latest_average_rating = rating;

        movie.save(function() {
            return;
        });
    });
}

/**
 * Function to update last average rating for one movie
 * @param {*} movie the movie to get the rating 
 * @param {*} u_id  the current user 
 */
async function getRating(movie, u_id) {

    return new Promise((resolve, reject) => {

        //Use the get review helpe function to get list of reivew which is not in current user's ban list
        movieData.getReviewHelp(movie.reviews, u_id, Review).then(function(result) {

            var sum = 0;
            for (var i = 0; i < result.length; i++) {
                sum = sum + result[i].rating;
            }

            if (result.length == 0) {
                resolve(0);
            } else {
                resolve(sum / result.length);
            }
        }, (err) => {
            return err;
        });
    });
}

module.exports.updateRating = updateRating;