var request = require('request');
var config = require('./config.json')
var common = require('./common_function');
var async = require('async');
var extension = require('./data_access.js');

exports.login = function(req, res) {
  res.render( 'login' );
};

// start tuto 3.1.2 3.4.2
exports.authenticate = function(req, res) {
  var requestBody = { "userId" : req.body.userid,"password": req.body.password};
  var requestData = common.createPostRequest('accounts/authentication', requestBody);
  request.post( requestData, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (response.body) {
        res.cookie('account', response.body.id);
        res.cookie('aclToken', response.body.token);
        res.redirect('/');
      }
    } else {
      common.outputError(error, response);
      res.redirect( '/login' );
    }
  });
};
// end tuto 3.1.2 3.4.2

// start tuto 3.3.2
exports.signon = function(req,res) {
  var account_id;
  async.waterfall([
    function(callback) {
      var requestBody = { 'userId' : req.body.signup_userid,
                           'password': req.body.signup_password,
                           'mailAddress': req.body.email
                         };
      var requestData = common.createPostRequest('accounts', requestBody);
      request.post( requestData, function(error, response, body){
        if(!error && response.statusCode == 201 && response.body){
          res.cookie('account', response.body.id);
          res.cookie('aclToken', response.body.token);
          account_id = response.body.id;
          callback(null, response.body);
        } else {
          common.outputError(error, response);
          callback(response.body,null);
        }
      });
    },
    function(result, callback) {
      var requestBody = { "userId" : req.body.signup_userid,
                          "password": req.body.signup_password};
      var requestData = common.createPostRequest('accounts/authentication', requestBody);
      request.post( requestData, function(error, response, body) {
        if (!error && response.statusCode == 200 && response.body) {
          res.cookie('account', response.body.id);
          res.cookie('aclToken', response.body.token);
          common.saveAclToken( response.body.token );
          callback(null, response.body);
        } else {
          common.outputError(error, response);
          callback(response.body,null);
        }
      });
    },
    // function(results, callback) {
    //   console.log('get category.');
    //   extension.getCategory(res, callback);
    // },
    function(results, callback) {
      console.log('put account.');
      var id = common.getIDFromIdentifier(results.ExtensionCategories, 'user_name');

      var requestBody = { 
                           'AccountExtensions':[
                             {
                               //'extensionCategoryId':id,
                               'dataType':20,
                               'value': req.body.displayname,
                               'publicLevel':0
                             }
                           ]
                         };
      var requestData = common.createPutRequest('accounts',account_id,requestBody);
      request.put( requestData, function(error, response, body){
        if(!error && response.statusCode == 200 && response.body){
          callback(null, response.body);
        } else {
          common.outputError(error, response);
          callback(response.body,null);
        }
      });
    }
  ],
  function(err,results){
    if(err){
      console.log('Something Error happened in create user.');
      res.render('error', {'message': 'Something Error happened in create user.'});
      return;
    }
    
    res.redirect('/');
  });
};

