// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var async = require('async');
var common = require('./common_function');
var extension = require('./data_access.js');

exports.get = function(req,res) {
  var categories;
  var items;
  var errors = [];
  async.series([
    function(callback) {
      var requestData = common.createGetRequest('extension/categories?limit=1000', null);
      request( requestData,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              categories = response.body;
            }
          } else {
            common.outputError(error, response);
            errors.push( response.body );
          }
          callback(null, null);
        }
      )
    },
    function(callback) {
      var requestData2 = common.createGetRequest('extension/items?limit=1000', null);
      request( requestData2,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              items = response.body;
            }
          } else {
            common.outputError(error, response);
            errors.push( response.body);
          }
          callback(null, null);
        }
      )
    }],
    function(err,result) {
      console.log('async complete.');
      if(errors.length !=0){
        console.log(errors);
        res.render('error', {'message':'Faild to get category data.'});
        return;
      };
      var room_type_item =[];
      var facility_item = [];

      for(var i=0; i<items.ExtensionItems.length; i++){
        switch( items.ExtensionItems[i].identifier ){
          case 'room_type_item':
            room_type_item.push( items.ExtensionItems[i] );
            break;
          case 'facility_item':// facility_item
            facility_item.push( items.ExtensionItems[i] );
            break;
          default: break;
        }
      };

      arrays = [room_type_item,facility_item];
      arrays.every( function(arr) {
        arr.sort( function(val1,val2){
          if(val1.displayOrder < val2.displayOrder) return -1;
          if(val2.displayOrder < val1.displayOrder) return 1;
          return 0
        });
        return true;
      });

      var address = new Object();
      var num = new Object();
      var roomType = new Object();
      var facility = new Object();
      var sharingStart = new Object();
      var sharingEnd = new Object();

      for (var n = 0 ; n < categories['ExtensionCategories'].length; n ++){
        var category = categories['ExtensionCategories'][n];

        switch (category.identifier){
          case 'address':
            address['id'] = category.id;
            address['identifier'] = category.identifier;
            address['displayName'] = category.displayName;
            address['require'] = 'display_required';
            break;
          case 'num':
            num['id'] = category.id;
            num['identifier'] = category.identifier;
            num['displayName'] = category.displayName;
            num['require'] = 'display_required';
            break;
          case 'room_type':
            roomType['id'] = category.id;
            roomType['identifier'] = category.identifier;
            roomType['displayName'] = category.displayName;
            roomType['require'] = 'display_required';
            break;
          case 'facility':
            facility['id'] = category.id;
            facility['identifier'] = category.identifier;
            facility['displayName'] = category.displayName;
            facility['require'] = 'display_not_required';
            break;
          case 'sharing_start':
            sharingStart['id'] = category.id;
            sharingStart['identifier'] = category.identifier;
            sharingStart['displayName'] = category.displayName;
            sharingStart['require'] = 'display_required';
            break;
          case 'sharing_end':
            sharingEnd['id'] = category.id;
            sharingEnd['identifier'] = category.identifier;
            sharingEnd['displayName'] = category.displayName;
            sharingEnd['require'] = 'display_required';
            break;
          default:
            continue;
        };
      }

      var params = { "categories": categories,
                     "address": address,
                     "num": num,
                     "roomType": roomType,
                     "facility": facility,
                     "sharingStart": sharingStart,
                     "sharingEnd": sharingEnd,
                     "room_type_item":room_type_item,
                     "facility_item":facility_item,
                     "param": "1"
                   };
      res.render( 'register',params );
    }
  );
};


