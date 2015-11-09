function vjsCuepoints(options) {
    var player = this;
    player.cuepoints = player.cuepoints || {};
    player.cuepoints.init = function(options) {
        player.cuepoints.instances = [];
    };
    player.cuepoints.destroy = function() {
        var i = 0,
            j = player.cuepoints.instances.length;
        for (; i < j; i++) {
            player.cuepoints.instances[i].destroy();
            player.cuepoints.instances[i] = null;
        }
        player.cuepoints.instances = null;
    };
    player.cuepoints._addCuepoint = function(options) {
        var cp = new Cuepoint(player, options);
        cp.activate();
        player.cuepoints.instances.push(cp);
        return cp;
    };
    

    player.addCuepoint = function(options) {
        return player.cuepoints._addCuepoint(options);
    };

    player.destroyCuepoints = function() {
        return player.cuepoints.destroy();
    };

    player.cuepoints.init(options);
}

videojs.plugin('cuepoints', vjsCuepoints);
