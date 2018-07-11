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
  ],
    function (err, result) {
      console.log(categories);

      var getImageData = common.imageGetRequest("87136355140382356011");
      request(getImageData,
        function (error, response) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              images = response.body;
              buf = new Buffer(images);
              console.log(buf);
              imageBase64 = buf.toString('base64');
              fs.writeFile('./public/images/upload/test.jpg', buf, function (err) {
                console.log(err);
              });

              var params = {
                "param": "1",
                "imageData": imageBase64
              };
              res.render('vegeSearch', params);
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
          }
        }
      )



    }

  );
};

exports.search_list = function (req, res) {


}

