'use strict';

angular.module('nightlifeApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .when('/location', {
        templateUrl: 'app/main/location.html',
        controller: 'MainCtrl'
      });
  });