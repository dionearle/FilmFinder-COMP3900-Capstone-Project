var mongoose = require('mongoose');
var Movie = mongoose.model('movies');
var Review = mongoose.model('Reviews');
var User = mongoose.model('User');

module.exports = {

    // Gets all movies in the database.
    getAll: function(req, res, next) {

        Movie.find(function(err, movie) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(200).json(movie);
        });
    },

    // Creates a movie with the provided details.
    createOne: function(req, res) {

        // We create a new movie document using the
        // parameters given.
        let newMovie = new Movie({
            title: req.body.title,
            plot: req.body.plot,
            released: req.body.released,
            genres: req.body.genres.split(','),
            directors: req.body.directors.split(','),
            cast: req.body.cast.split(','),
            runtime: req.body.runtime,
            poster: req.body.poster
        });

        // We then save this new movie document
        // to the movie database.
        newMovie.save(function(err, movie) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(201).json(movie);
        });
    },

    // Gets the movie with ID provided.
    getOne: function(req, res, next) {

        Movie.findOne({ _id: req.params.id })
            .exec(function(err, movie) {

                if (err) {
                    return res.status(400).json(err);
                }

                if (!movie) {
                    return res.status(404).json();
                }

                res.status(200).json(movie);
            });
    },

    // Updates the information for a movie.
    updateOne: function(req, res, next) {

        Movie.findOneAndUpdate({ _id: req.params.id }, req.body, function(err, movie) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!movie) {
                return res.status(404).json();
            }

            res.status(200).json(movie);
        });
    },

    // Deletes a movie from the database.
    deleteOne: function(req, res, next) {

        Movie.findOne({ _id: req.params.id }, async(err, movie) => {

            if (err) {
                return res.status(400).json(err);
            }

            if (!movie) {
                return res.status(404).json("Cannot find movie.");
            }

            await removieReviewList(movie.reviews, Review);

            Movie.findOneAndRemove({ _id: req.params.id }, function(err) {

                if (err) {
                    return res.status(400).json(err);
                }

                res.status(204).json();
            });
        });
    },

    // Adds a review for a movie.
    AddReview: function(req, res) {

        Movie.findOne({ _id: req.params.id }, function(err, movie) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!movie) {
                return res.status(404).json("Cannot find movie.");
            }

            Review.create(req.body, function(err, review) {

                if (err) {
                    return res.status(400).json(err);
                }

                movie.reviews.push(review._id);

                movie.save(async function(err) {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(201).json(review);
                });
            });
        });
    },

    // Deletes a review for a movie.
    deleteReview: function(req, res) {

        Movie.findOne({ _id: req.params.movieId }, function(err, movie) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!movie) {
                return res.status(404).json("Cannot find movie.");
            }

            // Find the index of review to delete.
            const index = movie.reviews.indexOf(req.params.reviewId);

            if (index > -1) {
                movie.reviews.splice(index, 1);
            } else {
                return res.status(400).json("Review cannot be found.");
            }

            movie.save(function(err) {

                if (err) {
                    return res.status(500).json(err)
                }
            });

            // Finally we remove the review from the database.
            Review.findOneAndRemove({ _id: req.params.reviewId }, function(err) {

                if (err) {
                    return res.status(400).json(err);
                }

                res.status(204).json();
            });
        });
    },

    // Gets all reviews for a movie from users not in the
    // currently logged in users ban list.
    getReview: function(req, res) {

        Movie.findOne({ _id: req.params.id }, function(err, movie) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!movie) {
                return res.status(404).json("Cannot find movie.");
            }

            getReviewHelp(movie.reviews, req.params.u_id, Review).then(function(result) {
                res.status(200).json(result);
            });
        });
    },

    // Finds a review given an ID.
    getReviewById: function(req, res) {

        Review.findById(req.query.reviewId, function(err, review) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(200).json(review);
        });
    }
}

/**
 * A helper function to get list of review whcih is not in currentr user's banlist
 * @param {*} reviewlist 
 * @param {*} user_id 
 */
async function getReviewHelp(reviewlist, user_id, type) {
    return new Promise(async(resolve, reject) => {
        var result = [];
        for (var i = 0; i < reviewlist.length; i++) {
            let reviewid = reviewlist[i];
            try {
                let review = await findById(type, reviewid);
                if (user_id == 'null') {
                    result.push(review);
                } else {
                    let check = await checkBanList(user_id, review.author);
                    if (!check) {
                        result.push(review);
                    }
                }
            } catch (err) {
                reject(err + reviewid);
            }
        }
        resolve(result);
    });
}
/**
 * A helper functiopn to return the object id in given collection 
 * @param {*} collection colleciton to find
 * @param {*} myId  the id it given
 */
function findById(collection, myId) {

    return new Promise((resolve, reject) => {

        collection.findById(myId, (err, results) => {
            (err) ? reject(err): resolve(results);
        });
    });
}
/**
 * Function to check whether the given user is in the banlist of current user
 * @param {*} user_id the current user
 * @param {*} checked_id  the user to check
 */
async function checkBanList(user_id, checked_id) {

    var user = await findById(User, user_id);
    var banlist = user.banList;

    if (!banlist) {
        return false;
    } else {

        for (var i = 0; i < banlist.length; i++) {

            if (String(checked_id) == String(banlist[i])) {
                return true
            }
        }
    }
    return false;
}

// Delets a review given an ID.
function deleteRevew(id, collection) {

    return new Promise((resolve, reject) => {

        collection.findOneAndRemove({ _id: id }, function(err) {

            if (err) {
                reject(err);
            }

            resolve();
        });
    });

}

// Removes a movie from a user's review list.
function removieReviewList(ReviewList, collection) {

    return new Promise(async(resolve, reject) => {

        for (let i = 0; i < ReviewList.length; i++) {

            try {
                deleteRevew(ReviewList[i], collection);
            } catch (err) {
                reject(err);
            }

        }
        resolve();
    });
}

module.exports.removieReviewList = removieReviewList;
module.exports.getReviewHelp = getReviewHelp;
module.exports.findById = findById;