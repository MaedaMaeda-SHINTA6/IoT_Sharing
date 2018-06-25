// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var common = require('./common_function');
var config = require('./config.json');

var resobj = '';

console.log("-------- Get AccessToken -------- ");

var body = "grant_type=" + config["AuthGrantType"] + '&' +
         "scope=" + config["AuthScope"] + '&' +
         "client_id=" + config["AuthId"] + '&' +
         "client_secret=" + config["AuthPassword"];
// parameter
var requestData = {
          'url': config['AuthUrl'],
          'headers': {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
          'body' :  body ,
          'rejectUnauthorized': false
       };
if(config['proxy']){
  requestData['proxy'] = config['proxy'];
}
console.log(requestData);

request.post( requestData, function(error, response,body) {
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
    const resobj = JSON.parse(response.body);
    console.log('');
    console.log('expires_in : ' + resobj.expires_in);
    console.log('AccessToken : ' + resobj.access_token);
  }
});
