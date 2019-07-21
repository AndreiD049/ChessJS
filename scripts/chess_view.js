"use strict";

var GameView = {};

Object.defineProperties(GameView, {
    _edge_size: {
        value: 50,
        writable: true
    },

    ctx: {
        value: null,
        writable: true
    },

    bg_ctx: {
        value: null,
        writable: true
    },

    playing_whites: {
        value: false,
        writable: true
    },

    dark_side: {
        value: 1
    },

    light_side: {
        value: 0
    },

    change_side: {
        value: function(side) {
            return side ^ 1;
        }
    },

    colors: {
        value: {},
        writable: true
    },

    controller: {
        value: null,
        writable: true
    },

    edge_size: {
        get: function() {
            return GameView._edge_size;
        },

        set: function(val) {
            GameView._edge_size = val;
        }
    },

    asset_images: {
        value: ["./sprites/master-sprite.png"],
        writable: true,
        configurable: true
    },

    loaded_images: {
        value: [],
        writable: true,
        configurable: true
    },

    sprites: {
        value: {},
        writable: true,
        configurable: true
    },

    clear_canvas: {
        value: function() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
    },

    x: {
        get: function() {
            return this.position._x;
        }, 

        set: function(val) {
            this.position._x = val;
        }
    },

    y: {
        get: function() {
            return this.position._y;
        },

        set: function(val) {
            this.position._y = val;
        }
    },

    init_game: {
        value: function(controller, colors) {
            let canvas = document.getElementById("canvas");
            let canvas_bg = document.getElementById("canvas-bg");
            this.ctx = canvas.getContext("2d");
            this.bg_ctx = canvas_bg.getContext("2d");
            this.controller = controller;
            this.colors = colors;
            this.board = Object.create(BoardView);

            this.ctx.canvas.addEventListener("click", this.MouseClickHandler.bind(this));

            this.on_ready(this.init_sprites.bind(this), this.board.init_board.bind(this.board), this.mainloop.bind(this));
        }
    },

    // using function declaration for self-reference
    mainloop: {
        value: function mainloop() {
            window.requestAnimationFrame(mainloop.bind(this));
            this.render();
        },
    },

    on_ready: {
        value: function() {
            /* Will create an array of promises that, each promise loads the immage from assetImages
            After all assets are loaded, function @f is invoked with arguments following it */
            let callbacks = Array.prototype.slice.call(arguments);
            let promiseArray = this.asset_images.map(function(img_url) {
                
                let promise = new Promise(function(resolve, reject) {
                    let img = new Image();
                    img.src = img_url;
                    img.addEventListener("load", function(){
                        this.loaded_images[img_url] = img;
                        resolve();
                    }.bind(this), false);
                }.bind(this));
    
                return promise;
    
            }, this);
    
            Promise.all(promiseArray).then(function() {
                callbacks.forEach(callback => callback());
            }.bind(this));
        }
    },

    render: {
        value: function() {
            this.clear_canvas();
            this.board.render();
        }
    },

    init_sprites: {
        value: function() {
            this.sprites["Pieces"] = Object.create(Sprite)
                .init_sprite(this.loaded_images["./sprites/master-sprite.png"], // Image object
                        6,                                                      // number of columns in the Sprite
                        3,                                                      // number of rows in the sprite
                        64,                                                     // each pile width
                        88);  
        }
    },

    MouseClickHandler: {
        value: function(e) {
            let ex = e.offsetX;
            let ey = e.offsetY;
            let b = this.board;
            let es = this.edge_size;
            
    
            if (ex > b.x && ex < (b.x + es * 8) && ey > b.y && ey < (b.y + es * 8)) {
                // clicked the board - pass the event to it
                b.MouseClickHandler(e);
            } else {
                // clicked something else - TODO
                console.log("Clicked outside the board");
            }
        }
    }
});


var BoardView = Object.create(GameView);

