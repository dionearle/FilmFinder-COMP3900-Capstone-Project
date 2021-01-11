var mongoose = require('mongoose');

var ReviewForActorSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    UserName: {
        type: String,
        require: true
    },
    content: {
        type: String,
        required: true
    },
    actor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Actor',
        required: true
    },
    best_movie: {
        type: mongoose.Schema.ObjectId,
        ref: 'movies'
    }
});

module.exports = mongoose.model('ReviewForActor', ReviewForActorSchema);