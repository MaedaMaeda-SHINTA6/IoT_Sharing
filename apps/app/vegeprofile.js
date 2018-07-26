var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

exports.vegeprofile = function (req, res) {
  // console.log(req.body);
  //ログオンセッションの確認
  if (common.isLogin(req) == 0) {
    res.redirect('/login');
    return;
  }
  //アカウントID取得
  if (req.cookies.account != undefined) {
    accountId = req.cookies.account;
    // console.log("accountId");
    // console.log(accountId);
  }
  //マッチングID取得
  var matchingId = req.params.id;
  // console.log("matchingId");
  // console.log(matchingId);

  async.series([
    function (callback) {
      var requestData = common.createGetRequest('matchings', matchingId, null);
      request(requestData,
        function (error, response, body) {
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
    function (callback) {
      extension.getCategory(res, callback);
    },
    function (callback) {
      extension.getCategoryItem(res, callback);
    },
    function (callback) {
      //Matching_Statesの取得
      var matching_statuses_list;
      var requestData2 = common.createGetRequest('matching_statuses', null,'matchingId=' + matchingId);
      request.get(requestData2,
        function (error, response2, body) {
          if (!error && response2.statusCode == 200) {
            if (response2.body) {
              matching_statuses_list = response2.body;
              callback(null, matching_statuses_list);
            }
          } else {
            common.outputError(error, matching_statuses_list);
            callback(matching_statuses_list, null);
          }
        }
      )
    },
  ],
    function (err, result) {
      console.log('async series complete.');
      if (err) {
        console.log('error happen.');
        res.render('error', { 'message': 'Something is wrong.' });
      } else if (result.length != 4) {
        // console.log('not enough data.');
        //console.log(result);
        res.render('error', { 'message': 'Cannot get enough data.' });
      }
      var params = createParams(result, common.isLogin(req));
      //console.log(params);
      if (params) {
        console.log(params);
        res.render('vegeprofile', params);
      } else {
        res.render('error', { 'message': 'Cannot create vegeprofile view.' });
      }
    });
};

function getExtensionValue(extensionArray, id) {
  var ret = "";
  if (Array.isArray(extensionArray)) {
    extensionArray.forEach(function (element, index, array) {
      if (element['extensionCategoryId'] == id) {
        console.log('return :' + element['value']);
        ret = element['value'];
      }
    });
  }
  return ret;
};
function getExtensionValues(extensionArray, id) {
  var ret = [];
  if (Array.isArray(extensionArray)) {
    extensionArray.forEach(function (element, index, array) {
      if (element['extensionCategoryId'] == id) {
        console.log('return :' + element['value']);
        ret.push(element['value']);
      }
    });
  }
  return ret;
};

function createParams(result, login) {

  var matchingInfo = result[0] != null ? result[0]['Matchings'][0] : null;
  var extensionInfo = result[1] != null ? result[1]['ExtensionCategories'] : null;
  var extensionItemInfo = result[2] != null ? result[2]['ExtensionItems'] : null;
  var matching_statusesInfo = result[3] != null ? result[3]['totalCount'] : null;

  if (!matchingInfo && !accountInfo && !extensionInfo && !matching_statusesInfo) { return null; };

  var matchingExtension = matchingInfo['MatchingExtensions'];
  // console.log(matchingExtension);

  var params = new Object();
  params['headp'] = { 'param': login };
  params['matchingId'] = matchingInfo['id'];
  params['accountId'] = matchingInfo['sellerAccountId'];
  params['matchingName'] = matchingInfo['matchingName'];
  params['vege_price'] = matchingInfo['matchingPrice'];
  // params['matchingDetail'] = matchingInfo['matchingDetail'];
  params['vege_variety_name'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_variety_name'));
  params['vege_location'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_location'));
  params['vege_gm'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_gm'));
  params['vege_quantity'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_quantity'));
  params['delivery_place_latitude'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'delivery_place_latitude'));
  params['delivery_place_longitude'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'delivery_place_longitude'));
  params['extention_id_latitude'] = common.getIDFromIdentifier(extensionInfo, 'delivery_place_latitude');
  params['extention_id_longtitude'] = common.getIDFromIdentifier(extensionInfo, 'delivery_place_longitude');
  params['matching_status']= matching_statusesInfo;

  return params;
};

// start tuto 3.7.2
exports.post = function (req, res) {
  console.log('post start');

  async.waterfall([
    function (callback) {
      var strday = new Date();
      var endday = new Date();
      endday.setDate(endday.getDate() + 1);
      var requestCalBody = {
        "Calendars": [
          {
            "matchingId": req.body.matchingId,
            "useStartDatetime": strday,
            "useEndDatetime": endday,
            "capacity": '1'
          }
        ]
      }
      console.log(requestCalBody);
      callback(null, requestCalBody);
    },
    function (requestCalBody, callback) {
      console.log('requestCalBody start');
      console.log(requestCalBody);
      var requestCalData = common.createPostRequest('calendars', requestCalBody);
      console.log('requestCalData start');
      console.log(requestCalData);
      request.post(requestCalData,
        function (error, response, body) {
          if (!error && response.statusCode == 201) {
            if (response.body) {
              console.log('matching requestCalData.');
              console.log(response.body);
              var caldate = response.body;
              callback(null, caldate);
            }
          } else {
            common.outputError(error, response);
            // console.log(response.body);
            callback(error, null);
          }
        }
      );
      console.log('matching register end.');
    },
    function (caldate, callback) {
      console.log('response');
      console.log(caldate);
      console.log(caldate['Ids'][0]['id']);
      var calid = caldate['Ids'][0]['id'];
      console.log(calid);

      var requestBody = {
        "MatchingStatuses": [
          {
            "sellerAccountId": req.body.accountId,
            "buyerAccountId": req.cookies.account,
            "matchingId": req.body.matchingId,
            "progressStatus": 'Reserved',
            "resourceCost": '1',
            "calendarId": calid,
            "acceptCode": '',
            "MatchingStatusExtensions": [
              {
                //緯度
                "extensionCategoryId": String(req.body.extention_id_latitude),
                "dataType": 21,
                "value": String(req.body.delivery_place_latitude)
              },
              {
                //経度
                "extensionCategoryId": String(req.body.extention_id_longtitude),
                "dataType": 21,
                "value": String(req.body.delivery_place_longitude)
              },
            ]
          }
        ]
      }
      console.log(requestBody);
      callback(null, requestBody);
    },
    function (requestBody, callback) {
      console.log('request start');
      console.log(requestBody);
      var requestData = common.createPostRequest('matching_statuses', requestBody);
      console.log('requestData start');
      console.log(requestData);
      request.post(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 201) {
            if (response.body) {
              console.log('matching register.');
              callback(error, response.body, requestBody);
            }
          } else {
            common.outputError(error, response);
            console.log(response.body);
            callback(error, response.body, requestBody);
          }
        }
      );
      console.log('matching register end.');
    }
  ],
    function (err, results) {
      if (err) {
        res.render('error', { 'message': 'Something Error happened in profile Vegetable.' });
        return;
      }
      console.log('async complete.');
      res.redirect('/');
    }
  );
}
