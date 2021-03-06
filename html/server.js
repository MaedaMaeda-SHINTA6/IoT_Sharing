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

  //ルーティング設定が必要な場合はここに追記
  switch (req.url) {
    case '/':
      filePath = '/index.html';
      break;
    case '/login':
      filePath = '/login.html';
      break;
    case '/maps':
      filePath = '/gg_map.html';
      break;
    case '/route-search':
      filePath = '/gg_route.html'
      break;
    case '/watch':
      filePath = '/watch.html';
      break;
    case '/talk':
      filePath = '/talk.html';
      break;
    case '/vege_profile':
      filePath = '/vegetable_profile.html';
      break;
    case '/deli_his':
      filePath = '/delivery_history.html';
      break;
    case '/entry':
      filePath = '/entry.html';
      break;
    default:
      filePath = req.url;
      break;
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