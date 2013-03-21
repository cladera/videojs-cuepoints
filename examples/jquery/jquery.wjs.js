/**
 * Description of wjs
 *
 * @author cgcladera-vancast
 */
(function($){
    $.fn.wjs = function(options){
        var o = {};
        o.video = $.extend($.fn.wjs.defaults.video, options.video);
        o.slides = $.extend($.fn.wjs.defaults.slides, options.slides);
        o.background = $.extend($.fn.wjs.defaults.background, options.background);
        return this.each(function(){
            var e = $(this),
            id = (e.attr("id") != undefined)?e.attr("id"):"wjs",
            v = $("<video></video>");
            //Create video element
            v.attr("id", id+"-video");
            v.addClass("video-js");
            v.addClass(o.video.skin);
            $.each(o.video.sources, function(i, source){
                v.append($('<source src="'+source.src+'" type="'+source.type+'">'));
            });
            
            //Append elements
            e.append(v);
            //Configure Video.js and start cuepoints service when it's ready
            if(typeof _V_ === "function"){
                _V_(v.attr("id")
                    , {
                        "poster": o.video.poster,
                        "preload": o.video.preload,
                        "controls": o.video.controls,
                        "autoplay": o.video.autoplay
                    }
                    , function(){
                        this.addEvent("webcastReady", function (e){
                            var webcast = this.webcast;
                            var cps = {};
                            webcast.addCuepoint("slideshow",0,10,{
                                id: "slide0",
                                src: "http://css3.bradshawenterprises.com/images/Stones.jpg"
                            });
                            webcast.addCuepoint("slideshow",10,30,{
                                id: "slide01",
                                src: "http://css3.bradshawenterprises.com/images/Cirques.jpg"
                            });
                        });
                        this.width(o.video.width);
                        this.height(o.video.height);
                    });
            }else {
                throw new Error("wjs: Video.js library is not included.");
            }
        });
    }
    $.fn.wjs.instances = [];
    $.fn.wjs.defaults = {
        video:{
            skin: "vjs-default-skin",
            poster: "",
            preload: "auto",
            autoplay: true,
            controls: true,
            sources: []
        }
    };
})(jQuery);