// start tuto 3.5.2
exports.post = function(req,res){
  console.log( req.body );

  async.waterfall([
    function(callback) {
      extension.getCategory(res, callback);
    },

    function(results,callback) {
      var registerBody = createRegisterData(req,results);

      var requestData = common.createPostRequest('matchings', registerBody);
      request.post( requestData, function(error,response,body) {
        if (!error && response.statusCode == 201) {
          if (response.body) {
            console.log('matching register.');
            callback(error,response.body,results);
          }
        } else {
          common.outputError(error, response);
          console.log(response.body);
          callback(error,response.body, results);
        }
      });
      console.log('matching register end.');
    },
    function(matchingRes,results,callback) {
      console.log('****** calendar ******');
      console.log(matchingRes);
      console.log(matchingRes['id']);

      if(matchingRes['id'] === undefined){
        console.log("matching register err.");
        callback("err",matchingRes,null,null);
        return;
      };

      var calBody = createCalendarData(req.body, matchingRes['id'] );

      var requestData = common.createPostRequest('calendars', calBody);
      request.post( requestData, function(error,response,body) {
        if (!error && response.statusCode == 201) {
          if (response.body) {
            console.log('calendar register.');
            console.log(response.body);
            callback(error,matchingRes,results,response.body);
          }
        } else {
          common.outputError(error, response);
          console.log(response.body);
          callback(error,matchingRes,results,response.body);
        }
      });
    }
  ],
  function(err,matchingRes,results,results2) {
    if(err){
      res.render('error', {'message': 'Something Error happened in register room.'});
      return;
    }
    console.log('async complete.');
    res.redirect( '/complete' );
  });
};

createRegisterData = function(req,results) {
  var accountId = null;
  if(req.cookies.account != undefined){
    accountId = req.cookies.account;
    console.log(accountId);
  }
  var bodyData = {
    "matchingName": req.body.room_name,
    "matchingDetail": req.body.description,
    "matchingPrice": Number(req.body.price),
    "postStartDate":req.body.h_publish_from,
    "postEndDate":req.body.h_publish_to,
    "MatchingExtensions":[
      {
        "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'address'),
        "dataType": 20,
        "value": req.body.address
      },
      {
        "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'num'),
        "dataType": 21,
        "value": req.body.num
      },
      {
        "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'room_type'),
        "dataType": 10,
        "value":  req.body.room_type_item
      },
      {
        "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'sharing_start'),
        "dataType": 22,
        "value": req.body.h_share_from
      },
      {
        "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'sharing_end'),
        "dataType": 22,
        "value": req.body.h_share_to
      }

    ]
  };
  if(req.body.facility_item != null){
    if(req.body.facility_item instanceof Array) {
      for (var i = 0; i < req.body.facility_item.length; i++) {
        var facility =  {
            "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'facility'),
            "dataType": 10,
            "value": req.body.facility_item[i]
        };
        bodyData.MatchingExtensions.push(facility);
      };
    } else {
      var facility =  {
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'facility'),
          "dataType": 10,
          "value": req.body.facility_item
      };
      bodyData.MatchingExtensions.push(facility);
    }
  };
  console.log(bodyData);
  return bodyData;
};

createCalendarData = function( body, matchingId) {
  console.log( matchingId  );

  console.log('start create calendar data for hour');
  var date = common.createDateFromYYYYMMDDHH(body['sharing_start']+'00');//sharing_start
  var endDate = common.createDateFromYYYYMMDDHH(body['sharing_end']+'23'); //sharing_end
  console.log( 'calendar :' + date + '-' + endDate  );

  var calendars = { 'Calendars':[] };
  while( date.getTime() <= endDate.getTime() ){
    var dateStringStart = common.createDateStringFromYYYYMMDDHHObject(date);
    date.setHours( date.getHours() + 1 );
    var dateStringEnd = new Date(date);
    dateStringEnd = new Date(dateStringEnd.setMilliseconds( dateStringEnd.getMilliseconds() - 1 ));

    var calData = {'matchingId': matchingId,
               'useStartDatetime': dateStringStart,
               'useEndDatetime': dateStringEnd,
               'capacity': 1,
               'remainingCost':1};
    calendars.Calendars.push(calData);
  }
  console.log(calendars);
  console.log('end create calendar data.');
  return calendars;
};
// end tuto 3.5.2
