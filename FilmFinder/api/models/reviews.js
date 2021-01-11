var mongoose = require('mongoose');

var ReviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true
    },
    movies: {
        type: mongoose.Schema.ObjectId,
        ref: 'movies',
        required: true
    }
});

module.exports = mongoose.model('Reviews', ReviewSchema);