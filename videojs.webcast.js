/**
* Cuepoint definition
*/

_V_.Cuepoint = function(player, type, start, end, opts){
	//Copy attributes
    this.type = type;
    this.start = start;
    this.end = end;
    this.opts = opts;
    this.player = player;
    this.fired = false; //Set fired flag to false
};

//Cuepoint prototype
_V_.Cuepoint.prototype = {
	activate : function (){
	    //Start listening to timepudate event
	    this.player.addEvent("timeupdate", this.proxy(this._process()));
	    /*this.player.addEvent("timeupdate", function(){
	    	//Check if current time is between start and end
	        if(this.currentTime() >= self.start && this.currentTime() < self.end){
	            if(self.fired) //Do nothing if start has already been called
	                return;
	            self.fired = true; //Set fired flag to true
	            self._start(); //Call start function
	        }else{
	            if(!self.fired) //Do nothing if end has already been called
	                return;
	            self.fired = false; //Set fired flat to false
	            self._end(); //Call end function
	        }
	    });*/
	},
	suspend : function (){
		this.fired = false;
		this.player.removeEvent("timeupdate", this.proxy(this._process()));
	},
	_process: function (){
		//Check if current time is between start and end
        if(this.player.currentTime() >= this.start && this.player.currentTime() < this.end){
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
};

/**
* Webcast Component
*/
//Extends Component
_V_.Webcast = _V_.Component.extend({
    init: function (player, options){
        this._super(player, options);
        //Init webcast
        this.player.wc = 99;
        this.cuepoints = [];
        this.show();
    },
    show : function () {
    	this._super();
    },
    buildCSSClass: function(){
        return " vjs-webcast ";
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

/**
* SyncComponent definition
*/

_V_.SyncComponent = _V_.Component.extend({
    init: function (player, options){
    	//Set options
    	var opts = {};
    	_V_.merge(opts, _V_.SyncComponent.options); //Copy defaults
    	_V_.merge(opts, options); //Override/extend with options from constructor
    	console.log(opts);
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
        console.log(c);
    },
    end : function (c){
        console.log(c);
    }
});
_V_.SyncComponent.options = {
	cuepointfilter : ".*"
};

_V_.Slideshow = _V_.SyncComponent.extend({
    init: function (player, options){
    	//Set options
    	var opts = {};
    	_V_.merge(opts, _V_.Slideshow.options); //Copy defaults
    	_V_.merge(opts, options); //Override/extend with options from constructor
    	console.log(opts);
    	//Call super constructor
        var p = this._super(player, opts);
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
    start : function (c){
    	this._super(c);
      	this.el.innerHTML = "<div>Slide in</div>"; //Testing
    },
    end: function(c){
    	this._super(c);
      	this.el.innerHTML = ""; //Testing
    }
});
_V_.Slideshow.options = {
	cuepointfilter : "slideshow"
};
//Enable Webcast component
_V_.options.components.webcast = {
	components: {}
};
//Enable slideshow component
_V_.options.components.webcast.components.slideshow = {};