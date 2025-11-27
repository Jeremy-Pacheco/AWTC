const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// GET /login -> show login form
router.get('/login', sessionController.showLogin);

// POST /login -> process credentials, set session cookie
router.post('/login', sessionController.login);

// GET /logout -> destroy session
router.get('/logout', sessionController.logout);

module.exports = router;
