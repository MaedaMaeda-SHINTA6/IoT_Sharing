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
  var items;
  var errors = [];

  //データ取得処理
  async.series([
    function (callback) {
      var requestData = common.createGetRequest('extension/categories?limit=1000', null);
      request(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              categories = response.body;
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
          }
          callback(null, null);
        }
      )
    },
    function (callback) {
      var requestData2 = common.createGetRequest('extension/items?limit=1000', null);
      request(requestData2,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              items = response.body;
            }
          } else {
            common.outputError(error, response);
            errors.push(response.body);
          }
          callback(null, null);
        }
      )
    }],
    function (err, result) {
      console.log('async complete.');
      if (errors.length != 0) {
        console.log(errors);
        res.render('error', { 'message': 'Faild to get category data.' });
        return;
      };
      var vege_state_item = [];
      var delivery_vega_state_item = [];

      //ExtItemを配列に格納処理
      for (var i = 0; i < items.ExtensionItems.length; i++) {
        switch (items.ExtensionItems[i].identifier) {
          case 'vege_state_item':
            vege_state_item.push(items.ExtensionItems[i]);
            break;
          case 'delivery_vega_state_item':// delivery_vega_state_item
            delivery_vega_state_item.push(items.ExtensionItems[i]);
            break;
          default: break;
        }
      };

      //配列の整列
      arrays = [vege_state_item, delivery_vega_state_item];
      arrays.every(function (arr) {
        arr.sort(function (val1, val2) {
          if (val1.displayOrder < val2.displayOrder) return -1;
          if (val2.displayOrder < val1.displayOrder) return 1;
          return 0
        });
        return true;
      });

      var vege_state = new Object();
      var delivery_vege_state = new Object();

      //JSON分解・変数格納処理
      for (var n = 0; n < categories['ExtensionCategories'].length; n++) {
        var category = categories['ExtensionCategories'][n];

        switch (category.identifier) {
          case 'vege_state':
            vege_state['id'] = category.id;
            vege_state['identifier'] = category.identifier;
            vege_state['displayName'] = category.displayName;
            vege_state['require'] = 'display_required';
            break;
          case 'delivery_vege_state':
            delivery_vege_state['id'] = category.id;
            delivery_vege_state['identifier'] = category.identifier;
            delivery_vege_state['displayName'] = category.displayName;
            delivery_vege_state['require'] = 'display_not_required';
            break;
          default:
            continue;
        };
      }
      //paramsセット
      var params = {
        "categories": categories,
        "vege_state": vege_state,
        "delivery_vege_state": delivery_vege_state,
        "vege_state_item": vege_state_item,
        "delivery_vega_state_item": delivery_vega_state_item,
        "param": "1"
      };

      //ページ出力
      res.render('vegeRegister', params);
    }
  );

};

