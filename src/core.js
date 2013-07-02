function webcastjs(options){
	var player = this;
	player.webcast = player.webcast || {};
	player.webcast.init = function(options){
		player.webcast.cuepoints = [];
	};
	player.webcast._addCuepoint = function(options){
		var cp = new Cuepoint(player, options);
		cp.activate();
		player.webcast.cuepoints.push(cp);
	};
	player.webcast.init(options);
}
videojs.Player.prototype.addCuepoint = function(options){
	this.webcast._addCuepoint(options);
	return this;
};
videojs.plugin('webcastjs', webcastjs);