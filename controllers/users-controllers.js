const { validationResult } = require('express-validator');

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

  if (!user || user.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  res.status(200).json({ message: 'Login Successful!', user: user.toObject({getters: true})});
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

  const createUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: [],
  });

  try {
    await createUser.save();
  } catch (err) {
    const error = new HttpError('Something went wrong, unable to signup.', 500);
    console.log(error);
    return next(error);
  }

  res.status(201).json({ user: createUser.toObject({ getters: true }) });
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
  res.status(201).json({ users: allUsers.map((user) => user.toObject({ getters: true })) });
};

exports.login = login;
exports.signups = signup;
exports.retrieveUsers = retrieveUsers;
