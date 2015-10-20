'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationSchema = new Schema({
  yelp_id: String,
  name: String,
  rating: Number,
  number: String,
  address: Array,
  url: String,
  img_url: String,
  usersAttending: Array
}, {strict: false});

module.exports = mongoose.model('Location', LocationSchema);