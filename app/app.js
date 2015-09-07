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

  angular.module('diabeticAnalytics').config(
    [
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider,$urlRouterProvider) {

      //https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-make-a-trailing-slash-optional-for-all-routes
      //
      //ngRoute (used in the app before moving to ui-router) is automatically forgiving of trailing slashes
      //However, ui-router is not. This saves us from:
      // a) having to ensure any links are properly slashed/unslashed
      // b) users, who like to play with urls sometimes, and don't think about slashes
      //
      //NOTE: this means our state urls now must be defined with a slash at the end
      $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.path()
          // Note: misnomer. This returns a query object, not a search string
          , search = $location.search()
          , params
          ;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
          return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
          return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function(v, k){
          params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
      });

      // Actual Routing
      $stateProvider.state('import', {
        url: '/import/',
        templateUrl: '../views/import.html',
        controller: 'csvImportController'
      });
      $stateProvider.state('average-bgl-auct', {
        url: '/average-bgl-auct/',
        templateUrl: '../views/average-bgl-auct.html',
        // controller: 'csvImportController'
      });
    }
  ]);

}());
