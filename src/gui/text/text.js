define(['jquery', 'utils'], function($){
"use strict";

if(pmp.gui === undefined) pmp.gui = {};


pmp.gui.Text = pmp.def(pmp.Observable, {

    CASE_BRICK : '##',
    CASE_EMPTY : '..',

    KEYS : {
        down : 40,
        left : 37,
        right : 39,
        rotate : 32,
        start : 13
    },

    START_MESSAGE : [
        "Welcome in PMP\n\n",
        "press ENTER to start\n\n",
        "rotate : space\n",
        "move : arrows\n",
        "pause/resume : enter\n",
    ].join(""),

    PAUSE_MESSAGE : [
        "game is paused\n\n",
        "press ENTER to resume\n\n",
        "rotate : space\n",
        "move : arrows\n",
        "pause/resume : enter\n",
    ].join(""),

    GAMEOVER_MESSAGE : [
        "game over :(\n\n",
        "press ENTER to play again",
    ].join(''),


    init : function(game)
    {
        this._game = game;
        game.on('loop', this.update, this);
        game.on('status', this.update_status, this);
        game.on('score', this.update_score, this);
    },

    render : function(container)
    {
        var body;

        this.load_css('gui/text/text.css');

        this._body = body = $('<div class="pmp text">');
        $(container).append(body);

        this._grid = $('<pre class="grid">');
        body.append(this._grid);

        this._score = $('<div class="score">');
        body.append(this._score);

        this._mask = $('<pre class="mask">')

        this.init_keyboard();
    },

    init_keyboard : function()
    {
        var that = this;
        $(document.body).keydown(function(event){
            that.on_key_press(event);
        });
    },

    on_key_press : function(event)
    {
        var key, command;

        key = event.keyCode;
        for(command in this.KEYS)
        {
            if(key === this.KEYS[command])
            {
                this.do_command(command);
                event.preventDefault();
                break;
            }
        }
    },

    do_command : function(command)
    {
        var status = this._game.get_status();

        if(command !== 'start' && status !== this._game.STATUS.STARTED)
        {
            return;
        }

        switch(command)
        {
        case 'left' :
            this._game.update(-1, 0);
            break;
        case 'right' :
            this._game.update(1, 0);
            break;
        case 'down' :
            this._game.update(0, 1);
            this._game.update(0, 1);
            this._game.update(0, 1);
            break;
        case 'rotate' :
            this._game.rotate();
            break;
        case 'start' :
            this._game.toggle();
            break;
        default :
            throw new Error("Command not supported : " + command);
        }

        this.update();
    },

    update : function()
    {
        this._grid.html(
            this.game_to_string(this._game)
        );
    },

    update_score : function(game, score)
    {
        score = '00000000000000' + score.toString();
        score = score.substr(-10);
        this._score.html(score);
    },

    update_status : function(game, old_status, status)
    {
        switch(status)
        {
        case game.STATUS.STARTED:
            this._mask.remove();
            break;
        case game.STATUS.NEW:
            this.update();
            this._mask.html(this.START_MESSAGE);
            this._body.append(this._mask);
            break;
        case game.STATUS.PAUSED:
            this._mask.html(this.PAUSE_MESSAGE);
            this._body.append(this._mask);
            break;
        case game.STATUS.OVER:
            this._mask.html(this.GAMEOVER_MESSAGE);
            this._body.append(this._mask);
            break;
        }
    },

    game_to_string : function(game)
    {
        var state, line, repr, width, height;
        var i, j, l, k;

        state = game.get_state();
        height = state.grid.length;
        repr = [];

        for(i = 0; i < height; i++)
        {
            line = state.grid[i];
            width = line.length;
            for(j = 0; j < width; j++)
            {
                repr.push(line[j] ? this.CASE_BRICK : this.CASE_EMPTY);
            }
            repr.push("\n");

            // x text lines for 1 grid line
            for(k = 0, l = this.CASE_BRICK.length; k < l; k++)
            {
                repr.push.apply(repr, repr.slice(-width-1));
            }
        }

        return repr.join('');
    },

    load_css : function(url)
    {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        $('head').get(0).appendChild(link);
    }
});

return pmp.gui.Text;

});