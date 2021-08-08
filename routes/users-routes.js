const express = require('express');

const usersControllers = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', usersControllers.retrieveUsers); 

router.post('/signup', usersControllers.signups); 

router.post('/login', usersControllers.login); 

module.exports = router; 