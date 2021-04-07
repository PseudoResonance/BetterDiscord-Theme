/**
 * @name Slideshow
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/Slideshow.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "Slideshow",
			authors:
			[
				{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "4.2.0",
			description: "Turns a transparent Discord background into a slideshow.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/Slideshow.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/Slideshow.plugin.js"
		},
		changelog: [
			{
				title: "Support for Local Images",
				type: "added",
				items: [
					"Images stored on your computer can now be used as backgrounds"
				]
			}
		],
	};
	
	_PseudoSlideshow = null;

	return !global.ZeresPluginLibrary ? class
	{
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load()
		{
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () =>
				{
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) =>
					{
						if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) =>
		{
			const { DiscordAPI, PluginUpdater, PluginUtilities } = Api;
			// List of all pictures to use as backgrounds with opacity and color of transparent screen
			const defaultBackgrounds = [
			{link:"https://i.imgur.com/xjmfk81.jpg", opacity:0.55, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/XDzFDVJ.jpg", opacity:0.65, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/Ey80Lpp.jpg", opacity:0.72, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/t0v923r.jpg", opacity:0.6, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/JTtvGOw.jpg", opacity:0.75, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/avzaqfC.jpg", opacity:0.6, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/MPXZh2E.jpg", opacity:0.65, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/x6oKs2B.jpg", opacity:0.65, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/0xTS9zY.jpg", opacity:0.5, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/fEZUUxQ.jpg", opacity:0.65, color:"0, 0, 0", local: false},
			{link:"https://i.imgur.com/OBIAgWl.jpg", opacity:0.7, color:"0, 0, 0", local: false}
			];
			const defaultDelay = 600;
			const defaultSpeed = 1500;
			
			var fs = require('fs');
			var mime = require('mime-types');
			
			var backgrounds = [];
			var delay = 0;
			var speed = 0;
			
			var interval = 0;
			var backgroundIndex = 0;
			
			var backgroundNode = null;
			var radioCircleTemplate = null;

			return class Slideshow extends Plugin
			{
				constructor()
				{
					super();
					_PseudoSlideshow = this;
					backgroundIndex = this.getData("index", 0);
					delay = this.getData("delay", defaultDelay);
					speed = this.getData("speed", defaultSpeed);
					backgrounds = JSON.parse(this.getData("backgrounds", JSON.stringify(defaultBackgrounds)));
					for (var i = 0; i < backgrounds.length; i++) {
						if (backgrounds[i].local === undefined) {
							backgrounds[i].local = false;
						}
					}
					this.saveBackgrounds();
					radioCircleTemplate = document.createElementNS("http://www.w3.org/2000/svg", "circle")
					radioCircleTemplate.setAttribute("cx", "12");
					radioCircleTemplate.setAttribute("cy", "12");
					radioCircleTemplate.setAttribute("r", "5");
					radioCircleTemplate.setAttribute("fill", "currentColor");
					radioCircleTemplate.classList.add("radioIconForeground-XwlXQN");
				}
	
				onStart()
				{
					PluginUtilities.addStyle(
						'Slideshow-CSS',
						`
						.pseudoslideshow-image {
							opacity:0;
							display:block;
							width:100%;
							height:100%;
							top:0px;
							left:0px;
							position:absolute;
							background-size:cover;
						}
						
						.pseudoslideshow-image.pseudoslideshow-image-visible {
							opacity:1;
						}
						
						.pseudoslideshow-settings {
							color:var(--header-primary);
						}
						
						.pseudoslideshow-table {
							width:100%;
						}
						
						.pseudoslideshow-table, .pseudoslideshow-table-header, .pseudoslideshow-table-row {
							border-right: thin solid #72767d;
							border-collapse: collapse;
						}
						
						.pseudoslideshow-table-header-obj, .pseudoslideshow-table-row-obj {
							border: thin solid #72767d;
							border-collapse: collapse;
						}
						
						.pseudoslideshow-table-row:hover {
							background-color:var(--background-modifier-hover);
						}
						
						.pseudoslideshow-table-header-obj {
							padding:10px;
						}
						
						.pseudoslideshow-table-hint {
							display:block;
							margin-top:5px;
							color:var(--text-muted);
						}
						
						.pseudoslideshow-table-input {
							background-color:transparent;
							padding:10px;
							border:none;
							width:100%;
							color:#f6f6f7;
							font-size:100%;
							box-sizing:border-box;
							-webkit-box-sizing:border-box;
							-moz-box-sizing:border-box;
						}
						
						.pseudoslideshow-table-checkbox {
							width:24px;
							vertical-align:middle;
							border-top:none;
							border-left:none;
							border-bottom:none;
						}
						
						.pseudoslideshow-table-image {
							width:calc(100% - 14rem);
						}
						
						.pseudoslideshow-table-opacity {
							width:6rem;
						}
						
						.pseudoslideshow-table-color {
							width:7rem;
						}
						
						.pseudoslideshow-table-invalid {
							background-color:rgba(240, 71, 71, 0.3);
						}
						`
					);
					this.initializeBackgrounds();
					this.resetImage();
					this.startInterval();
				}
	
				onStop()
				{
					this.stopInterval();
					backgroundNode = document.getElementById('pseudoslideshow-background');
					if (backgroundNode != null) {
						backgroundNode.remove();
					}
					PluginUtilities.removeStyle('Slideshow-CSS');
				}
				
				getData(key, defaultValue) {
					var temp = BdApi.loadData("Slideshow", key, defaultValue);
					if (typeof temp === 'undefined')
						return defaultValue;
					return temp;
				}
				
				initializeBackgrounds() {
					backgroundNode = document.getElementById('pseudoslideshow-background');
					if (backgroundNode != null) {
						backgroundNode.remove();
					}
					var appMount = document.getElementById('app-mount');
					backgroundNode = document.createElement("div");
					backgroundNode.id = "pseudoslideshow-background";
					backgroundNode.style.width = "100%";
					backgroundNode.style.height = "100%";
					backgroundNode.style.left = "0px";
					backgroundNode.style.top = "0px";
					backgroundNode.style.position = "absolute";
					appMount.parentElement.insertBefore(backgroundNode, appMount);
					for (var i = 0; i < backgrounds.length; i++) {
						var imageNode = document.createElement("div");
						imageNode.style.zIndex = "-3";
						imageNode.style.backgroundImage = this.genBackgroundImage(i);
						imageNode.classList.add("pseudoslideshow-image");
						backgroundNode.appendChild(imageNode);
					}
					if (backgroundNode.children.length > 0) {
						backgroundNode.children[0].style.display = "block";
						backgroundNode.children[0].classList.add("pseudoslideshow-image-visible");
					}
				}
	
				startInterval() {
					if (backgroundNode != null) {
						if (backgroundNode.children.length > 1) {
							interval = window.setInterval(function(){
								var lastIndex = backgroundIndex++;
								BdApi.setData("Slideshow", "index", backgroundIndex);
								if (backgroundIndex >= backgroundNode.children.length) {
									backgroundIndex = 0;
								}
								backgroundNode.children[backgroundIndex].style.zIndex = "-1";
								backgroundNode.children[backgroundIndex].style.transition = "opacity " + speed + "ms";
								backgroundNode.children[backgroundIndex].classList.add("pseudoslideshow-image-visible");
								_PseudoSlideshow.updateChecks();
								BdApi.setData("Slideshow", "index", backgroundIndex);
								setTimeout(function() {
									backgroundNode.children[lastIndex].style.transition = "opacity 0s";
									backgroundNode.children[lastIndex].classList.remove("pseudoslideshow-image-visible");
									backgroundNode.children[backgroundIndex].style.zIndex = "-3";
								}, speed + 1);
							}, delay * 1000);
						}
					}
				}
	
				resetImage() {
					if (backgroundNode != null) {
						if (backgroundIndex >= backgroundNode.children.length)
							backgroundIndex = 0;
						if (backgroundIndex < 0)
							backgroundIndex = 0;
						BdApi.setData("Slideshow", "index", backgroundIndex);
						for (var i = 0; i < backgrounds.length; i++) {
							if (i != backgroundIndex) {
								backgroundNode.children[i].style.transition = "opacity 0s";
								backgroundNode.children[i].classList.remove("pseudoslideshow-image-visible");
							} else {
								backgroundNode.children[i].style.transition = "opacity 0s";
								backgroundNode.children[i].classList.add("pseudoslideshow-image-visible");
							}
						}
					}
				}
				
				stopInterval() {
					window.clearInterval(interval);
				}
				
    			getSettingsPanel() {
					var ret = `<div class='pseudoslideshow-settings'><p>PseudoSlideshow Settings - Press enter after editing value to take effect!</p>
					<p style='clear:none; display:inline-block'>Reset all settings to their defaults: </p>
					<button style='display:inline-block' class='button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN' type='button' onclick='_PseudoSlideshow.resetSettings();'>Reset Settings</button>
					<br />
					<p>Delay Between Picture Changes (In Seconds) (Default: 600):&emsp;</p>
					<input id='pseudoslideshow-delay' class='inputDefault-_djjkz input-cIJ7To da-inputDefault da-input noBorder-CTIBpT da-noBorder' onkeydown='_PseudoSlideshow.delayInput(this)' value='` + delay + `'></input>
					<br />
					<p>Transition Speed (In Milliseconds) (Default: 1500):&emsp;</p>
					<input id='pseudoslideshow-speed' class='inputDefault-_djjkz input-cIJ7To da-inputDefault da-input noBorder-CTIBpT da-noBorder' onkeydown='_PseudoSlideshow.speedInput(this)' value='` + speed + `'></input>
					<br />
					<p>Insert Backgrounds:</p>
					<table id='pseudoslideshow-backgrounds' class='pseudoslideshow-table'>
					<tr id='pseudoslideshow-backgrounds-header' class='pseudoslideshow-table-header'><th class='pseudoslideshow-table-row-obj pseudoslideshow-table-checkbox'></th><th class='pseudoslideshow-table-header-obj pseudoslideshow-table-image'>Image <span class='pseudoslideshow-table-hint'>(URL/File Path)</span></th><th class='pseudoslideshow-table-header-obj pseudoslideshow-table-opacity'>Opacity <span class='pseudoslideshow-table-hint'>(0.0-1.0)</span></th><th class='pseudoslideshow-table-header-obj pseudoslideshow-table-color'>Screen Color <span class='pseudoslideshow-table-hint'>(r, g, b)</span></th></tr>` + this.generateBackgroundTable() + `</table></div>`;
					return ret;
				}
				
				generateBackgroundTable() {
					var backgroundList = "";
					for (var i = 0; i < backgrounds.length; i++) {
						backgroundList += `<tr class='pseudoslideshow-table-row'><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-checkbox' onclick='_PseudoSlideshow.check(this);'>`;
						if (backgroundIndex == i)
							backgroundList += `<svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path><circle cx="12" cy="12" r="5" class="radioIconForeground-XwlXQN" fill="currentColor"></circle></svg>`;
						else
							backgroundList += `<svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path></svg>`;
						backgroundList += `</td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-image'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value='` + backgrounds[i].link + `'></input></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-opacity'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value='` + backgrounds[i].opacity + `'></input></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-color'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value='` + backgrounds[i].color + `'></input></td></tr>`;
					}
					backgroundList += this.getEmptyBackgroundTableRow();
					return backgroundList;
				}
				
				getEmptyBackgroundTableRow() {
					return `<tr class='pseudoslideshow-table-row'><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-checkbox' onclick='_PseudoSlideshow.check(this);'><svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path></svg></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-image'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value=''></input></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-opacity'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value=''></input></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-color'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value=''></input></td></tr>`;
				}
				
				toggleCheck(ele, status) {
					if (status) {
						ele.appendChild(radioCircleTemplate.cloneNode());
					} else {
						if (ele.children.length > 1) {
							ele.children[1].remove();
						}
					}
				}
				
				updateChecks() {
					var rowParent = document.getElementById("pseudoslideshow-backgrounds");
					if (rowParent != null) {
						var rows = rowParent.children[0].children;
						for (var i = 0; i < backgrounds.length; i++) {
							if (i != backgroundIndex)
								this.toggleCheck(rows[i + 1].children[0].children[0], false);
							else
								this.toggleCheck(rows[i + 1].children[0].children[0], true);
						}
					}
				}
				
				check(ele) {
					var svg = ele.children[0];
					var row = ele.parentElement;
					var eleId = parseInt(Array.prototype.indexOf.call(row.parentElement.children, row) - 1);
					if (eleId < backgrounds.length) {
						this.toggleCheck(svg, true);
						var rows = ele.parentElement.parentElement.children;
						for (var i = 0; i < backgrounds.length; i++) {
							if (i != eleId)
								this.toggleCheck(rows[i + 1].children[0].children[0], false);
						}
						backgroundIndex = eleId;
						this.stopInterval();
						this.resetImage();
						this.startInterval();
					}
				}
				
				backgroundInput(ele) {
					if(event.key === 'Enter') {
						var row = ele.parentElement.parentElement;
						var eleId = parseInt(Array.prototype.indexOf.call(row.parentElement.children, row) - 1);
						var eleImage = row.children[1].children[0];
						var eleOpacity = row.children[2].children[0];
						var eleColor = row.children[3].children[0];
						var newImage = eleImage.value;
						var newOpacity = eleOpacity.value;
						var newColor = eleColor.value;
						if (eleId >= backgrounds.length) {
							if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
								if (this.isValidFile(newImage)) {
									backgrounds.push({link:newImage, opacity:parseFloat(newOpacity), color:newColor, local:true});
								} else {
									backgrounds.push({link:newImage, opacity:parseFloat(newOpacity), color:newColor, local:false});
								}
								var imageNode = document.createElement("div");
								imageNode.style.zIndex = "-3";
								imageNode.style.backgroundImage = this.genBackgroundImage(eleId);
								imageNode.classList.add("pseudoslideshow-image");
								backgroundNode.appendChild(imageNode);
								this.stopInterval();
								this.startInterval();
								var template = document.createElement("template");
								template.innerHTML = this.getEmptyBackgroundTableRow();
								row.parentElement.appendChild(template.content.firstChild);
								this.saveBackgrounds();
							}
						} else {
							var bgEle = backgroundNode.children[eleId];
							if (newImage.length == 0 && newOpacity.length == 0 && newColor.length == 0) {
								if (eleId <= backgroundIndex) {
									backgroundIndex--;
								}
								backgrounds.splice(eleId, 1);
								bgEle.remove();
								ele.parentElement.parentElement.remove();
								this.stopInterval();
								this.resetImage();
								this.updateChecks();
								this.startInterval();
								this.saveBackgrounds();
							} else {
								if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
									backgrounds[eleId].link = newImage;
									backgrounds[eleId].opacity = parseFloat(newOpacity);
									backgrounds[eleId].color = newColor;
									if (this.isValidFile(newImage)) {
										backgrounds[eleId].local = true;
									} else {
										backgrounds[eleId].local = false;
									}
									bgEle.style.backgroundImage = this.genBackgroundImage(eleId);
									this.saveBackgrounds();
								}
							}
						}
					}
				}
				
				isImageValid(inputUrl, elem) {
					if(this.isValidUrl(inputUrl) || this.isValidFile(inputUrl)) {
						elem.parentElement.classList.remove("pseudoslideshow-table-invalid");
						return true;
					} else {
						elem.parentElement.classList.add("pseudoslideshow-table-invalid");
						return false;
					}
				}
				
				isValidUrl(url) {
					return /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url);
				}
				
				isValidFile(path) {
					try {
						fs.accessSync(path);
						return true;
					} catch (err) {
						return false;
					}
				}
				
				isOpacityValid(inputOpacity, elem) {
					var op = parseFloat(inputOpacity);
					if (!isNaN(op) && op >= 0 && op <= 1) {
						elem.parentElement.classList.remove("pseudoslideshow-table-invalid");
						return true;
					} else {
						elem.parentElement.classList.add("pseudoslideshow-table-invalid");
						return false;
					}
				}
				
				isColorValid(inputColor, elem) {
					var split = inputColor.trim().split(",");
					if (split.length == 3 && this.checkRGBVal(split[0]) && this.checkRGBVal(split[1]) && this.checkRGBVal(split[2])) {
						elem.parentElement.classList.remove("pseudoslideshow-table-invalid");
						return true;
					} else {
						elem.parentElement.classList.add("pseudoslideshow-table-invalid");
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
					if (backgrounds[i].local) {
						var base64 = fs.readFileSync(backgrounds[i].link, {encoding:'base64'});
						var mimeType = mime.lookup(backgrounds[i].link);
						return 'linear-gradient(to right,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 0%,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 100%),url("data:' + mimeType + ';base64,' + base64 + '")';
					} else {
						return 'linear-gradient(to right,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 0%,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 100%),url("' + backgrounds[i].link + '")';
					}
				}
				
				saveBackgrounds() {
					var str = JSON.stringify(backgrounds);
					BdApi.setData("Slideshow", "backgrounds", str);
				}
				
				setDelay(val, setInput = false) {
					BdApi.setData("Slideshow", "delay", val);
					delay = val;
					if (setInput) {
						var delayElem = document.getElementById("pseudoslideshow-delay");
						if (delayElem != null) {
							delayElem.value = val;
						}
					}
					this.stopInterval();
					this.startInterval();
				}
				
				setSpeed(val, setInput = false) {
					BdApi.setData("Slideshow", "speed", val);
					speed = val;
					if (setInput) {
						var delayElem = document.getElementById("pseudoslideshow-speed");
						if (delayElem != null) {
							delayElem.value = val;
						}
					}
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
					backgrounds = JSON.parse(JSON.stringify(defaultBackgrounds));
					this.initializeBackgrounds();
					backgroundIndex = 0;
					this.saveBackgrounds();
					var table = document.getElementById("pseudoslideshow-backgrounds");
					if (table != null) {
						var tbody = table.children[0];
						for (var i = tbody.children.length - 1; i > 0; i--) {
							tbody.children[i].remove();
						}
						var template = document.createElement("template");
						template.innerHTML = this.generateBackgroundTable();
						var newNodes = template.content.childNodes;
						while (newNodes.length > 0) {
							tbody.appendChild(newNodes[0]);
						}
					}
					this.resetImage();
					this.startInterval();
				}
				
			}
			
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
