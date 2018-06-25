// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var mod = require('../app/search_controler');
var common = require('../app/common_function');

/* GET home page. */
router.get('/', function(req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req,res,mod.get);
//  mod.get(req, res);
});

router.post('/result', function(req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req,res,mod.search);
//  mod.search(req, res);
});
/*
router.post('/result', function(req, res, next) {
  res.render('searchResult', {'param': 1, 'count': 0, 'resultList': []} );
});
*/
module.exports = router;
