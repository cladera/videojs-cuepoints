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
		return cp;
	};
	player.cuepoints.init(options);
}
videojs.Player.prototype.addCuepoint = function(options){
	return this.cuepoints._addCuepoint(options);
};
videojs.plugin('cuepoints', vjsCuepoints);