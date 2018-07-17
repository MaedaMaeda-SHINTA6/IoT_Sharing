// Copyright FUJITSU LIMITED 2016-2017
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var formidable = require('formidable');
// var fs = require('fs');
// var util = require('util');

var routes = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');
var complete = require('./routes/complete');
var detail = require('./routes/detail');
var search = require('./routes/search');
var matchingList = require('./routes/matchingList');

//mypage
var mypage = require('./routes/mypage');
//野菜検索
var vegeSearch = require('./routes/vegeSearch');
//配送経路
var vegeRoute = require('./routes/vegeRoute');
//配送履歴
var vegeHistory = require('./routes/vegeHistory');
//野菜登録
var vegeRegister = require('./routes/vegeRegister');
//野菜照会
var vegeprofile = require('./routes/vegeprofile');

// i18n
var i18next = require('i18next');
var i18nextMiddleware = require('i18next-express-middleware');
var i18nextBackend = require('i18next-node-fs-backend');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// use i18next middleware 
i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    nsSeparator: false,
    keySeparator: false,
    ns: ['common'],
    defaultNS: 'common',
    preload: ['en', 'ja'],
    detection: {
      caches: ['cookie']
    },
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json'
    }
  }, (err, t) => {
    if (err) {
      console.error('error is occurred');
      console.error(err);
    } else {
      console.log('i18n ready');
    }
  });
app.use(i18nextMiddleware.handle(i18next));

app.use('/', routes);
app.use('/login', login);
app.use('/register', register);
app.use('/complete', complete);
app.use('/detail', detail);
app.use('/search', search);
app.use('/list', matchingList);
//追加ページ
app.use('/mypage', mypage);
//野菜検索ページ
app.use('/vege-search', vegeSearch);
//配送経路ページ
app.use('/vege-route', vegeRoute);
//配送履歴ページ
app.use('/d-history', vegeHistory);
//野菜登録ページ
app.use('/vege-register', vegeRegister);
//野菜照会ページ
app.use('/vege-profile', vegeprofile);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
