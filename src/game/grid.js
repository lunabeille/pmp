define(['jquery', 'utils'], function($){
"use strict";

/*
Grid class. Tetris grid internal representation.

How this class manages with moving blocks : grid handles several layers,
at least 1 : the static layer, containing printed blocks.

A layer is an Object with these atributes :
  * int dx : offset, in squares, on x axis
  * int dy : offset, in squares, on y axis
  * Array content : matrix defining layer content.
    first level indexes are y position, second level indexes are x positions
    (arrays contained in content array represent lines)
    content is either :
    * null / undefined / false : empty case
    * block reference : non empty case

A block is the model of one of the possible moving forms. In order to move,
a block is printed on a layer (the first free, usually the n°1, n°0 being static
layer).
A block an Object with these attributes :
  * Array content : a list (Array) of forms, one for each possible rotation.
  * each key : value defined in block configuration (arbitrary)
A form is a Object with these attributes :
  * Object group : block reference
  * int rotation : form index in block
  * int height : form height, in squares
  * int width : form width, in squares
  * Array content : matrix, similar to layer content, but with smaller
    dimensions

The grid keeps a list of active layer, the first one (index 0) is the static
layer. Following layers are moving layer. In classic tetris rules, we only
have one block moving on screen at a time, so only 1 layer is needed in
addition to the first one. However, Grid supports multi layers.

As explained, a layer defined offsets + content, which makes it really simple
to move. To move a layer of (dx, dy), we only have to update its offsets.
On the other hand, we have to use layer offset when reading its content, to
test if it collides or not with border / static layer for example.
Layer management is strictly confined to the Grid class. Grid doesn't give
acces to its layers, but provides methods to update layer positions (update),
add a new block (add), rotate blocks (rotate).

*/
pmp.Grid = pmp.def(pmp.Observable, {

    /*
     * Grid constructor.
     * @param int height : number of squares in height
     * @param int width : number of squares in width
     */
    init : function(height, width)
    {
        var layers, k, l;

        this._super.init.call(this);
        this._height = height;
        this._width = width;

        // initializes layers
        this._layers = layers = [
            {dx : 0, dy : 0, content : []},
        ];

        for(k = 0, l = layers.length; k < l; k++)
        {
            this.reset_layer(layers[k]);
        }
    },

    update : function(dx, dy)
    {
        var active_layers, layer, printed;
        var k, l;

        l = this._layers.length;
        if(l === 1) return undefined;

        active_layers = [this._layers[0]];
        printed = false;

        for(k = 1; k < l; k++)
        {
            layer = this._layers[k];;
            if(this.can_move_layer(layer, dx, dy))
            {
                this.move_layer(layer, dx, dy);
                active_layers.push(layer);
            }
            else if(dy !== 0)
            {
                this.print_layer(layer);
                printed = true;
            }
        }

        if(printed)
        {
            this._layers = active_layers;
        }

        return printed;
    },

    rotate : function()
    {
        var blocks, block, layer, k, l, c;

        for(k = 1, l = this._layers.length; k < l; k++)
        {
            layer = this._layers[k];
            blocks = layer.type.group;
            block = blocks[(layer.type.rotation + 1) % blocks.length];

            layer = { dx : layer.dx, dy : layer.dy};
            this.set_layer_content(layer, block);

            // this block would collide with fixed layer.
            // -> cancels
            if(this.do_layers_collide(this._layers[0], layer, 0, 0))
            {
                return false;
            }

            // this block would collide with borders; move it
            if((c = this.does_layer_collides_borders(layer, 0, 0)))
            {
                // collides on bottom
                // -> cancels
                if(c[1] !== 0)
                {
                    return false;
                }
                // else : collides on left or right
                else
                {
                    layer.dx += -c[0];
                    if(!this.can_move_layer(layer, 0, 0))
                    {
                        return false;
                    }
                }
            }

            this._layers[k] = layer;
        }
    },

    remove_full_lines : function()
    {
        var layer, line, removed, kept;
        var i, j, h, w;

        h = this._height;
        w = this._width;
        layer = this._layers[0];
        removed = [];
        kept = [];

        // finds full lines
        LINES : for(i = h-1; i >= 0; i--)
        {
            line = layer.content[(h + i - layer.dy) % h];
            for(j = 0; j < w; j++)
            {
                if(!line[(w - layer.dx + j) % w])
                {
                    kept.push(line);

                    // case is empty. test next line
                    continue LINES;
                }
            }

            // line is full, removes it
            removed.push(i);
        }

        // fills content with empty lines
        for(i = kept.length; i < h; i++)
        {
            kept.push([]);
        }

        // resets layer content;
        layer.content = kept.reverse();
        layer.dy = 0;

        return removed;
    },

    print_layer : function(layer)
    {
        var fixed = this._layers[0];
        fixed.dx = fixed.dy = 0;
        fixed.content = this.merge_layers([fixed, layer]);
    },

    reset_layer : function(layer)
    {
        var i;
        layer.dx = layer.dy = 0;
        for(i = 0; i < this._height; i++)
        {
            layer.content[i] = [];
        }
    },

    move_layer : function(layer, dx, dy)
    {
        if(dy !== 0)
        {
            layer.dy = Math.max(0, (layer.dy + dy) % this._height);
        }

        if(dx !== 0)
        {
            layer.dx = Math.max(
                (-this._width + 1),
                Math.min(this._width - 1, layer.dx + dx)
            );
        }
    },

    merge_layers : function(layers)
    {
        var result, result_line, layer, layer_line;
        var h, w, i, j, k, l;

        h = this._height;
        w = this._width;
        result = [];
        for(i = 0; i < h; i++)
        {
            result_line = result[i] = [];
            for(k = 0, l = layers.length; k < l; k++)
            {
                layer = layers[k];
                layer_line = layer.content[(h + i - layer.dy) % h];
                for(j = 0; j < w; j++)
                {
                    if(!result_line[j])
                    {
                        result_line[j] = layer_line[(w - layer.dx + j) % w];
                    }
                }
            }
        }

        return result;
    },

    can_move_layer : function(layer, dx, dy)
    {
        return !(this.does_layer_collides_borders(layer, dx, dy)
                 || this.do_layers_collide(this._layers[0], layer, dx, dy));
    },

    does_layer_collides_borders : function(layer, dx, dy)
    {
        var h, w, line, i, j, d;
        var start, end, excess;

        h = this._height;
        w = this._width;

        // move up : not supported yet
        if(dy < 0)
        {
            throw new Error('Moves up not supported yet !!');
        }

        // can we move vertically ?
        i = (h + h - dy - layer.dy) % h;
        line = layer.content[i];
        for(j = 0; j < this._width; j++)
        {
            if(line[(w + j - layer.dx) % w])
            {
                return [0, 1];
            }
        }

        // can we move horizontally ?
        if(dx !== 0)
        {
            d = layer.dx + dx + w;
            if(d < 0) return [d, 0];
            d = layer.dx + dx - w + 1;
            if(d > 0) return [d, 0];
        }


        if(layer.dx + dx === 0)
        {
            return false;
        }

        excess = 0;
        if((layer.dx + dx) > 0)
        {
            start = w - layer.dx - dx;
            end = w;
            LINES : for(i = 0; i < this._height; i++)
            {
                line = layer.content[i];
                for(j = start; j < end; j++)
                {
                    if(line[j])
                    {
                        d = 1;
                        j += 1
                        while(j < w && line[j]){ j += 1; d += 1; }
                        excess = Math.max(d, excess);
                        continue LINES;
                    }
                }
            }
        }
        else
        {
            start = 0;
            end = - dx - layer.dx;
            LINES: for(i = 0; i < this._height; i++)
            {
                line = layer.content[i];
                for(j = start; j < end; j++)
                {
                    if(line[j])
                    {
                        excess = Math.min(- end +j, excess);
                        continue LINES;
                    }
                }
            }
        }

        if(excess !== 0) return [excess, 0];

        return false;
    },

    do_layers_collide : function(fixed, moving, dx, dy)
    {
        var fixed_line, moving_line;
        var i, j, h, w;

        w = this._width;
        h = this._height;

        for(i = 0; i < h; i++)
        {
            fixed_line = fixed.content[(h + i - fixed.dy) % h];
            moving_line = moving.content[(h + i - dy - moving.dy) % h];
            for(j = 0; j < w; j++)
            {
                if(fixed_line[(w + j - fixed.dx) % w]
                   && moving_line[(w + j - dx - moving.dx) % w])
                {
                    return true;
                }
            }
        }

        return false;
    },

    /*
     *  adds a new layer to grid
     */
    add : function(config, dx, dy)
    {
        var layer;

        if(dx === undefined) dx = 0;
        if(dy === undefined) dy = 0;

        layer = {dx : dx, dy : dy};
        this.set_layer_content(layer, config);
        this._layers.push(layer);

        return layer;
    },

    set_layer_content : function(layer, block)
    {
        layer.type = block;
        layer.content = this.build_layer_content(block);
    },

    build_layer_content : function(block)
    {
        var layer_content, layer_line, block_line;
        var i, j;

        layer_content = [];
        for(i = 0; i < this._height; i++)
        {
            layer_content[i] = layer_line = [];
            if(block.content[i] instanceof Array)
            {
                block_line = block.content[i];
                for(j = 0; j < this._width; j++)
                {
                    layer_line[j] = block_line[j] ? block : false;
                }
            }
        }

        return layer_content;
    },

    get_state : function()
    {
        return this._state = this.merge_layers(this._layers);
    },

    get_width : function()
    {
        return this._width;
    },

    read_blocks : function(blocks)
    {
        var i, l;
        for(i = 0, l = blocks.length; i < l; i++)
        {
            blocks[i] = this.read_block_config(blocks[i]);
        }
        return blocks;
    },

    read_block_config : function(config)
    {
        var blocks, block_content, block_line, block_width, block_height;
        var config_patterns, config_pattern;
        var rot, w, i, j, l;

        blocks = [];

        config_patterns = config.patterns;
        for(rot = 0, l = config_patterns.length; rot < l; rot++)
        {
            config_pattern = config_patterns[rot];

            block_width = 0;
            block_height = config_pattern.length;
            block_content = [];

            for(i = 0; i < block_height; i++)
            {
                block_content[i] = block_line = config_pattern[i].split('');
                w = block_line.length;
                block_width = Math.max(block_width, w);
                for(j = 0; j < w; j++)
                {
                    block_line[j] = (block_line[j] !== ' ');
                }
            }

            blocks[rot] = {
                group : blocks,
                rotation : rot,
                height : block_height,
                width : block_width,
                content : block_content
            };
        }

        return $.extend({}, config, {
            contents : blocks
        });
    }
});

return pmp.Grid;

});