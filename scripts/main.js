
var Game = {
    /* Sole object containing all the assets and constants.
    Function passet to onReady should be the single entry point into the application as 
    it controls the loading of all assets */
    _edge_size: 64,
    _context: null,
    _playing_whites: false,

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

    assetImages: ["./sprites/master-sprite.png"],
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
        this.scene = Object.create(Scene);
        this.scene.initScene(Object.create(Board));
        this.initSprites();
        this.scene.board.initBoard('rgba(0, 0, 0, .8)', 'rgb(255, 255, 255)');
        this.ctx.canvas.addEventListener("click", this.MouseClickHandler.bind(this));
        this.mainloop();
    },

    initSprites: function() {
        this.Sprites["Pieces"] = Object.create(Sprite)
                .initSprite(this.loadedImages["./sprites/master-sprite.png"], // Image object
                            6,                                                // number of columns in the Sprite
                            3,                                                // number of rows in the sprite
                            64,                                               // each pile width
                            83);                                              // each pile height
    },

    // using function declaration for self-reference
    mainloop: function mainloop() {
        window.requestAnimationFrame(mainloop.bind(this));
        this.scene.board.renderBoard(this.ctx);
    },

    clearCanvas: function() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    },

    MouseClickHandler: function(e) {
        let ex = e.offsetX;
        let ey = e.offsetY;
        let b = this.scene.board;
        let es = this.edge_size;
        

        if (ex > b.x && ex < (b.x + es * 8) && ey > b.y && ey < (b.y + es * 8)) {
            // clicked the board - pass the event to it
            b.MouseClickHandler(e);
        } else {
            // clicked something else - TODO
            console.log("Cliecked outside the board");
        }
    },

    run: function() {
        this.onReady(this.initGame);
    }
}

var Scene = {
    initScene: function(board) {
        this.board = board;
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
    this.edge_size = this.edge_size < Math.floor(min_canvas_size / 10) ? 
                        this.edge_size :
                        Math.floor(min_canvas_size / 10) - 2;
    let max_board_size = this.edge_size * 8
    let x = Math.floor(this.ctx.canvas.width / 2) - Math.floor(max_board_size / 2);
    let y = Math.floor(this.ctx.canvas.height / 2) - Math.floor(max_board_size / 2);
    // Board starting position
    this.position = Object.create(Position);
    this.position.initPosition(x, y);

    this.animations = [];
    this.selected_cell = null;

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
            // let address = this.playing_whites ? 
            //               `${String.fromCharCode(c_idx+65)}${8-r_idx}` :
            //               `${String.fromCharCode(72-c_idx)}${r_idx+1}`;

            let address = this.playing_whites ? [c_idx, 7-r_idx] : [7-c_idx, r_idx];
            
            cell.initCell(x + this.edge_size * c_idx, y, current_color, null, address);
            
            // assign the cell to the correct array item
            if (this.playing_whites) {
                this.cells[c_idx][7-r_idx] = cell;
            } else {
                this.cells[7-c_idx][r_idx] = cell;
            }

            current_color = this.nextColour(current_color);
        }, this);
        y += this.edge_size;
    }, this);

    let piece = Object.create(Pawn);
    piece.initPiece(this.cells[0][0], this.Sprites["Pieces"]);

    let knight = Object.create(Knight);
    knight.initPiece(this.cells[1][0], this.Sprites["Pieces"]);

    let bishop = Object.create(Bishop);
    bishop.initPiece(this.cells[2][0], this.Sprites["Pieces"]);

    let rook = Object.create(Rook);
    rook.initPiece(this.cells[3][0], this.Sprites["Pieces"]);

    let queen = Object.create(Queen);
    queen.initPiece(this.cells[4][0], this.Sprites["Pieces"]);

    let king = Object.create(King);
    king.initPiece(this.cells[5][0], this.Sprites["Pieces"]);

    this.initCoords(this.edge_size + "px Bit Potion", "bottom");
};

Board.renderBoard = function() {
    // check if current edge size will fit into the canvas
    this.clearCanvas();

    this.draw_coords();

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
    }, this);

    this.playAnimations();
    this.renderPieces();
};

Board.renderPieces = function() {
    this.cells.forEach(
        row => row.filter(
            cell => cell.piece).forEach(
                cell => cell.piece.render()))
}

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
    // remove animations that are finished
    this.animations = this.animations.filter(function(a) {
        return !a.over;
    });
}

Board.unselect = function() {
    this.selected_cell = null;
}

Board.select_cell = function(cell) {
    this.selected_cell = cell;
    let animation = Object.create(ConditionalAnimation);
    
    let gradient = this.ctx.createLinearGradient(cell.x, cell.y, cell.x + this.edge_size, cell.y + this.edge_size);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.8, "violet");
    gradient.addColorStop(1, "white");

    this.animations.push(animation
            .initCondAnimation(this.ctx,
                               700, 
                               cell, 
                               ConditionalAnimation.selected_pulse.bind(animation, gradient), 
                               function(){return this.selected_cell}.bind(this)));
}

