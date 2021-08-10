const { v4: uuidv4 } = require("uuid"); // unique id with a timestamp component
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require('../models/places.js'); 

let DUMMY_PLACES = [
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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}

  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Could not find for the provided place id.", 404);
  }

  res.json({ place }); // { place } => { place: place }
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid; // {pid: 'p1'}

  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({ places }); // { place } => { place: place }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req); // checks to see if the express-validator functions passed to the router function returned any errors

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    ); // throw does not work with async express functions
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title, 
    description, 
    address, 
    location: coordinates, 
    image: 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
    creator
  }); 

  try {
    await createdPlace.save(); 
  } catch(err) {
    const error = new HttpError('Creating place failed please try again.', 500);
    return next(error);
  }
  

  res.status(201).json({ place: createdPlace }); //successful creation
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req); // checks to see if the express-validator functions passed to the router function returned any errors

  if (!errors.isEmpty()) {
    throw new HttpError("Missing input, please check your data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  if (!DUMMY_PLACES.find((p) => p.id === req.params.pid)) {
    throw new HttpError("The place with the specified id does not exist.", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== req.params.pid);
  res.status(200).json({
    message: "Place with id " + req.params.pid + " has been deleted.",
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesbyUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
