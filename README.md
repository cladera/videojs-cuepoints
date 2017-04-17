VideoJS Cuepoints
==================
## HTML5 Sync Cuepoints Plugin

VideoJS Cue Points is a plugin for Video JS player. With this plugin you can
sync actions with the media timeline and make the viewers experiences richer. 

## Installation
Add videojs.cuepoints.js, just after
videojs:

	<html>
    <head>
      <link href="http://vjs.zencdn.net/4.0/video-js.css" rel="stylesheet">
      <script src="http://vjs.zencdn.net/4.0/video.js"></script>
      <script src="dist/videojs.cuepoints.js"></script>
    </head>
      ....

**Warning!** Hosted version will be removed July 3rd. From now on, in order to use this library clone/download this project and use files in dist/ folder.

## Usage
When videojs is ready, initialize the plugin and use the function `addCuepoint` to sync actions
with the timeline:

	<script>
		videojs("myVideo").ready(function(){
			this.cuepoints();
			this.addCuepoint({
				namespace: "logger",
				start: 0,
				end: 30,
				onStart: function(params){
					if(params.error){
						console.error("Error at second 0");
					}else{
						console.log("Log at second 0");
					}
				},
				onEnd: function(params){
					console.log("Action ends at second 30");
				},
				params: {error: false}
			});
		});
	</script>
	
## Please, fork me!
I have a lot of things to learn yet (one of them is my English). So, fork me and help me to improve
the project.
Thanks! ;)
