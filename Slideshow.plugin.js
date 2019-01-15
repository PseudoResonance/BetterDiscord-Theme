//META{"name":"Slideshow"}*//

// Delay (in seconds) between image changes
var delay = 600;
// Transition speed (in milliseconds)
var speed = 1500;
// List of all pictures to use as backgrounds
var links = ["https://i.imgur.com/Ey80Lpp.jpg", "https://i.imgur.com/t0v923r.jpg", "https://i.imgur.com/JTtvGOw.jpg", "https://i.imgur.com/avzaqfC.jpg", "https://i.imgur.com/MPXZh2E.jpg", "https://i.imgur.com/x6oKs2B.jpg", "https://i.imgur.com/0xTS9zY.jpg", "https://i.imgur.com/fEZUUxQ.jpg", "https://i.imgur.com/OBIAgWl.jpg"];
// Opacity of each picture to use as a background
var opacity = [0.6, 0.5, 0.6, 0.5, 0.3, 0.50, 0.4, 0.45, 0.5];
// Color of transparent screen over background
var screenColor = ["0, 0, 0", "0, 0, 0", "0, 0, 0", "0, 0, 0", "0, 0, 0", "0, 0, 0", "0, 0, 0", "0, 0, 0", "0, 0, 0"];

var hasRun = false;
var interval = 0;

class Slideshow {
    getName() { return "Slideshow"; }
    getDescription() { return "Turns the background into a slideshow"; }
    getVersion() { return "1.0"; }
    getAuthor() { return "PseudoResonance"; }

    load() {}

    start() {
		if (!hasRun) {
			hasRun = true;
			$('<div id="betterdiscord-background" style="width:100%;height:100%;left:0px;top:0px;position:absolute;"></div>').insertBefore('#app-mount');
			for (var i = 0; i < links.length; i++) {
				$('#betterdiscord-background').append('<div style="display:none;width:100%;height:100%;left:0px;top:0px;position:absolute;background-size:cover;z-index:-3;background-image:linear-gradient(to right,rgba(' + screenColor[i] + ', ' + opacity[i] + ') 0%,rgba(' + screenColor[i] + ', ' + opacity[i] + ') 100%),url(' + links[i] + ');"></div>');
			}
		}
        $('#betterdiscord-background div:nth-child(1)').show();
		var i = 0;
        interval = window.setInterval(function(){
            i++;
            if (i >= links.length) {
				$('#betterdiscord-background div:nth-child(1)').css("z-index", "-1").fadeIn(speed);
				setTimeout(function() {
					$('#betterdiscord-background div:nth-child(' + i + ')').hide();
					i = 0;
					$('#betterdiscord-background div:nth-child(1)').css("z-index", "-3");
				}, speed + 1);
            } else {
				$('#betterdiscord-background div:nth-child(' + (i + 1) + ')').css("z-index", "-1").fadeIn(speed);
				setTimeout(function() {
					$('#betterdiscord-background div:nth-child(' + i + ')').hide();
					$('#betterdiscord-background div:nth-child(' + (i + 1) + ')').css("z-index", "-3");
				}, speed + 1);
			}
        }, delay * 1000);
    }

    initialize() {}

    stop() {
        window.clearInterval(interval);
    }

}
