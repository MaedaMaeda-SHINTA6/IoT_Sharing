var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

exports.get = function (req, res) {
  console.log(req.body);
  var errors = [];
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
  //アカウント情報取得
  async.waterfall([
    function (callback) {
      var requestData = common.createGetRequest('/accounts/', accountId);
      request(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              categories = response.body;
              console.log(categories);
              var params = {
                "MemberId": categories['Accounts'][0]['id'],
                "Account": categories['Accounts'][0]['userId'],
                "MailAddress": categories['Accounts'][0]['mailAddress'],
                "LastLoginTime": categories['Accounts'][0]['lastLoginDatetime'],
                "role": categories['Accounts'][0]['role'],
                "displayName": categories['Accounts'][0]['AccountExtensions'][0]['value'],
                "param": "1"
              };
              callback(null);
              res.render('mypage', params);
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
            res.redirect('/');
          }
        }
      )
    }
  ]);
};

exports.update = function (req, res) {
  console.log(req.body);
  res.redirect('/mypage');
};