Object.defineProperties(BoardView, {
    init_board: {
        value: function() {
            // get the smallest canvas edge
            let min_canvas_edge = Math.min(this.ctx.canvas.width, this.ctx.canvas.height);
            // if the min canvas edge is less than the current edge_size * 10 
            // we should adjust the edge_size
            if (this.edge_size * 10 > min_canvas_edge) {
                this.edge_size = Math.floor(min_canvas_edge * 0.8 / 10);
            }

            let board_half_size = Math.floor(this.edge_size * 8 / 2);
            let x = Math.floor(this.ctx.canvas.width / 2) - board_half_size;
            let y = Math.floor(this.ctx.canvas.height / 2) - board_half_size;

            this.position = Object.create(Position).init_position(x, y);

            this.cells = [Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8})];

            this.selected_piece = null;
            this.coords = []
            
            this.init_coords(this.edge_size + "px Bit Potion", "bottom");
            
            // init the cells
            this.controller.get_cells().forEach(function(col, c_idx) {
                col.forEach(function(cell, r_idx) {
                    let cell_model = this.controller.get_cell(c_idx, r_idx);
                    this.cells[c_idx][r_idx] = Object.create(CellView).init_cell(this.x + c_idx * this.edge_size,
                                                                                 this.y + this.edge_size * 7 - r_idx * this.edge_size,
                                                                                 cell_model.side,
                                                                                 this.controller.get_piece(c_idx, r_idx));
                }, this);
            }, this);

            if (!this.playing_whites) {
                // rotate the board to the player
                let hlf = Math.floor(this.edge_size * 8 / 2);
                this.bg_ctx.translate(this.x + hlf, this.y + hlf);
                this.bg_ctx.rotate(Math.PI / 180 * 180);
                this.bg_ctx.translate(-(this.x + hlf), -(this.y + hlf));

                this.ctx.translate(this.x + hlf, this.y + hlf);
                this.ctx.rotate(Math.PI / 180 * 180);
                this.ctx.translate(-(this.x + hlf), -(this.y + hlf));
            } else {
                // set the new pieces to be drawn over the previously drawn ones
                this.ctx.globalCompositeOperation = "destination-over";
            }

            this.render_board_bg();
            return this;
        }
    },

    render_board_bg: {
        value: function() {
            this.clear_canvas();
            this.render_coords();

            // render cells
            // the cells need to be rendered from top to bottom
            // this will vary depending on the playing side

            this.cells.forEach(function(coll, c_idx) {
                coll.forEach(function(cell, r_idx) {
                    cell.render_cell_bg();
                }, this);
            }, this);
        }
    },

    render: {
        value: function() {
            this.cells.forEach(function(coll) {
                coll.forEach(function(cell) {
                    cell.render();
                }, this);
            }, this);

            if (this.selected_piece) {
                this.selected_piece.cell.highlight();
            }
        }
    },

    init_coords: {
        value: function(font, baseline) {
            let es = this.edge_size;
            let hlf = this.edge_size / 2;
            this.coords_font = font;
            this.coords_baseline = baseline;
        
            this.ctx.save();
            this.ctx.font = font;
            this.ctx.textBaseline = baseline;
            let txt = this.ctx.measureText("A");
            this.ctx.restore();

            for (let i = 0; i < 8; i++) {
                let content = String.fromCharCode(65+i)
                let coordTop = Object.create(Coord).init_coord(this.x + hlf + (txt.width / 2) + es * i, this.y - es, content, 180);
                this.coords.push(coordTop);
                let coordBottom = Object.create(Coord).init_coord(this.x + es * i + hlf - txt.width / 2, this.y + es * 9, content, 0);
                this.coords.push(coordBottom);
        
                content = 8-i
                let coordLeft = Object.create(Coord).init_coord(this.x - hlf - txt.width / 2, this.y + es + es * i, content, 0);
                this.coords.push(coordLeft);
                let coordRight = Object.create(Coord).init_coord(this.x + hlf + txt.width / 2 + es * 8, this.y + es * i, content, 180);
                this.coords.push(coordRight);
            }
        }
    },

    render_coords: {
        value: function() {
            this.bg_ctx.save();
            this.bg_ctx.fillStyle = this.colors[this.dark_side];
            this.bg_ctx.font = this.coords_font;
            // this.ctx.textAlign = "center";
            this.bg_ctx.textBaseline = this.coords_baseline;
        
            this.coords.forEach(function(coord){
                coord.render();
            })
            this.bg_ctx.restore();
        }
    },

    MouseClickHandler: {
        value: function(e) {
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
    }
});


