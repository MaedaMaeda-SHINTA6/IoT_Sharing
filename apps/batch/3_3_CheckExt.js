// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var async = require('async');
var common = require('./common_function');
var config = require('./config.json');

var HEADERS = {
    'User-Agent': 'rss web service',
    'Content-Type':'application/json;charset=UTF-8',
    'X-Access-Token' :process.argv[2],
    'X-Acl-Token' :process.argv[3]
};

// Output parameters.
for (var i = 0; i < process.argv.length; i++) {
  console.log("Argument["+ i + "] : " + process.argv[i]);
}

// Checking Parameter.
if(process.argv.length != 4){
  console.log("Argument was incorrect.Correctly argument is");
  console.log("node 3_3_CheckExt.js [AccessToken] [ACLToken]");
  console.log("Process has ended.");
  process.exit();
};

// トークンを取得後、トークンを使ってカテゴリの検索、カテゴリ項目の検索を行い、それぞれ取得したデータをconsole.logに出力します
async.waterfall(
  [
    // カテゴリの検索
    function(callback){
      console.log("------- GET categories -------");
      console.log("HEADERS is " + JSON.stringify(HEADERS));

      // リクエスト作成
      var requestData = common.createGetRequest("extension/categories", null,"limit=1000&offset=0", HEADERS);

      // リクエスト送信
      request(
        requestData, function(error,response,body) {
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
            console.log("[GET categories] Success. ");
            callback( null, response.body );
          }
        }
      );
    },
    // 拡張項目の検索
    function(categories,callback) {
      console.log("------- GET items -------");

      // リクエスト作成
      var requestData = common.createGetRequest("extension/items", null, "limit=1000&offset=0", HEADERS);

      // リクエスト送信
      request(
        requestData, function(error,response,body) {

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
            console.log("[GET items] Success. ");
            callback( null, categories, response.body );
          }
        }
      );
    }
  ],
  // 取得したデータをログに出力
  function(err, categories, items) {

    console.log('-------- node_3_3_CheckExt complete. -------- ');
    // エラーがある場合
    if (err) {
      console.log("");
      console.log("---------------- Error Occurred. ----------------");
      console.log(err);
      console.log("");
      console.log("Process has ended.");
      process.exit(1);
    }

    if(categories == null || categories['ExtensionCategories'] == "") {
      console.log("Category could not be obtained.");
    } else {
      console.log("Registered Category is as follows.");
      categories['ExtensionCategories'].forEach( function(element,index,array){
        console.log("#" + ( "0"+(index+1) ).slice(-2) + " " + JSON.stringify(element));
      });
    }
    console.log("------------------------------------");
    if(items == null || items['ExtensionItems'] == "") {
      console.log("Items could not be obtained.");
    } else {
      console.log("Registered Items is as follows.");
      items['ExtensionItems'].forEach( function(element,index,array){
        console.log("#" + ( "0"+(index+1) ).slice(-2) + " " + JSON.stringify(element));
      });
    }
    console.log("Process has ended.");
  }
);
