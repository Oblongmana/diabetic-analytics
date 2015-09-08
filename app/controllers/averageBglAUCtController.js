(function () {
  'use strict';

  var angular = require('angular');

  angular.module('diabeticAnalytics').controller('averageBglAUCtController',
    [
    '$scope',
    'DataService',
    function(
      $scope,
      DataService
      ) {

      $scope.auctChart = [];
      $scope.auctChartOptions = {};

    }]);
}());
