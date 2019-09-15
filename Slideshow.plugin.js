//META{"name":"Slideshow"}*//

// Delay (in seconds) between image changes
// Default: 600
var delay = 600;
// Transition speed (in milliseconds)
// Default: 1500
var speed = 1500;
// List of all pictures to use as backgrounds with opacity and color of transparent screen
var backgrounds = [
{link:"https://i.imgur.com/xjmfk81.jpg", opacity:0.5, color:"0, 0, 0"},
{link:"https://i.imgur.com/XDzFDVJ.jpg", opacity:0.55, color:"0, 0, 0"},
{link:"https://i.imgur.com/Ey80Lpp.jpg", opacity:0.65, color:"0, 0, 0"},
{link:"https://i.imgur.com/t0v923r.jpg", opacity:0.5, color:"0, 0, 0"},
{link:"https://i.imgur.com/JTtvGOw.jpg", opacity:0.6, color:"0, 0, 0"},
{link:"https://i.imgur.com/avzaqfC.jpg", opacity:0.55, color:"0, 0, 0"},
{link:"https://i.imgur.com/MPXZh2E.jpg", opacity:0.4, color:"0, 0, 0"},
{link:"https://i.imgur.com/x6oKs2B.jpg", opacity:0.55, color:"0, 0, 0"},
{link:"https://i.imgur.com/0xTS9zY.jpg", opacity:0.45, color:"0, 0, 0"},
{link:"https://i.imgur.com/fEZUUxQ.jpg", opacity:0.5, color:"0, 0, 0"},
{link:"https://i.imgur.com/OBIAgWl.jpg", opacity:0.55, color:"0, 0, 0"}
];

var interval = 0;

class Slideshow {
    getName() { return "Slideshow"; }
    getDescription() { return "Turns the background into a slideshow"; }
    getVersion() { return "2.0"; }
    getAuthor() { return "PseudoResonance"; }

    load() {}

    start() {
		$('#betterdiscord-background').remove();
		$('<div id="betterdiscord-background" style="width:100%;height:100%;left:0px;top:0px;position:absolute;"></div>').insertBefore('#app-mount');
		for (var i = 0; i < backgrounds.length; i++) {
			$('#betterdiscord-background').append('<div style="display:none;width:100%;height:100%;left:0px;top:0px;position:absolute;background-size:cover;z-index:-3;background-image:linear-gradient(to right,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 0%,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 100%),url(' + backgrounds[i].link + ');"></div>');
		}
        $('#betterdiscord-background div:nth-child(1)').show();
		var i = 0;
        interval = window.setInterval(function(){
            i++;
            if (i >= backgrounds.length) {
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
