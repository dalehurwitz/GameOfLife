;(function() {

	/********************/
	/*** GAME OF LIFE ***/
	/********************/

	function GameOfLife() {

		//Static variables
		var MAP_W = 600,
			MAP_H = 600,
			TILE_W = 10,
			OFF_X = 400 - TILE_W/2,
			COLS = MAP_W / TILE_W,
			ROWS = MAP_H / TILE_W,
			curCellMap = null,
			nextCellMap = null;

		//Canvas object
		var canvas = {
			canvas: null,
			context: null,
			gridStroke: "#eee",
			cellAliveColour: "#000",
			cellDeadColour: "#ccc",
			cellImg: null,

			//Canvas functions
			init: function() {
				this.canvas = document.getElementById('game');
				this.context = this.canvas.getContext('2d');
				this.context.translate(OFF_X, 0);
				
				this.cellImg = new Image();
				this.cellImg.src = "images/isometric-cube.svg";
				this.cellImg.width = '17.32';
				this.cellImg.height = '20';
			},

			drawGrid: function() {

				//Vertical lines
				for(x = 0; x <= COLS; x++) {
					var start = utilities.twoDToIso(x*TILE_W, 0),
						end = utilities.twoDToIso(x*TILE_W, MAP_H);				
					this.context.moveTo(start.x, start.y);
					this.context.lineTo(end.x, end.y);
				}

				//Horizontal lines
				for(y = 0; y <= ROWS; y++) {
					var start = utilities.twoDToIso(0, y*TILE_W),
						end = utilities.twoDToIso(MAP_W, y*TILE_W);				
					this.context.moveTo(start.x, start.y);
					this.context.lineTo(end.x, end.y);
				}

				utilities.setStroke(this.gridStroke);

			},

			drawCellMap: function() {
				for(y = 0; y < ROWS; y++) {
					for(x = 0; x < COLS; x++) {
						if(curCellMap[y][x] == 1) {
							this.drawCell(x, y, this.cellAliveColour);
						} else {
							//this.drawCell(x, y, this.cellDeadColour);
						}
					}
				}
			},

			drawCell: function(x, y, colour) {
				
				var coords = utilities.twoDToIso(x*TILE_W, y*TILE_W);
				this.context.drawImage(this.cellImg, coords.x-17.32/2, coords.y-10);

				/*var topLeft = utilities.twoDToIso(x*TILE_W, y*TILE_W),
					topRight = utilities.twoDToIso(x*TILE_W+TILE_W, y*TILE_W),
					btmRight = utilities.twoDToIso(x*TILE_W+TILE_W, y*TILE_W+TILE_W),
					btmLeft = utilities.twoDToIso(x*TILE_W, y*TILE_W+TILE_W);

				utilities.setFill(colour);

				this.context.beginPath();
				this.context.moveTo(topLeft.x, topLeft.y);
				this.context.lineTo(topRight.x, topRight.y);
				this.context.lineTo(btmRight.x, btmRight.y);
				this.context.lineTo(btmLeft.x, btmLeft.y);
				this.context.closePath();
				this.context.fill();*/

			},

			clearCanvas: function() {
				this.context.clearRect(-OFF_X, 0, MAP_W+OFF_X, MAP_H);
			}
		};

		//Map object
		var map = {

			//Map functions
			init: function() {
				curCellMap = this.generateRandomMap(0.05);
				//curCellMap = this.generateTestMap();
				nextCellMap = this.generateEmptyMap();
			},

			generateRandomMap: function(density) {
				/*
                /* Generates a random cell map
                /* density = 0.00 -> No live cells, density = 1.00 -> All cells live
                */

				var map = utilities.create2DArray(ROWS, COLS);

				for(y = 0; y < ROWS; y++) {
					for(x = 0; x < COLS; x++) {
						var rand = utilities.getRandomNum(0, 1);
						map[y][x] = (rand <= density) ? 1 : 0;
					}
				}
				return map;
			},

			generateEmptyMap: function() {
				var map = utilities.create2DArray(ROWS, COLS);

				for(y = 0; y < ROWS; y++) {
					for(x = 0; x < COLS; x++) {
						var rand = utilities.getRandomNum(0, 1);
						map[y][x] = 0;
					}
				}
				return map;
			},

			refreshNextCellMap: function() {
				nextCellMap = this.generateEmptyMap();
			},

			generateTestMap: function() {
				var map = this.generateEmptyMap();

				map[1][0] = 1;
				map[1][1] = 1;
				map[1][2] = 1;

				return map;
			}
		};

		//Cells object
		var cells = {

			getNeighbourCount: function(y, x) {
				/*
                /* [y][x]
                /* Start at top and move clockwise
                */
				var neighbours = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]],
					count = 0;

				for(var i = 0; i < neighbours.length; i++) {
					var curNeighbour = neighbours[i];

					//Skip this iteration if neighbour is out of bounds
					if((y + curNeighbour[0] < 0) || (y + curNeighbour[0] > ROWS-1) || (x + curNeighbour[1] < 0) || (x + curNeighbour[1] > COLS-1)) {
						continue;
					}

					var nextY = y+curNeighbour[0],
						nextX = x+curNeighbour[1];

					if(curCellMap[nextY][nextX] === 1) {
						count++;
					}
				}              
				return count;
			},

			update: function() {
				for(var y = 0; y < ROWS; y++) {
					for(var x = 0; x < COLS; x++) {
						var numNeighbours = this.getNeighbourCount(y, x),
							curCellState = curCellMap[y][x],
							newCellState;

						//If living cell has 2-3 neighbours, keep it alive
						if(curCellState === 1 && numNeighbours > 1 && numNeighbours < 4) {
							newCellState = 1;
							//If dead cell has exactly 3 neighoburs, bring it to life
						} else if(curCellState === 0 && numNeighbours === 3) {
							newCellState = 1;
							//Death and destruction
						} else {
							newCellState = 0;
						}
						nextCellMap[y][x] = newCellState;
					}
				}
				curCellMap = nextCellMap;
				map.refreshNextCellMap();
			}
		};

		//utilities
		var utilities = {
			setStroke: function(colour) {
				canvas.context.strokeStyle = colour;
				canvas.context.stroke();
			},

			setFill: function(colour) {
				canvas.context.fillStyle = colour;
			},

			create2DArray: function(_rows, _cols) {
				var emptyArray = new Array(_rows);

				for(i = 0; i < emptyArray.length; i++) {
					emptyArray[i] = new Array(_cols);
				}

				return emptyArray;
			},

			getRandomNum: function(min, max, places) {
				var num = Math.random() * (max - min) + min;
				//Default to 2 decimal places
				places = places || 2;
				return parseFloat(num.toFixed(places));
			},

			/* Takes normal 2d coordinates, converting them to isometric */
			twoDToIso: function(x, y) {
				var coords = {};
				coords.x = x - y;
				coords.y = (x + y) / 2;
				return coords;
			},

			isoTo2d: function(x, y) {
				var coords = {};
				coords.x = (2 * y + x) / 2;
				coords.y = (2 * y - x) /2;
				return coords;
			}
		}

		//Initialise dom elements
		this.init = function() {
			map.init();
			canvas.init();
		};

		//Update game state
		this.update = function() {
			cells.update();
		};

		//Draw gamestate on canvas
		this.draw = function() {
			canvas.clearCanvas();
			canvas.drawGrid();
			canvas.drawCellMap();
		};

	};

	/*************/
	/*** SETUP ***/
	/*************/

	var gol = new GameOfLife();
	gol.init();

	/**********************/
	/*** MAIN GAME LOOP ***/
	/**********************/

	var fps = 5;

	function main() {
		setTimeout(function() {
			window.requestAnimationFrame(main);    
			gol.draw();
			gol.update();
		}, 1000/fps);
	}
	main();
})();