const { v4: uuidv4 } = require('uuid'); // unique id with a timestamp component
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/places.js');
const User = require('../models/users.js');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId); // no promise, but if you need one, you can call .exec()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, unable to find a place with that id.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('The specified id does not exist.', 404);
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); //  turn the mongoose object into a normal js object then set the _id to an id with getters: true
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid; // {pid: 'p1'}

  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find places for specified user id.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0)...
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find a place for the provided user id.', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  }); // { place } => { place: place }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req); // checks to see if the express-validator functions passed to the router function returned any errors

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
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
      'https://images.unsplash.com/photo-1555109307-f7d9da25c244?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating place failed please try again.', 500);
    return next(error);
  }

  console.log(user);

  if (!user) {
    const error = new HttpError('The specified user id does not exist.', 404);
    return next(error);
  }

  /* starting the transaction and session ensures that each of the
    following tasks actually complete successfully before saving. We 
    wouldnt't want one to complete then save, and the next to fail and have 
    no way to revert the previous save. Instead, if any of the processes fail, 
    none of them will save when a transaction occurs. */
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace); // mongoose push grabs the place id and adds it to the user places field.
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating place failed please try again.', 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace }); //successful creation
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req); // checks to see if the express-validator functions passed to the router function returned any errors

  if (!errors.isEmpty()) {
    const error = new HttpError('Missing input, please check your data.', 422);
    return next(error);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, cannot find place with that id.',
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
      'Something went wrong, cannot save place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  placeId = req.params.pid;

  let deletedPlace;
  try {
    deletedPlace = await Place.findById(placeId).populate('creator'); // populate automatically gets list of references in the specified field and allows you to access them via that field.
  } catch (err) {
    const error = new HttpError(
      'Something went wrong could not find place by specified id.',
      500
    );
    return next(error);
  }

  if (!deletedPlace) {
    const error = new HttpError(
      'Could not find a place with the specified id.',
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await deletedPlace.remove({ session: sess });
    deletedPlace.creator.places.pull(deletedPlace);
    await deletedPlace.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong could not delete place.',
      500
    );
    return next(error);
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlacesbyUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
