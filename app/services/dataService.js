(function () {
  'use strict';

  var angular = require('angular');

  angular.module('diabeticAnalytics').factory('DataService',
    [
    '$q',
    'ParsingService',
    function(
      $q,
      ParsingService
      ) {
      return {
        importData: function(csvFile) {
          var mySugrParser = ParsingService.mySugr();
          var mySugrColumnMappings = mySugrParser.config.columnMappings;
          var pMySugrParse = mySugrParser.parse(csvFile);
          return pMySugrParse.then(function(result){
            return ('BGL (mmol/L): ' + result.data[1][mySugrColumnMappings.DateTime] + '; ' +result.data[1][mySugrColumnMappings.BGL_mmol_L]);
          });
        }
      };
    }]);
}());
