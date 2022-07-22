const express = require('express');
const router = express.Router();

const AuthorizationController = require('../controllers/authorization.controller');

router.post('/login', AuthorizationController.login);

router.delete('/logout', AuthorizationController.logout);

module.exports = router;
