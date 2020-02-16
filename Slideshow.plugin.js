//META{"name":"Slideshow","displayName":"Background Slideshow"}*//

var defaultBackgrounds = [
{link:"https://i.imgur.com/xjmfk81.jpg", opacity:0.55, color:"0, 0, 0"},
{link:"https://i.imgur.com/XDzFDVJ.jpg", opacity:0.65, color:"0, 0, 0"},
{link:"https://i.imgur.com/Ey80Lpp.jpg", opacity:0.72, color:"0, 0, 0"},
{link:"https://i.imgur.com/t0v923r.jpg", opacity:0.6, color:"0, 0, 0"},
{link:"https://i.imgur.com/JTtvGOw.jpg", opacity:0.75, color:"0, 0, 0"},
{link:"https://i.imgur.com/avzaqfC.jpg", opacity:0.6, color:"0, 0, 0"},
{link:"https://i.imgur.com/MPXZh2E.jpg", opacity:0.65, color:"0, 0, 0"},
{link:"https://i.imgur.com/x6oKs2B.jpg", opacity:0.65, color:"0, 0, 0"},
{link:"https://i.imgur.com/0xTS9zY.jpg", opacity:0.5, color:"0, 0, 0"},
{link:"https://i.imgur.com/fEZUUxQ.jpg", opacity:0.65, color:"0, 0, 0"},
{link:"https://i.imgur.com/OBIAgWl.jpg", opacity:0.7, color:"0, 0, 0"}
];

var defaultDelay = 600;
var defaultSpeed = 1500;

var backgrounds = [];
var delay = 0;
var speed = 0;

var interval = 0;
var backgroundIndex = 0;

