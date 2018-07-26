var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

exports.get = function (req, res) {
  console.log(req.body);
  //ログオンセッションの確認
  if (common.isLogin(req) == 0) {
    res.redirect('/login');
    return;
  }
  //アカウントID取得
  if (req.cookies.account != undefined) {
    accountId = req.cookies.account;
    console.log(accountId);
  }

  var matching_categories;
  var matching_list = [];
  var error = [];

  async.waterfall([
    function (callback) {
      //Matching_Statesの取得
      var requestData = common.createGetRequest('matching_statuses', null);
      request(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              matching_categories = response.body;
              callback(null, matching_categories);
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
          }
        }
      )
    },
    function (matching_categories, callback) {

      async.waterfall([
        function (callback) {
          extension.getCategory(res, callback);
        },
        function (result, callback) {
          latitude_id = common.getIDFromIdentifier(result.ExtensionCategories, 'delivery_place_latitude');
          longitude_id = common.getIDFromIdentifier(result.ExtensionCategories, 'delivery_place_longitude');
          callback(error, latitude_id, longitude_id);
        }
      ],
        function (err, results, results2) {
          console.log("async2 end");

          for (i = 0; i < matching_categories['MatchingStatuses'].length; i++) {
            if (matching_categories['MatchingStatuses'][i]['MatchingStatusExtensions'].length != 0) {
              for (j = 0; j < matching_categories['MatchingStatuses'][i]['MatchingStatusExtensions'].length; j++) {
                var matching_extension = matching_categories['MatchingStatuses'][i]['MatchingStatusExtensions'];
                matching_list[i] = { "matching_id": matching_categories['MatchingStatuses'][i]['matchingId'] };
                //緯度
                matching_list[i]['lat'] = matching_extension[1]['value'];
                //経度
                matching_list[i]['lng'] = matching_extension[0]['value'];
              }
            }
          }
          console.log(matching_list);
          var params = {
            "param": "1",
            "matching_list": matching_list
          };
          res.render('vegeRoute', params);
          callback(null);
        }
      );
    },
  ],
    function (err) {
      console.log("end");
    });
};

