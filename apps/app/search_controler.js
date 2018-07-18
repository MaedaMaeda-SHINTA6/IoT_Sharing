// Copyright FUJITSU LIMITED 2016-2017
var request = require('request');
var async = require('async');
var common = require('./common_function');
var extension = require('./data_access');
var fs=require('fs');
var Search = {};

const NOT_SET_ID = '00000';
exports.get = function (req, res) {
  if (common.isLogin(req) == 0) {
    res.redirect('/login');
    return;
  }

  var requestData = common.createGetRequest('extension/categories?limit=1000', null);

  var categories;
  var items;
  var errors = [];
  async.waterfall([
    function (callback) {
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
          callback(error, null);
        }
      )
    },
    function (resBody, callback) {
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
          callback(null, items);
        }
      )
    },


  ],
    function (err, resBody) {
      console.log('async complete.');
      if (errors.length != 0) {
        console.log(errors);
        res.render('error', { 'message': 'Faild to get category data.' });
      }
      var houseType = [];
      var roomType = [];
      var facility = [];

      for (var i = 0; i < items.ExtensionItems.length; i++) {
        switch (items.ExtensionItems[i].identifier) {
          case 'house_type_item':
            houseType.push(items.ExtensionItems[i]);
            break;
          case 'room_type_item':
            roomType.push(items.ExtensionItems[i]);
            break;
          case 'facility_item':
            facility.push(items.ExtensionItems[i]);
            break;
          default: break;
        }
      };

      arrays = [houseType, roomType, facility];
      arrays.every(function (arr) {
        arr.sort(function (val1, val2) {
          if (val1.displayOrder < val2.displayOrder) return -1;
          if (val2.displayOrder < val1.displayOrder) return 1;
          return 0
        });
        return true;
      });

      var params = {
        "categories": categories,
        "houseType": houseType,
        "roomType": roomType,
        "facility": facility,
        "param": common.isLogin(req)
      };
      res.render('search', params);
    }
  );
};


