var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

exports.vegeprofile = function (req, res) {
  // console.log(req.body);
  //ログオンセッションの確認
  if (common.isLogin(req) == 0) {
    res.redirect('/login');
    return;
  }
  //アカウントID取得
  if (req.cookies.account != undefined) {
    accountId = req.cookies.account;
    // console.log("accountId");
    // console.log(accountId);
  }
  //マッチングID取得
  var matchingId = req.params.id;
  // console.log("matchingId");
  // console.log(matchingId);

  async.series([
    function (callback) {
      var requestData = common.createGetRequest('matchings', matchingId, null);
      request(requestData,
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body) {
              //console.log(response.body);
              accountId = response.body['Matchings'][0]['sellerAccountId'];
              callback(null, response.body);
            }
          } else {
            common.outputError(error, response);
            callback(response.body, null);
          }
        }
      )
    },
    function (callback) {
      extension.getCategory(res, callback);
    },
    function (callback) {
      extension.getCategoryItem(res, callback);
    }
  ],
    function (err, result) {
      console.log('async series complete.');
      if (err) {
        console.log('error happen.');
        res.render('error', { 'message': 'Something is wrong.' });
      } else if (result.length != 3) {
        // console.log('not enough data.');
        //console.log(result);
        res.render('error', { 'message': 'Cannot get enough data.' });
      }
      var params = createParams(result, common.isLogin(req));
      if (params) {
        res.render('vegeprofile', params);
      } else {
        res.render('error', { 'message': 'Cannot create vegeprofile view.' });
      }
    });
};

function getExtensionValue(extensionArray, id) {
  var ret = "";
  if (Array.isArray(extensionArray)) {
    extensionArray.forEach(function (element, index, array) {
      if (element['extensionCategoryId'] == id) {
        console.log('return :' + element['value']);
        ret = element['value'];
      }
    });
  }
  return ret;
};
function getExtensionValues(extensionArray, id) {
  var ret = [];
  if (Array.isArray(extensionArray)) {
    extensionArray.forEach(function (element, index, array) {
      if (element['extensionCategoryId'] == id) {
        console.log('return :' + element['value']);
        ret.push(element['value']);
      }
    });
  }
  return ret;
};

function createParams(result, login) {

  var matchingInfo = result[0] != null ? result[0]['Matchings'][0] : null;
  var extensionInfo = result[1] != null ? result[1]['ExtensionCategories'] : null;
  var extensionItemInfo = result[2] != null ? result[2]['ExtensionItems'] : null;

  if (!matchingInfo && !accountInfo && !extensionInfo) { return null; };

  var matchingExtension = matchingInfo['MatchingExtensions'];
  // console.log(matchingExtension);

  var params = new Object();
  params['headp'] = {'param': login};
  params['matchingId'] = matchingInfo['id'];
  params['accountId'] = matchingInfo['sellerAccountId'];
  params['matchingName'] = matchingInfo['matchingName'];
  // params['matchingDetail'] = matchingInfo['matchingDetail'];
  params['vege_variety_name'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_variety_name'));
  params['vege_location'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_location'));
  params['vege_gm'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_gm'));
  params['vege_quantity'] = getExtensionValue(matchingExtension, common.getIDFromIdentifier(extensionInfo, 'vege_quantity'));
  params['vege_price'] = matchingInfo['matchingPrice'];

  console.log(params);
  return params;
};
