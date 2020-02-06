//META{"name":"Slideshow"}*//

// List of all pictures to use as backgrounds with opacity and color of transparent screen
var defaultBackgrounds = [
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

var defaultDelay = 600;
var defaultSpeed = 1500;

var backgrounds = [];
var delay = 0;
var speed = 0;

var interval = 0;
var backgroundIndex = 0;

class Slideshow {
    getName() { return "Slideshow"; }
    getDescription() { return "Turns the background into a slideshow"; }
    getVersion() { return "3.0"; }
    getAuthor() { return "PseudoResonance"; }

    start() {
		this.initializeBackgrounds();
		this.startInterval();
    }

    stop() {
		this.stopInterval();
		$('#betterdiscord-background').remove();
    }

    load() {
		var temp = 
		delay = this.getData("delay", defaultDelay);
		speed = this.getData("speed", defaultSpeed);
		backgrounds = JSON.parse(this.getData("backgrounds", JSON.stringify(defaultBackgrounds)));
    }
	
	getData(key, defaultValue) {
		var temp = BdApi.loadData("Slideshow", key, defaultValue);
		if (typeof temp === 'undefined')
			return defaultValue;
		return temp;
	}
	
	initializeBackgrounds() {
		$('#betterdiscord-background').remove();
		$('<div id="betterdiscord-background" style="width:100%;height:100%;left:0px;top:0px;position:absolute;"></div>').insertBefore('#app-mount');
		for (var i = 0; i < backgrounds.length; i++) {
			$('#betterdiscord-background').append('<div style="display:none;width:100%;height:100%;left:0px;top:0px;position:absolute;background-size:cover;z-index:-3;background-image:' + this.genBackgroundImage(i) + '"></div>');
		}
        $('#betterdiscord-background div:nth-child(1)').show();
	}
	
	startInterval() {
        interval = window.setInterval(function(){
            backgroundIndex++;
            if (backgroundIndex >= backgrounds.length) {
				$('#betterdiscord-background div:nth-child(1)').css("z-index", "-1").fadeIn(speed);
				setTimeout(function() {
					$('#betterdiscord-background div:nth-child(' + backgroundIndex + ')').hide();
					backgroundIndex = 0;
					$('#betterdiscord-background div:nth-child(1)').css("z-index", "-3");
				}, speed + 1);
            } else {
				$('#betterdiscord-background div:nth-child(' + (backgroundIndex + 1) + ')').css("z-index", "-1").fadeIn(speed);
				setTimeout(function() {
					$('#betterdiscord-background div:nth-child(' + backgroundIndex + ')').hide();
					$('#betterdiscord-background div:nth-child(' + (backgroundIndex + 1) + ')').css("z-index", "-3");
				}, speed + 1);
			}
        }, delay * 1000);
	}
	
	resetImage() {
        backgroundIndex = 0;
		for (var i = 1; i < backgrounds.length; i++) {
			$('#betterdiscord-background div:nth-child(' + i + ')').hide();
		}
		$('#betterdiscord-background div:nth-child(1)').show();
	}
	
	stopInterval() {
        window.clearInterval(interval);
	}

    getSettingsPanel() {
		var backgroundList = "";
		for (var i = 0; i < backgrounds.length; i++) {
			backgroundList += `<tr class='pseudotable-row'><td class='pseudotable-row-obj pseudotable-image'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value='` + backgrounds[i].link + `'></input></td><td class='pseudotable-row-obj pseudotable-opacity'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value='` + backgrounds[i].opacity + `'></input></td><td class='pseudotable-row-obj pseudotable-color'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value='` + backgrounds[i].color + `'></input></td></tr>`
		}
		backgroundList += `<tr class='pseudotable-row'><td class='pseudotable-row-obj pseudotable-image'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-opacity'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-color'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td></tr>`
		var ret = `<p>PseudoSlideshow Settings - Press enter after editing value to take effect!</p>
		<p style='clear:none; display:inline-block'>Reset all settings to their defaults: </p>
		<button style='display:inline-block' class='bd-pfbtn' onclick='BdApi.getPlugin("Slideshow").resetSettings();'>Reset Settings</button>
		<br />
		<p>Delay Between Picture Changes (In Seconds) (Default: 600):&emsp;</p>
		<input id='pseudoslideshow-delay' class='inputDefault-_djjkz input-cIJ7To da-inputDefault da-input noBorder-CTIBpT da-noBorder' onkeydown='BdApi.getPlugin("Slideshow").delayInput(this)' value='` + delay + `'></input>
		<br />
		<p>Transition Speed (In Milliseconds) (Default: 1500):&emsp;</p>
		<input id='pseudoslideshow-speed' class='inputDefault-_djjkz input-cIJ7To da-inputDefault da-input noBorder-CTIBpT da-noBorder' onkeydown='BdApi.getPlugin("Slideshow").speedInput(this)' value='` + speed + `'></input>
		<br />
		<p>Insert Backgrounds:</p>
		<table id='pseudoslideshow-backgrounds' class='pseudotable'>
		<tr id='pseudoslideshow-backgrounds-header' class='pseudotable-header'><th class='pseudotable-header-obj pseudotable-image'>Image <span class='pseudotable-hint'>(URL)</span></th><th class='pseudotable-header-obj pseudotable-opacity'>Opacity <span class='pseudotable-hint'>(0.0-1.0)</span></th><th class='pseudotable-header-obj pseudotable-color'>Screen Color <span class='pseudotable-hint'>(r, g, b)</span></th></tr>` + backgroundList + `</table>`;
		return ret;
	}
	
	backgroundInput(ele) {
		if(event.key === 'Enter') {
			var eleId = parseInt(ele.parentElement.parentElement.index() - 1);
			var row = $(ele.parentElement.parentElement);
			var eleImage = row.children().eq(0).children().eq(0);
			var eleOpacity = row.children().eq(1).children().eq(0);
			var eleColor = row.children().eq(2).children().eq(0);
			if (eleId >= backgrounds.length) {
				var newImage = eleImage.val();
				var newOpacity = eleOpacity.val()
				var newColor = eleColor.val()
				if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
					backgrounds.push({link:newImage, opacity:parseFloat(newOpacity), color:newColor})
					$('#betterdiscord-background').append('<div style="display:none;width:100%;height:100%;left:0px;top:0px;position:absolute;background-size:cover;z-index:-3;background-image:' + this.genBackgroundImage(eleId) + '"></div>');
					this.stopInterval();
					this.startInterval();
					$('#pseudoslideshow-backgrounds').append(`<tr class='pseudotable-row'><td class='pseudotable-row-obj pseudotable-image'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-opacity'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-color'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td></tr>`);
					this.saveBackgrounds();
				}
			} else {
				var bgEle = $('#betterdiscord-background div:nth-child(' + (eleId + 1) + ')');
				var newImage = eleImage.val();
				var newOpacity = eleOpacity.val()
				var newColor = eleColor.val()
				if (newImage.length == 0 && newOpacity.length == 0 && newColor.length == 0) {
					backgrounds.splice(eleId, 1);
					bgEle.remove();
					ele.parentElement.parentElement.remove();
					this.stopInterval();
					this.resetImage();
					this.startInterval();
					this.saveBackgrounds();
				} else {
					if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
						backgrounds[eleId].link = newImage;
						backgrounds[eleId].opacity = parseFloat(newOpacity);
						backgrounds[eleId].color = newColor;
						bgEle.css("background-image", this.genBackgroundImage(eleId));
						this.saveBackgrounds();
					}
				}
			}
		}
	}
	
	isImageValid(inputUrl, elem) {
		if(/^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(inputUrl)) {
			elem.parent().removeClass('pseudoslideshow-invalid');
			return true;
		} else {
			elem.parent().addClass('pseudoslideshow-invalid');
			return false;
		}
	}
	
	isOpacityValid(inputOpacity, elem) {
		var op = parseFloat(inputOpacity);
		if (!isNaN(op) && op >= 0 && op <= 1) {
			elem.parent().removeClass('pseudoslideshow-invalid');
			return true;
		} else {
			elem.parent().addClass('pseudoslideshow-invalid');
			return false;
		}
	}
	
	isColorValid(inputColor, elem) {
		var split = inputColor.trim().split(",");
		if (split.length == 3 && this.checkRGBVal(split[0]) && this.checkRGBVal(split[1]) && this.checkRGBVal(split[2])) {
			elem.parent().removeClass('pseudoslideshow-invalid');
			return true;
		} else {
			elem.parent().addClass('pseudoslideshow-invalid');
			return false;
		}
	}
	
	checkRGBVal(val) {
		var num = parseInt(val);
		if (!isNaN(num) && num >= 0 && num <= 255)
			return true;
		return false;
	}
	
	genBackgroundImage(i) {
		return 'linear-gradient(to right,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 0%,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 100%),url(' + backgrounds[i].link + ')';
	}
	
	saveBackgrounds() {
		var str = JSON.stringify(backgrounds);
		BdApi.setData("Slideshow", "backgrounds", str);
		console.log("Saved backgrounds:");
		console.log(str);
	}
	
	setDelay(val, setInput = false) {
		BdApi.setData("Slideshow", "delay", val);
		delay = val;
		if (setInput)
			$('#pseudoslideshow-delay').val(val);
		this.stopInterval();
		this.startInterval();
		console.log("Set slideshow delay to " + val);
	}
	
	setSpeed(val, setInput = false) {
		BdApi.setData("Slideshow", "speed", val);
		speed = val;
		if (setInput)
			$('#pseudoslideshow-speed').val(val);
		console.log("Set slideshow speed to " + val);
	}
	
	delayInput(ele) {
		if(event.key === 'Enter') {
			if (!isNaN(ele.value) && ele.value.length > 0) {
				this.setDelay(ele.value);
			}
		}
	}
	
	speedInput(ele) {
		if(event.key === 'Enter') {
			if (!isNaN(ele.value) && ele.value.length > 0) {
				this.setSpeed(ele.value);
			}
		}
	}
	
	resetSettings() {
		this.setDelay(defaultDelay, true);
		this.setSpeed(defaultSpeed, true);
	}

}
