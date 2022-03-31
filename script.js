

class Game {
	constructor() {
		this.highscoreCookieName = "10kdleHighScore";
		this.clicksDataName = "ClickData";
		this.size = 100;
		this.state = "setting";
		this.counter = 0;
		this.width = $(".game").width();
		this.highscore = this.GetHighscore();
		$("#bestScoreValue").text(this.highscore ? this.highscore : "");
		this.setup();
		this.state = "playing";
	}
	generateDailyValues() {
		var that = this;
		var size = this.size;

		function rngFromSeed(seed) {
			return parseFloat(
				"0." +
					((seed*5.2352749217) / Math.PI)
						.toString()
						.slice(5)
			);
		}

		function getDateNumber() {
			var dateObj = new Date(Date.now());
			var month = dateObj.getUTCMonth() + 1; //months from 1-12
			var day = dateObj.getUTCDate();
			var year = dateObj.getUTCFullYear();
			var seed = year + "" + month + "" + day;
			seed = parseInt(seed);
			return seed;
		}

		function getPosFromDate() {
			var seed = getDateNumber();
			var x = Math.ceil(rngFromSeed(seed * 23023.232352) * size);
			var y = Math.ceil(rngFromSeed(seed * 2342.532523) * size);
			return { x: x, y: y };
		}

		function setColorFromDate() {
			var num = rngFromSeed(getDateNumber() * 8356.2307492);
			var from = 63;
			var to = 213;
			var diff = from - to;

			var hue = diff * num;
			hue += from;

			var sat = rngFromSeed(getDateNumber() * 5235.832692) * 60;
			sat += 30;
			that.hue = hue;
			//that.sat = sat;
		}

		this.pos = getPosFromDate();
		setColorFromDate();
	}
	generateBoard() {
		var bsize = this.width / this.size;
		var button = $(".guess");
		var row = $(".row");

		var halfSize = Math.ceil(this.size / 2);

		for (var i = 0; i < this.size * this.size; i++) {
			var x = i % this.size;
			var y = Math.floor(i / this.size);
			var newb = button.clone();
			newb.attr("data-x", x);
			newb.attr("data-y", y);
			newb.css("top", y * bsize);
			newb.css("left", x * bsize);
			if (halfSize == x && halfSize == y) {
				newb.find(".marker").addClass("outlined");
			}
			$(".game").append(newb);
		}
	}
	updateBoardWithSave() {
		var data = this.getClicks();
		var complete = false;
		for(var i=0;i<data.length;i++){
			var click = data[i];
			var button = $("[data-x="+click.x+"][data-y="+click.y+"]");
			complete = this.guess(click.x,click.y,button)||complete;
		}
		this.update();
		if(complete){
			this.onComplete();
		}
		
	}
	setupEvents() {
		$(".game").one("mousemove", (e)=>{
			$(".game").removeClass("prePlay");
		});

		$(".game").on("mousedown", ".guess", (e) => {
			this.onButtonClick($(e.currentTarget));
		});
	}
	
	onButtonClick(but){
		if (this.state != "playing") {
			return;
		}
		var done = false;
		but.removeClass("guess").addClass("guessed");
		var x = but.data("x");
		var y = but.data("y");
		this.saveClick(x,y);

		done = this.guess(x,y,but);

		if (done) {
			this.onComplete();
		} else {
			this.update();
		}
	}
	guess(x,y,but){
		var done = false;
		this.counter++;
		var delta = { x: this.pos.x - x, y: this.pos.y - y };
		var dist = Math.hypot(delta.x, delta.y);

		var tCol = "rgb(0, 255, 0)";
		if (dist != 0) {
			tCol = this.getColorFromDist(dist);
			but.addClass("guessed");
		} else {
			done = true;
			but.addClass("correct");
		}
		but.find(".marker").css("background-color", tCol);
		return done;

	}
	
	getColorFromDist(dist) {
		var maxDist = this.size * Math.sqrt(2);
		var closeness = dist / maxDist;
		closeness = 1 - closeness;
		closeness = closeness * closeness;
		closeness = closeness * 0.9;
		var brightness = 100 * closeness;
		return "hsl(" + this.hue + ", " + 100 + "%, " + brightness + "%)";
	}

	setup() {
		this.generateDailyValues();
		this.generateBoard();
		this.setupEvents();
		this.updateBoardWithSave();
	}
	update() {
		$("#scoreValue").text(this.counter);
	}
	onComplete() {
		console.log("Done!");
		var that = gam;
		that.state = "complete";
		if (!that.highscore || that.counter < that.highscore) {
			that.highscore = that.counter;
			that.SetHighscore(that.counter);
			$("#bestScoreValue").text(this.highscore);
		}
	}
	
	saveClick(x,y){
		var data = this.getClicks();
		
		data.push({x:x,y:y});
		
		var dataString = JSON.stringify(data);
		this.setCookie(this.clicksDataName,dataString,true);
	}
	getClicks(){
		var data = this.getCookie(this.clicksDataName);
		if(data){
			data = JSON.parse(data);
		}else{
			data = [];
		}
		return data;
	}
	
	SetHighscore(val){
		this.setCookie(this.highscoreCookieName, val);
	}
	GetHighscore() {
		var highscoreVal = this.getCookie(this.highscoreCookieName);
		return parseInt(highscoreVal);
	}
	
	
	setCookie(name, val,timeout) {
		var expiryString = "";
		if(timeout){
			var time = new Date(new Date().setHours(24,0,0,0)).toGMTString();
			expiryString = "expires="+time;
		}
		document.cookie = name + "=" + val;
	}
	getCookie(name) {
		if (document.cookie) {
			var elem = document.cookie
				.split("; ")

				.find((row) => row.startsWith(name + "="));
			if (!elem) {
				return undefined;
			}

			return elem.split("=")[1];
		}
		return undefined;
	}
}

var gam = new Game();
