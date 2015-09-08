(function () {
  'use strict';

  var angular = require('angular');
  var _ = require('lodash');

  angular.module('diabeticAnalytics').controller('averageBglAUCtController',
    [
    '$scope',
    'DataService',
    function(
      $scope,
      DataService
      ) {

      $scope.chartReady = false;

      $scope.auctChartData = null;
      $scope.auctChartOptions = null;
      $scope.bglAreaDataSeries = null;

      $scope.bglEntries = null;
      $scope.bglEntriesRetrievalError = null;

      var resetState = function() {
        $scope.auctChartData = null;
        $scope.auctChartOptions = null;
        $scope.bglAreaDataSeries = null;

        $scope.bglEntries = null;
        $scope.bglEntriesRetrievalError = null;
      };

      var populateChart = function() {
        if ($scope.bglEntries) {
          $scope.bglAreaDataSeries = { 
            // data: [[(new Date()).getTime(),5]],
            data: _($scope.bglEntries)
              .filter(function(bglEntry){
                return bglEntry[DataService.Fields.BGL_mmol_L] !== "";
              })
              .map(function(bglEntry){
                return [
                  Date.parse(bglEntry[DataService.Fields.DateTime]),
                  bglEntry[DataService.Fields.BGL_mmol_L]
                ];
              })
              .value(),
            label: 'BGL (mmol/L)',
            lines: {
              show: true,
              fill: true
            },
            points: {
              show: true
            }
          };
          $scope.auctChartData = [$scope.bglAreaDataSeries];
          $scope.auctChartOptions = {
            legend: {
              container: '#legend',
              show: true
            },
            axisLabels: {
                show: true
            },
            xaxes: [{
                axisLabel: 'Time',
                mode: "time",
                timeformat: "%d/%m",
                tickSize: [1,"day"],
                labelHeight: 35 //Magic number, to shunt axis-label clear of tick labels
            }],
            yaxes: [{
                position: 'left',
                axisLabel: 'BGL (mmol/L)'
            }]
          };

          $scope.chartReady = true;
        } else {
          $scope.chartReady = true;
        }
      };

      if (DataService.hasData()) {
        DataService.getBglEntries().then(
          function(bglEntries){
            $scope.bglEntries = bglEntries;
            $scope.bglEntriesRetrievalError = null;

            populateChart();
          },
          function(error){
            resetState();
            $scope.bglEntriesRetrievalError = error;
          }
        );
      }
    }]);
}());
