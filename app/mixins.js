(function () {
  'use strict';

  var _ = require('lodash');

  _.mixin({
    insert: function(array,index,value){
      array.splice(index, 0, value);
      return array;
    }
  });
  
}());