var CellView = Object.create(GameView);

Object.defineProperties(CellView, {
    init_cell: {
        value: function(x, y, color, piece) {
            this.position = Object.create(Position).init_position(x, y);
            this.color = color;
            this.piece = this.set_piece(piece);
            this.width = this.edge_size;
            this.height = this.edge_size;
            this.rotation = 0;

            return this;
        }
    },

    render_cell_bg: {
        // renders the background, only ones

        value: function() {
            this.bg_ctx.fillStyle = this.colors[this.color];

            this.bg_ctx.strokeRect(
                this.x,
                this.y,
                this.edge_size,
                this.edge_size
            );

            this.bg_ctx.fillRect(
                this.x, 
                this.y, 
                this.edge_size, 
                this.edge_size
            );
            
            // if (this.piece) this.piece.render();
        }
    },

    render: {
        value: function() {
            // check if we have a selected piece
            // if yes, highlight it

            // render the pieces
            if (this.piece) {
                this.piece.render();
            }
        }
    },

    set_piece: {
        value: function(piece) {
            switch (String(piece)) {
                case "pawn":
                    return Object.create(PawnView).init_piece(this, this.sprites["Pieces"], piece.side);
                    break;

                case "rook":
                    return Object.create(RookView).init_piece(this, this.sprites["Pieces"], piece.side);
                    break;

                case "knight":
                    return Object.create(KnightView).init_piece(this, this.sprites["Pieces"], piece.side);
                    break;

                case "bishop":
                    return Object.create(BishopView).init_piece(this, this.sprites["Pieces"], piece.side);
                    break;

                case "queen":
                    return Object.create(QueenView).init_piece(this, this.sprites["Pieces"], piece.side);
                    break;

                case "king":
                    return Object.create(KingView).init_piece(this, this.sprites["Pieces"], piece.side);
                    break;

                default:
                    break;
            }
        }
    },

    highlight: {
        value: function() {
            this.ctx.save();
            this.ctx.fillStyle = this.colors["highlight"];
            this.ctx.globalCompositeOperation = "destination-over";

            this.ctx.fillRect(
                this.x, 
                this.y, 
                this.edge_size, 
                this.edge_size
            );
            this.ctx.restore();
        }
    },

    MouseClickHandler: {
        value: function(e) {
            if (this.piece) {
                this.piece.MouseClickHandler(e);
            } else if (this.board.selected_piece) {
                // we clicked an empty cell and we have a selected piece
                // check if the selected piece can be moved here

                // if (this.board.selected_piece.valid_moves[`${this.address[0]}${this.address[1]}`]) {
                //     this.board.selected_piece.moveTo(this);
                // }
                this.board.selected_piece = null;
            }
        }
    }
});


var Coord = Object.create(GameView);

Object.defineProperties(Coord, {
    init_coord: {
        value: function(x, y, text, rotate) {
            this.position = Object.create(Position).init_position(x, y);
            this.text = text;
            this.rotate = rotate;

            return this;
        }
    },

    render: {
        value: function() {
            this.bg_ctx.save();   
            if (this.rotate) {
                this.bg_ctx.translate(this.x, this.y);
                this.bg_ctx.rotate(Math.PI / 180 * this.rotate)
                this.bg_ctx.fillText(this.text, 0, 0);
            } else {
                this.bg_ctx.fillText(this.text, this.x, this.y);
            }
            this.bg_ctx.restore();
        }
    }
});


var PieceView = Object.create(CellView);

