// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var common = require('./common_function');
var config = require('./config.json');
var fs = require('fs');
var argValue = process.argv[2];
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var async = require('async');

var HEADERS = {
    'User-Agent': 'rss web service',
    'Content-Type':'application/json;charset=UTF-8',
    'X-Access-Token' :process.argv[3],
    'X-Acl-Token' :process.argv[4]
};

// エラー発生時のAPIログの内容
var errResponse;

// Output parameters.
for (var i = 0; i < process.argv.length; i++) {
  console.log("Argument["+ i + "] : " + process.argv[i]);
}

// Parameterチェック
if(process.argv.length != 5){
  console.log("Argument was incorrect.Correctly argument is as fellows.");
  console.log("node 3_2_CreateExtCategory.js [Filename].csv [AccessToken] [ACLToken]");
  console.log("Process has ended.");
  process.exit();
};

async.waterfall(
  [
    function(callback) {
      console.log("-------- Get Categories -------- ");
      //シェアリングカテゴリーの取得
      requestData = common.createGetRequest('extension/categories',null,'limit=1000',HEADERS);
      request.get( requestData, function(error,response,body) {
        if (error) {
          common.outputError(error, null, null);
          console.error('Failed to get the categories.');
          console.error('Process has ended.');
          callback(error, null);
        } else if (response.statusCode !== 200) {
          const errResponse = response ? response.body : 'No response.body';
          common.outputError(
            error,
            response ? response.statusCode : null,
            response ? response.statusText : null);
          console.error('Failed to get the categories.');
          console.error('Process has ended.');
          callback(errResponse, null);
        } else {
          // ok
          console.log(response.body.totalCount === 0 ? 'ExtensionCategories does not exist' : '');
          callback( null, response.body );
        }
      });
    },
    function(result,callback) {
      console.log("--------  Delete Categories -------- ");
      //シェアリングカテゴリーの削除
      async.each(result.ExtensionCategories, function(info, callback2){
      var requestData = common.createDeleteRequest('extension/categories', info.id, HEADERS);
        request.delete( requestData, function(error,response,body) {
          if (error) {
            common.outputError(error, null, null);
            console.error('Failed to delete the categories.');
            console.error('Process has ended.');
            callback2(error);
          } else if (response.statusCode !== 204) {
            const errResponse = response ? response.body : 'No response.body';
            common.outputError(
              error,
              response ? response.statusCode : null,
              response ? response.statusText : null);
            console.error('Failed to delete the categories.');
            console.error('Process has ended.');
            callback2(errResponse);
          } else {
            // ok
            console.log('delete done(categories) : ' + info.id);
            callback2(null);
          }
        });
      },function complete(err){
        console.log('delete done');
        if(err){
          // ERRが発生した場合処理を中断
          callback( "To delete the categories has failed. ", null );
        } else {
          callback( null, "OK" );
        }
      });
    },
    function(result, callback) {
      console.log("-------- Register Categories. -------- ");
      console.log(argValue);
      // CSVをJSONに変換
      fs.createReadStream(argValue).pipe(converter);
      converter.on("end_parsed", function (jsonArray) {
        console.log("Conversion to JSON format.");
        var registerBody = {"ExtensionCategories":jsonArray};
        console.log(registerBody);
        // リクエスト作成
        var requestData = common.createPostRequest('extension/categories', registerBody, HEADERS);
        // リクエスト送信
        request.post(
          requestData, function(error,response,body) {
            if (error) {
              common.outputError(error, null, null);
              console.error('Failed in registration of the categories.');
              console.error('Process has ended.');
              callback(error);
            } else if (response.statusCode !== 201) {
              const errResponse = response ? response.body : 'No response.body';
              common.outputError(
                error,
                response ? response.statusCode : null,
                response ? response.statusText : null);
              console.error('Failed in registration of the categories.');
              console.error('Process has ended.');
              callback(errResponse);
            } else {
              // ok
              console.log('extension_category register.');
              callback( null, response.body );
            }
          }
        );
      });
    }
  ],
  function(err,results){
    console.log('-------- node_3_2_CreateExtCategory.js complete. -------- ');
    if (err) {
      console.log("");
      console.log("---------------- Error Occurred. ----------------");
      console.log(err);
      console.log("");
    } else {
      console.log("Category of registration has been completed. ( " + results.Ids.length + " items )");
    }
    console.log("Process has ended.");
  }
);

