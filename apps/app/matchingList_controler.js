// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var async = require('async');
var common = require('./common_function');
var extension = require('./data_access');

var Search = {};

const NOT_SET_ID = '00000';

exports.get = function(req,res){
  var categoryInfo = [];
  var itemInfo = [];
  console.log(req.body);

  async.waterfall([
    function(callback){
      extension.getCategory(res, callback);
    },
    function(result, callback) {
      categoryInfo = result.ExtensionCategories;
      extension.getCategoryItem(res, callback);
    },
    function(result, callback) {
      itemInfo = result.ExtensionItems;

      var searchquery = Search.createSearchData(req, categoryInfo);
      var requestData = common.createGetRequest('matchings', null, searchquery);
      request.get( requestData, function(error,response,body) {
        if (!error && response.statusCode == 200) {
          if (response.body) {
            console.log('search done.');
            callback(null,response.body['Matchings']);
          }
        } else {
          console.log('search done.(error)');
          common.outputError(error, response);
          callback( response.body, null);
        }
      });
    }
  ],
  function(err,results){
    console.log('async complete.');
    console.log(results);

    var param = [];
    param['resultList'] = [];
    param['count'] = 0 ;
    param['param'] = common.isLogin(req) ;

    if(results != null && Array.isArray(results) ){
      results.forEach( function( elm, idx, arr){
        var room = new Object;
        room['id'] = elm.id;
        room['matchingName'] = elm.matchingName;
        room['matchingPrice'] = elm.matchingPrice;
        var extensionIdentifiers = ['address','num','room_type'];
        extensionIdentifiers.forEach( function(identifier,idx,arr){
          room[identifier] = Search.getValueFromIdentifier(elm.MatchingExtensions,
                                                    categoryInfo,
                                                    itemInfo,
                                                    identifier);
        });
        param['resultList'].push(room);
      });
      param['count'] = results.length ;
    }
    console.log(param['resultList']);
    res.render( 'matchingList', param );
  });
};

Search.createSearchData = function(req, category) {
  var queryData;
  var accountId = null;
  if(req.cookies.account != undefined){
    accountId = req.cookies.account;
    console.log(accountId);
  }
  queryData='sellerAccountId=' + accountId;
  queryData+='&limit=' + 100;
  queryData+='&offset=' + 0;
  console.log('*** search condition ***');
  return queryData;
};

Search.getValueFromIdentifier = function(matchings, categories, items, identifier){
  var categoryId = common.getIDFromIdentifier(categories, identifier);
  var ret = "";
  matchings.forEach( function(elm, idx, arr) {
    if( elm.extensionCategoryId == categoryId) {
      if(elm.dataType == 10){
        ret = common.getItemNameFromId(items, elm.value);
      } else {
        ret = elm.value;
      }
    }
  });
  return ret;
};

// start tuto 3.8.2
exports.delete = function(req,res){
  var matchingId = req.body.id;
  console.log(matchingId);

  async.waterfall([
    function(callback){

      var requestData = common.createDeleteRequest('matchings', matchingId);
      request.delete( requestData, function(error,response,body) {
        if (!error && response.statusCode == 204) {
            console.log('delete done(matchings).');
            callback(null, response.body);
        } else {
          console.log('delete done(matchings).(error)');
          common.outputError(error, response);
          callback( response.body, null);
        }
      });
    },
    function(matching, callback){
      var queryData = 'matchingId=' + matchingId + '&limit=1000&offset=0';
      var requestData = common.createGetRequest('calendars', null, queryData);
      request.get( requestData, function(error,response,body) {
        if (!error && response.statusCode == 200) {
          if (response.body) {
            console.log('search done.');
            callback(null,matching,response.body['Calendars']);
          }
        } else {
          console.log('search done.(error)');
          common.outputError(error, response);
          callback( response.body, null);
        }
      });
    },
    function(matching, calendars, callback){

      async.each(calendars, function(caldata, next) {
        console.log(caldata.id);
        var requestData = common.createDeleteRequest('calendars', caldata.id);
        request.delete( requestData, function(error,response,body) {
          if (!error && response.statusCode == 204) {
            console.log('Calendar DELETE done.');
            next();

          } else {
            console.log('Calendar DELETE done.(error)');
            common.outputError(error, response);
            next();
          }
        });
      },
      function(err) {
        console.log('calendar delete all done.');
        callback(null, matching, calendars, null);
      });
    }
  ],

  function(err,matching,cals,delcals){
    console.log('async complete.');

    if(err){
      console.log('something wrong.')
      console.log(err);
      res.render('error', {'message': 'Something wrong in matching_delete.show console.'});
      return;
    }
    res.redirect( '/complete' );
  }
  );

};
// end tuto 3.8.2
