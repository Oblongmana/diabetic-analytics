(function () {
  'use strict';

  var angular = require('angular');
  var d3 = require('d3');

  angular.module('diabeticAnalytics').directive('auctSeries',
    [
    '$log',
    function(
      $log
      ) {

      var margin = {top: 20, right: 20, bottom: 75, left: 50};
      var width = 960 - margin.left - margin.right;
      var height = 500 - margin.top - margin.bottom;

      return {
        restrict: 'E',
        scope: {
          //Unless you'd like another 10 minutes of frustration again, don't call
          // any of your items 'dataSomething' - because the markup for that is
          // `data-something` - and of course the `data-` prefix is special, and
          // gets stripped -_- Silly billy
          bglEntries: '=',
          datetimeAccessor: '=',
          bglAccessor: '='
        },
        link: function ($scope, element, attrs) {
          // Setup SVG
          var d3Vis = d3.select(element[0])
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          //Blank slate
          d3Vis.selectAll('*').remove();


          //Basic scales, axis, and line functions
          var xScale = d3.time.scale()
            .range([0, width]);

          var yScale = d3.scale.linear()
            .range([height, 0]);

          var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(d3.time.day,1)
            .tickFormat(d3.time.format('%d/%m'));

          var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

          var bglLine = d3.svg.line()
              .x(function(dataPoint) { return xScale(dataPoint[$scope.datetimeAccessor]); })
              .y(function(dataPoint) { return yScale(dataPoint[$scope.bglAccessor]); });

          xScale.domain(d3.extent($scope.bglEntries, function(d) { return d[$scope.datetimeAccessor]; }));
          //Blood Glucose axis always starts at 0 (as the y axis on most good graphs should!)
          yScale.domain([0,d3.max($scope.bglEntries, function(d) { return d[$scope.bglAccessor]; })]);


          //draw x axis
          var xAxisDrawingGroup = d3Vis.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
          //rotate x axis ticks
          xAxisDrawingGroup.selectAll('.tick').selectAll('text')
            .style("text-anchor", "end" )
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

          //draw x axis label
          d3Vis.append("text")
              .attr("x", (width / 2) + margin.left)
              .attr("y", height + margin.bottom)
              .attr("dy", "-.71em")
              .style("text-anchor", "middle")
              .text("Time (Start of day)");

          //draw y axis
          d3Vis.append("g")
            .attr("class", "y axis")
            .call(yAxis);

          //draw y axis label
          d3Vis.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margin.left)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Blood Glucose Measurement (mmol/L)");

          //Add the value line
          d3Vis.append("g")
            .append("path")
            .data([$scope.bglEntries])
            .attr("class", "bgl-line")
            .attr("d", bglLine);

          //Add circles at each data point
          d3Vis.selectAll(".point")
            .data($scope.bglEntries)
            .enter()
              .append("circle")
              .attr('class', 'data-point')
              .attr('cx', function(data) { return xScale(data[$scope.datetimeAccessor]); })
              .attr('cy', function(data) { return yScale(data[$scope.bglAccessor]); })
              .attr('r', 3);

          //Add the highlight point (invisible at the moment)
          var highlightPointContainer = d3Vis.append("g")
            .style("display", "none");
          var highlightPoint = highlightPointContainer.append("circle")
            .attr("class", "highlight-point")
            .attr("r", 4);

          // d3Vis.append("g").style("display", "none").append('circle').attr('class','urgh');
          // var penis = d3Vis.append("g");
          // penis.append('circle').attr('class','blargh');

          //Function for finding the index at which a supplied datetime would be
          // inserted into the supplied array (inserting to the left if an exact
          // match already exists in the array)
          var bisectDatetime = d3.bisector(function(data) { return data[$scope.datetimeAccessor]; }).left;
          //Functions for displaying highlight point at data point nearest
          // mouse coord
          var highlightDataOnMouseMove = function () {
            $log.debug('auct-series: calculating data point to highlight');
            var xCoordAsDatetime = xScale.invert(d3.mouse(this)[0]);
            $log.debug('auct-series: xCoordAsDatetime:',xCoordAsDatetime);
            var dataPointIndex = bisectDatetime($scope.bglEntries, xCoordAsDatetime);
            $log.debug('auct-series: dataPointIndex:', dataPointIndex);
            var dataPointLeft = $scope.bglEntries[dataPointIndex-1];
            var dataPointRight = $scope.bglEntries[dataPointIndex];
            var datetimeToHighlight;
            if (!dataPointRight) {
              datetimeToHighlight = dataPointLeft;
            } else if (!dataPointLeft) {
              datetimeToHighlight = dataPointRight;
            } else if ( (xCoordAsDatetime - dataPointLeft[$scope.datetimeAccessor])
                  > (dataPointRight[$scope.datetimeAccessor] - xCoordAsDatetime)) {
              datetimeToHighlight = dataPointRight;
            } else {
              datetimeToHighlight = dataPointLeft;
            }
            $log.debug('auct-series: datetimeToHighlight[datetime]:',new Date(datetimeToHighlight[$scope.datetimeAccessor]));

            highlightPoint.attr("transform",
                      "translate(" + xScale(datetimeToHighlight[$scope.datetimeAccessor]) + "," +
                                     yScale(datetimeToHighlight[$scope.bglAccessor]) + ")");
          };

          //Draw mouse-capturing rect
          d3Vis.append("rect")
              .attr("width", width)
              .attr("height", height)
              .style("fill", "none")
              .style("pointer-events", "all")
              .on("mouseover", function() { highlightPointContainer.style("display", null); })
              .on("mouseout", function() { highlightPointContainer.style("display", "none"); })
              .on("mousemove", highlightDataOnMouseMove);

        }
      };

    }]);
}());
