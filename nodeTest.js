var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();
var ejs = require('ejs');
var http=require('http');
var server=app.listen(8000);
var io = require('socket.io').listen(server);

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

var count=0;
//// PONG VARS
var players=0;
var startid;
//ball movement
var ballPosition={
	ballx:150,
	bally:150
};
var ballDirection={
	dx:5,
	dy:-16
};
//player one
var playerOneReady= false;
var playerOneSocketID='';
var playerOnePosition={
	playeronex : 0,
	playeroney : 125
};
var playerOneDirection={
	upClicked : false,
	downClicked : false
}
// player two
var playerTwoReady= false;
var playerTwoSocketID='';
var playerTwoPosition={
	playertwox : 285,
	playertwoy : 125
}
var playerTwoDirection={
	upClicked : false,
	downClicked : false
}
// ball
var gameBall={
	position : ballPosition,
	direction : ballDirection
};
var playerOne={
	position : playerOnePosition,
	direction : playerOneDirection,
	ready : playerOneReady,
	socketid : playerOneSocketID
}
var playerTwo={
	position :  playerTwoPosition,
	direction : playerTwoDirection,
	ready : playerTwoReady,
	socketid : playerTwoSocketID
}

// Fire it up!
io.on('connection', function (socket) {
	console.log('socket connection');
	socket.emit('currentCount', {count: count});
	socket.emit('initial',{gameball: gameBall, playerone : playerOne, playertwo : playerTwo});

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
		players++;
		console.log('There are '+players+ ' players online');
		if(players==1){
			startid=data.socketid;
			playerOneSocketID=data.socketid;
			console.log('player one ID is '+playerOneSocketID);
		}
		else if(players==2){
			playerTwoSocketID=data.socketid;
			console.log('player two ID is '+playerTwoSocketID);
			console.log('x= '+ballPosition.ballx+' | y= '+ballPosition.bally);
			console.log(startid+'| derp');
			// drawGame(callback);
			if (ballPosition.ballx + ballDirection.dx > 300 || ballPosition.ballx + ballDirection.dx < 0)
				ballDirection.dx = -ballDirection.dx;
			if (ballPosition.bally + ballDirection.dy > 300 || ballPosition.bally + ballDirection.dy < 0)
				ballDirection.dy = -ballDirection.dy;
			ballPosition.ballx+=ballDirection.dx;
			ballPosition.bally+=ballDirection.dy;
			setTimeout(
				function() {
					io.sockets.emit('drawBall', {gameball: gameBall, playerone : playerOne, playertwo: playerTwo, socketid: startid});
				},100
			);
			callback(ballPosition);
		}
	});

	socket.on('continueGame', function (data, callback){
		// drawGame(callback);
			if (ballPosition.ballx + ballDirection.dx > 300 || ballPosition.ballx + ballDirection.dx < 0)
				ballDirection.dx = -ballDirection.dx;
			if (ballPosition.bally + ballDirection.dy > 300 || ballPosition.bally + ballDirection.dy < 0)
				ballDirection.dy = -ballDirection.dy;
			ballPosition.ballx+=ballDirection.dx;
			ballPosition.bally+=ballDirection.dy;
			collision();
			setTimeout(
				function() {
						io.sockets.emit('drawBall', {gameball: gameBall, playerone : playerOne, playertwo: playerTwo, socketid: startid})
				},100
			);
			callback(ballPosition);
	});

	socket.on('moveplayer', function (data, callback){
		if(data.keycode==38 && data.socketid==playerOneSocketID){
			playerOne.position.playeroney -= 15;
			if(playerOne.position.playeroney<=0){
				playerOne.position.playeroney=0;
			}
		}
		else if(data.keycode==40 && data.socketid==playerOneSocketID){
			playerOne.position.playeroney += 15;
			if(playerOne.position.playeroney>=250){
				playerOne.position.playeroney=250;
			}
		}
		else if(data.keycode==38 && data.socketid==playerTwoSocketID){
			playerTwo.position.playertwoy -= 15;
			if(playerTwo.position.playertwoy<=0){
				playerTwo.position.playertwoy=0;
			}
		}
		else if(data.keycode==40 && data.socketid==playerTwoSocketID){
			playerTwo.position.playertwoy += 15;
			if(playerTwo.position.playertwoy>=250){
				playerTwo.position.playertwoy=250;
			}
		}
		io.sockets.emit('drawPlayer', {gameball: gameBall, playerone: playerOne, playertwo : playerTwo, socketid: startid});
	});

	function collision(){
		if(gameBall.position.ballx+gameBall.direction.dx<0){
			if(gameBall.position.bally>playerOne.position.playeroney && 
				gameBall.position.bally<playerOne.position.playeroney + 50){
				gameBall.direction.dx=-gameBall.direction.dx;
			}
			else{
				console.log('Player Two 1 point');
				resetGame();
				io.sockets.emit('gg', {gameball: gameBall, playerone: playerOne, playertwo : playerTwo, socketid: startid});
			}
		}
		else if(gameBall.position.ballx+gameBall.direction.dx>300){
			if(gameBall.position.bally>playerTwo.position.playertwoy && 
				gameBall.position.bally<playerTwo.position.playertwoy + 50){
				gameBall.direction.dx=-gameBall.direction.dx;
			}
			else{
				console.log('Player One 1 Point');
				resetGame();
				io.sockets.emit('gg', {gameball: gameBall, playerone: playerOne, playertwo : playerTwo, socketid: startid});
			}			
		}
	}

	function resetGame(){
		playerOne.position.playeronex=0;
		playerOne.position.playeroney=125;
		playerTwo.position.playertwox=285;
		playerTwo.position.playertwoy=125;
		gameBall.position.ballx=150;
		gameBall.position.bally=150;
	}
});

// TODO
// need to broadcast once count is channged
console.log('Listening on port 8000');