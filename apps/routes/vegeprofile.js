// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var common = require('../app/common_function.js');
var mod = require('../app/vegeprofile');

/* GET home page. */
router.get('/', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.get);
});

router.get('/:id', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.vegeprofile);
  //   mod.vegeprofile(req, res);
});

router.post('/update', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.matchings);
  //   mod.signon(req, res);
});

module.exports = router;
