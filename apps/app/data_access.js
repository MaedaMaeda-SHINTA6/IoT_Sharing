var common = require('./common_function.js');
var request = require('request');


exports.getCategory = function(res,callback){
  var requestData = common.createGetRequest('extension/categories?limit=1000', null);
  request( requestData, 
    function(error, response, body) {
      if (!error && response.statusCode == 200 && response.body) {
//        console.log('***** SET COOKIE *****');
//        var val = JSON.stringify(response.body.ExtensionCategories);
//        console.log(encodeURIComponent(val));
//        res.cookie( 'categories', encodeURIComponent(val));
//        res.cookie( 'categoriescount', response.body.ExtensionCategories.length );
        callback(null,response.body);
      } else {
        common.outputError(error, response);
        callback(response.body,null);
      }
    }
  )
};

exports.getCategoryItem = function(res,callback){
  var requestData = common.createGetRequest('extension/items?limit=1000', null);
  request( requestData, 
    function(error, response, body) {
      if (!error && response.statusCode == 200 && response.body) {
//        console.log('***** SET COOKIE *****');
//        console.log( response.body.ExtensionItems);
//        res.cookie( 'items', response.body.ExtensionItems );
        callback(null,response.body);
      } else {
        common.outputError(error, response);
        callback(response.body,null);
      }
    }
  )
};

