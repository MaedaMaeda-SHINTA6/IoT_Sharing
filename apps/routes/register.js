// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var common = require('../app/common_function');
var mod = require('../app/register_controler');

/* GET home page. */
router.get('/', function(req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.get);
//  mod.get(res);
});

router.post('/new', function(req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.post);
//  mod.post(req, res);
});

module.exports = router;
