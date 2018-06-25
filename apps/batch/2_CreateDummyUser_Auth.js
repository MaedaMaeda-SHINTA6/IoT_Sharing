// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var common = require('./common_function');
var async = require('async');

var userId = process.argv[2];
var password = process.argv[3];
var accessToken = process.argv[4];

var HEADERS = {
    'User-Agent': 'rss web service',
    'Content-Type':'application/json;charset=UTF-8',
    'X-Access-Token':accessToken,
    'X-Acl-Token' :''
};

// Output parameters.
for (var i = 0; i < process.argv.length; i++) {
  console.log("Argument["+ i + "] : " + process.argv[i]);
}

// Parameterチェック
if(process.argv.length != 5){
  console.log("Argument was incorrect.Correctly argument is as fellows.");
  console.log("node 2_CreateDummyUser_Auth.js [DummyUserID] [DummyUserPassword] [AccessToken]");
  console.log("Process has ended.");
  process.exit();
};

async.waterfall(
  [
    function(callback) {
      // create the new Account
      console.log("-------- Create the new Account -------- ");
      var requestBody = {
                          'userId' : userId,
                          'password': password,
                          'mailAddress': userId+'@example.com'
                        };
      // リクエスト作成
      requestData = common.createPostRequest('accounts', requestBody, HEADERS);
      console.log("requestData[Create] is ...");
      console.log(requestData);
      // リクエスト送信
      request.post( requestData, function(error, response, body){
        if (error) {
          common.outputError(error, null, null);
          console.error('To create the new Account has failed.');
          console.error('Process has ended.');
          callback(error, null);
        } else if (response.statusCode !== 201) {
          const errResponse = response ? response.body : 'No response.body';
          common.outputError(
            error,
            response ? response.statusCode : null,
            response ? response.statusText : null);
          console.error('To create the new Account has failed.');
          console.error('Process has ended.');
          callback(errResponse, null);
        } else {
          // ok
          console.log('Account has been registered successfully.');
          callback( null, response.body );
        }
      });
    },
    function(result, callback) {
      // authentication
      console.log("-------- Authentication -------- ");
      requestBody = {
                      'userId' : userId,
                      'password': password
                    };
      // リクエスト作成
      requestData = common.createPostRequest('accounts/authentication', requestBody, HEADERS);
      console.log("requestData[Auth] is ...");
      // リクエスト送信
      request.post( requestData, function(error, response, body) {
        if (error) {
          common.outputError(error, null, null);
          console.error('The authentication has failed.');
          console.error('Process has ended.');
          callback(error, null, null);
        } else if (response.statusCode !== 200) {
          const errResponse = response ? response.body : 'No response.body';
          common.outputError(
            error,
            response ? response.statusCode : null,
            response ? response.statusText : null);
          console.error('The authentication has failed.');
          console.error('Process has ended.');
          callback(errResponse, null, null);
        } else {
          // ok
          console.log('Account has been registered successfully.');
          callback( null, result, response.body );
        }
      });
    },
  ],
  function(err, accountInfo, auth){
    console.log('-------- node_2_CreateDummyUser_Auth complete. -------- ');
    if(err){
      // エラー発生時
      console.log("");
      console.log("---------------- Error Occurred. ----------------");
      console.log(err);
      console.log("");
    }else{
      // 正常
      console.log("Created user_id /password : " + userId + "/" + password);
      console.log("AccountID : " + accountInfo.id);
      console.log("ACLToken : " + auth.token);
    };
    console.log("Process has ended.");
  }
);
