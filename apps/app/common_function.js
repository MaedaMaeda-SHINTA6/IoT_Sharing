var config = require('./config.json');
var async = require('async');
var request = require('request');
var fs = require('fs');
var aclToken;
var accessToken;
// start tuto 3.1.2
var RSS_HEADERS = {
  'User-Agent': 'rss web service'
  //    , 'X-Access-Token': config['XAccessToken']
  , 'Content-Type': 'application/json;charset=UTF-8'
  //  , 'X-Acl-Token': config['XAclToken']
};
// end tuto 3.1.2

exports.saveToken = function (req) {
  aclToken = req.cookies.aclToken;
  accessToken = req.cookies.accessToken;
};

exports.saveAclToken = function (token) {
  console.log('set Acl Token' + token);
  aclToken = token;
};

exports.outputError = function (error, response) {
  console.log('Error or status not equal Success.');
  console.log('error: ' + error);
  console.log('response.statusCode: ' + (response ? response.statusCode : ''));
  console.log('response.statusText: ' + (response ? response.statusText : ''));
  var body = '';
  if (response) {
    body = (typeof (response.body) === 'object')
      ? JSON.stringify(response.body, null, 2)
      : response.body;
  }
  console.log('response.body: ' + body);
};

// start tuto 3.6.2 3.8.2
exports.createGetRequest = function (resource, id, query) {
  var url = config['url'] + resource;
  if (id) {
    url = url + '/' + id;
  }
  if (query) {
    url = url + '?' + query;
  }

  console.log('acl token is ' + aclToken);
  if (aclToken != null && aclToken != undefined) {
    RSS_HEADERS['X-Acl-Token'] = aclToken;
  }
  else {
    console.log("No AclToken!");
    delete RSS_HEADERS['X-Acl-Token'];
  }
  if (accessToken != null && accessToken != undefined) {
    RSS_HEADERS['X-Access-Token'] = accessToken;
  }
  else {
    console.log("No AccessToken!");
    delete RSS_HEADERS['X-Access-Token'];
  }

  console.log(url);
  var requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json': true,
  };
  if (config['proxy']) {
    requestData['proxy'] = config['proxy'];
  }
  if (config['rejectUnauthorized'] === false) {
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};
// end tuto 3.8.2

// start tuto 3.1.2 3.3.2 3.4.2 3.5.2 3.7.2
exports.createPostRequest = function (resource, requestBody) {
  var url = config['url'] + resource;

  if (aclToken != null && aclToken != undefined) {
    RSS_HEADERS['X-Acl-Token'] = aclToken;
  }
  else {
    console.log("No AclToken!");
    delete RSS_HEADERS['X-Acl-Token'];
  }
  if (accessToken != null && accessToken != undefined) {
    RSS_HEADERS['X-Access-Token'] = accessToken;
  }
  else {
    console.log("No AccessToken!");
    delete RSS_HEADERS['X-Access-Token'];
  }

  console.log(RSS_HEADERS);
  console.log(url);
  console.log(requestBody);
  var requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json': true,
    'body': requestBody
  };
  if (config['proxy']) {
    requestData['proxy'] = config['proxy'];
  }
  if (config['rejectUnauthorized'] === false) {
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};
// end tuto 3.1.2 3.4.2 3.5.2 3.6.2

exports.createPutRequest = function (resource, id, requestBody) {
  var url = config['url'] + resource;
  if (id) {
    url = url + '/' + id;
  }

  if (aclToken != null && aclToken != undefined) {
    RSS_HEADERS['X-Acl-Token'] = aclToken;
  }
  else {
    console.log("No AclToken!");
    delete RSS_HEADERS['X-Acl-Token'];
  }
  if (accessToken != null && accessToken != undefined) {
    RSS_HEADERS['X-Access-Token'] = accessToken;
  }
  else {
    console.log("No AccessToken!");
    delete RSS_HEADERS['X-Access-Token'];
  }

  console.log(RSS_HEADERS);
  console.log(url);
  console.log(requestBody);
  var requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json': true,
    'body': requestBody
  };
  if (config['proxy']) {
    requestData['proxy'] = config['proxy'];
  }
  if (config['rejectUnauthorized'] === false) {
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};
// end tuto 3.3.2 3.7.2

