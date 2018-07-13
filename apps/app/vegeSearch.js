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
  var imageArray = [];

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
          imageList.push(categories['Images'][i]['id']);
        }
        callback(null, imageList);
      } else {
        common.outputError(error, imageList);
        errors.push(imageList);
      }
    },
    function (imageList, callback) {

      // 配列格納用 Async
      // async.mapSeries(imageList, function (imageId, callback) {
      //   var getImageData = common.imageGetRequest(imageId);
      //   request(getImageData,
      //     function (error, response) {
      //       if (!error && response.statusCode == 200) {
      //         if (response.body) {
      //           images = response.body;
      //           buf = new Buffer(images);
      //           imageArray.push(buf);
      //           callback(null, imageArray);
      //         }
      //       } else {
      //         common.outputError(error, response);
      //         errors.push(response.body);
      //       }
      //     }
      //   );

      // }, function (err, results) {
      //   callback(null, imageArray);
      // });

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

    //画像保存用 Async
    //   async.each(imageList, function (imageId, callback) {
    //     var getImageData = common.imageGetRequest(imageId);
    //     request(getImageData,
    //       function (error, response) {
    //         if (!error && response.statusCode == 200) {
    //           if (response.body) {
    //             images = response.body;
    //             buf = new Buffer(images);
    //             fs.writeFile('./public/images/upload/' + imageId + '.jpg', buf, function (file_err) {
    //               if (file_err) {
    //                 throw file_err;
    //               }
    //             });
    //           }
    //         } else {
    //           common.outputError(error, response);
    //           errors.push(response.body);
    //         }
    //       }
    //     );
    //     callback();
    //   }, function (err) {
    //     console.log("file download completed!");
    //     callback(null, imageList);
    //   });
    }
  ], function (err, result) {
    // for (i = 0; i <= (imageArray.length - 1); i++) {
    //   imageArray[i] = imageArray[i].toString('base64');
    // }
    //console.log(imageArray);
    var params = {
      "param": "1",
      "imageList": imageList
      //"imageData": imageBase64
      //"imageData": imageArray[1]
    };
    res.render('vegeSearch', params);
  }
  );
};

exports.search_list = function (req, res) {


}

