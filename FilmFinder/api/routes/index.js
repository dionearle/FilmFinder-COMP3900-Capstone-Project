var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    secret: 'MY_SECRET',
    algorithms: ['HS256'],
    userProperty: 'payload'
});

// First we define all of the controllers.
var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlSearch = require('../controllers/search');
var ctrAct = require('../controllers/modifyActorData');
var ctrMov = require('../controllers/modifyMovieData');
var ctrlWishlist = require('../controllers/wishlist');
var ctrlGroups = require('../controllers/group');

// Then we define the routes for each controller.

// Profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.post('/profile/addbanList', ctrlProfile.addBanlist);
router.delete('/profile/removeBanList', ctrlProfile.removeBanlist);
router.get('/profile/getName/:u_id', ctrlProfile.getName);
router.get('/profile/getDetails', ctrlProfile.getDetails);
router.get('/name', ctrlProfile.getName);
router.get('/banList', ctrlProfile.get);
router.get('/wishlist', auth, ctrlProfile.getDetails);

// Authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// Search
router.get('/searchTitle', ctrlSearch.title);
router.get('/searchDirector', ctrlSearch.director);
router.get('/searchGenre', ctrlSearch.genre);
router.get('/searchReviews', ctrlSearch.reviewsByUser);
router.get('/searchDCReviews', ctrlSearch.directorReviewsByUser);
router.get('/movieDetails', ctrlSearch.findDetails);
router.get('/recommendations', ctrlSearch.Recommendations);
router.get('/modifytest', ctrlSearch.deleteProterty);
router.get('/searchGroup', ctrlSearch.group);

// Actor
router.get('/actorName/:actorName', ctrAct.getOneByName);
router.post('/actors', ctrAct.createOne);
router.get('/actors/:id', ctrAct.getOne);
router.get('/actorName/:actorName', ctrAct.getOneByName);
router.put('/actors/:id', ctrAct.updateOne);
router.post('/actors/addReview', ctrAct.AddReview);
router.get('/actors/:actorId/getReview/:u_id', ctrAct.getReview);
router.delete('/actors/deleteReview', ctrAct.deleteReview);
router.post('/actors/updateRating', ctrAct.updateRating);
router.get('/actors/:name/getRating', ctrAct.getRating);
router.post('/actors/addReview/:id', ctrAct.AddReview);
router.get('/actors/:actorId/getReview/:u_id', ctrAct.getReview);
router.delete('/actors/deleteReview/:id/:reviewid', ctrAct.deleteReview);
router.post('/actors/updateRating/:id/:rating', ctrAct.updateRating);
router.get('/actors/:name/getRating', ctrAct.getRating);
router.get('/getActorReview/:id', ctrAct.getReviewById);
router.post('/actors/updateRating/:actorId', ctrAct.updateRating);
router.post('/actors/createActorForMovie', ctrAct.createForMovie);

// Movie
router.get('/movies', ctrMov.getAll);
router.post('/movies', ctrMov.createOne);
router.get('/movies/:id', ctrMov.getOne);
router.put('/movies/:id', ctrMov.updateOne);
router.delete('/movies/:id', ctrMov.deleteOne);
router.post('/movies/:id/addReview', ctrMov.AddReview);
router.get('/movies/:id/review/:u_id', ctrMov.getReview);
router.get('/getReviewById', ctrMov.getReviewById);
router.delete('/movies/:movieId/deleteReview/:reviewId', ctrMov.deleteReview);

// Wishlist
router.get('/getWishlist', ctrlWishlist.get);
router.get('/addWishlist', ctrlWishlist.add);
router.get('/removeWishlist', ctrlWishlist.remove);

// Groups
router.post('/createGroup', ctrlGroups.createOne);
router.get('/groupDetails', ctrlGroups.getOne);
router.get('/groupById', ctrlGroups.getById);
router.get('/getMembers', ctrlGroups.getMembers);
router.get('/addMember', ctrlGroups.addMember);
router.get('/removeMember', ctrlGroups.removeMember);
router.get('/sendMessage', ctrlGroups.sendMessage);
router.get('/reactMessage', ctrlGroups.react_message);
router.get('/getPost', ctrlGroups.getPost);
router.get('/getPostsFromGroup', ctrlGroups.getPostsFromGroup);

module.exports = router;