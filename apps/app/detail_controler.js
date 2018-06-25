var request = require('request');
var async = require('async');
var config = require('./config.json')
var common = require('./common_function');
var extension = require('./data_access.js');

exports.detail = function(req, res) {
  var matchingId = req.params.id;
  var searchDate = ((req.query.date == undefined ||
                     req.query.date == null ||
                     req.query.date == "") ?
                      common.createDateStringFromYYYYMMDDObject(new Date()) :
                      req.query.date).slice(0,10);
  console.log(searchDate);
  var accountId;

  async.series([
    function( callback ) {
      var requestData = common.createGetRequest('matchings', matchingId,null);
      request( requestData,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              //console.log(response.body);
              accountId = response.body['Matchings'][0]['sellerAccountId'];
              callback(null, response.body);
            }
          } else {
            common.outputError(error, response);
            callback(response.body, null);
          }
        }
      )
    },
    function(callback){
      var limit = 1000;
      var now = new Date();
      var nowTwomonth = new Date();
      nowTwomonth.setMonth(now.getMonth()+1);
      var nowDate = common.createDateStringFromYYYYMMDDObject(now);
      var twomonth = common.createDateStringFromYYYYMMDDObject(nowTwomonth);
      var requestData = common.createGetRequest('calendars',null,'matchingId='
                                                 +matchingId
                                                 +'&sinceUseStartDatetime='
                                                 +nowDate
                                                 +'&untilUseStartDatetime='
                                                 +twomonth
                                                 +'&minRemainingCost=1&limit='
                                                 +limit);
      request( requestData,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              //console.log(response.body);
              callback(null, response.body);
            }
          } else {
            common.outputError(error, response);
            callback(response.body, null);
          }
        }
      )
    },
    function(callback) {
      extension.getCategory(res, callback);
    },
    function(callback) {
      extension.getCategoryItem(res, callback);
    }
  ],
  function(err, result) {
    console.log('async series complete.');
    if(err){
      console.log('error happen.');
      res.render('error' , {'message':'Something is wrong.'});
    } else if (result.length != 4) {
        console.log('not enough data.');
        //console.log(result);
        res.render('error' , {'message':'Cannot get enough data.'});
    }
    var params = createParams(result, searchDate.slice(0,4)+searchDate.slice(5,7)+searchDate.slice(8,10), common.isLogin(req));
    if (params) {
      res.render( 'detail', params );
    } else {
      res.render('error' , {'message':'Cannot create detail view.'});
    }
  });
};

function getExtensionValue(extensionArray, id){
  var ret = "";
  if(Array.isArray(extensionArray)){
    extensionArray.forEach( function(element,index,array){
      if(element['extensionCategoryId'] == id){
       console.log('return :' + element['value']);
       ret =  element['value'];
      }
    });
  }
  return ret;
};
function getExtensionValues(extensionArray, id){
  var ret = [];
  if(Array.isArray(extensionArray)){
    extensionArray.forEach( function(element,index,array){
      if(element['extensionCategoryId'] == id){
       console.log('return :' + element['value']);
       ret.push(element['value']);
      }
    });
  }
  return ret;
};

function createParams(result, searchDate, login){

  var matchingInfo = result[0] !=null ? result[0]['Matchings'][0]:null;
  var calendarInfo = result[1] !=null ? result[1]['Calendars'] :null;
  var extensionInfo = result[2] !=null ? result[2]['ExtensionCategories'] :null;
  var extensionItemInfo = result[3] !=null ? result[3]['ExtensionItems'] :null;

  if (!matchingInfo && !accountInfo && !calendarInfo && !extensionInfo) { return null;};

  var matchingExtension =  matchingInfo['MatchingExtensions'];
  console.log(matchingExtension);

  calendarInfo.sort( function(val1,val2){
    if(val1.useStartDatetime < val2.useStartDatetime) return -1;
    if(val2.useStartDatetime < val1.useStartDatetime) return 1;
    return 0
  });

  var dateList = createCalListYYYYMMDD(calendarInfo);
  var datetimeArray=createTimeListSelectedDay(calendarInfo, searchDate);

  var params = new Object();
  params['headp'] = {'param': login};
  params['matchingId'] = matchingInfo['id'];
  params['accountId'] = matchingInfo['sellerAccountId'];
  params['matchingName'] = matchingInfo['matchingName'];
  params['matchingDetail'] = matchingInfo['matchingDetail'];
  params['address'] = getExtensionValue(matchingExtension,common.getIDFromIdentifier(extensionInfo, 'address'));
  params['searchDate'] = searchDate.slice(0,4)+'/'+searchDate.slice(4,6)+'/'+searchDate.slice(6,8);
  params['num'] = Math.floor(getExtensionValue(matchingExtension,common.getIDFromIdentifier(extensionInfo, 'num')));

  params['roomType'] = common.getItemNameFromId(
                          extensionItemInfo,
                          getExtensionValue(
                                matchingExtension,
                                common.getIDFromIdentifier(extensionInfo, 'room_type')));


  var matchingExIDs = getExtensionValues(matchingExtension,common.getIDFromIdentifier(extensionInfo, 'facility'));
  console.log('matchingExIDs is ' + matchingExIDs);
  var facilityNamelist = [];
  for (var i = 0; i < matchingExIDs.length; i++) {
    facilityNamelist.push(common.getItemNameFromId(extensionItemInfo,matchingExIDs[i]));
  }
  params['facility'] = facilityNamelist;
  params['matchingPrice'] = matchingInfo['matchingPrice'];
  params['dateList'] = dateList.join(',');
  params['timetable'] = datetimeArray;

  //
  console.log(params);
  return params;
};

