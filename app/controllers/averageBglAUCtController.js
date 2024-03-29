(function () {
  'use strict';

  var angular = require('angular');
  var _ = require('lodash');
  var moment = require('moment');

  angular.module('diabeticAnalytics').controller('averageBglAUCtController',
    [
    '$scope',
    'DataService',
    function(
      $scope,
      DataService
      ) {

      $scope.bglEntries = null;
      $scope.bglEntriesRetrievalError = null;

      var resetState = function() {
        $scope.bglEntries = null;
        $scope.bglEntriesRetrievalError = null;
      };


      $scope.datetimeAccessor = DataService.Fields.DateTime;
      $scope.bglAccessor = DataService.Fields.BGL_mmol_L;

      if (DataService.hasData()) {
        DataService.getBglEntries().then(
          function(bglEntries){
            $scope.bglEntries = bglEntries;
            $scope.bglEntriesRetrievalError = null;
          },
          function(error){
            resetState();
            $scope.bglEntriesRetrievalError = error;
          }
        );
      }
    }]);
}());
