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
            layers: [],
            cellLayer: {},
            mouseLayer: {},
            staticLayer: {},
			canvas: null,
			context: null,
            canvasW: null,
			gridStroke: "#eee",
			cellAliveColour: null,
			cellImg: null,
            cellDimensions: {},

			//Canvas functions
			init: function() {
                
                this.cellLayer.canvas = document.getElementById('CellLayer');
				this.cellLayer.ctx = this.cellLayer.canvas.getContext('2d');
                this.mouseLayer.canvas = document.getElementById('MouseLayer');
				this.mouseLayer.ctx = this.mouseLayer.canvas.getContext('2d');
                this.staticLayer.canvas = document.getElementById('StaticLayer');
				this.staticLayer.ctx = this.staticLayer.canvas.getContext('2d');
                
                this.layers.push({ canvas: this.cellLayer.canvas, ctx: this.cellLayer.ctx});
                this.layers.push({ canvas: this.mouseLayer.canvas, ctx: this.mouseLayer.ctx});
                this.layers.push({ canvas: this.staticLayer.canvas, ctx: this.staticLayer.ctx});
                
                this.canvasW = this.cellLayer.canvas.width;
                OFF_X = this.canvasW/2 - TILE_W/2;
                
                //Center all layers in view
				this.cellLayer.ctx.translate(OFF_X, 0);
                this.mouseLayer.ctx.translate(OFF_X, 0);
                this.staticLayer.ctx.translate(OFF_X, 0);
                
                this.cellAliveColour = this.generateColourPallete(53, 179, 32);
                
                //Calculate dimensions of side, width and height of cell (relative to isometric view)
                this.cellDimensions.height = utilities.twoDToIso(1*TILE_W, 1*TILE_W).y - utilities.twoDToIso(0, 0).y;
                this.cellDimensions.width = Math.abs(utilities.twoDToIso(0, 1*TILE_W).x - utilities.twoDToIso(1*TILE_W, 0).x);
                this.cellDimensions.side = {
                    x: this.cellDimensions.width / 2,
                    y: this.cellDimensions.height / 2
                }
                
                this.drawStaticLayer();
                                
			},
            
            drawStaticLayer: function() {
                this.drawGrid();
            },

			drawGrid: function() {

				//Vertical lines
				for(var x = 0; x <= COLS; x++) {
					var start = utilities.twoDToIso(x*TILE_W, 0),
						end = utilities.twoDToIso(x*TILE_W, MAP_H);				
					canvas.layers[2].ctx.moveTo(start.x, start.y);
					canvas.layers[2].ctx.lineTo(end.x, end.y);
				}

				//Horizontal lines
				for(var y = 0; y <= ROWS; y++) {
					var start = utilities.twoDToIso(0, y*TILE_W),
						end = utilities.twoDToIso(MAP_W, y*TILE_W);				
					canvas.layers[2].ctx.moveTo(start.x, start.y);
					canvas.layers[2].ctx.lineTo(end.x, end.y);
				}

				utilities.setStroke(this.gridStroke, 2);

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
                var ctx = this.mouseLayer.ctx;
                
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
                
                utilities.setFill('#333', 0);
                ctx.beginPath();
				ctx.moveTo(top.x, top.y);
				ctx.lineTo(left.x, left.y);
				ctx.lineTo(btm.x, btm.y);
				ctx.lineTo(right.x, right.y);
				ctx.closePath();
				ctx.fill();
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
                utilities.setFill(this.cellAliveColour.dark, 0);
                this.cellLayer.ctx.beginPath();
				this.cellLayer.ctx.moveTo(btmLeft.x, btmLeft.y);
				this.cellLayer.ctx.lineTo(midLeft.x, midLeft.y);
				this.cellLayer.ctx.lineTo(mid.x, mid.y);
				this.cellLayer.ctx.lineTo(btm.x, btm.y);
				this.cellLayer.ctx.closePath();
				this.cellLayer.ctx.fill();
                
                //Draw right face
                utilities.setFill(this.cellAliveColour.light, 0);
                this.cellLayer.ctx.beginPath();
				this.cellLayer.ctx.moveTo(btm.x, btm.y);
				this.cellLayer.ctx.lineTo(mid.x, mid.y);
				this.cellLayer.ctx.lineTo(midRight.x, midRight.y);
				this.cellLayer.ctx.lineTo(btmRight.x, btmRight.y);
				this.cellLayer.ctx.closePath();
				this.cellLayer.ctx.fill();
                
                //Draw top
                utilities.setFill(this.cellAliveColour.base, 0);
                this.cellLayer.ctx.beginPath();
				this.cellLayer.ctx.moveTo(midLeft.x, midLeft.y);
				this.cellLayer.ctx.lineTo(top.x, top.y);
				this.cellLayer.ctx.lineTo(midRight.x, midRight.y);
				this.cellLayer.ctx.lineTo(mid.x, mid.y);
				this.cellLayer.ctx.closePath();
				this.cellLayer.ctx.fill();
                
            },
            
            drawMouseState: function() {
                //As the mouse coordinats are navigating isometric space, they need to first be converted to 2d
                var twoDCoords = utilities.isoTo2d(mouse.mousePos.x, mouse.mousePos.y),
                    adjusted2dCoords = {
                        x: Math.floor(twoDCoords.x/TILE_W),
                        y: Math.floor(twoDCoords.y/TILE_W)
                    };
                
                this.clearLayer(1);
                
                //Only draw tiles that fall within the map
                if(adjusted2dCoords.x < 0 || adjusted2dCoords.x > COLS-1 || adjusted2dCoords.y < 0 || adjusted2dCoords.y > ROWS-1) {
                    return;
                }
                this.drawTile(adjusted2dCoords.x, adjusted2dCoords.y);
            },

			clearLayer: function(layer) {
                canvas.layers[layer].ctx.clearRect(-OFF_X, 0, MAP_W+OFF_X, MAP_H);
			},
            
            generateColourPallete: function(r, g, b) {
                return {
                    base: 'rgb(' + r + ',' + g + ',' + b + ')',
                    dark: 'rgb(' + Math.floor(0.7 * r) + ',' + Math.floor(0.7 * g) + ',' + Math.floor(0.7 * b) + ')',
                    light: 'rgb(' + Math.floor(1.15 * r) + ',' + Math.floor(1.15 * g) + ',' + Math.floor(1.15 * b) + ')'
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
                setCanvasBounds();
                this.bindMouseToCanvas();
                
                window.addEventListener('resize', setCanvasBounds);
                
                function setCanvasBounds() {
                    mouse.canvasBounds = canvas.cellLayer.canvas.getBoundingClientRect();
                }
            },
            
            bindMouseToCanvas: function() {
                canvas.cellLayer.canvas.addEventListener('mousemove', function(evt) {
                    //Takes into account offsets used to center canvas on screen
                    mouse.mousePos.x =  evt.clientX - mouse.canvasBounds.left - OFF_X,
                    mouse.mousePos.y =  evt.clientY - mouse.canvasBounds.top
                });
            }
        };

		//utilities
		var utilities = {
			setStroke: function(colour, layer) {
                canvas.layers[layer].ctx.strokeStyle = colour;
                canvas.layers[layer].ctx.stroke();
			},

			setFill: function(colour, layer) {
                canvas.layers[layer].ctx.fillStyle = colour;
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
			canvas.clearLayer(0);
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