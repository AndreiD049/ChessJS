"use strict";

var Game = {};

Object.defineProperties(Game, {

    _board: {
        value: null,
        writable: true,
        configurable: true,
        enumerable: true
    },

    board: {
        get: function(){
            return Game._board;
        },

        set: function(val) {
            Game._board = val;
        }
    },

    won: {
        value: null,
        writable: true,
        configurable: true,
        enumerable: true
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

    init_game: {
        value: function() {
            this.board = Object.create(Board);
            this.board.init_board();
            return this;
        }
    },

    validate_address: {
        value: function(col, row) {
            return col >= 0 && col < 8 && row >= 0 && row < 8;
        }
    }
});


var Board = Object.create(Game);

Object.defineProperties(Board, {

    init_board: {
        value: function() {

            /* cells: array that will contain all the cells on the board.
             Each cell may have a piece in it. First index is always Column (A,B,C...) 
             and the second is the row (1,2,3...). This is always true despite choosen 
             side (light/dark) */

            this.cells = [Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8}),
                          Array.apply(null, {length: 8})];

            this.kings = {};
            this.checked = {};
            this.checked[this.light_side] = false;
            this.checked[this.dark_side] = false;

            this.current_turn = this.light_side;
            let current_side = this.dark_side;
            
            this.cells.map(function(col, c_idx) {
                // column 0 - A, 1 - B, ...

                col.map(function(row, r_idx) {
                    let cell = Object.create(Cell)
                                     .init_cell(current_side, null, [c_idx, r_idx]);
                    
                    this.cells[c_idx][r_idx] = cell;
                    current_side = this.change_side(current_side);
                }, this);
                // Change the colour again before next row
                current_side = this.change_side(current_side);
            }, this);

            this.initial_position();
        }
    },

    log_board: {
        value: function() {
            let result = "";
            this.cells.forEach(function(col, c_idx) {
                let line = ""
                col.forEach(function(_, r_idx){
                    let cell = this.cells[r_idx][c_idx];
                    if (!cell.piece) {
                        line +=  ` ${cell.side ? "##" : "  "} `;
                    } else {
                        if (Pawn.isPrototypeOf(cell.piece)) {
                            line += ` P`;
                        } else if (Rook.isPrototypeOf(cell.piece)) {
                            line += ` R`;
                        } else if (Knight.isPrototypeOf(cell.piece)) {
                            line += ` ?`;
                        } else if (Bishop.isPrototypeOf(cell.piece)) {
                            line += ` B`;
                        } else if (Queen.isPrototypeOf(cell.piece)) {
                            line += ` Q`;
                        } else if (King.isPrototypeOf(cell.piece)) {
                            line += ` K`;
                        };
                        line += `${cell.piece.side ? "B" : "W"} `
                    }
                }, this);
                result = (line + "\n") + result;
            }, this);
            console.log(result);
        }
    },

    initial_position: {
        value: function() {
            // set white pieces
            Object.create(Rook).init_rook(this.cells[0][0], this.light_side);
            Object.create(Knight).init_knight(this.cells[1][0], this.light_side);
            Object.create(Bishop).init_bishop(this.cells[2][0], this.light_side);
            Object.create(Queen).init_queen(this.cells[3][0], this.light_side);
            Object.create(King).init_king(this.cells[4][0], this.light_side);
            Object.create(Bishop).init_bishop(this.cells[5][0], this.light_side);
            Object.create(Knight).init_knight(this.cells[6][0], this.light_side);
            Object.create(Rook).init_rook(this.cells[7][0], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[0][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[1][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[2][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[3][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[4][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[5][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[6][1], this.light_side);
            Object.create(Pawn).init_pawn(this.cells[7][1], this.light_side);
            // set balck pieces
            Object.create(Rook).init_rook(this.cells[0][7], this.dark_side);
            Object.create(Knight).init_knight(this.cells[1][7], this.dark_side);
            Object.create(Bishop).init_bishop(this.cells[2][7], this.dark_side);
            Object.create(Queen).init_queen(this.cells[3][7], this.dark_side);
            Object.create(King).init_king(this.cells[4][7], this.dark_side);
            Object.create(Bishop).init_bishop(this.cells[5][7], this.dark_side);
            Object.create(Knight).init_knight(this.cells[6][7], this.dark_side);
            Object.create(Rook).init_rook(this.cells[7][7], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[0][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[1][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[2][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[3][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[4][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[5][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[6][6], this.dark_side);
            Object.create(Pawn).init_pawn(this.cells[7][6], this.dark_side);
        }
    },

    next_turn: {
        value: function() {
            this.current_turn = this.change_side(this.current_turn);
        }
    }
});


var Cell = Object.create(Board);

Object.defineProperties(Cell, {
    init_cell: {
        value: function(side, piece, address) {
            this.side = side;
            this.piece = piece;
            this.address = address;
            /* assault_list: an object defining all the pieces that
            can currently move on this cell 
            key is the piece's id and the value is the MoveLink object */
            this.assault_list = {};

            return this;
        }
    },

    column: {
        get: function() {
            return this.address[0];
        }
    },

    row: {
        get: function() {
            return this.address[1];
        }
    },

    revalidate_moves: {
        value: function() {
            for (let k in this.assault_list) {
                // if k is not null, validate it
                if (this.assault_list[k]) {
                    this.assault_list[k].validate();
                }
            }
        }
    }
});


var Piece = Object.create(Game);

Object.defineProperties(Piece, {
    _id: {
        value: 1,
        writable: true,
        configurable: true,
        enumerable: true
    },

    // generate new id for each new piece
    new_id: {
        get: function() {
            let result = Piece._id;
            Piece._id++;
            return String(this) + result;
        }
    },

    init_piece: {
        value: function(cell, side) {
            this.id = this.new_id;
            this.cell = cell;
            this.side = side;
            this.max_disstance = 1;
            this.move_chains = [];
            this.first_move = true;
            this.cell.piece = this;
            this.cell.revalidate_moves();

            return this;
        }
    },

    move_to: {
        value: function(other_cell) {
            // move the piece to other cell
            // after we remove the piece from the original cell,
            // it's assault list needs to be revalidated
            let move = other_cell.assault_list[this.id]
            if (this.is_my_turn() && move && move.is_valid){
                // save the initial cell of this piece,
                // and the piece of other cell if exists
                let temp_init_cell = this.cell;
                let temp_other_piece = other_cell.piece;

                this.remove_piece();           // removes this piece from it's current position
                this.put_piece_on(other_cell); // puts the cell on the target cell

                // here we need to check if our king is not checked after this move
                // if yes, revert the move
                if (this.board.kings[this.side].is_checked()) {
                    // our King is checked after this move, revert it
                    // if the other cell had a piece before move
                    // just put this piece on it
                    // else, simple remove our piece from the other cell
                    if (temp_other_piece) {
                        temp_other_piece.put_piece_on(other_cell);
                    } else {
                        this.remove_piece();
                    }
                    // put this piece on it's initial cell
                    this.put_piece_on(temp_init_cell);
                    return false;
                }

                // now we need to check if we checked the opposite king
                let opposite_king = this.board.kings[this.change_side(this.side)];
                if (opposite_king.is_checked()) {
                    this.board.checked[opposite_king.side] = true;
                    // after we need to check if the opposite king has any possibilities
                    // possibilities to avoid mate
                    if (opposite_king.is_mate()) {
                        this.won = this.side;
                    }
                }

                if (this.board.checked[this.side]) this.board.checked[this.side] = false;
                if (this.first_move) this.first_move = false;
                this.board.next_turn();
                return true;
            }
        }
    },

    is_safe_move_to: {
        value: function(cell) {
            // Checks if this piece can be moved to the cell 
            // without a Check
            let move = cell.assault_list[this.id]
            if (move && move.is_valid){
                // save the initial cell of this piece,
                // and the piece of other cell if exists
                let temp_init_cell = this.cell;
                let temp_other_piece = cell.piece;

                this.remove_piece();           // removes this piece from it's current position
                this.put_piece_on(cell);       // puts the cell on the target cell

                // save the result
                let result = this.board.kings[this.side].is_checked();

                // revert the move
                if (temp_other_piece) {
                    temp_other_piece.put_piece_on(cell);
                } else {
                    this.remove_piece();
                }
                // put this piece on it's initial cell
                this.put_piece_on(temp_init_cell);

                // return true if the move is safe
                return !result;
            }
        }
    },

    init_move_chains: {
        value: function() {
            this.move_chains = [];
            let current_link = null;

            this.move_dirrections.forEach(function(dirrection, idx) {
                for (let mul = 1; mul <= this.max_disstance; mul++) {
                    // creating a new link object
                    let link = Object.create(MoveLink);
                    link.init_link(dirrection[0]*mul, dirrection[1]*mul, this, false);
                    // appending the link object to the tail
                    current_link = current_link ? 
                                   current_link.set_next_link(link) : 
                                   link;
                }
                this.move_chains.push(current_link);
                current_link = null;
            }, this);
        }
    },

    validate_chains: {
        value: function() {
            this.move_chains.forEach(function(chain, idx) {
                chain.validate();
            }, this);
        }
    },

    remove_chains: {
        value: function() {
            // removes the chains from the assult lists
            this.move_chains.forEach(function(chain, idx) {
                chain.remove_cells();
            })
        }
    },

    remove_piece: {
        value: function() {
            // removes the piece from it's cell
            this.remove_chains();
            this.cell.piece = null;
            this.cell.revalidate_moves();
        }
    },

    put_piece_on: {
        value: function(cell) {
            // after we insert the piece into the new cell
            // it's assault list also needs to be revalidated
            // if the other cell already has a piece, it's chains alse are removed
            if (cell.piece) cell.piece.remove_chains();
            cell.piece = this;
            this.cell = cell;
            cell.revalidate_moves();
            // in the end, the pieces chains also need to be revalidated
            this.validate_chains();
        }
    },

    is_my_turn: {
        value: function() {
            return this.side === this.board.current_turn;
        }
    },

    toString: {
        value: function() {
            return "piece";
        }
    }

});


var Pawn = Object.create(Piece);

Object.defineProperties(Pawn, {
    init_pawn: {
        value: function(cell, side) {
            this.init_piece(cell, side);
            this.max_disstance = 2;
            this.first_move = true;

            /* The pawn is the only piece that has different 
            move and hit pattern. This is why it would need to 
            overwrite the starndard move-validating method */
            if (this.side === this.light_side) {
                this.move_dirrections = [[0, 1]];
                this.hit_dirrections = [[-1, 1], [1, 1]];
            } else {
                this.move_dirrections = [[0, -1]];
                this.hit_dirrections = [[-1, -1], [1, -1]];
            }

            this.init_move_chains();
            this.validate_chains();
            // this.move_chains.forEach(chain=>console.log(chain.toString()));
            return this;
        }
    },

    init_move_chains: {
        value: function() {
            this.move_chains = [];
            let current_link = null;

            this.move_dirrections.forEach(function(dirrection, idx) {
                for (let mul = 1; mul <= this.max_disstance; mul++) {
                    // creating a new link object
                    let link = Object.create(MoveLink);
                    link.init_link(dirrection[0]*mul, dirrection[1]*mul, this, false);
                    // appending the link object to the tail
                    current_link = current_link ? 
                                   current_link.set_next_link(link) : 
                                   link;
                }
                this.move_chains.push(current_link);
                current_link = null;
            }, this);
            
            this.hit_dirrections.forEach(function(dirrection, idx) {
                let link = Object.create(MoveLink);
                link.init_link(dirrection[0], dirrection[1], this, true);
                current_link = current_link ?
                               current_link.set_next_link(link) :
                               link;
                this.move_chains.push(current_link);
                current_link = null;
            }, this);
        }
    },

    move_to: {
        value: function(other_cell) {
            // specific move value for pawn
            // shortens the move_chains after the first move
            if (this.first_move) {
                if (Piece.move_to.call(this, other_cell)) {
                    this.move_chains.forEach(function(chain, idx) {
                        if (chain.next_link) chain.next_link.remove_cells();
                        chain.next_link = null;
                    });
                }
            } else {
                Piece.move_to.call(this, other_cell);
            }
        }
    },

    toString: {
        value: function() {
            return "pawn";
        }
    }
});

var Rook = Object.create(Piece);

Object.defineProperties(Rook, {
    init_rook: {
        value: function(cell, side) {
            this.init_piece(cell, side);
            this.max_disstance = 7;
            this.move_dirrections = [[0, 1], [0, -1], [-1, 0], [1, 0]];

            this.init_move_chains();
            this.validate_chains();
            // this.move_chains.forEach(chain=>console.log(chain.toString()));
            return this;
        }
    },

    toString: {
        value: function() {
            return "rook";
        }
    }
});


var Knight = Object.create(Piece);

Object.defineProperties(Knight, {
    init_knight: {
        value: function(cell, side) {
            this.init_piece(cell, side);
            this.move_dirrections = [[-1, 2], [1, 2], [2, 1], [2, -1], 
                                     [1, -2], [-1, -2], [-2, -1], [-2, 1]];
            this.init_move_chains();
            this.validate_chains();
            return this;
        }
    },

    toString: {
        value: function() {
            return "knight";
        }
    }
});


var Bishop = Object.create(Piece);

Object.defineProperties(Bishop, {
    init_bishop: {
        value: function(cell, side) {
                this.init_piece(cell, side)
                this.max_disstance = 7;
                this.move_dirrections = [[-1, 1], [1, 1], [1, -1], [-1, -1]];

                this.init_move_chains();
                this.validate_chains();
                return this;
        }
    },

    toString: {
        value: function() {
            return "bishop";
        }
    }
});

var Queen = Object.create(Piece);

Object.defineProperties(Queen, {
    init_queen: {
        value: function(cell, side) {
                this.init_piece(cell, side)
                this.max_disstance = 7;
                this.move_dirrections = [[-1, 1], [1, 1], [1, -1], [-1, -1],
                                         [0, 1], [0, -1], [-1, 0], [1, 0]];

                this.init_move_chains();
                this.validate_chains();
                return this;
        }
    },

    toString: {
        value: function() {
            return "queen";
        }
    }
});

var King = Object.create(Piece);

Object.defineProperties(King, {
    init_king: {
        value: function(cell, side) {
                this.init_piece(cell, side)
                this.max_disstance = 1;
                this.board.kings[side] = this;
                this.move_dirrections = [[-1, 1], [1, 1], [1, -1], [-1, -1],
                                         [0, 1], [0, -1], [-1, 0], [1, 0]];

                this.init_move_chains();
                this.validate_chains();
                return this;
        }
    },

    is_checked: {
        value: function() {
            if (this.cell) {
                return Object.keys(this.cell.assault_list).filter(function(k) {
                    return this.cell.assault_list[k] &&
                           this.cell.assault_list[k].piece.side !== this.side &&
                           this.cell.assault_list[k].is_valid
                }, this).length > 0;
            }
        }
    },

    is_mate: {
        value: function() {
            // returns true if this King lost
            
            // we need to check each of the king's surrounding cells
            this.move_chains.forEach(function(chain) {
                // if the chain has a cell, we can check it
                if (chain.target_cell) {
                    // check this cell's assault list
                    // get all moves from friedly pieces that are valid
                    // and check if this move would prevent the check
                    let friendly_safe_moves = Object.keys(chain.target_cell.assault_list).filter(function(k) {
                        let move = chain.target_cell.assault_list[k];
                        return move && 
                               move.piece.side === this.side &&
                               move.piece.is_safe_move_to(move.target_cell);
                    }, this);

                    if (friendly_safe_moves.length > 0) return false;
                }
            }, this);

            // we also need to check if we can beat the pieces currently checking the king
            let enemy_valid_moves = Object.keys(this.cell.assault_list).map(function(k) {
                let move = this.cell.assault_list[k];
                if (move && move.piece.side !== this.side && move.is_valid) {
                    return move;
                } else {
                    return false;
                };
            }, this).filter(move => move);

            // loop through the enemy moves
            for (let e_idx = 0, len = enemy_valid_moves.length; e_idx < len; ++e_idx) {
                // check the cell where the enemy is located
                // if any friendly piece can prevent the check by moving on this cell
                // return false
                let enemy_piece = enemy_valid_moves[e_idx].piece;
                let friendly_safe_moves = Object.keys(enemy_piece.cell.assault_list).filter(function(k) {
                    let move = enemy_piece.cell.assault_list[k];
                    // if it's of opposite side and is safe to move to, we're saved
                    return move && 
                           move.piece.side === this.side &&
                           move.piece.is_safe_move_to(move.target_cell);
                }, this);
                if (friendly_safe_moves.length > 0) return false;
            }

            // if we got here, it's a mate
            return true;
        }
    },

    toString: {
        value: function() {
            return "king";
        }
    }
});

var MoveLink = Object.create(Game);

Object.defineProperties(MoveLink, {
    init_link: {
        value: function(dx, dy, piece, is_hit) {
            this.dx = dx;
            this.dy = dy;
            this.is_valid = false;
            this.piece = piece;
            this.target_cell = null;
            this.only_hit = is_hit;
            this.next_link = null;
            this.prev_link = null;

            return this;
        }
    },

    set_next_link: {
        value: function(other) {
            // set the next move link
            let that = this;
            while (that.next_link !== null) {
                that = that.next_link;
            }
            that.next_link = other;
            other.prev_link = that;
            return this;
        }
    },

    validate: {
        value: function() {
            let current_col = this.piece.cell.column;
            let current_row = this.piece.cell.row;
            let new_col = current_col + this.dx;
            let new_row = current_row + this.dy;

            if (this.validate_address(new_col, new_row)) {
                this.target_cell = this.board.cells[new_col][new_row];
                this.target_cell.assault_list[this.piece.id] = this;
                if (this.only_hit) {
                    // we can only hit, check if there is a piece
                    if (this.target_cell.piece && this.target_cell.piece.side !== this.piece.side) {
                        this.set_true_hit()
                    } else {
                        this.set_false();
                    }
                } else {
                    // we can either move or hit
                    if (this.target_cell.piece) {
                        // the cell we're aiming has a piece
                        // check if you can hit it
                        // if it's a Pawn we can't hit it
                        // Pawns can hit only if only_hit is true
                        if (this.target_cell.piece.side !== this.piece.side && 
                            !Pawn.isPrototypeOf(this.piece) && 
                            (this.prev_link === null || this.prev_link.is_valid)) {
                            // it's a valid hit, we set the current link to valid
                            // and set the other ones after it to not valid
                            // because you can't hit anything after an enemy piece
                            this.set_true_hit();
                        } else {
                            this.set_false();
                        }
                    } else {
                        //we don't have a piece in the target-cell
                        // means we can move here
                        this.is_valid = true;
                        if (this.next_link) this.next_link.validate();
                    }
                }
            } else {
                // this MoveLink is outside the board, set it and all links after it to false
                this.set_false();
                // also check if it has a cell and set it to null, both here and in the cell itself
                this.remove_cells();
            }
        }
    },

    set_false: {
        value: function() {
            let that = this;
            that.is_valid = false;
            while (that.next_link) {
                that = that.next_link;
                that.is_valid = false;
            }
        }
    },

    set_true_hit: {
        value: function() {
            let that = this;
            that.is_valid = true;
            while (that.next_link) {
                that = that.next_link;
                that.is_valid = false;
            }
        }
    },

    remove_cells: {
        value: function() {
            if (this.target_cell) {
                this.target_cell.assault_list[this.piece.id] = null;
                this.target_cell = null;
                if (this.next_link) {
                    this.next_link.remove_cells();
                }
            }
        }
    },

    toString: {
        value: function() {
            return `[${this.piece.id}] ${this.dx} - ${this.dy} = ${this.is_valid} \n${this.next_link ? this.next_link.toString() : "===============\n"}`;
        }
    }
});