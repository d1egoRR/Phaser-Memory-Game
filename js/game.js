window.onload = function () {

    "use strict";
    
	var tileSize = 80,
	    numRows = 4,
	    numCols = 5,
	    tileSpacing = 10,
	    localStorageName = "crackalien",
	    highScore,
        
	    tilesArray = [],
	    selectedArray = [],
        
	    playSound,
	    score,
	    timeLeft,
	    tilesLeft,
        
	    GAME_WIDTH = 500,
	    GAME_HEIGHT = 500,

	    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT);

	game.cache = new Phaser.Cache(game);
	game.cache.destroy();


	var preloadAssets = function (game) {};

	preloadAssets.prototype = {

		preload: function () {
			game.load.spritesheet("tiles", "img/tiles1.png", tileSize, tileSize);
			game.load.audio("select", ["sound/select.mp3", "sound/select.ogg"]);
			game.load.audio("right", ["sound/right.mp3", "sound/right.ogg"]);
			game.load.audio("wrong", ["sound/wrong.mp3", "sound/wrong.ogg"]);
			game.load.spritesheet("soundicons", "img/soundicons.png", 80, 80);
		},

		create: function () {
			game.state.start("TitleScreen");
		}
	};

	var gameOver = function (game) {};

	gameOver.prototype = {

		create: function () {

			highScore = Math.max(score, highScore);
			localStorage.setItem(localStorageName, highScore);

			var style = {font: "32px Monospace", fill: "#00ff00", align: "center"},
                text = game.add.text(
                    GAME_WIDTH / 2,
                    GAME_HEIGHT / 2,
				    "Game Over\n\nYour score: " + score + "\nBest score: " + highScore + "\n\nTap to restart",
				    style
                );

			text.anchor.set(0.5);

			game.input.onDown.add(this.restartGame, this);
		},

		restartGame: function () {
			tilesArray.length = 0;
			selectedArray.length = 0;
			game.state.start("TitleScreen");
		}
	};

	var titleScreen = function (game) {};

	titleScreen.prototype = {

		create: function () {

			game.scale.pageAlignHorizontally = true;
			game.scale.pageAlignVertically = true;
			game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

			game.stage.disableVisibilityChange = true;

			var style = {font: "48px Monospace", fill: "#00ff00", align: "center"},
                text = game.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, "Crack Alien Code", style),
                soundButton = game.add.button(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 100, "soundicons", this.startGame, this);
            
			text.anchor.set(0.5);

			soundButton.anchor.set(0.5);
			soundButton = game.add.button(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 100, "soundicons", this.startGame, this);
			soundButton.frame = 1;
			soundButton.anchor.set(0.5);
		},

		startGame: function (target) {
			playSound = (target.frame === 0) ? true : false;
			game.state.start("PlayGame");
		}
	};

	var playGame = function (game) {};

	playGame.prototype = {

		scoreText: null,
		timeText: null,
		soundArray: [],

		create: function () {
			score = 0;
			timeLeft = 60;

			this.placeTiles();

			if (playSound) {
				this.soundArray[0] = game.add.audio("select", 1);
				this.soundArray[1] = game.add.audio("right", 1);
				this.soundArray[2] = game.add.audio("wrong", 1);
			}

			var style = {font: "32px Monospace", fill: "#00ff00", align: "center"};

			this.scoreText = game.add.text(5, 5, "Score: " + score, style);

			this.timeText = game.add.text(5, GAME_HEIGHT - 5, "Time left: " + timeLeft, style);
			this.timeText.anchor.set(0, 1);

			game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);
		},

		decreaseTime: function () {
			timeLeft -= 1;
			this.timeText.text = "Time left: " + timeLeft;

			if (timeLeft === 0) {
				game.state.start("GameOver");
			}
		},

		placeTiles: function () {

			tilesLeft = numRows * numCols;

			var leftSpace = (GAME_WIDTH - (numCols * tileSize) - ((numCols - 1) * tileSpacing)) / 2,
			    topSpace = (GAME_HEIGHT - (numRows * tileSize) - ((numRows - 1) * tileSpacing)) / 2,
                x,
                y,
                i,
                j,
                tile;
            
			for (i = 0; i < numRows * numCols; i++) {
				tilesArray.push(Math.floor(i / 2));
			}

			this.shuffleArray();

			for (i = 0; i < numCols; i++) {
				for (j = 0; j < numRows; j++) {

					x = leftSpace + i * (tileSize + tileSpacing);
					y = topSpace + j * (tileSize + tileSpacing);

					tile = game.add.button(x, y, "tiles", this.showTile, this);
					tile.frame = 10;
					tile.value = tilesArray[j * numCols + i];

				}
			}
		},

		shuffleArray: function () {
            var i,
                from,
                to,
                temp;
            
			for (i = 0; i < numRows * numCols; i++) {
				from = game.rnd.between(0, tilesArray.length - 1);
				to = game.rnd.between(0, tilesArray.length - 1);
				temp = tilesArray[from];
				
				tilesArray[from] = tilesArray[to];
				tilesArray[to] = temp;
			}
		},

		showTile: function (target) {
			if (selectedArray.length < 2 && selectedArray.indexOf(target) === -1) {
				if (playSound) {
					this.soundArray[0].play();
				}
				target.frame = target.value;
				selectedArray.push(target);
			}

			if (selectedArray.length === 2) {
				game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);
			}
		},

		checkTiles: function () {
			if (selectedArray[0].value === selectedArray[1].value) {
				if (playSound) {
					this.soundArray[1].play();
				}

				timeLeft += 2;
				this.timeText.text = "Time left: " + timeLeft;

				score++;
				this.scoreText.text = "Score: " + score;

				selectedArray[0].destroy();
				selectedArray[1].destroy();

				tilesLeft -= 2;
				if (tilesLeft === 0) {
					tilesArray.length = 0;
					selectedArray.length = 0;
					this.placeTiles();
				}
			} else {
				if (playSound) {
					this.soundArray[2].play();
				}
				selectedArray[0].frame = 10;
				selectedArray[1].frame = 10;
			}

			selectedArray.length = 0;
		}

	};

	game.state.add("PreloadAssets", preloadAssets);
	game.state.add("TitleScreen", titleScreen);
	game.state.add("PlayGame", playGame);
	game.state.add("GameOver", gameOver);
	highScore = localStorage.getItem(localStorageName) === null ? 0 : localStorage.getItem(localStorageName);
	game.state.start("PreloadAssets");

};