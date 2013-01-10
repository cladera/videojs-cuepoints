//Cuepoint Object
_V_.Cuepoint = function(player, type, start, end, opts){
    this.type = type;
    this.start = start;
    this.end = end;
    this.opts = opts;
    this.player = player;
    this.playing = false;
    var self = this;
    this.player.addEvent("timeupdate", function(){
        if(this.currentTime() >= self.start && this.currentTime() < self.end){
            if(self.playing)
                return;
            self.playing = true;
            self._start();
        }else{
            if(!self.playing)
                return;
            self.playing = false;
            self._end();
        }
    })
};
//Cuepoint prototype
_V_.Cuepoint.prototype = {
    _start: function(){
        var e = new _V_.Event("cuepointStart");
        e.cuepoint = this;
        this.player.triggerEvent(e);
    },
    _end: function(){
        var e = new _V_.Event("cuepointEnd");
        e.cuepoint = this;
        this.player.triggerEvent(e);
    }
};

//Webcast Component
_V_.Webcast = _V_.Component.extend({
    options : {
        components: {
            "slideshow": {}
        }
    },
    init: function (player, options){
        var p = this._super(player, options);
        //Init webcast
        new _V_.Cuepoint(player, "slideshows", 4, 10, {});
        
    },
    buildCSSClass: function(){
        //return this._super() + " vjs-social-controlBar ";
        return " vjs-webcast ";
    },
    createElement: function(type, attrs){
        attrs = _V_.merge({
            className: this.buildCSSClass(),
            innerHTML:''
        }, attrs); 
      
        return this._super(type, attrs);
    }
});

/**
* SyncComponent definition
*/
_V_.SyncComponent = _V_.Component.extend({
    init: function (player, options){
        var p = this._super(player.options);
        var self = this;
        player.addEvent("cuepointStart", function(event){
            var c = event.cuepoint;
            if(options.cuepointfilter == "*" || options.cuepointfilter == c.type){
                self.onCuepointStart(c);
            }
        });
        player.addEvent("cuepointEnd", function(event){
            var c = event.cuepoint;
            if(options.cuepointfilter == "*" || options.cuepointfilter == c.type){
                self.onCuepointEnd(c);
            }
        });
    },
    onCuepointStart : function(c){
        console.log(c);
    },
    onCuepointEnd : function (c){
        console.log(c);
    }
});
_

_V_.Slideshow = _V_.SyncComponent.extend({
    init: function (player, options){
        options.cuepointfilter = "slideshows";
        var p = this._super(player, options);
    },
    buildCSSClass: function(){
        return this._super() +  " vjs-slideshow ";
    },
    createElement: function(type, attrs){
        attrs = _V_.merge({
            className: this.buildCSSClass()
        }, attrs); 
      
        return this._super(type, attrs);
    },
    onCuepointStart : function (c){
      this.el.innerHTML = "<div>Slide in</div>";
    },
    onCuepointEnd: function(c){
      this.el.innerHTML = "";
    }
});