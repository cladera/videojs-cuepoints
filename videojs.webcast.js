/**
* WebcastJS
* @version 1.0
* @author Carles Galan Cladera
**/

/**
* Cuepoint definition
*/
_V_.Cuepoint = _V_.Class.extend({
	init: function (player, type, start, end, opts){
		this.player = player;
		this.type = type;
		this.start = start;
		this.end = end || -1;
		this.opts = opts || {};
	},
	activate : function (){
		var self = this;
		this.player.addEvent("timeupdate", function (){
			self._process();
		});
	},
	suspend : function (){
		var self = this;
		this.fired = false;
		this.player.removeEvent("timeupdate", function (){
			self._process();
		});
	},
	_process: function (){
		//Check if current time is between start and end
        if(this.player.currentTime() >= this.start && (this.end < 0 || this.player.currentTime() < this.end)){
            if(this.fired) //Do nothing if start has already been called
                return;
            this.fired = true; //Set fired flag to true
            this._start(); //Call start function
        }else{
            if(!this.fired) //Do nothing if end has already been called
                return;
            this.fired = false; //Set fired flat to false
            this._end(); //Call end function
        }
	},
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
});
/**
* Webcast Component definition
*/

_V_.Webcast = _V_.Component.extend({
    init: function (player, options){
    	var opts = player.options.webcast || {};
        _V_.merge(opts, _V_.Webcast.options);
        player.options.webcast = opts;
        this._super(player, options);
        //Set with and height
        this.el.style.width = opts.width;
        this.el.style.height = opts.height;
        //Init webcast
        this.cuepoints = [];
        this.player.webcast = this;
        var e = new _V_.Event("webcastReady");
        e.webcast = this;
        this.player.triggerEvent(e);
    },
    buildCSSClass: function(){
        return "webcast-js";
    },
    createElement: function(type, attrs){
        attrs = _V_.merge({
            className: this.buildCSSClass(),
            innerHTML:''
        }, attrs); 
        return this._super(type, attrs);
    },
    addCuepoint : function(type, start, end, opts){
    	var cp = new _V_.Cuepoint(this.player, type, start, end, opts);
    	cp.activate();
    	this.cuepoints.push(cp);
    	return cp;
    }
});
_V_.Webcast.options = {
	width : "1024px",
    height: "670px"
}

/**
* SyncComponent definition
*/

_V_.SyncComponent = _V_.Component.extend({
    init: function (player, options){
    	//Set options
    	var opts = {};
    	_V_.merge(opts, _V_.SyncComponent.options); //Copy defaults
    	_V_.merge(opts, options); //Override/extend with options from constructor
    	//Call super constructor
        var p = this._super(player, opts);
        var self = this;
        //Start listening to start cuepoint event
        player.addEvent("cuepointStart", function(event){
            var c = event.cuepoint; //Copy cuepoint from event object
            //Filter unrelated cuepoints
            var regExp = new RegExp(options.cuepointfilter,'ig');
            if(regExp.test(c.type))
            	self.start(c); //Call start function
        });
        //Start listenting to end cuepoint event
        player.addEvent("cuepointEnd", function(event){
            var c = event.cuepoint; //Copy cuepoint from event object
            //Filter unrelated cuepoints
            var regExp = new RegExp(options.cuepointfilter,'ig');
            if(regExp.test(c.type))
            	self.end(c); //Call end function
        });
    },
    start : function(c){
        //Start function
    },
    end : function (c){
        //End function 
    }
});
_V_.SyncComponent.options = {
	cuepointfilter : ".*"
};

/**
* Slideshow sync compnent definition
*/
_V_.Slideshow = _V_.SyncComponent.extend({
    init: function (player, options){
    	//Set options
    	console.log(player.options);
    	var opts = player.options.webcast.slideshow || {};
    	_V_.merge(opts, _V_.Slideshow.options); //Copy defaults
    	_V_.merge(opts, options); //Override/extend with options from constructor
    	//Call super constructor
        this._super(player, opts);
        this.el.style.width = opts.width;
        this.el.style.height = opts.height;
    },
    buildCSSClass: function(){
        return this._super() +  "wjs-slideshow";
    },
    createElement: function(type, attrs){
        attrs = _V_.merge({
            className: this.buildCSSClass()
        }, attrs); 
      
        return this._super(type, attrs);
    },
    start : function (c){
    	this._super(c);
    	var slide = document.createElement("img");
    	slide.setAttribute("src", c.opts.src);
    	slide.setAttribute("id", c.opts.id);
    	slide.style.width = "100%";
    	slide.style["max-height"] = "100%";
    	this.el.appendChild(slide);
    },
    end: function(c){
    	this._super(c);
      	this.el.removeChild(this.el.querySelector("img#"+c.opts.id));
    }
});
_V_.Slideshow.options = {
	cuepointfilter : "slideshow",
	width: "497px",
	height: ""
};
//Enable Webcast component
_V_.options.components.webcast = {
	components: {}
};
//Enable slideshow component
_V_.options.components.webcast.components.slideshow = {};