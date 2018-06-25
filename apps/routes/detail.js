// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var mod = require('../app/detail_controler');
var common = require('../app/common_function');

/* GET home page. */

router.post('/reserve', function(req, res, next){
  common.saveToken(req);
  common.executeControlerWithToken( req, res, mod.reserve );
//  mod.reserve(req, res);
});

router.get('/:id', function(req, res, next){
  common.saveToken(req);
  common.executeControlerWithToken( req, res, mod.detail );
//  mod.detail(res,req);
});


router.post('/research', function(req, res, next){
  console.log('research');
  common.saveToken(req);
  common.executeControlerWithToken( req, res, mod.research );
//   mod.research(req,res);
});

module.exports = router;
