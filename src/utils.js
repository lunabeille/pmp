define(['jquery'], function($){
"use strict";

if(window.pmp === undefined){ windows.pmp = {}; }

pmp.def = function(parent, config)
{
    var f, child, proto;

    // 1 argument form : pmp.def({ ... })
    if(config === undefined)
    {
        config = parent;
        proto = null;
    }
    // 2 arguments form : pmp.def(parent, { ... })
    else
    {
        var f = function(){};
        proto = f.prototype = parent.prototype;
        config = $.extend(new f(), config);
    }

    var child = function(){
        this._super = proto;
        this.init.apply(this, arguments);
    };

    child.prototype = config;
    return child;
}

pmp.Observable = pmp.def({

    init : function()
    {
        this._handlers = {};
    },

    on : function(name, callback, scope)
    {
        var handlers = this._handlers[name] || (this._handlers[name] = []);
        handlers.push([callback, scope || callback]);
    },

    dispatch : function(name, v1, v2, v3)
    {
        var handlers, handler, i, l;

        if(!(handlers = this._handlers[name]))
        {
            return;
        }

        for(i = 0, l = handlers.length; i < l; i++)
        {
            handler = handlers[i];
            handler[0].call(handler[1], v1, v2, v3);
        }
    }
});

});