;(function() {

	/********************/
	/*** GAME OF LIFE ***/
	/********************/

	function GameOfLife() {

		//Static variables
		var MAP_W = 600,
			MAP_H = 600,
			TILE_W = 10,
			OFF_X,
			COLS = MAP_W / TILE_W,
			ROWS = MAP_H / TILE_W,
			curCellMap = null,
			nextCellMap = null;

		//Canvas object
		var canvas = {
			canvas: null,
			context: null,
            canvasW: null,
			gridStroke: "#eee",
			cellAliveColour: null,
			cellImg: null,
            cellDimensions: {},

			//Canvas functions
			init: function() {
				this.canvas = document.getElementById('game');
				this.context = this.canvas.getContext('2d');
                this.canvasW = this.canvas.width;
                OFF_X = this.canvasW/2 - TILE_W/2;
				this.context.translate(OFF_X, 0);
                
                this.cellAliveColour = this.generateColourPallete(53, 179, 32);
                
                //Calculate dimensions of side, width and height of cell (relative to isometric view)
                this.cellDimensions.height = utilities.twoDToIso(1*TILE_W, 1*TILE_W).y - utilities.twoDToIso(0, 0).y;
                this.cellDimensions.width = Math.abs(utilities.twoDToIso(0, 1*TILE_W).x - utilities.twoDToIso(1*TILE_W, 0).x);
                this.cellDimensions.side = {
                    x: this.cellDimensions.width / 2,
                    y: this.cellDimensions.height / 2
                }
                                
			},

			drawGrid: function() {

				//Vertical lines
				for(var x = 0; x <= COLS; x++) {
					var start = utilities.twoDToIso(x*TILE_W, 0),
						end = utilities.twoDToIso(x*TILE_W, MAP_H);				
					this.context.moveTo(start.x, start.y);
					this.context.lineTo(end.x, end.y);
				}

				//Horizontal lines
				for(var y = 0; y <= ROWS; y++) {
					var start = utilities.twoDToIso(0, y*TILE_W),
						end = utilities.twoDToIso(MAP_W, y*TILE_W);				
					this.context.moveTo(start.x, start.y);
					this.context.lineTo(end.x, end.y);
				}

				utilities.setStroke(this.gridStroke);

			},

			drawCellMap: function() {
                //this.drawCell(3,3);
                //return;
				for(var y = 0; y < ROWS; y++) {
					for(var x = 0; x < COLS; x++) {
						if(curCellMap[y][x] == 1) {
							this.drawCell(x, y);
						}
					}
				}
			},

			drawCell: function(x, y, colour) {
                this.drawCube(x, y);
			},
            
            drawTile: function(x, y) {
                var top = utilities.twoDToIso(x*TILE_W, y*TILE_W),
                    left = {
                        x: top.x - this.cellDimensions.side.x,
                        y: top.y + this.cellDimensions.side.y
                    },
                    right = {
                        x: top.x + this.cellDimensions.side.x,
                        y: top.y + this.cellDimensions.side.y
                    },
                    btm = {
                        x: top.x,
                        y: top.y + this.cellDimensions.height
                    }
                
                utilities.setFill('#333');
                this.context.beginPath();
				this.context.moveTo(top.x, top.y);
				this.context.lineTo(left.x, left.y);
				this.context.lineTo(btm.x, btm.y);
				this.context.lineTo(right.x, right.y);
				this.context.closePath();
				this.context.fill();
            },
            
            drawCube: function(x, y) {
                
                var origin = utilities.twoDToIso(x*TILE_W, y*TILE_W),
                    top = {
                        x: origin.x,
                        y: origin.y - this.cellDimensions.height
                    },
                    btmLeft = { 
                        x: origin.x - this.cellDimensions.side.x, 
                        y: origin.y + this.cellDimensions.side.y 
                    },
                    btm = { 
                        x: origin.x, 
                        y: origin.y + this.cellDimensions.height 
                    },
                    btmRight = {
                        x: origin.x + this.cellDimensions.side.x, 
                        y: origin.y + this.cellDimensions.side.y 
                    },
                    midLeft = { 
                        x: btmLeft.x, 
                        y: btmLeft.y - this.cellDimensions.height 
                    },
                    mid = origin,
                    midRight = {
                        x: btmRight.x, 
                        y: btmRight.y - this.cellDimensions.height 
                    }
                                
                //Draw left face
                utilities.setFill(this.cellAliveColour.dark);
                this.context.beginPath();
				this.context.moveTo(btmLeft.x, btmLeft.y);
				this.context.lineTo(midLeft.x, midLeft.y);
				this.context.lineTo(mid.x, mid.y);
				this.context.lineTo(btm.x, btm.y);
				this.context.closePath();
				this.context.fill();
                
                //Draw right face
                utilities.setFill(this.cellAliveColour.light);
                this.context.beginPath();
				this.context.moveTo(btm.x, btm.y);
				this.context.lineTo(mid.x, mid.y);
				this.context.lineTo(midRight.x, midRight.y);
				this.context.lineTo(btmRight.x, btmRight.y);
				this.context.closePath();
				this.context.fill();
                
                //Draw top
                utilities.setFill(this.cellAliveColour.base);
                this.context.beginPath();
				this.context.moveTo(midLeft.x, midLeft.y);
				this.context.lineTo(top.x, top.y);
				this.context.lineTo(midRight.x, midRight.y);
				this.context.lineTo(mid.x, mid.y);
				this.context.closePath();
				this.context.fill();
                
            },
            
            drawMouseState: function() {
                //As the mouse coordinats are navigating isometric space, they need to first be converted to 2d
                var twoDCoords = utilities.isoTo2d(mouse.mousePos.x, mouse.mousePos.y),
                    adjusted2dCoords = {
                        x: Math.floor(twoDCoords.x/TILE_W),
                        y: Math.floor(twoDCoords.y/TILE_W)
                    };
                
                //Only draw tiles that fall within the map
                if(adjusted2dCoords.x < 0 || adjusted2dCoords.x > COLS-1 || adjusted2dCoords.y < 0 || adjusted2dCoords.y > ROWS-1) {
                    return;
                }
                
                this.drawTile(adjusted2dCoords.x, adjusted2dCoords.y);
            },

			clearCanvas: function() {
				this.context.clearRect(-OFF_X, 0, MAP_W+OFF_X, MAP_H);
			},
            
            generateColourPallete: function(r, g, b) {
                return {
                    base: 'rgb(' + r + ',' + g + ',' + b + ')',
                    dark: 'rgb(' + Math.floor(0.7 * r) + ',' + Math.floor(0.7 * g) + ',' + Math.floor(0.7 * b) + ')',
                    light: 'rgb(' + Math.floor(1.3 * r) + ',' + Math.floor(1.3 * g) + ',' + Math.floor(1.3 * b) + ')'
                }
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

				for(var y = 0; y < ROWS; y++) {
					for(var x = 0; x < COLS; x++) {
						var rand = utilities.getRandomNum(0, 1);
						map[y][x] = (rand <= density) ? 1 : 0;
					}
				}
				return map;
			},

			generateEmptyMap: function() {
				var map = utilities.create2DArray(ROWS, COLS);

				for(var y = 0; y < ROWS; y++) {
					for(var x = 0; x < COLS; x++) {
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
        
        //Add mouse interaction
        var mouse = {
            canvasBounds: {},
            mousePos: {},
            
            init: function() {
                this.canvasBounds = canvas.canvas.getBoundingClientRect();
                this.bindMouseToCanvas();
            },
            
            bindMouseToCanvas: function() {
                canvas.canvas.addEventListener('mousemove', function(evt) {
                    //Takes into account offsets used to center canvas on screen
                    mouse.mousePos.x =  evt.clientX - mouse.canvasBounds.left - OFF_X,
                    mouse.mousePos.y =  evt.clientY - mouse.canvasBounds.top
                });
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
            mouse.init();
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
        
        this.renderMouseActivity = function() {
            canvas.drawMouseState();
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
    
    //Mouse interactions need to be rendered seperately to main loop to provide real-time feedback
    function interactionLoop() {
        window.requestAnimationFrame(interactionLoop);    
        gol.renderMouseActivity();
    }
    
    main();
    interactionLoop();
    
})();