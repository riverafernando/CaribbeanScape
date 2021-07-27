const express = require('express');
const router = express.Router({mergeParams: true});
const {wrapAsync, validateReview, isLoggedIn, isAuthorReview} = require('../utils/middleware.js');
const reviews = require('../controllers/reviews');

// Post a review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.postReview));

// Delete a review
router.delete('/:reviewId', isLoggedIn, isAuthorReview, wrapAsync(reviews.deleteReview));

module.exports = router;