function createCalListYYYYMMDD(calendarInfo){
  var dateArray=[];
  for (var i = 0; i < calendarInfo.length; i++) {
    //dateArray.push(calendarInfo[i].useStartDatetime.slice(0)
    dateArray.push(calendarInfo[i].useStartDatetime.slice(0,4)
          +'/'
          +calendarInfo[i].useStartDatetime.slice(5,7)
          +'/'
          +calendarInfo[i].useStartDatetime.slice(8,10));
  };
  return dateArray.filter(function(x,i,self){return self.indexOf(x) ===i});
}


function createTimeListSelectedDay(calendarInfo, searchDate){
  console.log('createTimeListSelectedDay');
  var datetimeArray = [];
  for (var i = 0; i < calendarInfo.length; i++) {
    var yyyymmdd = calendarInfo[i].useStartDatetime.slice(0,4)+calendarInfo[i].useStartDatetime.slice(5,7)+calendarInfo[i].useStartDatetime.slice(8,10);
    if ( yyyymmdd == searchDate) {
      var time = {'id':calendarInfo[i].id,
                    'time':calendarInfo[i].useStartDatetime.slice(11,13)
                  };
      datetimeArray.push(time);
    }
  };
  return datetimeArray;
}

// start tuto 3.7.2
exports.reserve = function(req,res){
  console.log('reserve start');

  if(common.isLogin(req) == 0){
    res.redirect('/login');
    return;
  }
  console.log(req.body);
  var selectedDate = req.body.selectedDate;
  var calIDs = [];
  if(Array.isArray(req.body.timetable)){
    calIDs = req.body.timetable;
  } else {
    calIDs.push(req.body.timetable);
  }

  async.waterfall([
    function(callback){
      var calendars = [];
      console.log('func-Get calendar :' + selectedDate.toString());

      async.each( calIDs, function(cal,next) {
        console.log('START each calendar :' + cal);
        var getCalData = common.createGetRequest('calendars', cal, null);
        request( getCalData, function(error, response, body){
          if (!error && response.statusCode == 200 && response.body) {
            console.log(response.body);
            if (response.body.remainingCost == 0) {
              next();
            }
            calendars.push(response.body.Calendars[0]);
            next();
          } else {
            console.log('cal get.(error)');
            common.outputError(error, response);
            next();
          }
        });
      }, // end of each function.
      function(err){
        console.log('each complete.');
        console.log( calendars );
        if( calendars.length != calIDs.length ){
          console.log('calendar conflicted');
          callback('calendar conflict',null);
          return;
        }
        callback( null , calendars);
      });
    },
    function(cals, callback) {
      console.log('func-Post matchingstatus :' );
      if(cals == null  || cals == undefined ||
         !Array.isArray(cals) || cals.length == 0 ){
        console.log('No Calendar.');
        callback('calendar doesnot exist.', null);
        return;
      }

      console.log(cals);
      var body = createMatchingStatuses(req,cals);
      var requestData = common.createPostRequest('matching_statuses', body);
      request.post( requestData, function(error,response,body){
        if (!error && response.statusCode == 201 && response.body) {
          callback(null, cals);
        } else {
          console.log('status post.(error)');
          common.outputError(error, response);
          callback( response.body, null);
        }

      });
    },
    function(cals, callback) {
      console.log('func-Put calenar :' );
      var error;
      if(cals == null || cals == undefined || !Array.isArray(cals) ){
        callback('calendar is undef.', null);
        return;
      }
      console.log(cals);

      async.each( cals, function( cal, next ){
        var id = cal['id'];
        console.log(id);
        var body = createCalendarUpdateData();
        var putCalData = common.createPutRequest('calendars', id, body);
        request.put( putCalData, function(error,response,body){
          if (!error && response.statusCode == 200 && response.body) {
            next();
          } else {
            console.log('cal put.(error)');
            common.outputError(error, response);
            error = 'Put cal error.'
            next();
          }
        })
      },
      function(err){
        console.log(err);
        callback(null, cals);
      });
    }
  ], // end of waterfall function array.
  function(err, cals) {
    console.log('create status and update calendar all done.');

    if(err){
      console.log('something wrong.')
      console.log(err);
      res.render('error', {'message': 'Something wrong in research.show console.'});
      return;
    }
    res.redirect( '/complete' );
  });
};