// start tuto 3.6.2
exports.search = function (req, res) {
  var categoryInfo = [];
  var itemInfo = [];
  var imageList = [];
  var resourceList = [];
  console.log(req.body);

  async.waterfall([
    function (callback) {
      extension.getCategory(res, callback);
    },
    function (result, callback) {
      categoryInfo = result.ExtensionCategories;
      extension.getCategoryItem(res, callback);
    },
    function (result, callback) {
      itemInfo = result.ExtensionItems;

      var searchBody = Search.createSearchData(req, categoryInfo);
      var requestData = common.createPostRequest('matchings/search', searchBody);
      request.post(requestData, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if (response.body) {
            console.log('search done.');
            callback(null, response.body['Matchings']);
          }
        } else {
          console.log('search done.(error)');
          common.outputError(error, response);
          callback(response.body, null);
        }
      });
    },
    function (matchings, callback) {
      var results = [];
      var errors = [];

      if (matchings == null || matchings.length == 0) {
        console.log('Nothing is matched.');
        callback(null, results);
        return;
      }

      if (!req.body.sharing_date) {
        console.log('AvailableDate isnot included in SearchCondition.');
        Array.prototype.push.apply(results, matchings);
        callback(null, results);
        return;
      }
      console.log("*** calendar search start ***");

      var dateQuery = Search.getDateQuery(req.body);

      async.each(matchings, function (data, next) {
        console.log('each matching ... ');
        query = 'matchingId=' + data.id + '&minRemainingCost=1&maxRemainingCost=1';
        if (dateQuery) {
          query += dateQuery;
        }
        query += '&limit=24';
        var requestData = common.createGetRequest('calendars'
          , null
          , query);

        request.get(requestData, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            if (response.body.Calendars.length > 0) {
              console.log('calendar done.');
              data['calendar'] = response.body;
              results.push(data);
              next();
            }
            else {
              console.log('No calendar.');
              next();
            }
          } else {
            console.log('calendar done.(error)');
            common.outputError(error, response);
            errors.push(response.body);
            next();
          }
        })
      },
        function (err) {
          console.log('calendar search all done.');
          callback(null, results);
        });
    }
  ],
    //
    function (err, results) {
      console.log('async complete.');
      //console.log(results);

      var param = [];
      param['resultList'] = [];
      param['count'] = 0;
      param['param'] = common.isLogin(req);

      if (results != null && Array.isArray(results)) {
        results.forEach(function (elm, idx, arr) {
          var room = new Object;
          room['id'] = elm.id;
          room['matchingName'] = elm.matchingName;
          room['matchingPrice'] = elm.matchingPrice;
          var extensionIdentifiers = [
            'address',
            'num',
            'room_type',
            'vege_location',
            'delivery_place_latitude',
            'delivery_place_longitude',
            'vege_quantity',
            'vege_price',
            'vege_state',
            'delivery_vege_state'
          ];
          extensionIdentifiers.forEach(function (identifier, idx, arr) {
            room[identifier] = Search.getValueFromIdentifier(elm.MatchingExtensions,
              categoryInfo,
              itemInfo,
              identifier);
          });
          param['resultList'].push(room);
        });
        param['count'] = results.length;
        if (req.body.sharing_date) {
          param['date'] = (req.body.sharing_date + 'T00:00:00.000Z').replace(/\//g, '-');
        } else {
          param['date'] = common.createDateStringFromYYYYMMDDObject(new Date);
        }
      }
       
      //イメージID取得
      async.waterfall([
        function (callback) {
          var requestData = common.createGetRequest('images', null);
          request(requestData,
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                if (response.body) {
                  categories = response.body;
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
              resourceList.push(categories['Images'][i]['resourceId']);
            }
            callback(null, imageList, resourceList);
          } else {
            common.outputError(error, imageList);
            errors.push(imageList);
          }
        },
      ],
        function (err, result) {
          //画像保存map Async
          async.map(param['resultList'], function (result_id, callback) {
            for (i = 0; i <= (resourceList.length - 1); i++) {
              if (resourceList[i] == result_id.id) {
                var getImageData = common.imageGetRequest(imageList[i]);

                request(getImageData,
                  function (error, response) {
                    if (!error && response.statusCode == 200) {
                      if (response.body) {
                        images = response.body;
                        buf = new Buffer(images);
                        fs.writeFile('./public/images/upload/' + result_id.id + '.jpg', buf, function (file_err) {
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

              }else{
                //イメージが見つからない場合
                fs.writeFile('./public/images/upload/' + result_id.id + '.jpg', "noimages", function (file_err) {
                  if (file_err) {
                    throw file_err;
                  }
                });
              }
            }
          }, function (err, results) {
            console.log("DownLoad");
            res.render('searchResult', param);
            //console.log(param.resultList);
          });   
      }
    );
    });
};

Search.createSearchData = function (req, category) {
  var bodyData = new Object;
  if (req.body.price_from) bodyData['minMatchingPrice'] = req.body.price_from;
  if (req.body.price_to) bodyData['maxMatchingPrice'] = req.body.price_to;
  bodyData['SearchConditions'] = [];
  if (req.body.address) {
    bodyData['SearchConditions'].push({
      'method': 'like',
      'key': common.getIDFromIdentifier(category, 'address'),
      'value': req.body.address
    });
  }
  if (req.body.room_type_radio && req.body.room_type_radio != NOT_SET_ID) {
    bodyData['SearchConditions'].push({
      'method': 'equal',
      'key': common.getIDFromIdentifier(category, 'room_type'),
      'value': req.body.room_type_radio
    });
  }
  if (req.body.num_from) {
    bodyData['SearchConditions'].push({
      'method': 'more',
      'key': common.getIDFromIdentifier(category, 'num'),
      'value': req.body.num_from
    });
  }
  if (req.body.num_to) {
    bodyData['SearchConditions'].push({
      'method': 'less',
      'key': common.getIDFromIdentifier(category, 'num'),
      'value': req.body.num_to
    });
  }

  if (req.body.facility && req.body.facility.length != 0) {
    if (req.body.facility instanceof Array) {
      for (var i = 0; i < req.body.facility.length; i++) {
        bodyData['SearchConditions'].push({
          'method': 'equal',
          'key': common.getIDFromIdentifier(category, 'facility'),
          'value': req.body.facility[i]
        });
      }
    } else {
      bodyData['SearchConditions'].push({
        'method': 'equal',
        'key': common.getIDFromIdentifier(category, 'facility'),
        'value': req.body.facility
      });
    }
  }

  bodyData['limit'] = 100;
  bodyData['offset'] = 0;
  console.log('*** search condition ***');
  return bodyData;
};

Search.getDateQuery = function (body) {
  var dateQuery;
  if (body.sharing_date) {
    var startTime;
    var endTime;
    var date = common.createDateFromYYYYMMDDHH(body.sharing_date + body.sharing_start);
    startTime = common.createDateStringFromYYYYMMDDHHObject(date);
    dateQuery = '&sinceUseStartDatetime=' + startTime;
    if (body.sharing_end != 24) {
      var date = common.createDateFromYYYYMMDDHH(body.sharing_date + body.sharing_end);
    } else {
      var date = common.createDateFromYYYYMMDDHH(body.sharing_date + body.sharing_end);
    }
    endTime = common.createDateStringFromYYYYMMDDHHObject(date);
    dateQuery += '&untilUseEndDatetime=' + endTime;
  }
  return dateQuery;
};
// end tuto 3.6.2

Search.getValueFromIdentifier = function (matchings, categories, items, identifier) {
  var categoryId = common.getIDFromIdentifier(categories, identifier);
  var ret = "";
  matchings.forEach(function (elm, idx, arr) {
    if (elm.extensionCategoryId == categoryId) {
      if (elm.dataType == 10) {
        ret = common.getItemNameFromId(items, elm.value);
      } else {
        ret = elm.value;
      }
    }
  });
  return ret;
};
