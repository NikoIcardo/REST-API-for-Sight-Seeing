const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/users');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, unable find user with specified email address.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      'supersecret_dont_share', // key to generate token. Should be kept a secret in every real world situation. 
      { expiresIn: '1h' }
    );
  } catch(err) {
    const error = new HttpError('Something went wrong, unable to sign in.', 500);
    console.log(error);
    return next(error);
  }

  res
    .status(200)
    .json({userId: user.id, email: user.email, token: token});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.errors);
    const error = new HttpError(
      'Could not signup, please check that you entered a valid name, email, and password.',
      422
    );
    console.log(error);
    return next(error);
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, unable to check specified email address.',
      500
    );
    console.log(error);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login.', 422);
    console.log(error);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Something went wrong, unable to signup.', 500);
    console.log(error);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Something went wrong, unable to signup.', 500);
    console.log(error);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch(err) {
    const error = new HttpError('Something went wrong, unable to signup.', 500);
    console.log(error);
    return next(error);
  }
  

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token});
};

const retrieveUsers = async (req, res, next) => {
  let allUsers;
  try {
    allUsers = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, unable to retrieve user list right now.',
      500
    );
    return next(error);
  }
  res
    .status(201)
    .json({ users: allUsers.map((user) => user.toObject({ getters: true })) });
};

exports.login = login;
exports.signups = signup;
exports.retrieveUsers = retrieveUsers;
