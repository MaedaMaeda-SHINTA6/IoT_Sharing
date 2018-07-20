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

router.post('/', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.post);
});

router.get('/:id', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.vegeprofile);
  //   mod.vegeprofile(req, res);
});

router.post('/reserve', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.reserve);
  //   mod.reserve(req, res);
});

module.exports = router;
