// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var common = require('./common_function');

var accountId = process.argv[2];
var accessToken = process.argv[3];
var aclToken = process.argv[4];

var HEADERS = {
    'User-Agent': 'rss web service',
    'Content-Type':'application/json;charset=UTF-8',
    'X-Access-Token' :accessToken,
    'X-Acl-Token' :aclToken
};

// Output parameters.
for (var i = 0; i < process.argv.length; i++) {
  console.log("Argument["+ i + "] : " + process.argv[i]);
}

console.log("-------- Delete dummyUser -------- ");

// Parameterチェック
if(process.argv.length != 5){
  console.log("Argument was incorrect.Correctly argument is as fellows.");
  console.log("node 4_DeleteDummyUser.js [Dummy user's accountID] [AccessToken] [ACLToken]");
  console.log("Process has ended.");
  process.exit();
};

// リクエスト作成
var requestData = common.createDeleteRequest('accounts', accountId, HEADERS);
// リクエスト送信
request.delete( requestData, function(error,response,body) {
  if (error) {
    common.outputError(error, null, null);
    console.error('To delete the account('+ accountId + ') has failed.');
    console.error('Process has ended.');
  } else if (response.statusCode !== 204) {
    common.outputError(
      error,
      response ? response.statusCode : null,
      response ? response.statusText : null);
    console.error('To delete the account('+ accountId + ') has failed.');
    console.error('Process has ended.');
  } else {
    //　正常
    console.log("Account("+ accountId +") has been deleted successfully.");
    console.log("Process has ended.");
  }
});
