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
    	//Create options object
   		player.options.webcast = this.options = player.options.webcast || {};
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
	        this.player.triggerEvent(e);
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
    	//Call super constructor
        var p = this._super(player, options);
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
        this.addEvent("click", this.onClick);
    },
    setup : function (c) {
    	//Setup function
    },
    start : function(c){
        //Start function
    },
    end : function (c){
        //End function 
    },
    onClick: function(){},
    setSize: function (w, h, unit){
    	if(unit == undefined)
    		unit = "px";
    	this.el.style.width = w+unit;
    	this.el.style.height = h+unit;
    },
    zoomIn: function (){
    },
    zoomOut: function (){
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
    	options = this.options = _V_.merge(this.options || {}, options);
    	options = this.options = _V_.merge(this.options, player.options.webcast.slideshow || {});
    	//Call super constructor
        this._super(player, options);
        this.setSize(this.options.width, this.options.height);
        this.zoom = false;
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
    onClick: function () {
    	/*if(this.zoom){
    		this.setSize(this.options.width, this.options.height);
    		this.removeClass("zoom");
    		this.zoom = false;
    		
    	}else {
    		this.setSize("","","");
    		this.addClass("zoom-in");
    		this.zoom = true;
    	}
    	this.triggerEvent("zoomchange");*/
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
    	s.style.width = this.options.width+"px";
    	s.style["max-height"] = "100%";
    	s.style.opacity = 0;
    	s.style.visibility = "hidden";
    	s.style.position = "absolute";
    	this.addEvent("zoomchange", function(){
    		
    		/*if(this.zoom){
    			s.style.width = "";
    		}else {
    			s.style.width = this.options.width+"px";
    		}*/
    	});
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
//Enable Webcast component
_V_.options.components.webcast = {
	components: {}
};
//Enable slideshow component
_V_.options.components.webcast.components.slideshow =  {
	cuepointfilter : "slideshow",
	width: 400,
	height: 300
};
