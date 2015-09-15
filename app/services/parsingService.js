(function () {
  'use strict';

  var angular = require('angular');
  var _ = require('lodash');
  var moment = require('moment');
  var papaparse = require('papaparse');

  /**
   * TODO: Update this doc to reflect changed approach - actually providing
   * a parser, with manipulatable config and pre/post functions
   *
   * ParsingService provides parsing for various formats
   * of Blood Glucose logging CSV files into javascript objects using the
   * PapaParse library.
   *
   * NOTE: all entries should be sorted into ascending order
   * TODO: should that be checked somehow?
   *
   * XXXXXXXXXXX
   *  It is the responsbility of anyone using this service to provide their own
   *  event handling callbacks (such as, and most importantly, the "complete"
   *  callback)
   * XXXXXXXXXXX
   *
   * TODO: Actually - we should probably instead return a promise from some
   * function ourselves - allowing us to do post-transforms,
   * and verify input columns matched expected columns
   *
   * Implementers will provide:
   *   - configObject: a PapaParse config object, with no event handling callbacks
   *   - opt_preParseTransform: optionally, may transform the File object before
   *      the parsing occurs - must return a File Object (optionally in a promise)
   *   - opt_postParseTransform: optionally, may transform the PapaParse.Results
   *      object after the PapaParse parsing occurs - must return a
   *      PapaParse.Results Object (optionally in a promise) - this would
   *      generally be used for things like merging columns
   *
   *
   * Each strategy also exposes a "columnMappings" field. This is a mapping from
   * the data fields that the DiabeticAnalytics app requires, to the equivalent
   * in the imported data. This is for users of the ParsingService to use - the
   * service itself may in fact manipulate the data to force it to conform
   *
   * TODO: Somehow document these required fields/maybe enforce them? Probably
   * don't need to enforce though
   *
   * TODO: Probably somehow flag the choices between units - mmol/L vs mg/dL,
   * kg vs lb, carb units vs grams vs exchanges vs goodness knows what else, etc
   *
   * So for a full example, here's how you might parse a mySugr file into a
   * javascript object, and then log the Blood Glucose Measurement of the
   * first data row of the file:
   *
   *   var mySugrParser = ParsingService.mySugr();
   *   var mySugrColumnMappings = mySugrParser.columnMappings;
   *   var pMySugrParse = mySugrParser.parse(theCsvFileObject);
   *   pMySugrParse.then(function(result){
   *     console.log('BGL (mmol/L): ' + result.data[1][mySugrColumnMappings.BGL_mmol_L]);
   *   });
   *
   * Note that these strategies should not touch any of the callbacks (at least
   * for now), restricting themselves instead to just config (and preprocessing
   * in future)
   */
  angular.module('diabeticAnalytics').factory('ParsingService',
    [
    '$q',
    function(
      $q
      ) {


      var Parser = function(configObject,opt_preParseTransform,opt_postParseTransform) {
        this.config = configObject;
        var resultDeferred = $q.defer();
        this.config.complete = function(result) {
          //Force identical handling for all on complete - resolving this._result
          // with the PapaParsing parsing result
          //TODO: maybe something with errors
          resultDeferred.resolve(result);
        };
        this._result = resultDeferred.promise;
        this.opt_preParseTransform = opt_preParseTransform;
        this.opt_postParseTransform = opt_postParseTransform;
      };
      Parser.prototype.parse = function(fileObject) {
        var self = this;
        var pPreParseTransform = this.opt_preParseTransform
          ? $q.when(this.opt_preParseTransform(fileObject))
          : $q.when(fileObject);
        var pPapaParse = pPreParseTransform.then(function(preParsedFileObject){
          papaparse.parse(preParsedFileObject,self.config);
          return self._result; //will be populated by self.config.complete when papaparse.parse finishes
        });
        var pPostParseTransform = pPapaParse.then(function(parsedResultObject){
          return self.opt_postParseTransform
            ? $q.when(self.opt_postParseTransform(parsedResultObject))
            : $q.when(parsedResultObject);
        });
        return pPostParseTransform;
      };

      /**
       * This is the data that all parsers must supply, and expose access
       * information for under the `config.columnMappings` field
       * @type {Object}
       */
      var REQUIRED_DATA = {
        DateTime: 'DateTime', //Note that this should be in Milliseconds since the epoch
        BGL_mmol_L: 'BGL_mmol_L'
      };

      var PARSERS = {
        /**
         * Config for the mySugr (https://mysugr.com/) app. This config setup
         * forces comma delimiter, has dynamic typing, has row data indexed by
         * numeric index rather than by header (so you'll need to ignore line
         * one), and skips empty lines.
         *
         * For full details compare the source code to the list of options at
         * http://papaparse.com/docs#config
         *
         * TODO: Should probably provide some methodology for verifying received
         * columns match expected columns. Probably a simple substring search
         * type thing
         *
         * @type {Function}
         */
        mySugr: function() {
          return new Parser({
              delimiter: ",",
              newline: "",  // auto-detect
              header: false,
              dynamicTyping: true,
              preview: 0,
              encoding: "",
              worker: false,
              comments: false,
              download: false,
              skipEmptyLines: true,
              fastMode: undefined,
              beforeFirstChunk: undefined,
              columnMappings: {
                DateTime: 0,
                BGL_mmol_L: 2
              }
            },
            undefined,
            function(resultObject) {
              //This post-parse function merges the contents of the
              // "Date" and "Time" fields into "DateTime" - containing ms since
              // the epoch
              //
              //We then reverse the order of the entries (as mySugr provides
              // them in descending order)
              var srcDateIndex = 0;
              var srcTimeIndex = 1;
              var outDateTimeIndex = 0;

              var headers = _(resultObject.data).take(1).flatten().value();
              _.pullAt(headers,srcDateIndex,srcTimeIndex); //Remove date & time headers
              _.insert(headers,outDateTimeIndex,"DateTime"); //Add DateTime header at outDateTimeIndex

              var data = _(resultObject.data).drop(1).map(function(dataRow) {
                var dateTimeMS = moment(
                  _(dataRow).pullAt(srcDateIndex,srcTimeIndex).join(" "),
                  [
                    "MMM D, YYYY h:mm:ss a", //Format received (at least in NZ) before ~2015-09-15
                    "DD/MM/YYYY h:mm:ss a", //Format received (at least in NZ) after ~2015-09-15
                    "YYYY-MM-DD h:mm:ss a", //Alternative format (why can't we all do it this way)
                    "MM/DD/YYYY h:mm:ss a", //Alternative format (American)
                    "DD.MM.YYYY h:mm:ss a", //Alternative format (German)
                    //Couldn't find any other formats in mySugr source code, and haven't received any others
                  ]
                ).valueOf(); //Convert date + time to ms since the epoch
                _.insert(dataRow,outDateTimeIndex,dateTimeMS); //Add DateTime value at outDateTimeIndex
                return dataRow;
              }).value();

              //Switch from descending order to ascending order
              data.reverse();

              resultObject.data = [headers].concat(data);
              return resultObject;
            }
          );
        }
      };

      return {
        Parsers: PARSERS,
        Fields: REQUIRED_DATA
      };
    }]);
}());
