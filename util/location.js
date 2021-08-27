const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = process.env.GOOGLE_API_KEY; 

async function getCoordsForAddress (address) {
  
  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
 

  const data = response.data; // axios gives us a data field on the response object returned

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Could not find location of the specified address.', 422);
    console.log(error); 
    throw error; 
  }
  
  console.log(data); 
  const coordinates = data.results[0].geometry.location; 

  return coordinates; 
}

module.exports = getCoordsForAddress; 