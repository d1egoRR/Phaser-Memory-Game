window.onload = function() {

	var tileSize = 80;
	var numRows = 4;
	var numCols = 5;
	var tileSpacing = 10;

	var tilesArray = [];
	var selectedArray = [];

	var playSound;
	var score;
	var timeLeft;

	var GAME_WIDTH = 500;
	var GAME_HEIGHT = 500;

	var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT);


	var gameOver = function(game) {}

	gameOver.prototype = {

		create: function() {

			var style = {
				font: "32px Monospace",
				fill: "#00ff00",
				align: "center"
			}

			var text = game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Game Over\n\nYour score: " + score + "\n\nTap to restart", style);
			text.anchor.set(0.5);

			game.input.onDown.add(this.restartGame, this);
		},

		restartGame: function() {
			tilesArray.length = 0;
			selectedArray.length = 0;
			game.state.start("TitleScreen");
		}
	}

	var titleScreen = function(game) {}

	titleScreen.prototype = {

		preload: function() {
			game.load.spritesheet("soundicons", "img/soundicons.png", tileSize, tileSize);
		},

		create: function() {

			game.stage.disableVisibilityChange = true;

			var style = {
				font: "48px Monospace",
				fill: "#00ff00",
				align: "center"
			};

			var text = game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Crack Alien Code", style);
			text.anchor.set(0.5);

			var soundButton = game.add.button(GAME_WIDTH / 2 - 100 , GAME_HEIGHT / 2 + 100, "soundicons", this.startGame, this);
			soundButton.anchor.set(0.5);

			soundButton = game.add.button(GAME_WIDTH / 2 + 100 , GAME_HEIGHT / 2 + 100, "soundicons", this.startGame, this);
			soundButton.frame = 1;
			soundButton.anchor.set(0.5);
		},

		startGame: function(target) {
			playSound = (target.frame == 0) ? true : false;
			game.state.start("PlayGame");
		}
	}

	var playGame = function(game) {}

	playGame.prototype = {

		scoreText: null,
		timeText: null,
		soundArray: [],

		preload: function() {
			game.load.spritesheet('tiles', 'img/tiles1.png', tileSize, tileSize);
			game.load.audio("select", ["sound/select.mp3", "sound/select.ogg"]);
			game.load.audio("right", ["sound/right.mp3", "sound/right.ogg"]);
			game.load.audio("wrong", ["sound/wrong.mp3", "sound/wrong.ogg"]);
		},

		create: function() {
			score = 0;
			timeLeft = 20;

			this.placeTiles();

			if (playSound) {
				this.soundArray[0] = game.add.audio("select", 1);
				this.soundArray[1] = game.add.audio("right", 1);
				this.soundArray[2] = game.add.audio("wrong", 1);
			}

			var style = {
				font: "32px Monospace",
				fill: "#00ff00",
				align: "center"
			}

			this.scoreText = game.add.text(5, 5, "Score: " + score, style);

			this.timeText = game.add.text(5, GAME_HEIGHT - 5, "Time left: " + timeLeft, style);
			this.timeText.anchor.set(0, 1);

			game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);
		},

		decreaseTime: function() {
			timeLeft --;
			this.timeText.text = "Time left: " + timeLeft;

			if (timeLeft == 0) {
				game.state.start("GameOver");
			}
		},

		placeTiles: function() {

			leftSpace = (GAME_WIDTH - (numCols * tileSize) - ((numCols - 1) * tileSpacing)) / 2;
			topSpace = (GAME_HEIGHT - (numRows * tileSize) - ((numRows - 1) * tileSpacing)) / 2;

			var x, y;

			for (var i = 0; i < numRows * numCols; i++) {
				tilesArray.push(Math.floor(i / 2));
			}

			this.shuffleArray();

			for (var i = 0; i < numCols; i++) {
				for (var j = 0; j < numRows; j++) {

					x = leftSpace + i * (tileSize + tileSpacing);
					y = topSpace + j * (tileSize + tileSpacing);

					var tile = game.add.button(x, y, "tiles", this.showTile, this);
					tile.frame = 10;
					tile.value = tilesArray[j * numCols + i];

				}
			}
		},

		shuffleArray: function() {
			for (var i = 0; i < numRows * numCols; i++) {
				var from = game.rnd.between(0, tilesArray.length-1);
				var to = game.rnd.between(0, tilesArray.length-1);
				var temp = tilesArray[from];
				
				tilesArray[from] = tilesArray[to];
				tilesArray[to] = temp;
			}
		},

		showTile: function(target) {
			if (selectedArray.length < 2 && selectedArray.indexOf(target) == -1) {
				if (playSound) {
					this.soundArray[0].play();
				}
				target.frame = target.value;
				selectedArray.push(target);
			}

			if (selectedArray.length == 2) {
				game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);
			}
		},

		checkTiles: function() {
			if (selectedArray[0].value == selectedArray[1].value) {
				if (playSound) {
					this.soundArray[1].play();
				}

				score ++;
				this.scoreText.text = "Score: " + score;

				selectedArray[0].destroy();
				selectedArray[1].destroy();
			}
			else
			{
				if (playSound) {
					this.soundArray[2].play();
				}
				selectedArray[0].frame = 10;
				selectedArray[1].frame = 10;
			}

			selectedArray.length = 0;
		}

	}

	game.state.add("TitleScreen", titleScreen);
	game.state.add("PlayGame", playGame);
	game.state.add("GameOver", gameOver);
	
	game.state.start("TitleScreen");

}