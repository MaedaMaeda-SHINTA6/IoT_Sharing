// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var common = require('../app/common_function.js');

router.get('/', function (req, res, next) {
  common.saveToken(req);
  var loginStatus = { param: '0' };
  if (req.cookies.aclToken) {
    console.log('token alives.');
    loginStatus = { param: '1' };
  };
  res.render('talk', loginStatus);
});

module.exports = router;
