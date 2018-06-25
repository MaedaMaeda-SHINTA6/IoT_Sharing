// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var mod = require('../app/login_controler');
var common = require('../app/common_function.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken( req, res, mod.login );
//  mod.login(res);
});

router.post('/auth', function(req, res, next){
  common.saveToken(req);
  common.executeControlerWithToken( req, res, mod.authenticate );
//   mod.authenticate(res, req);
});

router.post('/signon', function(req, res, next){
  common.saveToken(req);
  common.executeControlerWithToken( req, res, mod.signon );
//   mod.signon(req, res);
});

module.exports = router;
