(function () {
  'use strict';

  var angular = require('angular');

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
