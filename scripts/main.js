
var Game = {
    /* Sole object containing all the assets and constants.
    Function passet to onReady should be the single entry point into the application as 
    it controls the loading of all assets */
    _edge_size: 64,
    _context: null,
    _playing_whites: true,
    _dark_colour: 'rgba(0, 0, 0, .8)',
    _light_colour: 'rgb(255, 255, 255)',
    _board: undefined,
    _highlight_color: 'rgb(0, 238, 255)',
    _hit_highlight_color: 'rgb(252, 63, 63)',


    get highlight_color() {
        return Game._highlight_color;
    },
    set highlight_color(val) {
        Game._highlight_color = val
    },
    get hit_highlight_color() {
        return Game._hit_highlight_color;
    },
    set hit_highlight_color(val) {
        Game._hit_highlight_color = val
    },
    get board() {
        return Game._board;
    },
    set board(val) {
        Game._board = val
    },
    get dark_colour() {
        return Game._dark_colour;
    },
    set dark_colour(val) {
        Game._dark_colour = val
    },
    get light_colour() {
        return Game._light_colour;
    },
    set light_colour(val) {
        Game._light_colour = val
    },
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
        this.board = this.scene.board;
        this.initSprites();
        this.scene.board.initBoard();
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
            console.log("Clicked outside the board");
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
    },
})

