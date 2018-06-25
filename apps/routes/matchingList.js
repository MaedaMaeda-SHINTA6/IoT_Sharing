// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var mod = require('../app/matchingList_controler');
var common = require('../app/common_function');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('display matching page.');
  common.saveToken(req);
  common.executeControlerWithToken(req,res,mod.get);
//  mod.get(req, res);
});

router.post('/delete', function(req, res, next) {
  console.log('delete');
  common.saveToken(req);
  common.executeControlerWithToken(req,res,mod.delete);
//  mod.delete(req, res);
});

module.exports = router;
