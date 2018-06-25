// Copyright FUJITSU LIMITED 2016-2017
var request   = require('request');
var common    = require('./common_function');
var config    = require('./config.json');
var fs        = require('fs');
var Converter = require('csvtojson').Converter;
var converter = new Converter({});
var async     = require('async');

var argValue    = process.argv[2];
var accessToken = process.argv[3];
var aclToken    = process.argv[4];

var HEADERS = {
    'User-Agent': 'rss web service',
    'Content-Type':'application/json;charset=UTF-8',
    'X-Access-Token' :accessToken,
    'X-Acl-Token' :aclToken
};

// パラメーター出力
for (var i = 0; i < process.argv.length; i++) {
  console.log("Argument["+ i + "] : " + process.argv[i]);
}

// パラメーター数チェック
if(process.argv.length != 5){
  console.log("Argument was incorrect.Correctly argument is as fellows.");
  console.log("node 3_1_CreateExtItem.js [Filename].csv [AccessToken] [ACLToken]");
  console.log("Process has ended.");
  process.exit();
};

async.waterfall(
  [
    function(callback) {
      console.log("-------- Get ExtensionItems. -------- ");
      //拡張項目取得
      requestData = common.createGetRequest('extension/items',null,'limit=1000',HEADERS);
      console.log("Header info :");
      console.log(HEADERS);
      request.get( requestData, function(error,response,body) {
        if (error) {
          common.outputError(error, null, null);
          console.error('Failed to get the ExtensionItem.');
          console.error('Process has ended.');
          callback(error, null);
        } else if (response.statusCode !== 200) {
          const errResponse = response ? response.body : 'No response.body';
          common.outputError(
            error,
            response ? response.statusCode : null,
            response ? response.statusText : null);
          console.error('Failed to get the ExtensionItem.');
          console.error('Process has ended.');
          callback(errResponse, null);
        } else {
          // ok
          console.log(response.body.totalCount === 0 ? 'ExtensionItems does not exist' : '');
          callback( null, response.body );
        }
      });
    },

    function(result,callback) {
      console.log("-------- Delete ExtensionItems. -------- ");
      //拡張項目削除
      async.each(result.ExtensionItems, function(info, callback2){
        var requestData = common.createDeleteRequest('extension/items', info.id, HEADERS);
        request.delete( requestData, function(error,response,body) {
          if (error) {
            common.outputError(error, null, null);
            console.error('Failed to delete the ExtensionItem.');
            console.error('Process has ended.');
            callback2(error);
          } else if (response.statusCode !== 204) {
            const errResponse = response ? response.body : 'No response.body';
            common.outputError(
              error,
              response ? response.statusCode : null,
              response ? response.statusText : null);
            console.error('Failed to delete the ExtensionItem.');
            console.error('Process has ended.');
            callback2(errResponse);
          } else {
            // ok
            callback2(null);
          }
        });
      },function complete(err){
        console.log('delete done');
        if (err) {
          callback( "Failed to delete the ExtensionItem.",null );
        } else {
          callback(null,"OK");
        };
      });
    },

    function(result, callback) {
      console.log("-------- Register ExtensionItems. -------- ");
      //拡張項目の登録
      //CSVをJSONに変換
      fs.createReadStream(argValue).pipe(converter);
      converter.on("end_parsed", function (jsonArray) {
        console.log("Conversion to JSON format.");
        var registerBody = {"ExtensionItems":jsonArray};
        console.log(registerBody);
        // リクエスト作成
        var requestData = common.createPostRequest('extension/items', registerBody, HEADERS);
        // リクエスト送信
        request.post(
          requestData, function(error,response,body) {
            if (error) {
              common.outputError(error, null, null);
              console.error('Failed in registration of the ExtensionItem.');
              console.error('Process has ended.');
              callback(error);
            } else if (response.statusCode !== 201) {
              const errResponse = response ? response.body : 'No response.body';
              common.outputError(
                error,
                response ? response.statusCode : null,
                response ? response.statusText : null);
              console.error('Failed in registration of the ExtensionItem.');
              console.error('Process has ended.');
              callback(errResponse);
            } else {
              // ok
              console.log('extension_item register.');
              callback( null, response.body );
            }
          }
        );
      });
    }
  ],

  function(err,results){
  // 終了処理
    console.log('-------- node_3_1_createExtItem complete. -------- ');
    if (err) {
    // エラーメッセージ表示
      console.log("");
      console.log("---------------- Error Occurred. ----------------");
      console.log(err);
      console.log("");
    } else {
    // 登録した項目数を表示
      console.log("Category Items of registration has been completed. ( " + results.Ids.length + " items )");
    };
    console.log("Process has ended.");
  }
);
