// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var common = require('../app/common_function.js');
var mod = require('../app/vegeSearch');

/* GET home page. */
router.get('/', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.get);
});


module.exports = router;