exports.post = function (req, res) {

  console.log(req.body);
  async.waterfall([
    function (callback) {
      extension.getCategory(res, callback);
    },

    function (results, callback) {
      var registerBody = createRegisterData(req, results);

      var requestData = common.createPostRequest('matchings', registerBody);
      request.post(requestData, function (error, response, body) {
        if (!error && response.statusCode == 201) {
          if (response.body) {
            console.log('matching register.');
            callback(error, response.body, results);
          }
        } else {
          common.outputError(error, response);
          console.log(response.body);
          callback(error, response.body, results);
        }
      });
      console.log('matching register end.');
    },
    function (matchingRes, results, callback) {
      console.log('****** Image Post ******');
      console.log(matchingRes);
      console.log(matchingRes['id']);

      if (matchingRes['id'] === undefined) {
        console.log("matching register err.");
        callback("err", matchingRes, null, null);
        return;
      };

      var resourcetData = {
        "resourceType": "matching",
        "resourceId": matchingRes['id'],
        "title": req.file.originalname
      };
      var imageBody = common.imagePostRequest(resourcetData, req.file.originalname, req.file.mimetype, req.file.buffer);
      request.post(imageBody, function (error, response, body) {
        if (!error && response.statusCode == 201) {
          if (response.body) {
            console.log('Image Upload');
            console.log(req.file.buffer);
            callback(error, response.body, results);
          }
        } else {
          common.outputError(error, response);
          console.log(response.body);
          callback(error, response.body, results);
        }
      }
      );
    }
  ],
    function (err, matchingRes, results) {
      if (err) {
        res.render('error', { 'message': 'Something Error happened in register Vegetable.' });
        return;
      }
      console.log('async complete.');
      res.redirect('/');
    }
  );


  //登録用の変数エリア
  //登録用データの生成
  createRegisterData = function (req, results) {
    var accountId = null;
    if (req.cookies.account != undefined) {
      accountId = req.cookies.account;
      console.log(accountId);
    }
    var bodyData = {
      "matchingName": req.body.vege_variety_name,
      //"matchingDetail": req.body.description,
      //合計金額
      "matchingPrice": Number(req.body.vege_price) * Number(req.body.vege_quantity),
      //"postStartDate": req.body.h_publish_from,
      //"postEndDate": req.body.h_publish_to,
      "MatchingExtensions": [
        {
          //産地
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_location'),
          "dataType": 20,
          "value": req.body.vege_location
        },
        {
          //数量
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_quantity'),
          "dataType": 21,
          "value": req.body.vege_quantity
        },
        {
          //単価
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_price'),
          "dataType": 21,
          "value": req.body.vege_price
        },
        {
          //重さ
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_gm'),
          "dataType": 21,
          "value": req.body.vege_gm
        },
        {
          //緯度
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'delivery_place_latitude'),
          "dataType": 21,
          "value": req.body.delivery_place_latitude
        },
        {
          //経度
          "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'delivery_place_longitude'),
          "dataType": 21,
          "value": req.body.delivery_place_longitude
        },

      ]
    };

      console.log(req.body.vege_state_item);
      // if (req.body.vege_state_item != null) {
      //   if (req.body.vege_state_item instanceof Array) {
      //     for (var i = 0; i < req.body.vege_state_item.length; i++) {
      //       var vege_state = {
      //         "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_state'),
      //         "dataType": 10,
      //         "value": req.body.vege_state_item[i]
      //       };
      //       bodyData.MatchingExtensions.push(vege_state);
      //     };
      //   } else {
      //     var vege_state = {
      //       "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_state'),
      //       "dataType": 10,
      //       "value": req.body.vege_state
      //     };
      //     bodyData.MatchingExtensions.push(vege_state);
      //   }
      // };

      if(req.body.vege_state_item != null){
        if(req.body.vege_state_item instanceof Array) {
          for (var i = 0; i < req.body.vege_state_item.length; i++) {
            var vege_state =  {
                "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_state'),
                "dataType": 10,
                "value": req.body.vege_state_item[i]
            };
            bodyData.MatchingExtensions.push(vege_state);
          };
        } else {
          var vege_state =  {
              "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'vege_state'),
              "dataType": 10,
              "value": req.body.vege_state_item
          };
          bodyData.MatchingExtensions.push(vege_state);
        }
      };

      if(req.body.delivery_vega_state_item != null){
        if(req.body.delivery_vega_state_item instanceof Array) {
          for (var i = 0; i < req.body.delivery_vega_state_item.length; i++) {
            var delivery_vege_state =  {
                "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'delivery_vege_state'),
                "dataType": 10,
                "value": req.body.delivery_vega_state_item[i]
            };
            bodyData.MatchingExtensions.push(delivery_vege_state);
          };
        } else {
          var delivery_vege_state =  {
              "extensionCategoryId": common.getIDFromIdentifier(results.ExtensionCategories, 'delivery_vege_state'),
              "dataType": 10,
              "value": req.body.vege_state_item
          };
          bodyData.MatchingExtensions.push(delivery_vege_state);
        }
      };

      

    console.log(bodyData);
    return bodyData;
  };
}
