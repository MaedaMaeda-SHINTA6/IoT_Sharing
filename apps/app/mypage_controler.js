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
              console.log(categories['Accounts'][0]['AccountExtensions']);
              var params = {
                "MemberId": categories['Accounts'][0]['id'],
                "Account": categories['Accounts'][0]['userId'],
                "MailAddress": categories['Accounts'][0]['mailAddress'],
                "LastLoginTime": categories['Accounts'][0]['lastLoginDatetime'],
                "role": categories['Accounts'][0]['role'],
                "displayName": categories['Accounts'][0]['AccountExtensions'][0]['value'],
                "extensions_id": categories['Accounts'][0]['AccountExtensions'][0]['extensionCategoryId'],
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
  var error = [];

  var accountId = req.cookies.account;
  async.waterfall([
    function (callback) {
      var requestBody = {
        'extensions_id': req.body.extensions_id,
        'MemberId': req.body.MemberId,
        'Account': req.body.Account,
        'MailAddress': req.body.MailAddress,
        'role': req.body.role,
        'displayName': req.body.displayName,
        'old_password': req.body.old_password,
        'new_password1': req.body.new_password1,
        'new_password2': req.body.new_password2
      }

      callback(null, requestBody);

    },
    function (requestBody, callback) {
      if (requestBody.new_password1 != requestBody.new_password2) {
        res.render('error', { 'message': '新しいパスワードが一致しません。' });
      } else {
        var putBodyData = {
          "userId": requestBody.Account,
          "newPassword": requestBody.new_password1,
          "oldPassword": requestBody.old_password,
          "mailAddress": requestBody.MailAddress,
          "status": 0,
          "AccountExtensions": [
            {
              "extensionCategoryId": requestBody.extensions_id,
              "dataType": 20,
              "value": "yasai taro",
              "publicLevel": 0
            }
          ]
        };
        callback(null, putBodyData);
      }
    },
    function (putBodyData,callback) {
      var requestData = common.createPutRequest("accounts",accountId,putBodyData);
      console.log(requestData);
      var putdatas;
      request.put(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              putdatas = response.body;
              //callback(null, putdatas);
            }
          } else {
            common.outputError(error, response);
          }
        }
      );
      callback(error, putdatas);
    }
  ],
    function (err, putdatas) {
      console.log("async end");
      res.redirect('/mypage');
    }
  );
};

