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
      $scope.debug_lineOne = null;
      
      
      $scope.loadData = function() {
        if ($scope.csvToImport) {
          DataService.importData($scope.csvToImport).then(function(result){
            $scope.debug_lineOne = result;
          });
        } else {
          $scope.debug_lineOne = "No CSV Supplied";
        }
        
        // return "Not implemented lol. Input " + file;
      };
      
    }]);
}());
