var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

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




