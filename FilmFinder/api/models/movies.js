var mongoose = require('mongoose');

// Schema for the movie data set.
var movies = new mongoose.Schema({
    plot: String,
    genres: Array,
    runtime: Number,
    cast: Array,
    poster: String,
    title: String,
    fullplot: String,
    languages: Array,
    released: Date,
    directors: Array,
    awards: Object,
    lastupdated: String,
    year: Number,
    imdb: Object,
    countries: Array,
    type: String,
    tomatoes: Object,
    reviews: Array,
    latest_average_rating: Number
}, { collection: 'movies' });

module.exports = mongoose.model('movies', movies);