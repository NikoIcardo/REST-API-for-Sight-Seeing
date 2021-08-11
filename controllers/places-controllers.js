const { v4: uuidv4 } = require("uuid"); // unique id with a timestamp component
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/places.js");

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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}

  let place;
  try {
    place = await Place.findById(placeId); // no promise, but if you need one, you can call .exec()
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, unable to find a place with that id.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("The specified id does not exist.", 404);
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); //  turn the mongoose object into a normal js object then set the _id to an id with getters: true
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid; // {pid: 'p1'}

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find places for specified user id.",
      505
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  }); // { place } => { place: place }
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
    image:
      "https://images.unsplash.com/photo-1555109307-f7d9da25c244?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Creating place failed please try again.", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace }); //successful creation
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req); // checks to see if the express-validator functions passed to the router function returned any errors

  if (!errors.isEmpty()) {
    const error = new HttpError("Missing input, please check your data.", 422);
    return next(error); 
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, cannot find place with that id.",
      500
    );
    return next(error);
  }

  console.log(updatedPlace.title);
  updatedPlace.title = title;
  console.log(updatedPlace.title);
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, cannot save place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  placeId = req.params.pid; 

  let deletedPlace; 
  try{
    deletedPlace = await Place.findById(placeId);
  } catch(err) {
    const error = new HttpError('Something went wrong could not find place by specified id.', 500); 
    return next(error); 
  }

  try{
    await deletedPlace.remove();
  } catch(err) {
    const error = new HttpError('Something went wrong could not delete place.', 500); 
    return next(error); 
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlacesbyUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
