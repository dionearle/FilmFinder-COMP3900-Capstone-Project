var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.ObjectId,
        ref: 'Group',
        require: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    },
    text_content: {
        type: String,
    },
    reply_on: {
        type: mongoose.Schema.ObjectId,
        ref: 'message'
    },
    share_type: {
        type: String,
    },
    shared_content_movie: {
        type: mongoose.Schema.ObjectId,
        ref: 'movies'
    },
    shared_content_review: {
        type: mongoose.Schema.ObjectId,
        ref: 'Reviews'
    },
    shared_content_actor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Actor'
    },
    reactList: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
})

messageSchema.methods.reactOrUnreact = function(userId) {

    if (!this.reactList.includes(userId)) {
        this.reactList.push(userId);
    } else {

        const index = this.reactList.indexOf(userId);

        if (index > -1) {
            this.reactList.splice(index, 1);
        }
    }
};

module.exports = mongoose.model('message', messageSchema);