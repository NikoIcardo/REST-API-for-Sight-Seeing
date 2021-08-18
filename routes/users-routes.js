const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersControllers.retrieveUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail({ gmail_remove_dots: false }).isEmail(), //noramalize converts things such as Test@test.com => test@test.com
    check('password').isLength({ min: 6 }),
  ],
  usersControllers.signups
);

router.post('/login', usersControllers.login);

module.exports = router;
