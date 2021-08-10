const express = require('express');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes'); 
const usersRoutes = require('./routes/users-routes'); 
const HttpError = require('./models/http-error');

const app = express(); 
const url = 'mongodb+srv://Niko:eKkVDD5ZQ44JsDn@cluster0.arfc1.mongodb.net/Places?retryWrites=true&w=majority';

app.use(bodyParser.json()); // this will extract any json data and convert it to js data structures, then call next automatically

app.use('/api/places', placesRoutes); // => /api/places/...
app.use('/api/users', usersRoutes); 

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error; 
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'}); // default error
});  // error handler. Will execute if any previous middleware function yields an error


mongoose.connect(url)
  .then(() => {
    app.listen(5000); 
  })
  .catch(err => {
    console.log(err);
  });


