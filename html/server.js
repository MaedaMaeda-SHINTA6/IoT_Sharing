var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json"
  // 読み取りたいMIMEタイプはここに追記
};

var http_server = new http.createServer(function (req, res) {

  if (req.url == '/') {
    filePath = '/index.html';
  }
  else if (req.url == '/login') {
    filePath = '/sign_in.html';
  }
  else if (req.url == '/maps') {
    filePath = '/gg_map.html';
  }
  else if (req.url == '/Webcamera') {
    filePath = '/Webcamera.html';
  }
  else if (req.url == '/Web') {
    filePath = '/Webcamera_pear.html';
  }
  else if (req.url == '/vege_profile') {
    filePath = '/vegetable_profile.html';
  }
  else {
    filePath = req.url;
  }
  var fullPath = __dirname + filePath;

  res.writeHead(200, { "Content-Type": mime[path.extname(fullPath)] || "text/plain" });
  fs.readFile(fullPath, function (err, data) {
    if (err) {
      // エラー時の応答
    } else {
      res.end(data, 'UTF-8');
    }
  });
}).listen(3000);
console.log('Server running at http://localhost:3000/');