// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
//  res.render('login', { title: 'Express' });
  res.render( 'complete', {param:1, message:''}  );
});

module.exports = router;
