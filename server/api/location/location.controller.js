'use strict';

var _ = require('lodash');
var Location = require('./location.model');

exports.getLocations = function(req, res) {
  var yelp = require("yelp").createClient({
    consumer_key: "consumer_key", 
    consumer_secret: "consumer_secret",
    token: "token",
    token_secret: "token_secret"
  }); 
  yelp.search({term: "bar", location: req.params.location}, function(error, data) {
    return res.json(data);
  });
};

exports.addUserToEvent = function(req, res) {
  console.log("INSIDE OF addUserToEvent");
  Location.find({ yelp_id: req.params.id}, function(err, location) {
    if (err) { 
      console.log("ERROR");
      return handleError(res,err); 
    }
    if(!location) { 
      // if not found, create new location
      console.log("LOCATION NOT FOUND BABY!");
      // return res.status(404).send('Not Found'); 
    }

    return res.json(location);
  });
};

// Get list of locations
exports.index = function(req, res) {
  Location.find(function (err, locations) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(locations);
  });
};


exports.checkForLocation = function(req, res) {
  console.log("showUserPolls called.")
  Location.find({ yelp_id: req.params.yelp_id
  }, function(err, locations) {
    if (err) {
      return handleError(res, err);
    }
    if (locations.length === 0) {
      return res.status(404).send('Not Found');
    }
    return res.json(locations);
  });
};

// Creates a new location in the DB.
exports.create = function(req, res) {
  Location.create(req.body, function(err, location) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(location);
  });
};

// Updates an existing location in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Location.findById(req.params.id, function (err, location) {
    if (err) { return handleError(res, err); }
    if(!location) { return res.status(404).send('Not Found'); }
    var updated = _.extend(location, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(location);
    });
  });
};

// Deletes a location from the DB.
exports.destroy = function(req, res) {
  Location.findById(req.params.id, function (err, location) {
    if(err) { return handleError(res, err); }
    if(!location) { return res.status(404).send('Not Found'); }
    location.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}