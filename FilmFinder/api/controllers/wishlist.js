var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {

    // Retrieve a user's wishlist.
    get: function(req, res) {

        // We first get the user model using
        // their id.
        User.findById(req.query.userId)
            .exec(function(err, user) {

                // We can then simply return the wishlist
                // field for this user.
                res.status(200);
                res.json(user.wishlist);
            });
    },

    // Given a movie's ID, we add this to the given
    // user's wishlist
    add: function(req, res) {

        // We first get the user model using
        // their id.
        User.findById(req.query.userId)
            .exec(function(err, user) {

                // We then call the user method
                // to add this movie ID to their
                // wishlist.
                user.addWishlist(req.query.movieId);

                // Finally we save this change and
                // send a response.
                user.save(function() {
                    var token;
                    token = user.generateJwt();
                    res.status(200);
                    res.json({
                        "token": token
                    });
                });
            });
    },

    // Given a movie's ID, we remove this from the 
    // given user's wishlist.
    remove: function(req, res) {

        // We first get the user model using
        // their id.
        User.findById(req.query.userId)
            .exec(function(err, user) {

                // We then call the user method
                // to add this movie ID to their
                // wishlist.
                user.removeWishlist(req.query.movieId);

                // Finally we save this change and
                // send a response.
                user.save(function() {
                    var token;
                    token = user.generateJwt();
                    res.status(200);
                    res.json({
                        "token": token
                    });
                });
            });
    }
}