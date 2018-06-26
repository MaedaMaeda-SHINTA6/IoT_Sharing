// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var async = require('async');
var common = require('./common_function');
var config = require('./config.json');
var resobj = '';
var requestdatacalendar = [];

console.log("-------- Get AccessToken -------- ");

var body = "grant_type=" + config["AuthGrantType"] + '&' +
  "scope=" + config["AuthScope"] + '&' +
  "client_id=" + config["AuthId"] + '&' +
  "client_secret=" + config["AuthPassword"];
// parameter
var requestData = {
  'url': config['AuthUrl'],
  'headers': { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  'body': body,
  'rejectUnauthorized': false
};
if (config['proxy']) {
  requestData['proxy'] = config['proxy'];
}


request.post(requestData, function (error, response, body) {
  if (error) {
    common.outputError(error, null, null);
    console.log('To get the accessToken has failed. ');
  } else if (response.statusCode !== 201) {
    errResponse = response ? response.body : null;
    common.outputError(
      error,
      response ? response.statusCode : null,
      response ? response.statusText : null);
    console.log('To get the accessToken has failed. ');
  } else {
    // ok
    console.log(response.body);
    const resobj = JSON.parse(response.body);
    console.log('');
    console.log('expires_in : ' + resobj.expires_in);
    console.log('AccessToken : ' + resobj.access_token);

    var HEADERS = {
      'User-Agent': 'rss web service',
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Access-Token': resobj.access_token,
      'X-Acl-Token': ''
    };

    // authentication
    console.log("-------- Authentication -------- ");
    requestBody = {
      'userId': 'test10',
      'password': 'test10'
    };
    // リクエスト作成
    requestData = common.createPostRequest('accounts/authentication', requestBody, HEADERS);
    console.log("requestData[Auth] is ...");
    // リクエスト送信
    request.post(requestData, function (error, response, body) {
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
        var HEADERS = {
          'User-Agent': 'rss web service',
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Access-Token': resobj.access_token,
          'X-Acl-Token': response.body.token
        };
        // Output parameters.
        for (var i = 0; i < process.argv.length; i++) {
          console.log("Argument[" + i + "] : " + process.argv[i]);
        }


        // リクエスト作成
        var requestData = common.createGetRequest("matchings", null, "limit=100&offset=1", HEADERS);

        // リクエスト送信
        request(
          requestData, function (error, response, body) {
            if (error) {
              common.outputError(error, null, null);
              console.error('Failed to get the matchings.');
              console.error('Process has ended.');
              callback(error, null);
            } else if (response.statusCode !== 200) {
              const errResponse = response ? response.body : 'No response.body';
              common.outputError(
                error,
                response ? response.statusCode : null,
                response ? response.statusText : null);
              console.error('Failed to get the matchings.');
              console.error('Process has ended.');
              callback(errResponse, null);
            } else {
              // ok
              console.log("[GET Item] Success. ");
              console.log("------- GET matchings -------");
              var Itemjson = response.body;

              for (var index = 0; index < Itemjson.Matchings.length; index++) {
                console.log(Itemjson.Matchings[index].id);
                console.log(Itemjson.Matchings[index].matchingName);
                console.log(Itemjson.Matchings[index].sellerAccountId);
                console.log(Itemjson.Matchings[index].matchingPrice + "円");
              }

            }
          }
        );

        // リクエスト作成
        var requestData = common.createGetRequest("matching_statuses", null, "limit=100&offset=1", HEADERS);

        // リクエスト送信
        request(
          requestData, function (error, response, body) {
            if (error) {
              common.outputError(error, null, null);
              console.error('Failed to get the matching_statuses.');
              console.error('Process has ended.');
              callback(error, null);
            } else if (response.statusCode !== 200) {
              const errResponse = response ? response.body : 'No response.body';
              common.outputError(
                error,
                response ? response.statusCode : null,
                response ? response.statusText : null);
              console.error('Failed to get the matching_statuses.');
              console.error('Process has ended.');
              callback(errResponse, null);
            } else {
              // ok
              console.log("[GET Item] Success. ");
              console.log("------- GET matching_statuses -------");
              var Itemjson = response.body;

              for (var index = 0; index < Itemjson.MatchingStatuses.length; index++) {
                console.log(Itemjson.MatchingStatuses[index].id);
                console.log(Itemjson.MatchingStatuses[index].sellerAccountId);
                console.log(Itemjson.MatchingStatuses[index].buyerAccountId);
                console.log(Itemjson.MatchingStatuses[index].matchingId);
                console.log(Itemjson.MatchingStatuses[index].progressStatus);
                requestdatacalendar.push(Itemjson.MatchingStatuses[index].calendarId);
              }

            }
          }
        );

        // リクエスト作成
        var requestData = common.createGetRequest("Accounts", null, "limit=100&offset=1", HEADERS);

        // リクエスト送信
        request(
          requestData, function (error, response, body) {
            if (error) {
              common.outputError(error, null, null);
              console.error('Failed to get the Accounts.');
              console.error('Process has ended.');
              callback(error, null);
            } else if (response.statusCode !== 200) {
              const errResponse = response ? response.body : 'No response.body';
              common.outputError(
                error,
                response ? response.statusCode : null,
                response ? response.statusText : null);
              console.error('Failed to get the Accounts.');
              console.error('Process has ended.');
              callback(errResponse, null);
            } else {
              // ok
              console.log("[GET Item] Success. ");
              console.log("------- GET Accounts -------");
              var Itemjson = response.body;

              for (var index = 0; index < Itemjson.Accounts.length; index++) {

                console.log(Itemjson.Accounts[index].id);
                console.log(Itemjson.Accounts[index].userId);
                console.log(Itemjson.Accounts[index].mailAddress);
                console.log(Itemjson.Accounts[index].role);
                console.log(Itemjson.Accounts[index].lastLoginDatetime);
              }
            }
          }
        );
      }
    })
  }
})