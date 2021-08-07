const express = require("express");

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();
/* gives a special object that can also register middleware, 
  but once configured, the router can be exported and imported 
  in app.js and registered as a single midleware in app.js*/

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacebyUserId);

module.exports = router;
