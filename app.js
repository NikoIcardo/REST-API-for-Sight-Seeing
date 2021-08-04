const express = require('express');
const bodyParser = require('body-parser'); 

const placesRoutes = require('./routes/places-routes');

const app = express(); 

app.use('/api/places', placesRoutes); // => /api/places/...

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'}); // default error
});  // error handler. Will execute if any previous middleware function yields an error

app.listen(5000); 

