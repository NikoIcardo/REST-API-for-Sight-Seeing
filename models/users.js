const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }], // Add an array to store multiple ids, for each place uploaded.
});

userSchema.plugin(uniqueValidator); // validates as unique unique fields in mongoose.

module.exports = mongoose.model('User', userSchema);
