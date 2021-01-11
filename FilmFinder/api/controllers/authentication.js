var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

// The register API controller.
module.exports.register = function(req, res) {

    // Before creating a new account, we need to check the 
    // given email is not already associated with another
    // existing user.
    User.find({ email: req.body.email }, function(err, docs) {

        // If a user with this email is found, we return
        // an error.
        if (docs.length) {
            res.status(401).json(err);
        } else {

            // Otherwise, we take the data from the 
            // submitted form and create a new Mongoose 
            // model instance.
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            // Adds the salt and hash to the instance.
            user.setPassword(req.body.password);

            // Sets the user's wishlist to empty.
            user.wishlist = [];

            // Sets ths user type to a regular user.
            user.type = 'user';

            // Saves the instance as a record to the database,
            // and sends the JWT inside the JSON response.
            user.save(function() {
                var token;
                token = user.generateJwt();
                res.status(200);
                res.json({
                    "token": token
                });
            });
        }
    })
};

// The login API controller
module.exports.login = function(req, res) {

    passport.authenticate('local', function(err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }

        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);

};