// start tuto 3.8.2
exports.createDeleteRequest = function (resource, id) {
  var url = config['url'] + resource;
  if (id) {
    url = url + '/' + id;
  }
  console.log(url);

  if (aclToken != null && aclToken != undefined) {
    RSS_HEADERS['X-Acl-Token'] = aclToken;
  }
  else {
    console.log("No AclToken!");
    delete RSS_HEADERS['X-Acl-Token'];
  }
  if (accessToken != null && accessToken != undefined) {
    RSS_HEADERS['X-Access-Token'] = accessToken;
  }
  else {
    console.log("No AccessToken!");
    delete RSS_HEADERS['X-Access-Token'];
  }

  var requestData = {
    'url': url,
    'method': 'DELETE',
    'headers': RSS_HEADERS,
    'json': true
  };
  if (config['proxy']) {
    requestData['proxy'] = config['proxy'];
  }
  if (config['rejectUnauthorized'] === false) {
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
};
// end tuto 3.8.2

exports.imagePostRequest = function (resourceData, filename, filetype, imageBinaryData) {

  var url = config['url'] + "images/";
  // if (id) {
  //   url = url + '/' + id;
  // }

  // console.log(url);

  if (aclToken != null && aclToken != undefined) {
    RSS_HEADERS['X-Acl-Token'] = aclToken;
  }
  else {
    console.log("No AclToken!");
    delete RSS_HEADERS['X-Acl-Token'];
  }
  if (accessToken != null && accessToken != undefined) {
    RSS_HEADERS['X-Access-Token'] = accessToken;
  }
  else {
    console.log("No AccessToken!");
    delete RSS_HEADERS['X-Access-Token'];
  }

  var requestData = {
    'url': url,
    'headers': RSS_HEADERS,
    'json': true,
    'formData': {
      'resource': {
        'value': JSON.stringify(resourceData),
        'options': {
          'contentType': "application/json"
        }
      },
      'upfile': {
        'value': imageBinaryData,
        'options': {
          'filename': filename,
          'contentType': filetype
        }
      }
    }
  };

  if (config['proxy']) {
    requestData['proxy'] = config['proxy'];
  }
  if (config['rejectUnauthorized'] === false) {
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  return requestData;
}

// Create Date object from String(YYYYMMDD)
exports.createDateFromYYYYMMDD = function (dateString) {
  var tmpStr = dateString.replace(/\//g, '');
  var date = new Date(parseInt(tmpStr.slice(0, 4), 10),
    parseInt(tmpStr.slice(4, 6), 10) - 1,
    parseInt(tmpStr.slice(6)), 0, 0);
  return date;
};

// Create Date object from String(YYYYMMDDHH)
exports.createDateFromYYYYMMDDHH = function (dateString) {
  var tmpStr = dateString.replace(/\//g, '');
  var date = new Date(parseInt(tmpStr.slice(0, 4), 10),
    parseInt(tmpStr.slice(4, 6), 10) - 1,
    parseInt(tmpStr.slice(6, 8), 10),
    parseInt(tmpStr.slice(8), 10), 0, 0);
  return date;
};

// Create Date object from String(YYYYMMDDHHmmSS)
exports.createDateFromYYYYMMDDHHMMSS = function (dateString) {
  var tmpStr = dateString.replace(/\//g, '');
  var date = new Date(parseInt(tmpStr.slice(0, 4), 10),
    parseInt(tmpStr.slice(4, 6), 10) - 1,
    parseInt(tmpStr.slice(6, 8), 10),
    parseInt(tmpStr.slice(8, 10), 10),
    parseInt(tmpStr.slice(10, 12), 10),
    parseInt(tmpStr.slice(12), 10));
  return date;
};

// Create String(YYYY-MM-DDThh:mm:ss.mmmZ) from Date object
exports.createDateStringFromYYYYMMDDObject = function (date) {
  var dateString = ('' + date.getFullYear()) + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getDate()).slice(-2) + 'T00:00:00.000Z'
  return dateString;
};

// Create String(YYYY-MM-DDThh:mm:ss.mmmZ) from Date object
exports.createDateStringFromYYYYMMDDHHObject = function (date) {
  var dateString = ('' + date.getFullYear()) + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getDate()).slice(-2) + 'T' +
    ('0' + date.getHours()).slice(-2) + ':00:00.000Z'
  return dateString;
};

// Create String(YYYY-MM-DDThh:mm:ss.mmmZ) from Date object
exports.createDateStringFromYYYYMMDDHHMMSSObject = function (date) {
  var dateString = ('' + date.getFullYear()) + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getDate()).slice(-2) + 'T' +
    ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinute()).slice(-2) + ':' +
    ('0' + date.getSecond()).slice(-2) + '.000Z'
  return dateString;
};


exports.getIDFromIdentifier = function (categoryArray, identifier) {
  var ret = "";
  if (Array.isArray(categoryArray)) {
    categoryArray.forEach(function (element, index, array) {
      if (element['identifier'] == identifier) {
        ret = element['id'];
      }
    });
  }
  return ret;
}


exports.getExtensionValueFromIdentifier = function (extensionArray, id) {
  var ret = "";
  if (Array.isArray(extensionArray)) {
    extensionArray.forEach(function (element, index, array) {
      if (element['extensionCategoryId'] == id) {
        ret = element['value'];
      }
    });
  }
  return ret;
}

exports.getItemNameFromId = function (extensionItemArray, id) {
  var ret = "";
  if (Array.isArray(extensionItemArray)) {
    extensionItemArray.forEach(function (element, index, array) {
      if (element['id'] == id) {
        ret = element['displayName'];
      }
    });
  }
  return ret;
}

exports.isLogin = function (req) {
  if (req.cookies.aclToken && req.cookies.account) {
    return 1;
  }
  return 0;
};


// start tuto 3.1.2
exports.executeControlerWithToken = function (req, res, next) {
  //  if(res.cookie.accessToken){
  //    console.log("accessToken is exists.");
  //    return;
  //  }
  var form = {
    'grant_type': config['AuthGrantType'],
    'scope': config['AuthScope'],
    'client_id': config['AuthId'],
    'client_secret': config['AuthPassword'],
  };
  var requestData = {
    'url': config['AuthUrl'],
    'headers': { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    'form': form,
  };
  if (config['rejectUnauthorized'] !== undefined) {
    requestData['rejectUnauthorized'] = config['rejectUnauthorized'];
  }
  if (config['proxy']) {
    requestData['proxy'] = config['proxy'];
  }
  request.post(requestData, function (error, response, body) {
    if (!error && response.statusCode == 201 && response.body) {
      resobj = JSON.parse(response.body);
      console.log(resobj.access_token);
      console.log("get accessToken:" + resobj.access_token);
      res.cookie('accessToken', resobj.access_token);
    }
    else {
      require('./common_function').outputError(error, response);
      console.log("For debugging accessToken");
      res.cookie('accessToken', 1);
      res.render('error', { 'message': 'Get access token failed.' });
      return;
    }
    next(req, res);
  })
};

// end tuto 3.1.2
