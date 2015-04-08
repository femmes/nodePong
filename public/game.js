$(document).ready(function(){
	//canvas
	var WIDTH;
	var HEIGHT;
	var ctx;
	//circle start position
	// var ballx=150;
	// var bally=150;
	//playerone start position
	var playeronex=0;
	var playeroney=125;
	//playertwo start position
	var playertwox=285;
	var playertwoy=125;
	//change ball in direction
	// var dx=2;
	// var dy=-4;

	var clientsocket='';
	var serversocket='';

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

	// init();
	init();

	socket.on('initial', function (data) {
		clientsocket=socket.id;
		clear();
		circle(data.position.ballx,data.position.bally,10, function(){});
	});

	//gets called only on clicked browser
	$('.playGame').on('click', function(){
		socket.emit('playGame', {socketid: clientsocket}, function(data){});
	});

	//gets called for each open browser because of server js
	socket.on('drawBall', function (data) {
		clear();
		serversocket=data.socketid;
		circle(data.position.ballx,data.position.bally,10, function(){
			if(clientsocket===serversocket){
				// alert(clientsocket);
				socket.emit('playGame', {socketid: clientsocket}, function(data){
					// alert(data.ballx);
				});
			}
		});
	});

});
