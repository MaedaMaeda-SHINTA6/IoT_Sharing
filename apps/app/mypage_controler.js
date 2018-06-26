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
  if(req.cookies.account != undefined){
    accountId = req.cookies.account;
    console.log(accountId);
  }
  //アカウント情報取得
  var requestData = common.createGetRequest('/accounts/', accountId);
  console.log(requestData);
  request( requestData,
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        if (response.body) {
          categories = response.body;
          console.log(categories);
        }
      } else {
        common.outputError(error, response);
        errors.push( response.body );
      }
      //callback(null, null);
    }
  )
  



  var params = { "param": "1" };
  res.render('mypage', params);
};

exports.update = function (req, res) {
  console.log(req.body);
  res.redirect('/mypage');
};

