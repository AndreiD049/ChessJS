
var Game = {
    /* Sole object containing all the assets and constants.
    Function passet to onReady should be the single entry point into the application as 
    it controls the loading of all assets */
    _edge_size: 64,
    _context: null,
    _playing_whites: true,

    get edge_size() {
        return Game._edge_size;
    },
    set edge_size(val) {
        Game._edge_size = val
    },
    get ctx() {
        return Game._context;
    },
    set ctx(val) {
        Game._context = val;
    },
    get playing_whites() {
        return Game._playing_whites;
    },
    set playing_whites(val) {
        Game._playing_whites = val
    },

    assetImages: ["./sprites/master-sprite.png", 
                  "./sprites/explosion.png", 
                  "./sprites/brightfire.png"],
    loadedImages: {},
    Sprites: {},

    onReady: function(f) {
        /* Will create an array of promises that, each promise loads the immage from assetImages
        After all assets are loaded, function @f is invoked with arguments following it */
        let args = Array.prototype.slice.call(arguments, 1);
        let promiseArray = this.assetImages.map(function(img_url) {
            
            let promise = new Promise(function(resolve, reject) {
                let img = new Image();
                img.src = img_url;
                img.addEventListener("load", function(){
                    this.loadedImages[img_url] = img;
                    resolve();
                }.bind(this), false);
            }.bind(this));

            return promise;

        }, this);

        Promise.all(promiseArray).then(function() {
            f.apply(this, args);
        }.bind(this));
    },

    initGame: function() {
        /* This function should run only after all assets were loaded. Called from onReady. */
        let canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");
        this.board = Object.create(Board);
        this.initSprites();
        this.board.initBoard('rgba(0, 0, 0, .5)', 'rgb(250, 255, 148)');
        this.mainloop();
    },

    initSprites: function() {
        this.Sprites["Pieces"] = Object.create(Sprite)
                .initSprite(this.loadedImages["./sprites/master-sprite.png"], // Image object
                            6,                                                // number of columns in the Sprite
                            3,                                                // number of rows in the sprite
                            64,                                               // each pile width
                            83);                                              // each pile height
        
        this.Sprites["Explosion"] = Object.create(Sprite)
                .initSprite(this.loadedImages["./sprites/explosion.png"], 
                            6, 
                            6, 
                            100, 
                            96);
        
        this.Sprites["Fire"] = Object.create(Sprite)
                .initSprite(this.loadedImages["./sprites/brightfire.png"], 
                            8, 
                            8, 
                            100, 
                            100);
    },

    // using function declaration for self-reference
    mainloop: function mainloop() {
        window.requestAnimationFrame(mainloop.bind(this));
        this.board.renderBoard(this.ctx);
    },

    clearCanvas: function() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    },

    run: function() {
        this.onReady(this.initGame);
    }
}

var Board =  Object.create(Game);

/* Define getter-setter for x & y position */

Object.defineProperties(Board, {
    x: {
        get: function() {
            return this.position.x;
        },

        set: function(val) {
            this.position.x = val;
        }
    },

    y: {
        get: function() {
            return this.position.y;
        },

        set: function(val) {
            this.position.y = val;
        }
    }
})

