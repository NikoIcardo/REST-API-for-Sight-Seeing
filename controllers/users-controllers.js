const { v4: uuidv4 } = require("uuid"); // unique id with a timestamp component
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require('../models/users');

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Niko Icardo",
    email: "test@test.com",
    password: "testers",
  },
];

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user; 
  try{
    user = await User.findOne({email: email})
  } catch (err) {
    const error = new HttpError('Something went wrong, unable find user with specified email address.', 500);
    return next(error); 
  }
  
  if (!user || user.password !== password) {
    const error = new HttpError('Invalid credentials, could not log you in.', 401);
    return next(error);
  }

  res.status(200).json({ message: "Login Successful!" });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req); 

  if(!errors.isEmpty()){
    console.log(errors.errors);
    const error = new HttpError('Could not signup, please check that you entered a valid name, email, and password.', 422);
    return next(error);
  }

  const { name, email, password, places } = req.body;

  let existingUser;
  try{
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Something went wrong, unable to check specified email address.', 500);
    return next(error); 
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login.', 422); 
    return next(error); 
  }

  const createUser = new User({
    name, 
    email, 
    image: 
    'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.eguardtech.com%2Fblog%2Fchanging-your-network-profile%2F&psig=AOvVaw3_9smKJbQxvAwaFExUMnrc&ust=1628774683793000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCMjMgNyIqfICFQAAAAAdAAAAABAE', 
    password, 
    places
  }); 

  try{
    await createUser.save();
  } catch (err) {
    const error = new HttpError('Something went wrong, unable to signup.', 500);
    return next(error); 
  }

  res.status(201).json({user: createUser.toObject({getters: true})});
};

const retrieveUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

exports.login = login;
exports.signups = signup;
exports.retrieveUsers = retrieveUsers;
