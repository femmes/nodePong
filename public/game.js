$(document).ready(function(){
	//canvas
	var WIDTH;
	var HEIGHT;
	var ctx;

	var clientsocket='';
	var serversocket='';

	var upClicked = false;
	var downClicked = false;

	function init(){
		ctx=$("#pongCanvas")[0].getContext("2d");
		WIDTH=$("#pongCanvas").width();
		HEIGHT=$("#pongCanvas").height();
		// return setInterval(draw(dx,dy),10);
	}

	function start(){
		return setInterval(draw(dx,dy),10);	
	}

	function circle(x,y,r, callback){
		ctx.fillStyle="#fff";
		ctx.beginPath();
		ctx.arc(x,y,r,0, Math.PI*2, true);
		ctx.fill();
		callback();
	}

	function rectangle(x,y,w,h){
		ctx.fillStyle="#fff";
		ctx.beginPath();
		ctx.rect(x,y,w,h);
		ctx.fill();
	}

	function clear(){
		ctx.clearRect(0,0, WIDTH, HEIGHT);
	}

	function draw(x,y){
		clear();

		circle(ballx,bally,10);
		// rectangle(playeronex,playeroney,15,50);
		// rectangle(playertwox,playertwoy,15,50);
		
		// if (ballx + dx > WIDTH || ballx + dx < 0)
		// 	dx = -dx;
		// if (bally + dy > HEIGHT || bally + dy < 0)
		// 	dy = -dy;

		// ballx+=dx;
		// bally+=dy;
	}

	init();

	socket.on('initial', function (data) {
		clear();
		circle(data.gameball.position.ballx,data.gameball.position.bally,10, function(){});
		rectangle(data.playerone.position.playeronex,data.playerone.position.playeroney,15,50);
		rectangle(data.playertwo.position.playertwox,data.playertwo.position.playertwoy,15,50);
	});

	//gets called only on clicked browser
	$('.playGame').on('click', function(){
		$('.playGame').hide();
		$('.waitingForPlayer').show();
		clientsocket=socket.id;
		socket.emit('playGame', {socketid: clientsocket}, function(data){});
	});

	//gets called for each open browser because of server js
	socket.on('drawBall', function (data) {
		clear();
		serversocket=data.socketid;
		rectangle(data.playerone.position.playeronex,data.playerone.position.playeroney,15,50);
		rectangle(data.playertwo.position.playertwox,data.playertwo.position.playertwoy,15,50);
		circle(data.gameball.position.ballx,data.gameball.position.bally,10, function(){
			if(clientsocket===serversocket){
				// alert(clientsocket);
				// socket.emit('playGame', {socketid: clientsocket}, function(data){
				// 	// alert(data.ballx);
				// });
				socket.emit('continueGame', {socketid: clientsocket}, function(data){
					// alert(data.ballx);
				});
			}
		});
	});

	$(document).keydown(function(e){
		if(e.keyCode==38 || e.keyCode==40){
			socket.emit('moveplayer',{keycode : e.keyCode, socketid : socket.id}, function(data){});
		}
	});
	$(document).keyup(function(e){
		// socket.emit('playeronemove',{keycode : e.keyCode}, function(data){})
	});

	socket.on('drawPlayer', function (data) {
		clear();
		circle(data.gameball.position.ballx,data.gameball.position.bally,10, function(){});
		rectangle(data.playerone.position.playeronex,data.playerone.position.playeroney,15,50);
		rectangle(data.playertwo.position.playertwox,data.playertwo.position.playertwoy,15,50);
	});

	socket.on('gg', function (data){
		$('.ggnore').show();
		clear();
		circle(data.gameball.position.ballx,data.gameball.position.bally,10, function(){});
		rectangle(data.playerone.position.playeronex,data.playerone.position.playeroney,15,50);
		rectangle(data.playertwo.position.playertwox,data.playertwo.position.playertwoy,15,50);
	});
});
