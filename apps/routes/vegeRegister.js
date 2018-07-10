// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var router = express.Router();
var common = require('../app/common_function.js');
var mod = require('../app/vegeRegister');
var multer = require('multer');
// var storage = multer.memoryStorage();
//var upload = multer({ dest: './public/images/upload/' }).single('file_uploads');
var upload = multer({ inMemory: true }).single('file_uploads');


/* GET home page. */
router.get('/', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.get);
});

/* GET home page. */
router.post('/', function (req, res, next) {
  common.saveToken(req);
  common.executeControlerWithToken(req, res, mod.post);
});

router.post('/uploads', function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.log("Failed to write " + req.file.destination + " with " + err);
    } else {
      console.log("uploaded " + req.file.originalname + " as " + req.file.filename + " Size: " + req.file.size);
      common.saveToken(req);
      common.executeControlerWithToken(req, res, mod.uploads);
    }
  });

  // console.log(buffer);
  // common.saveToken(req);
  // common.executeControlerWithToken(req, res, mod.uploads);

});

module.exports = router;
