var BROADCAST_ID = '_broadcast_';

// signalingServerの作成、ポート番号の指定
var srv = require('http').Server();
var io = require('socket.io')(srv);
var port = 9001;
srv.listen(port);
console.log('signaling server started on port:' + port);


// ソケットがサーバーに接続しようとする度に呼び出される関数 
io.on('connection', function(socket) {

    socket.on('enter', function(roomname) {
      socket.join(roomname);
      console.log('id=' + socket.id + ' enter room=' + roomname);
      setRoomname(roomname);
    });

    function setRoomname(room) {
      socket.roomname = room;
    }

    function getRoomname() {
      var room = null;
      room = socket.roomname;

      return room;
    }


    function emitMessage(type, message) {
      // ----- multi room ----
      var roomname = getRoomname();

      if (roomname) {
        console.log('===== message broadcast to room -->' + roomname);
        socket.broadcast.to(roomname).emit(type, message);
      }
      else {
        console.log('===== message broadcast all');
        socket.broadcast.emit(type, message);
      }
    }


    // ユーザがSDPメッセージを送信したときにアクセスしている全てのユーザに送信する
    socket.on('message', function(message) {
        message.from = socket.id;

        // get send target
        var target = message.sendto;
        if ( (target) && (target != BROADCAST_ID) ) {
          console.log('===== message emit to -->' + target);
          socket.to(target).emit('message', message);
          return;
        }

        // broadcast in room
        emitMessage('message', message);
    });


    socket.on('disconnect', function() {
        console.log('-- user disconnect: ' + socket.id);
        // --- emit ----
        emitMessage('user disconnected', {id: socket.id});

        // --- leave room --
        var roomname = getRoomname();
        if (roomname) {
          socket.leave(roomname);
        }

    });

});