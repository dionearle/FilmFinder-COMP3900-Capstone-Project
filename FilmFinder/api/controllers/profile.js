var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {

    // Reads a user's profile.
    profileRead: function(req, res) {

        // If no user ID exists in the JWT return a 401
        if (!req.payload._id) {

            res.status(401).json({
                "message": "UnauthorizedError: private profile"
            });

        } else {
            // Otherwise continue
            User
                .findById(req.payload._id)
                .exec(function(err, user) {
                    res.status(200).json(user);
                });
        }
    },

    // Retrieve a user's banlist.
    get: function(req, res) {

        // We first get the user model using
        // their id.
        User.findById(req.query.userId)
            .exec(function(err, user) {

                // We can then simply return the wishlist
                // field for this user.
                res.status(200);
                res.json(user.banList);
            });
    },

    // Gets the details of a user from their ID.
    getDetails: function(req, res) {

        // We first get the user model using
        // their id.
        User.findById(req.query.userId)
            .exec(function(err, user) {

                // We can then simply return the wishlist
                // field for this user.
                res.status(200);
                res.json(user);
            });
    },

    // Adds a user to the logged in users banlist.
    addBanlist: function(req, res) {

        User.findById(req.body.u_id, function(err, user) {

            if (err) {
                return res.status(400).json(err);
            }

            if (!user) {
                return res.status(404).json();
            }

            User.findById(req.body.ban_id, function(err, ban_user) {

                if (err) {
                    return res.status(400).json(err);
                }

                if (!ban_user) {
                    return res.status(404).json();
                }

                user.banList.push(ban_user._id);

                user.save(function(err) {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(201).json(user);
                });
            });
        });
    },

    // Removes a user from the currently logged in
    // user's banlist.
    removeBanlist: function(req, res) {

        User.findOne({ _id: req.query.u_id })
            .exec(function(err, user) {

                if (err) {
                    return res.status(400).json(err);
                }

                if (!user) {
                    return res.status(404).json();
                }

                const index = user.banList.indexOf(req.query.ban_id);

                if (index > -1) {
                    user.banList.splice(index, 1);
                } else {
                    return res.status(400).json("This actor is not in the cast list.");
                }

                user.save(function(err) {

                    if (err) return res.status(500).json(err);

                    res.status(201).json(user);
                });
            });
    },

    // Gets the name of a user given an ID.
    getName: function(req, res) {
        User.findOne({ _id: req.query.u_id }, function(err, user) {
            if (err) {
                return res.status(404).json(err);
            }
            if (!user) {
                return res.status(404).json("User not found.");
            }
            res.status(200).json(user.name);
        })


    }
};