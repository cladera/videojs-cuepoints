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
Cuepoint.prototype._process = function (){
	//Check if current time is between start and end
    if(this.player.currentTime() >= this.start && (this.end < 0 || this.player.currentTime() < this.end)){
        if(this.fired){ //Do nothing if start has already been called
            return;
        }
        this.fired = true; //Set fired flag to true
        this._start(); //Call start function
    }else{
        if(!this.fired){ //Do nothing if end has already been called
            return;
        }
        this.fired = false; //Set fired flat to false
        this._end(); //Call end function
    }
};
Cuepoint.prototype._start = function(){
	this.startFn.call(this, this.params);
};
Cuepoint.prototype._end = function(){
	this.endFn.call(this, this.params);
};
Cuepoint.prototype.activate = function(){
	var self = this;
	this.player.on("timeupdate", function(){
		self._process();
	});
};
Cuepoint.prototype.suspend = function(){
	this.fired = false;
	var self = this;
	this.player.off("timeupdate", function(){
		self._process();
	});
};
function vjsCuepoints(options){
	var player = this;
	player.cuepoints = player.cuepoints || {};
	player.cuepoints.init = function(options){
		player.cuepoints.instances = [];
	};
	player.cuepoints._addCuepoint = function(options){
		var cp = new Cuepoint(player, options);
		cp.activate();
		player.cuepoints.instances.push(cp);
	};
	player.cuepoints.init(options);
}
videojs.Player.prototype.addCuepoint = function(options){
	this.cuepoints._addCuepoint(options);
	return this;
};
videojs.plugin('cuepoints', vjsCuepoints);