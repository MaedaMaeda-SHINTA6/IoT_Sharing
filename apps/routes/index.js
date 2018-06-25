// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var common = require('../app/common_function.js');
var extension = require('../app/data_access.js');
var async = require('async');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
//   common.getAccessToken(req,res);
 
  common.saveToken(req);
  var loginStatus = {param: '0'};
  if(req.cookies.aclToken){
    console.log('token alives.');
    loginStatus = {param: '1'};
  };
  res.render('index', loginStatus);
});

router.get('/logout', function(req,res,next) {
  console.log('logout');
  res.clearCookie('aclToken') ;
  res.clearCookie('account') ;
  res.clearCookie('accessToken') ;
  
  res.redirect('/');
});

router.get('/thankyou', function(req,res,next) {
  common.saveToken(req);
  res.render('index');
});

module.exports = router;
