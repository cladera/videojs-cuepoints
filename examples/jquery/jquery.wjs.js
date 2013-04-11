/**
 * Description of wjs
 *
 * @author Carles Galan Cladera
 */
(function($){
	var methods = {
		init: function (options){
			var o = {};
	        o.video = $.extend($.fn.wjs.defaults.video, options.video);
	        o.slideshow = $.extend($.fn.wjs.defaults.slideshow, options.slideshow);
	        o.background = $.extend($.fn.wjs.defaults.background, options.background);
	        o.cuepointsservice = $.extend($.fn.wjs.defaults.cuepointsservice, options.cuepointsservice);
	        o.ready = options.ready || function (player){};
			return this.each(function(){
				var element = $(this);
				element.addClass("wjs-container");
	            id = (element.attr("id") != undefined)?element.attr("id"):"wjs"+$(".wjs-container").length;
	            element.attr("id",id);
	            v = $("<video></video>");
	            //Create video element
	            v.attr("id", id+"-video");
	            v.addClass("video-js");
	            v.addClass(o.video.skin);
	            $.each(o.video.sources, function(i, source){
	                v.append($('<source src="'+source.src+'" type="'+source.type+'">'));
	            });
	            //Append elements
	            element.append(v);
	            //Configure Video.js and start cuepoints service when it's ready
	            if(typeof _V_ === "function"){
	            	_V_(v.attr("id")
	                    , {
	                        poster : o.video.poster,
	                        preload : o.video.preload,
	                        controls : o.video.controls,
	                        autoplay : o.video.autoplay,
	                        webcast : {
	                        	slideshow : {
	                        		width : o.slideshow.width
	                        	},
	                        	background : o.background.style
	                        }
	                    }
	                    , function(){
	                        this.addEvent("webcastReady", function (e){
	                        	$.fn.wjs.players[id] = this;                      	
	                            if(o.cuepointsservice.enabled){
	                            	var cps = {};
		                            $.getScript(o.cuepointsservice.host+"/socket.io/socket.io.js", function(){
		                                //create socket
		                                var socket = io.connect(o.cuepointsservice.host+o.cuepointsservice.socket);
		                                socket.emit('subscribe', {
		                                    part: o.cuepointsservice.part, 
		                                    point: o.cuepointsservice.point
		                                });
		                                socket.on('error', function (error){
		                                    console.log(error);
		                                });
		                                socket.on('message', function(data){
		                                    console.log(data);
		                                });
		                                socket.on('cuepoint', function (cuepoint){
		                                    if(!(cuepoint.type in cps))
		                                        cps[cuepoint.type] = [];
		                                    console.log(cuepoint);
		                                    switch(cuepoint.type){
		                                        case "slideshow":
		                                            var opts = {};
		                                            var type_cps = cps[cuepoint.type];
		                                            opts.src = cuepoint.src;
		                                            opts.id = "slide_"+type_cps.length;
		                                            var cp = webcast.addCuepoint(cuepoint.type, cuepoint.start, cuepoint.end||-1, opts);
		                                            if(type_cps.length && type_cps[type_cps.length-1].end < 0)
		                                                type_cps[type_cps.length-1].end = cuepoint.start;
		                                            type_cps.push(cp);
		                                            break;
		                                    }
		                                });
		                            });
		                    	}
		                    	
		                    	//Call ready method
	                        	o.ready.call(element, this);
	                        });
	                        this.width(o.video.width);
	                        this.height(o.video.height);
	                        
	                    });
	            }else {
	                throw new Error("wjs: Video.js library is not included.");
	            }
			});
		},
		addCuepoint: function (type, init, end, params){
			//Add cuepoint method
			var id = $(this).attr("id");
			if(id) {
				var player = $.fn.wjs.players[id];
				if(player){
					player.webcast.addCuepoint(type, init, end, params);
				}else {
					$.error('Webcast element has not been initialized yet');
				}
			}else {
				$.error('Webcast element has not been initialized yet');
			}
		}
	};
    $.fn.wjs = function(method){
    	if ( methods[method] ) {
	    	return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      	return methods.init.apply( this, arguments );
	    } else {
	      	$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    	}
    }
    $.fn.wjs.defaults = {
    	cuepointsservice: {
    		enabled: true,
            point: 0,
            part: 0,
            host: "http://node.webcasting-studio.net:8080",
            socket: "/cuepoints/live" 
        },
        video:{
            skin: "vjs-default-skin",
            poster: "",
            preload: "auto",
            autoplay: true,
            controls: true,
            sources: [],
            width: 475,
            height: 267
        },
        slideshow: {
        	width: 475
        },
        background: {
        	style: ""
        }
    };
    $.fn.wjs.players = {};
})(jQuery);