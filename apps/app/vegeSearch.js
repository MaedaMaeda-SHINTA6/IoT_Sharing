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

  var categories;
  var errors = [];

  async.series([
    function (callback) {
      var requestData = common.createGetRequest('images', null);
      request(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              categories = response.body;
              console.log(categories);
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
          }
          callback(null, null);
        }
      )
    },
  ]);
  var params = { 
    "param": "1" 
  };
  res.render('vegeSearch', params);
};

