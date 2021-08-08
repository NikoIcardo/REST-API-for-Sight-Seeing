const { v4: uuidv4 } = require("uuid"); // unique id with a timestamp component

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: 'u1', 
    name: 'Niko Icardo', 
    email: 'test@test.com', 
    password: 'testers'
  }
];

const login = (req, res, next) => {
  const { email, password } = req.body; 

  const user = DUMMY_USERS.find( u => u.email === email );
  
  if(!user || user.password !== password){
    throw new HttpError('Could not find user, please check email and password.', 404); 
  }

  res.status(200).json({message: 'Login Successful!'}); 
}; 

const signup = (req, res, next) => {
  const { name, email, password} = req.body; 

  const hasUser = DUMMY_USERS.find( u => u.email === email); 

  if (hasUser) {
    throw new HttpError('Could not create user, email already exists.', 422); 
  }

  const createUser = {
    id: uuidv4(), 
    name, 
    email, 
    password
  };

  DUMMY_USERS.push(createUser);

  res.status(201).json({message: 'User Created', user: createUser});
}; 

const retrieveUsers = (req, res, next) => {
  res.status(200).json({users: DUMMY_USERS});
}; 


exports.login = login; 
exports.signups = signup; 
exports.retrieveUsers = retrieveUsers; 