var Slideshow = (() => {
	const config = {
		info: {
			name: "Slideshow",
			authors: [{name: "PseudoResonance"}],
			version: "4.0.1",
			description: "Makes the background a slideshow",
		},
		main: "index.js",
		defaultConfig: []
	};

	return !global.ZeresPluginLibrary ? class {
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(x => x.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }

		load() {
			const zlibMissing = !global.ZeresPluginLibrary;
			const header = `Missing Library`;
			const content = `The ZeresPluginLibrary required for ${this.name} is missing.`;
			const ModalStack = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
			const TextElement = BdApi.findModuleByProps('Sizes', 'Weights');
			const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() === 'confirm-modal');
			const onFail = () => BdApi.getCore().alert(header, `${content}<br/>Due to a slight mishap however, you'll have to download the libraries yourself. After opening the links, do CTRL + S to download the library.<br/>${(zlibMissing && '<br/><a href="https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"target="_blank">Click here to download ZeresPluginLibrary</a>') || ''}`);
			if (!ModalStack || !ConfirmationModal || !TextElement) return onFail();
			ModalStack.push(props => {
				return BdApi.React.createElement(
					ConfirmationModal,
					Object.assign({
						header,
						children: [BdApi.React.createElement(TextElement, { color: TextElement.Colors.PRIMARY, children: [`${content} Please click Download Now to install it`] })],
						red: false,
						confirmText: 'Download Now',
						cancelText: 'Cancel',
						onConfirm: () => {
							const request = require('request');
							const fs = require('fs');
							const path = require('path');
							const waitForLibLoad = callback => {
								if (!global.BDEvents) return callback();
								const onLoaded = e => {
									if (e !== 'ZeresPluginLibrary') return;
									BDEvents.off('plugin-loaded', onLoaded);
									callback();
								};
								BDEvents.on('plugin-loaded', onLoaded);
							};
							if (!global.ZeresPluginLibrary) {
							request('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (error, response, body) => {
								if (error) return onFail();
								waitForLibLoad(downloadXenoLib);
								fs.writeFile(path.join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, () => {});
								});
							}
						}
					}, props)
				);
			});
		}
		start() {}
		stop() {}
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {

			return class Slideshow extends Plugin {
				
				onStart() {
					backgroundIndex = this.getData("index", 0);
					delay = this.getData("delay", defaultDelay);
					speed = this.getData("speed", defaultSpeed);
					backgrounds = JSON.parse(this.getData("backgrounds", JSON.stringify(defaultBackgrounds)));
					this.initializeBackgrounds();
					this.resetImage();
					this.startInterval();
				}
	
				onStop() {
					this.stopInterval();
					$('#betterdiscord-background').remove();
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
						BdApi.setData("Slideshow", "index", backgroundIndex);
						if (backgroundIndex >= backgrounds.length) {
							$('#betterdiscord-background div:nth-child(1)').css("z-index", "-1").fadeIn(speed);
							BdApi.getPlugin("Slideshow").updateChecks(backgroundIndex);
							setTimeout(function() {
								$('#betterdiscord-background div:nth-child(' + backgroundIndex + ')').hide();
								backgroundIndex = 0;
								BdApi.setData("Slideshow", "index", backgroundIndex);
								$('#betterdiscord-background div:nth-child(1)').css("z-index", "-3");
							}, speed + 1);
						} else {
							$('#betterdiscord-background div:nth-child(' + (backgroundIndex + 1) + ')').css("z-index", "-1").fadeIn(speed);
							BdApi.getPlugin("Slideshow").updateChecks(backgroundIndex);
							setTimeout(function() {
								$('#betterdiscord-background div:nth-child(' + backgroundIndex + ')').hide();
								$('#betterdiscord-background div:nth-child(' + (backgroundIndex + 1) + ')').css("z-index", "-3");
							}, speed + 1);
						}
					}, delay * 1000);
				}
				
				resetImage() {
					if (backgroundIndex >= backgrounds.length)
						backgroundIndex = 0;
					BdApi.setData("Slideshow", "index", backgroundIndex);
					for (var i = 1; i <= backgrounds.length; i++) {
						$('#betterdiscord-background div:nth-child(' + i + ')').hide();
					}
					$('#betterdiscord-background div:nth-child(' +  (backgroundIndex + 1) + ')').show();
				}
				
				stopInterval() {
					window.clearInterval(interval);
				}

				getSettingsPanel() {
					var backgroundList = "";
					for (var i = 0; i < backgrounds.length; i++) {
						backgroundList += `<tr class='pseudotable-row'><td class='pseudotable-row-obj pseudotable-checkbox'>`;
						if (backgroundIndex == i)
							backgroundList += `<label class='checkboxWrapper-SkhIWG da-checkboxWrapper alignTop-1ntJ4-'><input class='inputDefault-3JxKJ2 input-3ITkQf da-inputDefault da-input' type='checkbox' style='width: 24px; height: 24px;' onclick='BdApi.getPlugin("Slideshow").check(this);' checked><div class='checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs da-checkbox da-flexCenter da-flex da-justifyCenter da-alignCenter box-mmYMsp checked-3_4uQ9 da-checked' style='width: 24px; height: 24px; border-color: rgb(114, 137, 218);'><svg name='Checkmark' aria-hidden='true' width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><polyline stroke='#7289da' stroke-width='2' points='3.5 9.5 7 13 15 5'></polyline></g></svg></div></label>`;
						else
							backgroundList += `<label class='checkboxWrapper-SkhIWG da-checkboxWrapper alignTop-1ntJ4-'><input class='inputDefault-3JxKJ2 input-3ITkQf da-inputDefault da-input' type='checkbox' style='width: 24px; height: 24px;' onclick='BdApi.getPlugin("Slideshow").check(this);'><div class='checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs da-checkbox da-flexCenter da-flex da-justifyCenter da-alignCenter box-mmYMsp' style='width: 24px; height: 24px;'><svg name='Checkmark' aria-hidden='true' width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><polyline stroke='transparent' stroke-width='2' points='3.5 9.5 7 13 15 5'></polyline></g></svg></div></label>`;
						backgroundList += `</td><td class='pseudotable-row-obj pseudotable-image'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value='` + backgrounds[i].link + `'></input></td><td class='pseudotable-row-obj pseudotable-opacity'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value='` + backgrounds[i].opacity + `'></input></td><td class='pseudotable-row-obj pseudotable-color'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value='` + backgrounds[i].color + `'></input></td></tr>`;
					}
					backgroundList += `<tr class='pseudotable-row'><td class='pseudotable-row-obj pseudotable-checkbox'><label class='checkboxWrapper-SkhIWG da-checkboxWrapper alignTop-1ntJ4-'><input class='inputDefault-3JxKJ2 input-3ITkQf da-inputDefault da-input' type='checkbox' style='width: 24px; height: 24px;' onclick='BdApi.getPlugin("Slideshow").check(this);'><div class='checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs da-checkbox da-flexCenter da-flex da-justifyCenter da-alignCenter box-mmYMsp' style='width: 24px; height: 24px;'><svg name='Checkmark' aria-hidden='true' width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><polyline stroke='transparent' stroke-width='2' points='3.5 9.5 7 13 15 5'></polyline></g></svg></div></label></td><td class='pseudotable-row-obj pseudotable-image'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-opacity'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-color'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td></tr>`;
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
					<tr id='pseudoslideshow-backgrounds-header' class='pseudotable-header'><th class='pseudotable-row-obj pseudotable-checkbox'></th><th class='pseudotable-header-obj pseudotable-image'>Image <span class='pseudotable-hint'>(URL)</span></th><th class='pseudotable-header-obj pseudotable-opacity'>Opacity <span class='pseudotable-hint'>(0.0-1.0)</span></th><th class='pseudotable-header-obj pseudotable-color'>Screen Color <span class='pseudotable-hint'>(r, g, b)</span></th></tr>` + backgroundList + `</table>`;
					return ret;
				}
				
				toggleCheck(ele, status) {
					var jElem = $(ele.nextSibling);
					var check = jElem.children().eq(0).children().eq(0).children().eq(0);
					if (status) {
						ele.checked = true;
						jElem.css('border-color', 'rgb(114, 137, 218)');
						jElem.addClass('checked-3_4uQ9 da-checked');
						check.attr('stroke', '#7289da');
					} else {
						ele.checked = false;
						jElem.css('border-color', '');
						jElem.removeClass('checked-3_4uQ9 da-checked');
						check.attr('stroke', 'transparent');
					}
				}
				
				updateChecks(id) {
					var rowParent = document.getElementById("pseudoslideshow-backgrounds");
					if (rowParent != null) {
						var rows = rowParent.children[0].children;
						for (var i = 0; i < backgrounds.length; i++) {
							if (i != id)
								this.toggleCheck(rows[i + 1].children[0].children[0].children[0], false);
							else
								this.toggleCheck(rows[i + 1].children[0].children[0].children[0], true);
						}
					}
				}
	
				check(ele) {
					if (ele.checked) {
						var eleId = parseInt(ele.parentElement.parentElement.parentElement.index() - 1);
						if (eleId < backgrounds.length) {
							this.toggleCheck(ele, true);
							var rows = ele.parentElement.parentElement.parentElement.parentElement.children;
							for (var i = 0; i < backgrounds.length; i++) {
								if (i != eleId)
									this.toggleCheck(rows[i + 1].children[0].children[0].children[0], false);
								}
							backgroundIndex = eleId;
							this.stopInterval();
							this.resetImage();
							this.startInterval();
						} else
							ele.checked = false;
					} else
						ele.checked = true;
				}
				
				backgroundInput(ele) {
					if(event.key === 'Enter') {
						var eleId = parseInt(ele.parentElement.parentElement.index() - 1);
						var row = $(ele.parentElement.parentElement);
						var eleImage = row.children().eq(1).children().eq(0);
						var eleOpacity = row.children().eq(2).children().eq(0);
						var eleColor = row.children().eq(3).children().eq(0);
						if (eleId >= backgrounds.length) {
							var newImage = eleImage.val();
							var newOpacity = eleOpacity.val();
							var newColor = eleColor.val();
							if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
								backgrounds.push({link:newImage, opacity:parseFloat(newOpacity), color:newColor});
								$('#betterdiscord-background').append('<div style="display:none;width:100%;height:100%;left:0px;top:0px;position:absolute;background-size:cover;z-index:-3;background-image:' + this.genBackgroundImage(eleId) + '"></div>');
								this.stopInterval();
								this.startInterval();
								$('#pseudoslideshow-backgrounds').append(`<tr class='pseudotable-row'><td class='pseudotable-row-obj pseudotable-checkbox'><label class='checkboxWrapper-SkhIWG da-checkboxWrapper alignTop-1ntJ4-'><input class='inputDefault-3JxKJ2 input-3ITkQf da-inputDefault da-input' type='checkbox' style='width: 24px; height: 24px;' onclick='BdApi.getPlugin("Slideshow").check(this);'><div class='checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs da-checkbox da-flexCenter da-flex da-justifyCenter da-alignCenter box-mmYMsp' style='width: 24px; height: 24px;'><svg name='Checkmark' aria-hidden='true' width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><polyline stroke='transparent' stroke-width='2' points='3.5 9.5 7 13 15 5'></polyline></g></svg></div></label></td><td class='pseudotable-row-obj pseudotable-image'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-opacity'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td><td class='pseudotable-row-obj pseudotable-color'><input class='pseudotable-input' onkeydown='BdApi.getPlugin("Slideshow").backgroundInput(this)' value=''></input></td></tr>`);
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
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
