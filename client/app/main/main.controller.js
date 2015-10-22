'use strict';

angular.module('nightlifeApp')
  .controller('MainCtrl', function ($scope, $http, $location, $rootScope, Auth) {

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $rootScope.getCurrentUser = Auth.getCurrentUser;

    $scope.findLocations = function(location) {
      $scope.isLoading = true;
      $rootScope.listOfLocations = [];
      $rootScope.isAttending = [];

      $http.get('/api/locations/' + location).success(function(data) {
        $scope.isLoading = false;
        var locations = data.businesses;

        locations.forEach(function(location) {
          $http.get('/api/locations/checkForLocation/' + location.id).success(function(response){
            // location found
            var location = response[0];
            // check to see if the user is attending the event
            var attendingCheck = isUserAttending(location);
            if (attendingCheck) {
              $rootScope.isAttending.push(true);
            } else {
              $rootScope.isAttending.push(false);
            }
            $rootScope.listOfLocations.push(location);

          }).error(function() {
            // location not found 
            var structedLocation = createLocation(location);
            $rootScope.isAttending.push(false);
            $rootScope.listOfLocations.push(structedLocation);
          });

        });


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

    $scope.locationDetails = function(location, index) {
      $rootScope.location = location;
      $rootScope.index = index;
      var url = $location.url('/location');
    };

    var isUserAttending = function(currentLocation) {
      var isAttending = false;
      
      for (var i = 0; i < currentLocation.usersAttending.length; i++) {
        if (currentLocation.usersAttending[i].user_id === $rootScope.getCurrentUser()._id) {
          isAttending = true;
          break;
        } else {
          isAttending = false
        }
      }
      return isAttending;
    };


    $scope.addUserToEvent = function(location, index) {
      console.log("rootScope.isAttending");
      console.log($rootScope.isAttending[index]);

      if ($scope.isLoggedIn()) {
        // check to see if the location exists in the db
        $http.get('/api/locations/checkForLocation/' + location.yelp_id).success(function(response) {
          // Location exists
          var currentLocation = response[0];
          var isAttending = isUserAttending(currentLocation);

          if (!isAttending) {
            currentLocation.usersAttending.push({ user_id: $rootScope.getCurrentUser()._id,
                                                  user_name: $rootScope.getCurrentUser().name });
            
            $http.delete('/api/locations/' + currentLocation._id).success(function(res) {

              $http.post('/api/locations/', currentLocation).success(function(response) {
                $rootScope.location = response;
                $rootScope.isAttending[index] = true;
                $rootScope.listOfLocations[index] = response;
              });

            });

          } else {
            console.log("User is already attending this event!");
          }

        }).error(function(err) {
          // Location not in the DB
          var newLocation = createLocation(location);
          $rootScope.isAttending[index] = true;
          newLocation.usersAttending.push({ user_id: $rootScope.getCurrentUser()._id, 
                                            user_name: $rootScope.getCurrentUser().name });
  
          $http.post('/api/locations/', newLocation).success(function(response) {
            $rootScope.location = response;
            $rootScope.listOfLocations[index] = response;
          });

        });

      } 
      else if ($scope.isLoggedIn() === false) {
        console.log("not logged in");
        alert("Sorry, you have to be logged in to attend an event");
      }
    };

    $scope.removeUserFromEvent = function(location, index) {
      if ($scope.isLoggedIn()) {

        var updatedLocation = location;
        var changesMade = false;

        if (updatedLocation.usersAttending.length === 1 && updatedLocation.usersAttending[0] === $rootScope.getCurrentUser()._id) {
          updatedLocation.usersAttending = [];

            $http.delete('/api/locations/' + updatedLocation._id).success(function(res) {

              $http.post('/api/locations/', updatedLocation).success(function(response) {
                $rootScope.location = response;
                $rootScope.isAttending[index] = false;
                $rootScope.listOfLocations[index] = response;
              });

            });

        } else {
          for(var i = 0; i < updatedLocation.usersAttending.length; i++) {
            if (updatedLocation.usersAttending[i].user_id === $rootScope.getCurrentUser()._id) {
              updatedLocation.usersAttending.splice(i, 1);
              changesMade = true;
              break;
            }
          }

          if (changesMade) {
            $http.delete('/api/locations/' + updatedLocation._id).success(function(res) {

              $http.post('/api/locations/', updatedLocation).success(function(response) {
                $rootScope.location = response;
                $rootScope.isAttending[index] = false;
                $rootScope.listOfLocations[index] = response;
              });

            });
      
          } 
          else if (!changesMade) {
            console.log("nothing to change here!")
          }
                  
        }

      } 
      else if ($scope.isLoggedIn() === false) {
        console.log("not logged in");
        alert("Sorry, you have to be logged in to attend an event");
      }
    };

  });

 