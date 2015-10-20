'use strict';

var express = require('express');
var controller = require('./location.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/checkForLocation/:yelp_id', controller.checkForLocation);
router.get('/events/:location', controller.addUserToEvent);
router.get('/:location', controller.getLocations);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:yelp_id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;