var ChessController = {};

Object.defineProperties(ChessController, {
    init_game: {
        value: function() {
            this.model = Game.init_game();

            let colors = {};
            colors[this.model.light_side] = "rgba(255, 255, 255, .5)";
            colors[this.model.dark_side] = "rgba(0, 0, 0, .7)";
            colors["highlight"] = "rgba(3, 252, 236, .5)";
            this.view = GameView;
            this.view.init_game(this, colors);
        }
    },

    get_cells: {
        value: function() {
            return this.model.board.cells;
        }
    },

    get_cell: {
        value: function(col, row) {
            return this.model.board.cells[col][row];
        }
    },

    get_piece: {
        value: function(col, row) {
            return this.get_cell(col, row).piece;
        }
    },

    get_valid_moves: {
        value: function(col, row) {
            let result = [];
            this.get_piece(col, row).move_chains.forEach(function(link) {
                let tmp = link
                while (tmp && tmp.is_valid) {
                    let address = tmp.target_cell.address
                    result.push(this.view.board.cells[address[0]][address[1]]);
                    tmp = tmp.next_link;
                }
            }, this);
            return result;
        }
    },

    is_valid_move: {
        value: function(piece, cell) {
            let piece_cell = piece.cell;
            return (this.get_piece(piece_cell.column, piece_cell.row).is_safe_move_to(this.get_cell(cell.column, cell.row)))
        }
    },

    move_to: {
        value: function(piece, cell) {
            let p_cell = piece.cell;
            return (this.get_piece(p_cell.column, p_cell.row).move_to(this.get_cell(cell.column, cell.row)));
        }
    },

    current_turn: {
        value: function() {
            return this.model.board.current_turn;
        }
    }
})

var game = ChessController.init_game();