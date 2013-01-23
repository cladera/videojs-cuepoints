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
		self._setup();
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
	_setup: function (){
		var e = new _V_.Event("cuepointSetup");
		e.cuepoint = this;
		this.player.triggerEvent(e);
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
    	var self = this;
    	var opts = player.options.webcast || {};
        _V_.merge(opts, _V_.Webcast.options);
        player.options.webcast = opts;
        this._super(player, options);
        //Init webcast properties
        this.cuepoints = [];
        this.player.webcast = this;
        //Add ready functions
        this.ready(function() {
        	//Reorder DOM elements
        	this.player.el.parentNode.appendChild(this.el);
        	_V_.insertFirst(this.player.el, this.el);
        });
        this.ready(function(){
        	//Trigger webcast ready event
	        var e = new _V_.Event("webcastReady");
	        e.webcast = this;
	        this.triggerEvent(e);
        });
        
        //Trigger component ready functions when player is ready
        this.player.addEvent("ready", function (){
        	self.triggerReady();
        });
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
//Default webcast options
_V_.Webcast.options = {};

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
        player.addEvent("cuepointSetup", function (event){
        	var c = event.cuepoint;
        	var regExp = new RegExp(options.cuepointFilter, 'ig');
        	if(regExp.test(c.type))
        		self.setup(c);
        });
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
    setup : function (c) {
    	//Setup function
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
        this.el.style.width = opts.width+"px";
        this.el.style.height = opts.height+"px";
        var self = this;
        /*this.player.addEvent("fullscreenchange", function (){
        	if(this.isFullScreen){
        		self.hide();
        	}else {
        		self.show();
        	}
        });*/
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
    setup: function (c) {
    	this.createSlide(c.opts.id, c.opts.src);    	
    },
    start : function (c){
    	this._super(c);
    	this.showSlide(c.opts.id);
    	
    },
    end: function(c){
    	this._super(c);
      	this.hideSlide(c.opts.id);
    },
    getSlide: function (id) {
    	return this.el.querySelector("img#"+id);
    },
    createSlide: function (id, src) {
    	var self = this;
    	var s = _V_.createElement("img", {
    		id: id,
    		src: src,
    		className: "wjs-slide"
    	});
    	s.style.width = "100%";
    	s.style["max-height"] = "100%";
    	s.style.opacity = 0;
    	s.style.visibility = "hidden";
    	s.style.position = "absolute";
    	s.style.top = 0;
    	s.style.left = 0;
    	this.el.appendChild(s);
    },
    hideSlide: function (id) {
    	var s = this.getSlide(id);
    	_V_.removeClass(s, "vjs-fade-in");
    	_V_.addClass(s, "vjs-fade-out");
    },
    showSlide: function (id){
    	var s = this.getSlide(id);
    	_V_.removeClass(s, "vjs-fade-out");
    	_V_.addClass(s, "vjs-fade-in");
    }
});
_V_.Slideshow.options = {
	cuepointfilter : "slideshow",
	width: "400",
	height: "300"
};
//Enable Webcast component
_V_.options.components.webcast = {
	components: {}
};
//Enable slideshow component
_V_.options.components.webcast.components.slideshow = {};