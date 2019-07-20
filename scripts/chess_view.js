"use strict";

var GameView = {};

Object.defineProperties(GameView, {
    _edge_size: {
        value: 50
    },

    controller: {
        value: null,
        writable: true
    },

    edge_size: {
        get: function() {
            return this._edge_size;
        },

        set: function(val) {
            this._edge_size = val;
        }
    },

    context: {
        value: null,
        writable: true
    },

    init_game: {
        value: function() {
            let canvas = document.getElementById("canvas");
            this.ctx = canvas.getContext("2d");
        }
    }
});


var BoardView = Object.create(GameView);

Object.defineProperties(BoardView, {

});