/* initialize the chessboard with the edge size and an empty 2d
array 8x8 */
Board.initBoard = function() {

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
    this.selected_piece = null;

    // creates a 2d array (8 rows by 8 columns)

    this.cells = [Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8}),
                  Array.apply(null, {length: 8})]

    this.cells.map(function(row, r_idx) {
        // if row is even (incl. 0) start with dark colour
        var current_color = r_idx % 2 === 0 ? this.light_colour : this.dark_colour;
        row.map(function(_, c_idx) {
            let cell = Object.create(Cell);

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
    piece.initPawn(this.cells[0][0], this.Sprites["Pieces"], this.light_colour);

    let knight = Object.create(Knight);
    knight.initPiece(this.cells[1][1], this.Sprites["Pieces"], this.dark_colour);

    let bishop = Object.create(Bishop);
    bishop.initPiece(this.cells[2][0], this.Sprites["Pieces"], this.light_colour);

    let rook = Object.create(Rook);
    rook.initRook(this.cells[3][0], this.Sprites["Pieces"], this.light_colour);

    let queen = Object.create(Queen);
    queen.initPiece(this.cells[4][0], this.Sprites["Pieces"], this.light_colour);

    let king = Object.create(King);
    king.initPiece(this.cells[5][0], this.Sprites["Pieces"], this.light_colour);

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
    if (this.selected_piece) {
        this.selected_piece.valid_moves = {};
        this.selected_piece = null;
    }
}

Board.select_cell = function(cell) {
    this.selected_piece = cell.piece;
    let animation = Object.create(ConditionalAnimation);

    this.animations.push(animation
            .initCondAnimation(this.ctx,
                               1000, 
                               cell, 
                               ConditionalAnimation.selected_pulse.bind(animation, this.highlight_color), 
                               function(){return this.selected_piece}.bind(this)));
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
    cell.MouseClickHandler(e);
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

Cell.MouseClickHandler = function(e) {

    if (this.piece) {
        this.piece.MouseClickHandler(e);
    } else if (this.board.selected_piece) {
        // we clicked an empty cell and we have a selected piece
        // check if the selected piece can be moved here
        if (this.board.selected_piece.valid_moves[`${this.address[0]}${this.address[1]}`]) {
            this.board.selected_piece.moveTo(this);
        }
        this.board.unselect();
    }
}

/* Coordinate implementation */

var Position = {};

Position.initPosition = function(x, y) {
    this.x = x;
    this.y = y;
}

var Piece = Object.create(Cell);

Piece.initPiece = function(parent, sprite, colour) {
    this.parent = parent;
    this.sprite = sprite;
    this.piece_colour = colour;
    this.valid_moves = {};
    this.move_dirrections =  [[0, 0]];
    this.hit_dirrections =  [[0, 0]];
    this.max_move_distance = 1;
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


Piece.MouseClickHandler = function(e) {
    // a cell was clicked that had contains a piece
    if (!this.board.selected_piece) {
        // there is no cell selected, yet
        // select current cell
        this.board.select_cell(this.parent);
        //also we will add the valid moves to piece.valid_moves
        this.add_valid_moves();
        this.highlight_valid_moves();
    } else {
        // we have a selected cell
        // check if the piece can has a different color
        if (this.piece_colour !== this.board.selected_piece.piece_colour) {
            // check if this move is valid
            if (this.board.selected_piece.valid_moves[`${this.parent.address[0]}${this.parent.address[1]}`]) {
                this.board.selected_piece.moveTo(this.parent);
            }
        }
        this.board.unselect();
    }
}

// TODO: optimize
Piece.add_valid_moves = function() {
    let moves = this.move_dirrections.slice();
    let hits = this.hit_dirrections.slice();
    let test = {};
    for (let mul = 1; mul <= this.max_move_distance; mul++) {
        moves.forEach(function(dirrection, idx) {
            // debugger;
            let dir_col = this.parent.address[0] + mul * dirrection[0];
            let dir_row = this.parent.address[1] + mul * dirrection[1];

            test[`${mul}${mul}`] = test[`${mul}${mul}`] + 1 || 1;

            if (this.isValidMove(dir_col, dir_row)) {
                this.valid_moves[`${dir_col}${dir_row}`] = this.board.cells[dir_col][dir_row];
            } else {
                // remove the falsy move from the move array
                moves[idx] = null;
            };
        }, this)
        //remove false moves
        moves = moves.filter(move => move);

        hits.forEach(function(dirrection, idx) {
            let dir_col = this.parent.address[0] + mul * dirrection[0];
            let dir_row = this.parent.address[1] + mul * dirrection[1];
            
            if (this.isValidHit(dir_col, dir_row)) {
                this.valid_moves[`${dir_col}${dir_row}`] = this.board.cells[dir_col][dir_row];
                hits[idx] = null;
            }
        }, this);
        // remove falsy hits
        hits = hits.filter(hit => hit);
    }
    console.table(test, Object.keys(test).length);
}


Piece.isValidMove = function(target_col, target_row) {
    if (target_col >= 0 && target_row >= 0 && target_col < 8 && target_row < 8) {
        let cell = this.board.cells[target_col][target_row]
        // if there is no piece in this cell it's a valid move
        return !cell.piece;
    } else {
        // move would be outside the board - false
        return false;
    }
}


Piece.isValidHit = function(target_col, target_row) {
    if (target_col >= 0 && target_row >= 0 && target_col < 8 && target_row < 8) {
        let cell = this.board.cells[target_col][target_row]
        // if there is a piece in this cell
        return !!cell.piece && cell.piece.piece_colour !== this.piece_colour;
    } else {
        // move would be outside the board - false
        return false;
    } 
}

Piece.highlight_valid_moves = function() {
    Object.keys(this.valid_moves).forEach(function(key) {
        let cell = this.valid_moves[key];
        let animation = Object.create(ConditionalAnimation);
        this.board.animations.push(animation
            .initCondAnimation(this.ctx,
                               1000, 
                               cell, 
                               ConditionalAnimation.selected_pulse.bind(animation, cell.piece ? this.hit_highlight_color : this.highlight_color), 
                               function(){return Object.keys(this.valid_moves).length > 0}.bind(this)));
    }, this)
}

Piece.moveTo = function(cell) {
    let c1 = this.parent.address[0];
    let r1 = this.parent.address[1];
    let c2 = cell.address[0];
    let r2 = cell.address[1];

    let temp = this;
    this.board.cells[c1][r1].piece = null;
    temp.update(this.board.cells[c2][r2]);
    this.board.unselect();
}


var Pawn = Object.create(Piece);

Pawn.initPawn = function(parent, sprite, colour) {
    this.initPiece(parent, sprite, colour);

    this.max_move_distance = 2;

    if (this.playing_whites && (this.piece_colour === this.light_colour) ||
        !this.playing_whites && (this.piece_colour === this.dark_colour)) {
        this.move_dirrections =  [[0, 1]];
        this.hit_dirrections = [[-1, 1], [1, 1]];
    } else {
        this.move_dirrections = [[0, -1]];
        this.hit_dirrections = [[-1, -1], [1, -1]];
    }
}

Pawn.moveTo = function(cell) {
    if (this.max_move_distance == 2) {
        this.max_move_distance = 1;
    }
    Piece.moveTo.call(this, cell);
}

Pawn.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y + (this.parent.edge_size * 0.05));
}

Pawn.render = function() {
    this.sprite.drawFrame(this.ctx, this.piece_colour === this.light_colour ? 0 : 6, this.x, this.y, this.width, this.height);
}

var Rook = Object.create(Piece);

Rook.initRook = function(parent, sprite, colour) {
    this.initPiece(parent, sprite, colour);

    this.max_move_distance = 8;
    this.move_dirrections =  [[0, 1], [0, -1], [-1, 0], [1, 0]];
    this.hit_dirrections = this.move_dirrections;
}

Rook.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y - (this.parent.edge_size * 0.2));
}

Rook.render = function() {
    this.sprite.drawFrame(this.ctx, this.piece_colour === this.light_colour ? 3 : 9, this.x, this.y, this.width, this.height);
}

var Knight = Object.create(Piece);

Knight.update_position = function() {
    this.position.initPosition(this.parent.x, this.parent.y - (this.parent.edge_size * 0.25));
}

Knight.render = function() {
    this.sprite.drawFrame(this.ctx, this.piece_colour === this.light_colour ? 1 : 7, this.x, this.y, this.width, this.height);
}

var Bishop = Object.create(Piece);

Bishop.render = function() {
    this.sprite.drawFrame(this.ctx, this.piece_colour === this.light_colour ? 2 : 8, this.x, this.y, this.width, this.height);
}

var Queen = Object.create(Piece);

Queen.render = function() {
    this.sprite.drawFrame(this.ctx, this.piece_colour === this.light_colour ? 4 : 10, this.x, this.y, this.width, this.height);
}

var King = Object.create(Piece);

King.render = function() {
    this.sprite.drawFrame(this.ctx, this.piece_colour === this.light_colour ? 5 : 11, this.x, this.y, this.width, this.height);
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
        this.alpha = 0.1 + (this.progress / this.length) * 0.3;
    } else {
        this.alpha = 0.4 - (this.progress / this.length) * 0.3;
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
