'use strict';

angular.module('nightlifeApp')
  .controller('MainCtrl', function ($scope, $http, $location, $rootScope, Auth) {

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $rootScope.getCurrentUser = Auth.getCurrentUser;

    $scope.findLocations = function(location) {
      $scope.isLoading = true;

      $rootScope.listOfLocations = [];
      $http.get('/api/locations/' + location).success(function(data) {
        $scope.isLoading = false;
        var locations = data.businesses;
        var test = [];
        var count = 0;

        for(var location in locations) {
          test.push(locations[location]);
          $http.get('/api/locations/checkForLocation/' + locations[location].id).success(function(response) {
            // location found
            $rootScope.listOfLocations.push(response[0]);   
            count++;
          }).error(function(err) {
            // location not found
            var error = err;
            var structedLocation = createLocation(test[count]);
            $rootScope.listOfLocations.push(structedLocation);
            count++;
          });
        }

      });

    };

    var createLocation = function(location) {

      var newLocation = {
        id: location.id,
        yelp_id: location.id,
        name: location.name,
        display_phone: location.display_phone,
        rating: location.rating,
        number: location.display_phone,
        location: {
          display_address: [ 
            location.location.display_address['0'],
            location.location.display_address['1'] 
          ]
        },
        url: location.url,
        image_url: location.image_url,
        rating_img_url: location.rating_img_url,
        usersAttending: []
      };

      return newLocation;
    };    

    $scope.locationDetails = function(location) {
      $rootScope.location = location;
      $rootScope.numAttending = location.usersAttending.length;
      var url = $location.url('/location');
    };

    $scope.addUserToEvent = function(location) {

      if ($scope.isLoggedIn()) {
        // check to see if the location exists in the db
        $http.get('/api/locations/checkForLocation/' + location.yelp_id).success(function(response) {
          // Location exists
          var currentLocation = response[0];
          var isAttending = false;
          // add user if not already attending
          for (var i = 0; i < currentLocation.usersAttending.length; i++) {
            if (currentLocation.usersAttending[i].user_id === $rootScope.getCurrentUser()._id) {
              isAttending = true;
              break;
            } else {
              isAttending = false;
            }
          }

          if (!isAttending) {
            currentLocation.usersAttending.push({ user_id: $rootScope.getCurrentUser()._id, user_name: $rootScope.getCurrentUser().name });
            $http.put('/api/locations/' + currentLocation._id, currentLocation).success(function(response) {
              $rootScope.location = response;
              $rootScope.numAttending = $rootScope.location.usersAttending.length;
            });
          } else {
            console.log("User is already attending this event!");
          }

        }).error(function(err) {
          // Location not in the DB
          var newLocation = createLocation(location);
          newLocation.usersAttending.push({ user_id: $rootScope.getCurrentUser()._id, user_name: $rootScope.getCurrentUser().name });
  
          $http.post('/api/locations/', newLocation).success(function(response) {
            $rootScope.location = response;
            $rootScope.numAttending = newLocation.usersAttending.length;
          });

        });

      } 
      else if ($scope.isLoggedIn() === false) {
        console.log("not logged in");
      }
    };

    $scope.removeUserFromEvent = function(location) {
      var updatedLocation = location;

      console.log(updatedLocation);

      if (updatedLocation.usersAttending.length === 1) {
        updatedLocation.usersAttending = [];
        $http.put('/api/locations/' + updatedLocation._id, updatedLocation).success(function(response) {
          $rootScope.location = response;
          $rootScope.numAttending = $rootScope.location.usersAttending.length;
        }); 
      } else {
        for(var i = 0; i < updatedLocation.usersAttending.length; i++) {
          if (updatedLocation.usersAttending[i].user_id === $rootScope.getCurrentUser()._id) {
            delete updatedLocation.usersAttending[i];
            $http.put('api/locations/' + updatedLocation._id, updatedLocation).success(function(response) {
              $rootScope.location = response;
              $rootScope.numAttending = $rootScope.location.usersAttending.length;
            });
            break;
          }
        }        
      }

    };

  });

 