createMatchingStatusData = function(req, cal,code){
  console.log(req.body);
  console.log(req.cookies.account);
  console.log(cal);
  console.log(code);
  var data = new Object;
  data['sellerAccountId'] = req.body.accountId;
  data['buyerAccountId'] = req.cookies.account;
  data['matchingId'] = cal.matchingId;
  data['progressStatus'] = '0';
  data['resourceCost'] = '1';
  data['calendarId'] = cal.id;
  data['acceptCode'] = code;
  return data;
};

createMatchingStatuses = function(req, cals){
  var statuses = [];
  var code=req.cookies.account + new Date().getTime();
  cals.forEach( function(cal,i,arr){
    statuses.push(createMatchingStatusData(req,cal,code));
  });
  var obj = {'MatchingStatuses': statuses };
  return obj;
};
// end tuto 3.7.2

createCalendarUpdateData = function(){
  var updateiData;
  updateData ={'remainingCost':0};
  return updateData;
};


exports.research = function(req,res){
  console.log('research start');
  var date = req.body.h_selectedDate;//yyyymmdd
  var nextDate = common.createDateFromYYYYMMDD(req.body.h_selectedDate);
  nextDate.setDate(nextDate.getDate() + 1);
  var matchingId = req.body.matchingId;

  async.waterfall([
    function(callback) {
      extension.getCategory(res,callback);
    },
      function(extensions, callback){
      var requestData = common.createGetRequest('calendars',null,'matchingId='
                                                 +matchingId
                                                 +'&sinceUseStartDatetime='
                                                 + (date.slice(0,4)+'-'+date.slice(4,6)+'-'+date.slice(-2)+'T00:00:00.000Z')
                                                 +'&untilUseStartDatetime='
                                                 + common.createDateStringFromYYYYMMDDObject(nextDate)
                                                 +'&minRemainingCost=1&limit=1000');
      request( requestData,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              console.log(response.body);
              callback(null, extensions, response.body);
            }
          } else {
            common.outputError(error, response);
            callback(response.body, null);
          }
        }
      )
    }
  ],
  function(err, extensions, calendars) {
    console.log('async waterfall complete.');
    if(err){
      console.log('error happen.');
      res.render('error' , {'message':'Cannot get research information.'});
    }
    var params = createResearchData(calendars, extensions, req.body);
    if (params) {
      params['headp'] = {'param': common.isLogin(req)}
      res.render( 'detail', params );
    } else {
      res.render('error' , {'message':'Cannot create research data.'});
    }
  })
};

function createResearchData(calendars,extensions,reqbody) {
  console.log('createResearchData');

  var calendarInfo = calendars['Calendars'];
  var extensionInfo = extensions['ExtensionCategories'];
  var searchDate = reqbody.h_selectedDate;

  calendarInfo.sort( function(val1,val2){
    if(val1.useStartDatetime < val2.useStartDatetime) return -1;
    if(val2.useStartDatetime < val1.useStartDatetime) return 1;
    return 0
  });

  var datetimeArray = createTimeListSelectedDay(calendarInfo, searchDate);

  var params = new Object();
  params['username'] = reqbody.user_name;
  params['matchingId'] = reqbody.matchingId;
  params['accountId'] = reqbody.accountId;
  params['matchingName'] = reqbody.matchingName;
  params['matchingDetail'] = reqbody.matchingDetail;
  params['address'] = reqbody.address;
  params['searchDate'] = searchDate.slice(0,4)+'/'+searchDate.slice(4,6)+'/'+searchDate.slice(6,8);
  params['num'] = reqbody.num;
  params['roomType'] = reqbody.roomType;
  params['facility'] = new Array(reqbody.facility);
  params['matchingPrice'] = reqbody.matchingPrice;
  params['dateList'] = reqbody.dateList;
  params['timetable'] = datetimeArray;
  return params;
}
