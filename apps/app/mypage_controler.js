var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

exports.mypage = function(req, res) {
  res.render( 'mypage' );
};

