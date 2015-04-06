var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();
var ejs = require('ejs');
var http=require('http');
var server=app.listen(8000);
var io = require('socket.io').listen(server);

var count=0;

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
// app.listen(8000);
io.on('connection', function (socket) {
	console.log('socket connection');
	socket.emit('currentCount', {count: count});

	socket.on('increment', function (data, callback) {
		count++;
		console.log('count incremented to '+ count);
		socket.broadcast.emit('boradcastCount', {count: count});
		callback(count);
		console.log('after callback');
	});

	socket.on('decrement', function (data, callback) {
		count--;
		console.log('count decremented to '+ count);
		socket.broadcast.emit('boradcastCount', {count: count});
		callback(count);
		console.log('after callback');
	});
});

// TODO
// need to broadcast once count is channged
console.log('Listening on port 8000');