const express = require('express');
const router = express.Router();
const {wrapAsync, validateAttraction, isLoggedIn, isAuthorAttraction} = require('../utils/middleware.js');
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage});

// Controller for attractions
const attractions = require('../controllers/attractions');

// Main page for displaying all attractions
router.get('/', wrapAsync(attractions.index));

// Generate template for creating a new attraction
router.get('/new', isLoggedIn, attractions.renderNewForm);
  
// Show Page for displying a single attraction in more detail
router.get('/id?', wrapAsync(attractions.show));

// Updating our attraction and resave to database
router.put('/:id', isLoggedIn, upload.array('images'), wrapAsync(validateAttraction), wrapAsync(attractions.updateAttraction));

// Render images of camp for deletion
router.get('/:id/images', isLoggedIn, isAuthorAttraction, wrapAsync(attractions.renderImages));

// Delete Image asssociated with attraction
router.delete('/:id/images', isLoggedIn, isAuthorAttraction, wrapAsync(attractions.deleteImage));

// Creating a new attraction and adding to database, first must validate
router.post('/', isLoggedIn, upload.array('images'), wrapAsync(validateAttraction), wrapAsync(attractions.createAttraction));

// Render form for editing
router.get('/edit/id?', isLoggedIn, wrapAsync(attractions.renderEditForm));

// Delete attraction
router.delete('/:id', isLoggedIn, isAuthorAttraction, wrapAsync(attractions.deleteAttraction));

module.exports = router;