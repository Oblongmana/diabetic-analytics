(function () {
  'use strict';

  var angular = require('angular');
  var _ = require('lodash');

  angular.module('diabeticAnalytics').factory('DataService',
    [
    '$q',
    'ParsingService',
    function(
      $q,
      ParsingService
      ) {

      var importedDataResult = null;
      var selectedParser = null;

      return {
        importData: function(csvFile) {
          //TODO: allow user to select the parser type in interface
          selectedParser = ParsingService.Parsers.mySugr();
          var pMySugrParse = selectedParser.parse(csvFile);
          return pMySugrParse.then(function(result){
            importedDataResult = result;
            return ('BGL (mmol/L): ' + result.data[1][selectedParser.config.columnMappings.DateTime] + '; ' +result.data[1][selectedParser.config.columnMappings.BGL_mmol_L]);
          });
        },
        getBglEntries: function() {
          var deferred = $q.defer();
          if (!importedDataResult) {
            deferred.reject('No data has been imported into the app yet. Please import data using the "Data Import" page');
          } else {
            var returnData = selectedParser.config.headers
              ? importedDataResult.data
              : _.drop(importedDataResult.data,1);

            deferred.resolve(_.map(returnData,function(dataRow){
              var retDataRow = {};
              retDataRow[ParsingService.Fields.DateTime] = dataRow[selectedParser.config.columnMappings.DateTime];
              retDataRow[ParsingService.Fields.BGL_mmol_L] = dataRow[selectedParser.config.columnMappings.BGL_mmol_L];
              return retDataRow;
            }));
          }
          return deferred.promise;
        }
      };
    }]);
}());
