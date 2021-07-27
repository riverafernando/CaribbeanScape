const express = require('express');
const router = express.Router();
const {wrapAsync} = require('../utils/middleware.js');
const users = require('../controllers/users');
const passport = require('passport');

// Render registration form
router.get('/', users.renderRegistrationForm);

// Registers a user
router.post('/', wrapAsync(users.register));

// Render login form
router.get('/login', users.renderLoginForm);

// Logs in
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/register/login'}), users.login);

// Log out
router.get('/logout', users.logout);

module.exports = router;