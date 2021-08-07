const express = require("express");

const HttpError = require('../models/http-error'); 

const router = express.Router();
/* gives a special object that can also register middleware, 
  but once configured, the router can be exported and imported 
  in app.js and registered as a single midleware in app.js*/

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famouse skyscrapers in the world.",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}

  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if(!place) {
    throw new HttpError('Could not find for the provided place id.', 404);
  }

  res.json({ place }); // { place } => { place: place }
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid; // {pid: 'p1'}

  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId;
  });

  if(!place) { 
    return next(new HttpError('Could not find for the provided user id.', 404)); 
  }

  res.json({ place }); // { place } => { place: place }
});

module.exports = router;
