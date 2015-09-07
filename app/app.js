(function () {
  'use strict';

  var angular = require('angular');

  angular.module('diabeticAnalytics', [
    require('angular-flot'),
    require('angular-ui-router'),
    require('angular-resource'),
    require('angular-file')
  ]);

  require('./controllers');
  require('./services');
}());
