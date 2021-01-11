var mongoose = require('mongoose');
var Group = mongoose.model('Group');
var User = mongoose.model('User');
var Message = mongoose.model('message');

module.exports = {

    // Creates a new group.
    createOne: function(req, res) {

        // Takes the data from the form and makes a new group.
        var newGroup = new Group();
        newGroup.creator = req.body.creator;
        newGroup.name = req.body.name;
        newGroup.description = req.body.description;

        // Saves the instance as a record to the db.
        newGroup.save(function(err, group) {

            // returns an error if unsuccessful.
            if (err) {
                res.status(400).json(err);
                return;
            }

            res.status(200).json(group);
        });
    },

    // Gets the details of a group from
    // the name passed in as a query param.
    getOne: function(req, res) {

        Group.findOne({ name: req.query.name }).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            // Return the results of the search.
            res.status(200).json(results);
        })
    },

    // Gets a group by ID.
    getById: function(req, res) {

        Group.findOne({ _id: req.query.id }).exec(function(err, results) {

            if (err) {
                return res.status(400).json(err);
            }

            // Return the results of the search.
            res.status(200).json(results);
        })
    },

    // Given the id of a group, 
    // return its members.
    getMembers: function(req, res) {

        Group.findById(req.query.groupId).exec(function(err, group) {

            // Then return the members list.
            res.status(200);
            res.json(group.members);
        });
    },

    // Adds a member to a group.
    addMember: function(req, res) {

        // First get the group's ID.
        Group.findById(req.query.groupId).exec(function(err, group) {

            // Then call the group method to add this member to 
            // their members array.
            group.addGroupMember(req.query.userId);

            // Then save this change.
            group.save(function() {});
        });

        // Then need to add the group to the user's list of groups.
        User.findById(req.query.userId).exec(function(err, user) {

            // Then call the user method to add the group to
            // the user's groups ID.
            user.addGroup(req.query.groupId);

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

    // Removes a member from a group.
    removeMember: function(req, res) {

        // First, get the group's ID.
        Group.findById(req.query.groupId).exec(function(err, group) {

            group.removeGroupMember(req.query.userId);

            // Then save the change.
            group.save(function() {});
        });

        // Now need to remove the group from the member's list.
        User.findById(req.query.userId).exec(function(err, user) {

            // Then call the user method to add the group to
            // the user's groups ID.
            user.removeGroup(req.query.groupId);

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

    /**
     * Function to send message in a gourp
     * If the message does not reply on any message, reply on should be null.
     * Share type could only be movie or review or actor
     * share type decide which objetc ID will be shared
     * For example if the share type is actor then share_content_actor will contain the obejct id of that actor.
     * @param {*} req you must provide group represent group object id, auther whic represent user object id;
     * @param {*} res the message will be returned.
     */
    sendMessage: function(req, res) {

        // Take the data from the form and make a new group.
        var newMessage = new Message();
        newMessage.group = (mongoose.Types.ObjectId)(req.query.group);
        newMessage.author = (mongoose.Types.ObjectId)(req.query.author);
        newMessage.text_content = req.query.text_content;
        newMessage.reply_on = req.query.reply_on;
        let share_type = req.query.share_type;
        newMessage.share_type = share_type;

        // Check whether this message has shared content.
        if (share_type != null) {

            if (share_type.localeCompare("movie") == 0) {
                newMessage.shared_content_movie = (mongoose.Types.ObjectId)(req.query.share_content);
            } else if (share_type.localeCompare("review") == 0) {
                newMessage.shared_content_review = (mongoose.Types.ObjectId)(req.query.share_content);
            } else if (share_type.localeCompare("actor") == 0) {
                newMessage.shared_content_actor = (mongoose.Types.ObjectId)(req.query.share_content);
            } else {
                res.status(400).json("share type error: " + share_type + " is not avaiable for shared");
                return;
            }
        }

        // Save the instance as a record to the db.
        Group.findById(req.query.group).exec(function(err, group) {

            group.posts.push(newMessage._id);

            // Then save the change.
            group.save(function() {});

            newMessage.save(function(err, message) {

                if (err) {
                    return res.status(400).json(err);
                }

                return res.status(201).json(message);
            });
        });
    },

    /**
     * React function allow the user to react on a message. IF this user is in the react list (i.e. the user has already react on this message before)
     * The react function will unreact this message.(removie this user from react list)
     * @param {*} req provide the user id and message id
     * @param {*} res return the message after react or unreact
     */
    react_message: function(req, res) {

        Message.findById((mongoose.Types.ObjectId)(req.query.messageId)).exec(function(err, message) {

            message.reactOrUnreact((mongoose.Types.ObjectId)(req.query.userId));

            message.save(function(err, message) {

                if (err) {
                    return res.status(400).json(err);
                }

                res.status(201).json(message);
            });
        });
    },

    // Gets a post given an ID.
    getPost: function(req, res) {

        Message.findById((mongoose.Types.ObjectId)(req.query.id)).exec(function(err, message) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(201).json(message);
        });
    },

    // Gets all posts from a given group.
    getPostsFromGroup: function(req, res) {

        Message.find({
            group: req.query.group
        }).
        exec(function(err, messages) {

            if (err) {
                return res.status(400).json(err);
            }

            res.status(200).json(messages);
        });
    }
}