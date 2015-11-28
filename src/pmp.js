(function(){
"use strict";

if(window.pmp === undefined){ windows.pmp = {}; }

pmp.run = function(config)
{
    var blocks, gui;

    blocks = 'blocks/' + (config.blocks || 'tetris');

    gui = (config.gui || 'text');
    gui = 'gui/' + gui + '/' + gui + '.js';

    requirejs([blocks, 'game/game', gui], function(blocks, Game, Gui){
        var game, gui;
        config.blocks = blocks;
        game = new Game(config);
        gui = new Gui(game);
        gui.render(document.body);
        game.prepare();
    });
};

requirejs.config({
    baseUrl: '',
    paths:
    {
        jquery : 'bower/jquery/dist/jquery.min',
    }
});

}());