var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();
var ejs = require('ejs');
var http=require('http');
var server=app.listen(8000);
var io = require('socket.io').listen(server);

var count=0;
//// PONG VARS
var startid;
//ball movement
var ballPosition={
	ballx:150,
	bally:150
};
var ballDirection={
	dx:8,
	dy:-16
};
//// PONG VARS


//set view engine to ejs
app.set('view engine', 'ejs');

// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/derp', function(req, res){
// 	count++;
// 	res.render(__dirname+'/views/counter', { count: count })
// });

app.get('/sockets', function(req, res){
	res.sendFile(__dirname+'/blah.html');
});
// Route for everything else.
// app.get('*', function(req, res){
// 	res.send('Hello World wut');
// });

// Fire it up!
io.on('connection', function (socket) {
	console.log('socket connection');
	socket.emit('currentCount', {count: count});
	socket.emit('initial',{position: ballPosition});

	socket.on('increment', function (data, callback) {
		count++;
		console.log('count incremented to '+ count);
		socket.broadcast.emit('boradcastCount', {count: count});
		callback(count);
	});

	socket.on('decrement', function (data, callback) {
		count--;
		console.log('count decremented to '+ count);
		socket.broadcast.emit('boradcastCount', {count: count});
		callback(count);
	});

	socket.on('playGame', function (data, callback) {
		console.log('x= '+ballPosition.ballx+' | y= '+ballPosition.bally);
		startid=data.socketid;
		console.log(startid+'| derp');
		if (ballPosition.ballx + ballDirection.dx > 300 || ballPosition.ballx + ballDirection.dx < 0)
			ballDirection.dx = -ballDirection.dx;
		if (ballPosition.bally + ballDirection.dy > 300 || ballPosition.bally + ballDirection.dy < 0)
			ballDirection.dy = -ballDirection.dy;
		ballPosition.ballx+=ballDirection.dx;
		ballPosition.bally+=ballDirection.dy;
		setTimeout(
			function() {
				io.sockets.emit('drawBall', {position: ballPosition, socketid: startid})
			},2000
		);
		callback(ballPosition);
	});

});

// TODO
// need to broadcast once count is channged
console.log('Listening on port 8000');