/* initialize the chessboard with the edge size and an empty 2d
array 8x8 */
Board.initBoard = function(dark_colour, light_colour) {

    let min_canvas_size = Math.min(this.ctx.canvas.width, this.ctx.canvas.height)
    // Check if the set edge_size will fit current canvas dimensions
    // if not, return the max possible size
    this.edge_size = this.edge_size < Math.floor(min_canvas_size / 8) ? 
                        this.edge_size :
                        Math.floor(min_canvas_size / 8) - 2;
    let max_board_size = this.edge_size * 8
    let x = Math.floor(this.ctx.canvas.width / 2) - Math.floor(max_board_size / 2);
    let y = Math.floor(this.ctx.canvas.height / 2) - Math.floor(max_board_size / 2);
    // Board starting position
    this.position = Object.create(Position);
    this.position.initPosition(x, y);

    this.animations = [];

    // creates a 2d array (8 rows by 8 columns)
    this.cells = Array(8).
                    fill(0).
                    reduce(
                        (acc, _) => {
                            acc.push(Array(8).fill(null));
                            return acc}, 
                        []);
    
    this.dark_colour = dark_colour || "#000000";
    this.light_colour = light_colour || "#ffffff";

    this.cells.map(function(row, r_idx) {
        // if row is even (incl. 0) start with dark colour
        var current_color = r_idx % 2 === 0 ? this.light_colour : this.dark_colour;
        row.map(function(_, c_idx) {
            let cell = Object.create(Cell);
            let address = this.playing_whites ? 
                          `${String.fromCharCode(c_idx+65)}${8-r_idx}` :
                          `${String.fromCharCode(72-c_idx)}${r_idx+1}`;
            let piece = Object.create(Pawn);
            cell.initCell(x + this.edge_size * c_idx, y, current_color, piece, address);
            piece.initPawn(cell, this.Sprites["Pieces"]);
            this.cells[r_idx][c_idx] = cell;
            current_color = this.nextColour(current_color);
        }, this);
        y += this.edge_size;
    }, this);

    this.initCoords("64px Bit Potion", "bottom");

    this.ctx.canvas.addEventListener("click", this.clickExplosion.bind(this));
};

Board.renderBoard = function() {
    // check if current edge size will fit into the canvas
    this.clearCanvas();

    this.cells.map(function(row) {
        row.map(function(cell, c_idx) {
            this.ctx.fillStyle = cell.colour;
            
            this.ctx.strokeRect(
                cell.x,
                cell.y,
                this.edge_size,
                this.edge_size
            );

            this.ctx.fillRect(
                cell.x, 
                cell.y, 
                this.edge_size, 
                this.edge_size
            );
            
        }, this);
        this.cells[7][7].piece.render();
    }, this);
    this.draw_coords();
    this.playAnimations();
};

Board.nextColour = function(colour) {
    return (colour == this.dark_colour) ? this.light_colour : this.dark_colour;
};

Board.initCoords = function(font, baseline) {
    let es = this.edge_size;
    let hlf = this.edge_size / 2;
    this.coords = [];
    this.coords_font = font;
    this.coords_baseline = baseline;

    this.ctx.save();
    this.ctx.font = font;
    this.ctx.textBaseline = baseline;
    let txt = this.ctx.measureText("A");
    console.log(txt.width);
    this.ctx.restore();

    for (let i = 0; i < 8; i++) {
        let content = this.playing_whites ? String.fromCharCode(65+i) : String.fromCharCode(72-i);
        let coordTop = Object.create(Coord).initCoord(this.x + hlf + (txt.width / 2) + es * i, this.y - es, content, 180);
        this.coords.push(coordTop);
        let coordBottom = Object.create(Coord).initCoord(this.x + es * i + hlf - txt.width / 2, this.y + es * 9, content, 0);
        this.coords.push(coordBottom);

        content = this.playing_whites ? 8-i : i+1;
        let coordLeft = Object.create(Coord).initCoord(this.x - hlf - txt.width / 2, this.y + es + es * i, content, 0);
        this.coords.push(coordLeft);
        let coordRight = Object.create(Coord).initCoord(this.x + hlf + txt.width / 2 + es * 8, this.y + es * i, content, 180);
        this.coords.push(coordRight);
    }
}

Board.draw_coords = function() {
    this.ctx.save();
    this.ctx.fillStyle = this.dark_colour;
    this.ctx.font = this.coords_font;
    // this.ctx.textAlign = "center";
    this.ctx.textBaseline = this.coords_baseline;

    this.coords.forEach(function(coord){
        coord.render();
    })
    this.ctx.restore();
}

Board.playAnimations = function() {
    this.animations.forEach(function(a, idx) {
        a.execute();
    });
    this.animations = this.animations.filter(function(a) {
        return !a.over;
    });
}

