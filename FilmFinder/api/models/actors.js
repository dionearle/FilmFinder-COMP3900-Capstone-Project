var mongoose = require('mongoose');

var Actor_DirectorSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    birth_year: {
        type: Number,
    },
    job: {
        type: String,
        required: true
    },
    movies: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Movie'
    }],
    rating: {
        type: Number,
    },
    reviews: [{
        type: mongoose.Schema.ObjectId,
        ref: 'ReviewForActor'
    }],
});

module.exports = mongoose.model('Actor', Actor_DirectorSchema);