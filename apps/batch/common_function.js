// Copyright FUJITSU LIMITED 2016-2017
var config = require('./config.json');
var async = require('async');
var request = require('request');
var common = require('./common_function');


exports.outputError = function(error,statusCode,statusText){
  console.log('Error or status not equal Success.');
  console.log('error: ' + error);
  console.log('response.statusCode: ' + statusCode);
  console.log('response.statusText: ' + statusText);
};


exports.createGetRequest = function(resource, id, query, RSS_HEADERS ){
  // URL作成
  let url = config['url'] + resource;
  if(id){
    // URL/resource/{id}
    url = url + '/'+ id ;
  }
  if(query){
    // URL/reource?query
    url = url + '?' + query;
  }

  console.log(RSS_HEADERS);
  console.log(url);
  const requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json' : true,
  };
  if(config['proxy']){
    requestData['proxy'] = config['proxy'];
  }
  if(config['rejectUnauthorized'] === false){
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};


exports.createPostRequest = function( resource, requestBody, RSS_HEADERS ){
  // URL作成。 http://[url]/resource の形に整形
  const url = config['url'] + resource;

  console.log(RSS_HEADERS);
  console.log(url);
  console.log(requestBody);
  const requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json' : true,
    'body' : requestBody,
  };
  if(config['proxy']){
    requestData['proxy'] = config['proxy'];
  }
  if(config['rejectUnauthorized'] === false){
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};

exports.createDeleteRequest = function( resource, id, RSS_HEADERS ){
  const url = config['url'] + resource + '/'+ id;
  console.log(RSS_HEADERS);
  console.log(url);
  const requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json' : true,
    'body' : '',
  };
  if(config['proxy']){
    requestData['proxy'] = config['proxy'];
  }
  if(config['rejectUnauthorized'] === false){
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};

exports.createPutRequest = function( resource, id, requestBody, RSS_HEADERS ){
  const url = config['url'] + resource + '/'+ id;
  console.log(RSS_HEADERS);
  console.log(url);
  console.log(requestBody);
  const requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json' : true,
    'body' : requestBody
  };
  if(config['proxy']){
    requestData['proxy'] = config['proxy'];
  }
  if(config['rejectUnauthorized'] === false){
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};