Board.clickExplosion = function(e) {
    let anim = Object.create(Animation);
    anim.initAnimation(this.ctx, 
                       e.offsetX-50, 
                       e.offsetY-50, 
                       100, 100, 
                       800, 
                       this.Sprites["Explosion"],
                       Animation.drawSprite);

    this.animations.push(anim);
}


/* Cell represents each individual cell on the board
specifying it's position, colour, address & the figure object if any.
*/
var Cell = Object.create(Board);

Cell.initCell = function(x, y, colour, piece, address) {
    this.position = Object.create(Position);
    this.position.initPosition(x, y);
    this.colour = colour;
    this.piece = piece;
    this.address = address;
}

/* Coordinate implementation */

var Position = {};

Position.initPosition = function(x, y) {
    this.x = x;
    this.y = y;
}

var Piece = Object.create(Cell);

Piece.initPiece = function(parent, sprite) {
    this.parent = parent;
    this.sprite = sprite;
}

var Pawn = Object.create(Piece);

Pawn.initPawn = function(parent, sprite) {
    
    this.initPiece(parent, sprite);
    this.width = this.parent.edge_size;
    this.height = (this.parent.edge_size * this.sprite.frame_height) / this.sprite.frame_width;
    this.position = Object.create(Position);

    /* y position is aligned with the top of the cell + 10% down.  */
    this.position.initPosition(this.parent.x, this.parent.y + (this.parent.edge_size * 0.1));
}

Pawn.render = function() {
    this.sprite.drawFrame(this.ctx, 0, this.x, this.y, this.width, this.height);
}


var Animation = {
    initAnimation: function(ctx, x, y, w, h, length, element, action, repeat) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.length = length;
        this.progress = 0;
        this.start_time = -1;
        this.element = element;
        // function will have the ctx of the anmation object for property access
        this.action = action;
        this.over = false;
        this.current_frame = 0;
        this.total_frames = this.element.rows * this.element.columns || 0;
        this.frame_length = this.total_frames === 0 ? 0 : this.length / this.total_frames;
        this.repeat = repeat || 0;
    },

    execute: function() {

        let timestamp = new Date();
        if (this.start_time < 0) {
            this.start_time = timestamp;
        }
        this.progress = timestamp - this.start_time;
        if (this.progress < this.length) {
            this.action();
        } else {
            if (this.repeat > 1) {
                this.repeat--;
                this.start_time = -1;
                this.progress = 0;
            } else {
                this.over = true;
            }
        }
    },

    drawSprite: function() {
        this.current_frame = Math.ceil(this.progress / this.frame_length);
        this.element.drawFrame(this.ctx, this.current_frame, this.x, this.y, this.width, this.height);
    }
};

var Sprite = {
    initSprite: function(img, rows, columns, frame_width, frame_height) {
        this.img = img;
        this.rows = rows;
        this.columns = columns;
        this.frame_width = frame_width;
        this.frame_height = frame_height;

        return this;
    },

    drawFrame: function(ctx, frame_idx, x, y, w, h) {
        ctx.drawImage(this.img, 
                      frame_idx % this.rows * this.frame_width,
                      Math.floor(frame_idx / this.columns) * this.frame_height,
                      this.frame_width,
                      this.frame_height,
                      x,
                      y,
                      w,
                      h);
    }
};

var Coord = Object.create(Board);

Coord.initCoord = function(x, y, text, rotate) {
        this.position = Object.create(Position);
        this.position.initPosition(x, y);
        this.rotate = rotate;
        this.text = text;

        return this;
    },

Coord.render = function() {
    // debugger;
    this.ctx.save();   
    if (this.rotate) {
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(Math.PI / 180 * this.rotate)
        this.ctx.fillText(this.text, 0, 0);
    } else {
        this.ctx.fillText(this.text, this.x, this.y);
    }
    this.ctx.restore();
}

var main = Object.create(Game);
main.run();
