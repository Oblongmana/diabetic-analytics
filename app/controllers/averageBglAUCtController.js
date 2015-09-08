(function () {
  'use strict';

  var angular = require('angular');
  var _ = require('lodash');
  var moment = require('moment');
  require('flot');
  require('flot-resize');
  require('flot-time');
  require('flot-axislabels');

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

      $scope.doTheThing = function(plotObj) {
        window.plotObj = plotObj;
      };

      var populateChart = function() {
        if ($scope.bglEntries) {
          //we'll work out the min moment while doing some other data manipulation
          var minMoment = moment($scope.bglEntries[1][DataService.Fields.DateTime]); 

          $scope.bglAreaDataSeries = { 
            data: _.map($scope.bglEntries,function(bglEntry){
              var bglMoment = moment(bglEntry[DataService.Fields.DateTime]);
              if (bglMoment.isBefore(minMoment)) {
                minMoment = bglMoment; 
              }
              return [
                bglMoment.valueOf(),
                bglEntry[DataService.Fields.BGL_mmol_L]
              ];
            }),
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
                min: minMoment.valueOf(),
                ticks: function(axis) {
                  //This ticks function gives uniform gaps between axes and vertical
                  // grid lines, with 1 day ticks, starting at the start of the day 
                  // of the earliest entry, and ending just after the latest entry
                  var ticks = [];
                  var currMoment = moment(axis.min);
                  var maxMoment = moment(axis.max);
                  //Start at the start of the first day
                  ticks.push(currMoment.startOf('day').valueOf());
                  //Step day by day til we hit max
                  while (currMoment.add(1,'day').isBefore(maxMoment)) {
                    ticks.push(currMoment.valueOf());
                  }
                  //Now that we are either >= maxMoment, we can add the final tick
                  ticks.push(currMoment.valueOf());
                  return ticks;
                },
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
