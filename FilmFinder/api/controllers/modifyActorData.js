var mongoose = require("mongoose");
var Actor = mongoose.model('Actor');
var Review = mongoose.model('ReviewForActor');
var movie = require('./modifyMovieData');

module.exports = {

    // Gets all actors from the database.
    getAll: function(req, res, next) {

        Actor.find(function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(200).json(actor);
        });
    },

    // Creates an actor.
    createOne: function(req, res, next) {

        Actor.create(req.body, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(201).json(actor);
        });
    },

    // Gets an actor given a name.
    getOneByName: function(req, res, next) {

        Actor.findOne({ name: req.params.actorName, job: req.query.job })
            .exec(function(err, actor) {

                if (err) {
                    return res.status(400).json(err);
                }

                if (!actor) {
                    return res.status(404).json();
                }

                res.status(200).json(actor);
            });
    },

    // Gets an actor given an ID.
    getOne: function(req, res, next) {

        Actor.findOne({ _id: req.params.id })
            .exec(function(err, actor) {

                if (err) {
                    return res.status(400).json(err);
                }

                if (!actor) {
                    return res.status(404).json();
                }

                res.status(200).json(actor);
            });
    },

    // Updates an actor's information.
    updateOne: function(req, res, next) {

        Actor.findOneAndUpdate({ _id: req.params.id }, req.body, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json();
            }

            res.status(200).json(actor);
        });
    },

    // Deletes an actor from the database.
    deleteOne: function(req, res, next) {

        Actor.findOneAndRemove({ _id: req.params.id }, function(err) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(204).json();
        });
    },

    // Adds an actor to the database.
    addactor: function(req, res, next) {

        Actor.findOne({ _id: req.params.id }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json("Cannot find actor.");
            }

            actor.findOne({ _id: req.body.id })
                .exec(function(err, actor) {

                    if (err) {
                        return res.status(400).json(err);
                    }

                    if (!actor) {
                        return res.status(404).json("Cannot find actor.");
                    }

                    actor.actors.push(actor);

                    actor.save(function(err) {
                        if (err) return res.status(500).json(err);
                        res.status(201).json(actor);
                    });
                });
        });
    },

    // Adds a review for an actor.
    AddReview: function(req, res) {

        Actor.findOne({ _id: req.params.id }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json("Cannot find actor.");
            }

            let newReview = new Review();
            newReview.author = (mongoose.Types.ObjectId)(req.body.userId);
            newReview.UserName = (req.body.UserName);
            newReview.content = req.body.content;
            newReview.actor = actor._id;
            newReview.best_movie = req.body.best_movie;

            newReview.save((err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                actor.reviews.push(newReview._id);

                actor.save(function(err) {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(201).json(newReview);
                });
            })
        });
    },

    // Deletes a review for an actor.
    deleteReview: function(req, res) {

        Actor.findOne({ _id: req.params.id }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json("Cannot find actor.");
            }

            const index = actor.reviews.indexOf(req.params.reviewid);

            if (index > -1) {
                actor.reviews.splice(index, 1);
            } else {
                return res.status(400).json("Review cannot be found.");
            }

            actor.save(function(err) {

                if (err) {
                    return res.status(500).json(err)
                }
            });
            Review.findOneAndRemove({ _id: req.params.reviewid }, function(err) {

                if (err) {
                    return res.status(400).json(err);
                }

                res.status(204).json();
            });
        });
    },

    // Returns all reviews for an actor from user's not in 
    // the current user's banlist
    getReview: function(req, res) {

        Actor.findOne({ _id: req.params.actorId }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json("Cannot find actor.");
            }

            movie.getReviewHelp(actor.reviews, req.params.u_id, Review).then(function(result) {
                res.status(200).json(result);
            });
        });
    },

    // Updates the latest average rating of an actor.
    updateRating: function(req, res) {

        Actor.findOne({ _id: req.params.id }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json("Cannot find actor.");
            }

            actor.rating = (Number)(req.params.rating);

            actor.save((err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.status(201).json(actor);
            });
        });
    },

    // Gets the latest average rating for an actor.
    getRating: function(req, res) {

        Actor.findOne({ name: req.params.name }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {
                return res.status(404).json("Cannot find actor.");
            }

            res.status(200).json(actor);

        })
    },

    // Creates a new actor in the database if they
    // don't already exist.
    createForMovie: function(req, res) {

        Actor.findOne({ name: req.body.actorName }, function(err, actor) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!actor) {

                let newActor = new Actor({
                    name: req.body.actorName,
                    job: req.body.job,
                });

                newActor.movies = [req.body.movieId];

                newActor.save((err) => {

                    if (err) {
                        return res.status(400).json(err);
                    }

                    res.status(200).json(newActor)
                });
            } else {
                actor.movies.push((mongoose.Types.ObjectId)(req.body.movieId));

                actor.save((err) => {

                    if (err) {
                        return res.status(400).json(err);
                    }

                    res.status(201).json(actor);
                });
            }
        });
    },

    // Gets an actor review by ID.
    getReviewById: function(req, res) {

        Review.findOne({ _id: req.params.id }, function(err, review) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!review) {
                return res.status(404).json("Cannot find actor.");
            }

            res.status(200).json(review);
        })
    }
}