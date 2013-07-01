function Cuepoint(player,options){
	this.player = player;
	var opts = options || {};
	this.namespace = opts.namespace || "";
	this.start = opts.start || 0;
	this.end = opts.end || -1;
	this.startFn = opts.onStart || function(){};
	this.endFn = opts.onEnd || function(){};
	this.params = opts.params || {};
}
Cuepoint.prototype._setup = function (){
	this.player.trigger("cuepointSetup",this);
}
Cuepoint.prototype._process = function (){
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
}
Cuepoint.prototype._start = function(){
	this.startFn.call(this, this.params);
}
Cuepoint.prototype._end = function(){
	this.endFn.call(this, this.params);
}
Cuepoint.prototype.activate = function(){
	this._setup();
	var self = this;
	this.player.on("timeupdate", function(){
		self._process();
	});
}
function webcastjs(options){
	console.log("Webcast Configured");
	var player = this;
	player.webcast = player.webcast || {};
	player.webcast.init = function(options){
		player.webcast.cuepoints = [];
	}
	player.webcast._addCuepoint = function(options){
		var cp = new Cuepoint(player, options);
		cp.activate();
		player.webcast.cuepoints.push(cp);
	}
	player.webcast.init(options);
};
videojs.Player.prototype.addCuepoint = function(options){
	this.webcast._addCuepoint(options);
	return this;
}
videojs.plugin('webcastjs', webcastjs);