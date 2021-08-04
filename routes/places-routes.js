const express = require("express");

const router = express.Router();
/* gives a special object that can also register middleware, 
  but once configured, the router can be exported and imported 
  in app.js and registered as a single midleware in app.js*/


  router.get('/', (req, res, next) => {
    console.log('GET Request in Places'); 
    res.json({message: 'It works!'}); // sends back a response in JSON DATA
  });

  module.exports = router; 
