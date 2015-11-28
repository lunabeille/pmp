define(['jquery', 'game/grid', 'utils'], function($, Grid){

"use strict";

/*
Game class. Tetris game engine.

events triggered :

EVENT "status" :
  * Game game : game instance
  * int old_status : previous status, 1 of game.STATUS
  * int new_status : current status, 1 of game.STATUS
  triggered when game status changes

EVENT "loop" :
  * Game game : game instance
  * boolean gameover : true if the game was over at end of this loop
  triggered at end of each game loop

EVENT "full" :
  * Game game : game instance
  * int Array removed : indexes of lines removed
  triggered when lines are full, after they are removed

EVENT "score" :
  * Game game : game instance
  * int score : new score after update
  triggered after score was updated

EVENT "block" :
  * Game game : game instance
  * Object block : newly selected block
  triggered when the next block is chosen

*/
pmp.Game = pmp.def(pmp.Observable, {

    STATUS : {
        NEW : 0,
        STARTED : 1,
        PAUSED : 2,
        OVER : 3,
    },

    /*
     * Game constructor.
     * @param Object config : game configuration
     */
    init : function(config)
    {
        this._super.init.call(this);
        this._grid = new pmp.Grid(config.height, config.width);
        this._blocks = this._grid.read_blocks(config.blocks);
        this._speed = config.speed || 1;
    },

    prepare : function()
    {
        this.set_status(this.STATUS.NEW);
    },

    toggle : function()
    {
        var status = this._status === this.STATUS.STARTED ?
            this.STATUS.PAUSED
            : this.STATUS.STARTED;

        return this.set_status(status);
    },

    start : function()
    {
        return this.set_status(this.STATUS.STARTED);
    },

    pause : function()
    {
        return this.set_status(this.STATUS.PAUSED);
    },

    set_status : function(status)
    {
        var that = this;

        if(this._status === status)
        {
            return false;
        }

        if(status === this.STATUS.NEW)
        {
            this.update_score(0);
            this.select_next_block();
        }
        else if(status === this.STATUS.STARTED)
        {
            this._loop = window.setInterval(
                function(){ that.loop(); },
                1000 / this._speed
            );
        }
        else
        {
            clearInterval(this._loop);
        }

        this.dispatch('status', this, this._status, status);
        this._status = status;

        return true;
    },

    get_status : function()
    {
        return this._status;
    },

    loop : function()
    {
        var gameover = !this.update();

        this.dispatch('loop', this, gameover);

        if(gameover)
        {
            this.set_status(this.STATUS.OVER);
        }
    },

    update : function(dx, dy)
    {
        var printed, block, layer, removed, i;

        if(dx === undefined) dx = 0;
        if(dy === undefined) dy = 1;

        printed = this._grid.update(dx, dy);

        if(printed || printed === undefined)
        {
            // removes full lines
            removed = this._grid.remove_full_lines();
            if(removed.length > 0)
            {
                this.dispatch('full', this, removed);
                this.update_score(removed.length);
            }

            // next block horizontal position
            block = this._next_block;

            // computes centered block position
            i = Math.max(
                0,
                (Math.floor(this._grid.get_width() / 2)
                 - Math.ceil(block.width / 2))
            );

            layer = this._grid.add(block, i, 0);
            if(!this._grid.can_move_layer(layer, 0, 1))
            {
                return false;
            }

            this.select_next_block();
        }

        return true;
    },

    update_score : function(n)
    {
        if(this._score === undefined)
        {
            this._score = n;
        }
        else
        {
            this._score += n * 100;
        }

        this.dispatch('score', this, this._score);
    },

    rotate : function()
    {
        this._grid.rotate();
    },

    select_next_block : function()
    {
        var l, i, block;

        l = this._blocks.length;
        i = Math.min(l - 1, Math.floor(Math.random() * l));

        block = this._next_block = this._blocks[i].contents[0];
        this.dispatch('block', this, block);
    },

    get_state : function()
    {
        return {
            score : this._score,
            grid : this._grid.get_state()
        };
    }
});

return pmp.Game;

});