Board.MouseClickHandler = function(e) {
    // identify the cell that was clicked
    let ex = e.offsetX;
    let ey = e.offsetY;
    let b = this;
    let es = this.edge_size;

    let row = this.playing_whites ? 7 - Math.floor((ey - b.y) / es) : Math.floor((ey - b.y) / es);
    let col = this.playing_whites ? Math.floor((ex - b.x) / es) : 7 - Math.floor((ex - b.x) / es);
    
    let cell = b.cells[col][row];
    cell.MouseClickHandler(e, this);
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

Cell.moveTo = function(another, board) {
    let c1 = this.address[0];
    let r1 = this.address[1];
    let c2 = another.address[0];
    let r2 = another.address[1];

    let temp = board.cells[c1][r1].piece;
    board.cells[c1][r1].piece = null;
    temp.update(board.cells[c2][r2]);
    board.unselect();
}

Cell.MouseClickHandler = function(e, board) {
    if (this.piece || board.selected_cell) {
        if (!board.selected_cell) {
            board.select_cell(this);
            return;
        } else {
            // we have a selected cell
            // if it's not the same cell, move the piece
            // if move is validated, do move
            if (board.selected_cell !== this) {
                board.selected_cell.moveTo(this, board);
            }
        }
    }
    board.unselect();
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
    parent.piece = this;
    this.width = this.parent.edge_size;
    this.height = (this.parent.edge_size * this.sprite.frame_height) / this.sprite.frame_width;
    this.position = Object.create(Position);
    this.update_position();
}

Piece.update = function(newParrent) {
    this.parent = newParrent;
    this.parent.piece = this;
    this.update_position();
}

Piece.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y - (this.parent.edge_size * 0.4));
}

var Pawn = Object.create(Piece);

Pawn.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y + (this.parent.edge_size * 0.05));
}

Pawn.render = function() {
    this.sprite.drawFrame(this.ctx, 0, this.x, this.y, this.width, this.height);
}

var Rook = Object.create(Piece);

Rook.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y - (this.parent.edge_size * 0.2));
}

Rook.render = function() {
    this.sprite.drawFrame(this.ctx, 3, this.x, this.y, this.width, this.height);
}

var Knight = Object.create(Piece);

Knight.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y - (this.parent.edge_size * 0.25));
}

Knight.render = function() {
    this.sprite.drawFrame(this.ctx, 1, this.x, this.y, this.width, this.height);
}

var Bishop = Object.create(Piece);

Bishop.render = function() {
    this.sprite.drawFrame(this.ctx, 2, this.x, this.y, this.width, this.height);
}

var Queen = Object.create(Piece);

Queen.render = function() {
    this.sprite.drawFrame(this.ctx, 4, this.x, this.y, this.width, this.height);
}

var King = Object.create(Piece);

King.render = function() {
    this.sprite.drawFrame(this.ctx, 5, this.x, this.y, this.width, this.height);
}

var Animation = {
    initAnimation: function(ctx, length, element, action, repeat) {
        this.ctx = ctx;
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

        return this;
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

    drawSprite: function(x, y, w, h) {
        this.current_frame = Math.ceil(this.progress / this.frame_length);
        this.element.drawFrame(this.ctx, this.current_frame, x, y, w, h);
    }
};

/* Conditional animation will play until the condition specified is true */

var ConditionalAnimation = Object.create(Animation);

ConditionalAnimation.initCondAnimation = function(ctx, length, element, action, condition) {
    this.initAnimation(ctx, length, element, action, 0);
    this.condition = condition;
    
    return this;
}

ConditionalAnimation.execute = function() {
    if (this.condition()) {
        this.action();
    } else {
        this.over = true;
    }
}

ConditionalAnimation.selected_pulse = function(colour) {
    // pulse...
    let timestamp = new Date();
    if (this.start_time < 0) {
        this.start_time = timestamp;
    }

    this.dirrection = this.dirrection || 1;
    this.progress = timestamp - this.start_time;

    if (this.progress > this.length) {
        this.progress = 0;
        this.start_time = timestamp;
        this.dirrection *= -1;
    }
    
    if (this.dirrection > 0) {
        this.alpha = 0.1 + (this.progress / this.length) * 0.9;
    } else {
        this.alpha = 1 - (this.progress / this.length) * 0.9;
    }

    this.ctx.save();
    this.ctx.fillStyle = colour;
    this.ctx.globalAlpha = this.alpha;
    this.ctx.fillRect(this.element.x, this.element.y, this.element.edge_size, this.element.edge_size);
    this.ctx.restore();
}

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
                      Math.floor(frame_idx / this.rows) * this.frame_height,
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
