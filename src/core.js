function vjsCuepoints(options){
	var player = this;
	player.cuepoints = player.cuepoints || {};
	player.cuepoints.init = function(options){
		player.cuepoints.instances = [];
	};
	player.cuepoints.destroy = function(){
		var i = 0,
			j = player.cuepoints.instances.length
		;
		for (; i < j; i++) {
			player.cuepoints.instances[i].destroy();
			player.cuepoints.instances[i] = null;
		}
		player.cuepoints.instances = null;
	};
	player.cuepoints._addCuepoint = function(options){
		var cp = new Cuepoint(player, options);
		cp.activate();
		player.cuepoints.instances.push(cp);
		return cp;
	};
	player.cuepoints.init(options);
}
videojs.Player.prototype.addCuepoint = function(options){
	return this.cuepoints._addCuepoint(options);
};
videojs.Player.prototype.destroyCuepoints = function(){
	return this.cuepoints.destroy();
};
videojs.plugin('cuepoints', vjsCuepoints);