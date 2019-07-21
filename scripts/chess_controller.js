var ChessController = {};

Object.defineProperties(ChessController, {
    init_game: {
        value: function() {
            this.model = Game.init_game();

            let colors = {};
            colors[this.model.light_side] = "rgba(255, 255, 255, .5)";
            colors[this.model.dark_side] = "rgba(0, 0, 0, .7)";
            this.view = GameView.init_game(this, colors);
            return this;
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
    }
})

// debugger;
var game = Object.create(ChessController).init_game();