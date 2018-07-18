var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');
var fs = require('fs');


exports.get = function (req, res) {
  console.log(req.body);
  //ログオンセッションの確認
  if (common.isLogin(req) == 0) {
    res.redirect('/login');
    return;
  }
  //アカウントID取得
  if (req.cookies.account != undefined) {
    accountId = req.cookies.account;
    console.log(accountId);
  }

  var categories;
  var errors = [];
  var imageList = [];
  //var imageArray = [];

  async.waterfall([
    function (callback) {
      var requestData = common.createGetRequest('images', null);
      request(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              categories = response.body;
              //console.log(categories);
              callback(null, categories);
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
          }
        }
      )
    },
    function (categories, callback) {
      if (categories != null) {
        for (i = 0; i <= categories['Images'].length - 1; i++) {
          //if(categories['Images'][i]['resourceId'] == "21834433172729097014"){
          imageList.push(categories['Images'][i]['id']);
          //}
        }
        callback(null, imageList);
      } else {
        common.outputError(error, imageList);
        errors.push(imageList);
      }
    },
    function (imageList, callback) {

      // 画像保存map Async
      async.map(imageList, function (imageId, callback) {
        var getImageData = common.imageGetRequest(imageId);
        request(getImageData,
          function (error, response) {
            if (!error && response.statusCode == 200) {
              if (response.body) {
                images = response.body;
                buf = new Buffer(images);
                fs.writeFile('./public/images/upload/' + imageId + '.jpg', buf, function (file_err) {
                  if (file_err) {
                    throw file_err;
                  }
                });
                callback(null, imageList);
              }
            } else {
              common.outputError(error, response);
              errors.push(response.body);
            }
          }
        );

      }, function (err, results) {
        callback(null, imageList);
      });
    },
    
  ], function (err, result) {
    var params = {
      "param": "1",
      "imageList": imageList
    };
    res.render('vegeSearch', params);
  }
  );
};

exports.post = function (req, res) {
  var delete_req = common.createDeleteRequest("images",req.body.imageId);
  var images_data;
  console.log(req.body.imageId);

  request.delete(delete_req, function (error, response, body) {
    if (error) {
      common.outputError(error, null, null);
    } else if (response.statusCode !== 204) {
      common.outputError(
        error,
        response ? response.statusCode : null,
        response ? response.statusText : null);
    } else {
      //　正常
      console.log("has been deleted successfully.");
      console.log("Process has ended.");
    }
  });
}

