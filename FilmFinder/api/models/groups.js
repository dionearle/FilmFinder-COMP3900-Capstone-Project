var mongoose = require('mongoose');

var groupSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    members: Array,
    posts: Array
});

// Adds a user's ID to the members array
groupSchema.methods.addGroupMember = function(userId) {

    if (!this.members.includes(userId)) {
        this.members.push(userId);
    }
};

// Removes a user's id from the members array.
groupSchema.methods.removeGroupMember = function(userId) {

    // Retrive the index of the user ID and when found, remove it.
    let index = this.members.indexOf(userId);

    if (index > -1) {
        this.members.splice(index, 1);
    }
};

module.exports = mongoose.model('Group', groupSchema);