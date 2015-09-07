(function () {
  'use strict';

  var angular = require('angular');
  // var papaparse = require('papaparse');
  // var angularFile = require('angular-file');
  // var jquery = require('jquery');
  
  // Note that the service provided by require('angular-resource') is in fact
  //  $resource, so while the app does require('angular-resource'), we can't 
  //  programmatically get the name of the service, so hard-code $resource in :/

  angular.module('diabeticAnalytics').controller('csvImportController',
    [
    '$scope',
    'DataService',
    function(
      $scope,
      DataService
      ) {

      $scope.csvToImport = null;
      $scope.csvData = null;
      $scope.csvDataLoaded = false;
      $scope.debug_lineOneBglDump = null;
      
      
      $scope.loadData = function() {
        if ($scope.csvToImport) {
          DataService.importData($scope.csvToImport).then(function(result){
            $scope.debug_lineOneBglDump = "Line 1 BGL Value: " + result;
          });
        } else {
          $scope.debug_lineOneBglDump = "No CSV Supplied";
        }
        
        // return "Not implemented lol. Input " + file;
      };
      
    }]);
}());
