var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

// User schema which defines a unique email and a name,
// alongside a hash and salt in place of a password.
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    banList: [{
        type : mongoose.Schema.ObjectId,
        ref : 'User',
    }],
    hash: String,
    salt: String,
    wishlist: Array,
    type: String,
    groups: Array
});

// Uses a provided password and a created salt to set the
// hash for a user.
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

// Given a password, checks it is valid by comparing the hash.
userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

// Creates a JWT and returns it.
userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        wishlist: this.wishlist,
        type: this.type,
        exp: parseInt(expiry.getTime() / 1000),
    }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

// Adds a movie ID to the user's wishlist.
userSchema.methods.addWishlist = function(movieId) {

    // Given this movie ID isn't already in their wishlist,
    // we simply add it to the array of movie IDs.
    if (!this.wishlist.includes(movieId)) {
        this.wishlist.push(movieId);
    }
};

// Removes a movie ID to the user's wishlist.
userSchema.methods.removeWishlist = function(movieId) {

    // We first retrieve the index of the movie ID in
    // the user's wishlist, and if found we remove it
    // from the array.
    let index = this.wishlist.indexOf(movieId);
    if (index > -1) {
        this.wishlist.splice(index, 1);
    }
};

// Add a group id to the array of groups a user belongs to
userSchema.methods.addGroup = function(groupId){
    if (!this.groups.includes(groupId)) {
        this.groups.push(groupId);
    }
};

// Removes a group id from the groups array
userSchema.methods.removeGroup = function(groupId){
    let index = this.groups.indexOf(groupId);
    if (index > -1) {
        this.groups.splice(index, 1);
    }
};

mongoose.model('User', userSchema);