Object.defineProperties(PieceView, {
    init_piece: {
        value: function(cell, sprite, side) {
            this.cell = cell;
            this.sprite = sprite;
            this.side = side;
            this.cell.piece = this;
            this.width = this.edge_size;
            this.height = (this.edge_size * this.sprite.frame_height) / this.sprite.frame_width;
            this.rotation = this.playing_whites ? 0 : 180;
            this.position = Object.create(Position);
            this.update_position();

            return this;
        }
    },

    handle_rotation: {
        value: function() {
            if (!this.playing_whites) {
                let hlf = Math.floor(this.edge_size / 2);
                this.ctx.save();
                this.ctx.translate(this.cell.x + hlf, this.cell.y + hlf);
                this.ctx.rotate(Math.PI / 180 * this.rotation);
                this.ctx.translate(-(this.cell.x + hlf), -(this.cell.y + hlf));
            }
        }
    },

    restore: {
        value: function() {
            if (!this.playing_whites) {
                this.ctx.restore();
            }
        }
    },

    render_piece: {
        value: function(light_frame, dark_frame) {
            this.handle_rotation();
            this.sprite.draw_frame(this.side === this.light_side ? light_frame : dark_frame, this.x, this.y, this.width, this.height);
            this.restore();
        }
    },

    update_position: {
        value: function() {
            this.position.init_position(this.cell.x, this.cell.y - (this.edge_size * 0.15));
        }
    },

    MouseClickHandler: {
        value: function(e) {
            // a cell was clicked that had contains a piece
            if (!this.board.selected_piece) {
                // there is no cell selected, yet
                // select current cell
                this.board.selected_piece = this;
            } else {
                // we have a selected cell
                // check if the piece can have a different color
                this.board.selected_piece = null;
            }
        }
    }
});


var PawnView = Object.create(PieceView);

Object.defineProperties(PawnView, {
    update_position: {
        value: function() {
            this.position.init_position(this.cell.x, this.cell.y + (this.edge_size * 0.05));
        }
    },

    render: {
        value: function() {
            this.render_piece(0, 6);
        }
    }
});


var RookView = Object.create(PieceView);

Object.defineProperties(RookView, {
    render: {
        value: function() {
            this.render_piece(3, 9);
        }
    }
});


var KnightView = Object.create(PieceView);

Object.defineProperties(KnightView, {
    render: {
        value: function() {
            this.render_piece(1, 7);
        }
    }
});


var BishopView = Object.create(PieceView);

Object.defineProperties(BishopView, {
    update_position: {
        value: function() {
            this.position.init_position(this.cell.x, this.cell.y - (this.edge_size * 0.3));
        }
    },

    render: {
        value: function() {
            this.render_piece(2, 8);
        }
    }
});


var QueenView = Object.create(PieceView);

Object.defineProperties(QueenView, {
    update_position: {
        value: function() {
            this.position.init_position(this.cell.x, this.cell.y - (this.edge_size * 0.3));
        }
    },

    render: {
        value: function() {
            this.render_piece(4, 10);
        }
    }
});

var KingView = Object.create(PieceView);

Object.defineProperties(KingView, {
    update_position: {
        value: function() {
            this.position.init_position(this.cell.x, this.cell.y - (this.edge_size * 0.3));
        }
    },

    render: {
        value: function() {
            this.render_piece(5, 11);
        }
    }
});


var Position = Object.create(GameView);

Object.defineProperties(Position, {
    init_position: {
        value: function(x, y) {
            this._x = x;
            this._y = y;

            return this;
        }
    }
});


var Sprite = Object.create(GameView);

Object.defineProperties(Sprite, {
    init_sprite: {
        value: function(img, rows, columns, frame_width, frame_height) {
            this.img = img;
            this.rows = rows;
            this.columns = columns;
            this.frame_width = frame_width;
            this.frame_height = frame_height;
    
            return this;
        }
    },

    draw_frame: {
        value: function(frame_idx, x, y, w, h) {
            this.ctx.drawImage(this.img, 
                frame_idx % this.rows * this.frame_width,
                Math.floor(frame_idx / this.rows) * this.frame_height,
                this.frame_width,
                this.frame_height,
                x,
                y,
                w,
                h);
        }
    }
})