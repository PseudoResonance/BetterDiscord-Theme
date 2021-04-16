/**
 * @name Slideshow
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/Slideshow.plugin.js
 */

//TODO Allow for dragging rows around or some sort of reordering rows - SortableJS
//https://github.com/SortableJS/Sortable

module.exports = (() => {
	
	const BackgroundFill =
	{
		Cover: "cover",
		Contain: "contain",
		Full: "full",
		Stretch: "100% 100%"
	};
	
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
			version: "4.3.0",
			description: "Turns a transparent Discord background into a slideshow.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/Slideshow.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/Slideshow.plugin.js"
		},
		changelog:
		[
			{
				title: "Reorder Images",
				type: "added",
				items:
				[
					"Background images can be dragged and dropped to reorder",
					"Option to shuffle images",
					"Different image fill options"
				]
			},
			{
				title: "Deny Invalid Settings",
				type: "fixed",
				items:
				[
					"An invalid speed/delay can no longer be entered"
				]
			}
		],
		defaultConfig:
		[
			{
				type: 'category',
				id: 'general',
				name: 'General Settings',
				collapsible: true,
				shown: true,
				settings:
				[
					{
						name: 'Delay Between Picture Changes',
						note: '(Seconds) (Default: 600) (0 to Disable)',
						id: 'delay',
						type: 'textbox',
						value: '600'
					},
					{
						name: 'Transition Speed',
						note: '(Milliseconds) (Default: 1500)',
						id: 'speed',
						type: 'textbox',
						value: '1500'
					},
					{
						name: 'Shuffle Backgrounds',
						id: 'imageShuffle',
						type: 'switch',
						value: false
					},
					{
						name: 'Background Fill',
						id: 'imageFill',
						type: 'dropdown',
						value: BackgroundFill.Cover,
						options:
						[
							{label: "Cover", value: BackgroundFill.Cover},
							{label: "Contain", value: BackgroundFill.Contain},
							{label: "Full", value: BackgroundFill.Full},
							{label: "Stretch", value: BackgroundFill.Stretch}
						]
					}
				]
			}
		]
	};
	
	_PseudoSlideshow = null; // Global variable for events/callbacks

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
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

		const plugin = (Plugin, Api) => {
			const { Settings, DOMTools, PluginUtilities } = Api;
			// Set of default backgrounds
			// URL/File path, opacity/color of transparent screen, and whether it is a local file
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
			
			// File system and mime types for reading local files
			var fs = require('fs');
			var mime = require('mime-types');
			
			// In-use backgrounds
			var backgrounds = [];
			// Timer ID until next transition
			var interval = 0;
			// Current background index
			var backgroundIndex = 0;
			
			// Node for background images
			var backgroundNode = null;
			// Node for drag-and-drop overlay
			var overlayNode = null;
			// Template for radio circle
			var radioCircleTemplate = null;
			
			// Data used in drag-and-drop calculations
			var tableDragData = null;

			return class Slideshow extends Plugin {
				
				// Initialize plugin
				constructor() {
					super();
					_PseudoSlideshow = this;
					// Load backgrounds/index
					backgroundIndex = this.getData("index", 0);
					backgrounds = JSON.parse(this.getData("backgrounds", JSON.stringify(defaultBackgrounds)));
					// Compatibility check to update old data
					for (var i = 0; i < backgrounds.length; i++) {
						if (backgrounds[i].local === undefined) {
							backgrounds[i].local = false;
						}
					}
					// Save data to ensure it is properly stored
					this.saveBackgrounds();
					// Create radio circle template
					radioCircleTemplate = document.createElementNS("http://www.w3.org/2000/svg", "circle")
					radioCircleTemplate.setAttribute("cx", "12");
					radioCircleTemplate.setAttribute("cy", "12");
					radioCircleTemplate.setAttribute("r", "5");
					radioCircleTemplate.setAttribute("fill", "currentColor");
					radioCircleTemplate.classList.add("radioIconForeground-XwlXQN");
				}
				
				// Start plugin
				onStart() {
					// Add general CSS
					PluginUtilities.addStyle('Slideshow-CSS',
						`
						.pseudoslideshow-image {
							opacity:0;
							display:block;
							width:100%;
							height:100%;
							top:0px;
							left:0px;
							position:absolute;
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
							cursor:pointer;
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
						
						.pseudoslideshow-input-invalid {
							background-color:rgba(240, 71, 71, 0.3);
						}
						
						.pseudoslideshow-table-image-div {
							display:flex;
							flex-flow:row nowrap;
							align-items:stretch;
							align-content:flex-start;
							width:100%;
						}
						
						.pseudoslideshow-table-input-file {
							display:none;
						}
						
						.pseudoslideshow-table-input-file-label {
							flex-grow:0;
							flex-shrink:0;
							margin:3px 3px 3px 0;
							padding:1px 7px;
							border-radius:3px;
							background-color:#3e82e5;
							text-align:center;
							cursor:pointer;
							display:none;
						}
						
						.pseudoslideshow-table-image-div:hover .pseudoslideshow-table-input-file-label {
							display:block !important;
						}
						
						input:focus {
							border-color:red;
						}
						
						#pseudoslideshow-overlay {
							width:100%;
							height:100%;
							left:0;
							top:0;
							position:absolute;
							z-index:5000;
						}
						
						.pseudoslideshow-table-row-visualizer .pseudoslideshow-table-image-div:hover .pseudoslideshow-table-input-file-label {
							display:none !important;
						}
						
						.pseudoslideshow-table-row-visualizer {
							background-color:var(--background-floating);
						}
						
						.pseudoslideshow-table-row-placeholder {
							background-color:var(--background-floating);
						}
						
						.pseudoslideshow-table-row-placeholder * {
							opacity:0;
						}
						`
					);
					// Add configurable image fill CSS
					PluginUtilities.addStyle('Slideshow-Fill-CSS',
						`
						.pseudoslideshow-image {
							background-size:` + _PseudoSlideshow.settings.general.imageFill + `;
						}
						`
					);
					// Add all backgrounds to DOM
					this.initializeBackgrounds();
					// Ensure correct image is set
					this.resetImage();
					// Start timer if necessary
					if (this.settings.general.delay > 0) {
						this.startInterval();
					}
				}
				
				// Stop plugin
				onStop() {
					this.stopInterval();
					// Remove all backgrounds
					backgroundNode = document.getElementById('pseudoslideshow-background');
					if (backgroundNode != null) {
						backgroundNode.remove();
					}
					// Remove drag-and-drop overlay
					if (overlayNode != null) {
						overlayNode.remove();
					}
					overlayNode = null;
					// Remove CSS
					PluginUtilities.removeStyle('Slideshow-CSS');
					PluginUtilities.removeStyle('Slideshow-Fill-CSS');
					// Delete all drag-and-drop data if necessary
					if (tableDragData != null) {
						document.removeEventListener('mousemove', _PseudoSlideshow.checkMouseMove);
						document.removeEventListener('mouseup', _PseudoSlideshow.checkMouseUp);
						window.removeEventListener('blur', _PseudoSlideshow.lostFocus);
						tableDragData = null;
					}
				}
				
				// Method to get certain data from settings
				getData(key, defaultValue) {
					var temp = BdApi.loadData(_PseudoSlideshow.getName(), key, defaultValue);
					if (typeof temp === 'undefined')
						return defaultValue;
					return temp;
				}
				
				// Add all backgrounds to DOM
				initializeBackgrounds() {
					// Remove background node if already present
					backgroundNode = document.getElementById('pseudoslideshow-background');
					if (backgroundNode != null) {
						backgroundNode.remove();
					}
					// Generate new background node
					var appMount = document.getElementById('app-mount');
					backgroundNode = document.createElement("div");
					backgroundNode.id = "pseudoslideshow-background";
					backgroundNode.style.width = "100%";
					backgroundNode.style.height = "100%";
					backgroundNode.style.left = "0px";
					backgroundNode.style.top = "0px";
					backgroundNode.style.position = "absolute";
					appMount.parentElement.insertBefore(backgroundNode, appMount);
					// Add all backgrounds
					for (var i = 0; i < backgrounds.length; i++) {
						try {
							var imageNode = document.createElement("div");
							imageNode.style.zIndex = "-3";
							imageNode.style.backgroundImage = this.genBackgroundImage(i);
							imageNode.classList.add("pseudoslideshow-image");
							backgroundNode.appendChild(imageNode);
						} catch (err) {
						}
					}
					// Set the first image to be visible
					if (backgroundNode.children.length > 0) {
						backgroundNode.children[0].style.display = "block";
						backgroundNode.children[0].classList.add("pseudoslideshow-image-visible");
					}
				}
				
				// Start slideshow timer
				startInterval() {
					if (backgroundNode != null) {
						if (backgroundNode.children.length > 1) {
							interval = window.setInterval(function(){
								// Current index (before change)
								var lastIndex = 0;
								// Is image shuffling on
								if (_PseudoSlideshow.settings.general.imageShuffle) {
									lastIndex = backgroundIndex;
									// Get random number between 0 and 1 less than max (to exclude current image)
									backgroundIndex = Math.floor(Math.random() * (backgroundNode.children.length - 1));
									// If the generated number equals the current image, set it to the last image
									if (backgroundIndex == lastIndex) {
										backgroundIndex = backgroundNode.children.length - 1;
									}
								} else {
									// Increment index
									lastIndex = backgroundIndex++;
									// If index is out of bounds, roll back to 0
									if (backgroundIndex >= backgroundNode.children.length) {
										backgroundIndex = 0;
									}
								}
								// Save new index
								BdApi.setData(_PseudoSlideshow.getName(), "index", backgroundIndex);
								// Move new image to front 
								backgroundNode.children[backgroundIndex].style.zIndex = "-1";
								// Set transition speed
								backgroundNode.children[backgroundIndex].style.transition = _PseudoSlideshow.settings.general.speed + "ms";
								// Set image to visible
								backgroundNode.children[backgroundIndex].classList.add("pseudoslideshow-image-visible");
								// Update selected image in settings menu if possible
								_PseudoSlideshow.updateChecks();
								// Wait until transition is over + 10ms to ensure it is done
								setTimeout(function() {
									// Disable transition on old image
									backgroundNode.children[lastIndex].style.transition = "0s";
									// Set old image to no longer visible
									backgroundNode.children[lastIndex].classList.remove("pseudoslideshow-image-visible");
									// Move new image back to match z-index of other images
									backgroundNode.children[backgroundIndex].style.zIndex = "-3";
								}, Number(_PseudoSlideshow.settings.general.speed) + 10);
							}, _PseudoSlideshow.settings.general.delay * 1000);
						}
					}
				}
				
				// Fix backgrounds and ensure only the current background is visible
				resetImage() {
					if (backgroundNode != null) {
						// Ensure index is bounded
						if (backgroundIndex >= backgroundNode.children.length)
							backgroundIndex = 0;
						if (backgroundIndex < 0)
							backgroundIndex = 0;
						// Save index
						BdApi.setData(_PseudoSlideshow.getName(), "index", backgroundIndex);
						for (var i = 0; i < backgrounds.length; i++) {
							if (i != backgroundIndex) {
								// Set other images to be invisible
								backgroundNode.children[i].style.transition = "0s";
								backgroundNode.children[i].classList.remove("pseudoslideshow-image-visible");
							} else {
								// Set current image to be visible
								backgroundNode.children[i].style.transition = "0s";
								backgroundNode.children[i].classList.add("pseudoslideshow-image-visible");
							}
						}
					}
				}
				
				// Stop slideshow timer
				stopInterval() {
					window.clearInterval(interval);
				}
				
				// Get settings panel plus custom backgrounds panel
				getSettingsPanel() {
					return this.buildSettingsPanel().append(this.getSettingsPanelExtra()).getElement();
				}
				
				// Run when a setting is changed
				saveSettings(category, setting, value) {
					switch (category) {
					case 'general':
						switch (setting) {
						case 'delay':
							// Check if delay is valid, and is longer than speed
							if (!isNaN(value) && value.length > 0 && value >= 0 && ((value * 1000 > Number(_PseudoSlideshow.settings.general.speed) + 10) || value == 0)) {
								_PseudoSlideshow.settings[category][setting] = value;
								PluginUtilities.saveSettings(_PseudoSlideshow.getName(), _PseudoSlideshow.settings);
								// Restart the slideshow to ensure it is updated
								this.stopInterval();
								if (_PseudoSlideshow.settings.general.delay > 0) {
									this.startInterval();
								}
								return true;
							} else {
								return false;
							}
							break;
						case 'speed':
							// Check if speed is valid and is shorter than delay
							if (!(!isNaN(value) && value.length > 0 && value >= 0 && ((Number(_PseudoSlideshow.settings.general.delay) * 1000) > value + 10))) {
								return false;
							}
							break;
						case 'imageFill':
							// Update image fill CSS
							PluginUtilities.removeStyle('Slideshow-Fill-CSS');
							PluginUtilities.addStyle('Slideshow-Fill-CSS',
								`
								.pseudoslideshow-image {
									background-size:` + value + `;
								}
								`
							);
							break;
						}
						break;
					}
					// Save setting
					_PseudoSlideshow.settings[category][setting] = value;
					PluginUtilities.saveSettings(_PseudoSlideshow.getName(), _PseudoSlideshow.settings);
				}
				
				// Get custom backgrounds settings
    			getSettingsPanelExtra() {
					var group = new Settings.SettingGroup("Backgrounds", {collapsible: true, shown: false});
					group.id = "backgrounds";
					var table = `<table id='pseudoslideshow-backgrounds' class='pseudoslideshow-table colorStandard-2KCXvj'>
					<tr id='pseudoslideshow-backgrounds-header' class='pseudoslideshow-table-header'><th class='pseudoslideshow-table-row-obj pseudoslideshow-table-checkbox'></th><th class='pseudoslideshow-table-header-obj pseudoslideshow-table-image'>Image <span class='pseudoslideshow-table-hint'>(URL/File Path)</span></th><th class='pseudoslideshow-table-header-obj pseudoslideshow-table-opacity'>Opacity <span class='pseudoslideshow-table-hint'>(0.0-1.0)</span></th><th class='pseudoslideshow-table-header-obj pseudoslideshow-table-color'>Screen Color <span class='pseudoslideshow-table-hint'>(r, g, b)</span></th></tr>` + this.generateBackgroundTable() + `</table></div>`;
					group.append(DOMTools.parseHTML(table));
					return group;
				}
				
				// Generate table of background image settings
				generateBackgroundTable() {
					var backgroundList = "";
					for (var i = 0; i < backgrounds.length; i++) {
						backgroundList += `<tr class='pseudoslideshow-table-row'><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-checkbox' onmousedown='_PseudoSlideshow.checkMouseDown(this, event);'>`;
						if (backgroundIndex == i)
							backgroundList += `<svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path><circle cx="12" cy="12" r="5" class="radioIconForeground-XwlXQN" fill="currentColor"></circle></svg>`;
						else
							backgroundList += `<svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path></svg>`;
						backgroundList += `</td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-image'><div class='pseudoslideshow-table-image-div'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value='` + backgrounds[i].link + `'></input><input type='file' accept='image/*' class='pseudoslideshow-table-input-file' id='pseudoslideshow-table-input-file-` + i + `' onchange='_PseudoSlideshow.backgroundFileSelect(this)'></input><label class='pseudoslideshow-table-input-file-label' for='pseudoslideshow-table-input-file-` + i + `'>Select<br />File</label></div></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-opacity'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value='` + backgrounds[i].opacity + `'></input></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-color'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value='` + backgrounds[i].color + `'></input></td></tr>`;
					}
					backgroundList += this.getEmptyBackgroundTableRow(backgrounds.length);
					return backgroundList;
				}
				
				// Generate empty row for background image table (used for entering new data)
				getEmptyBackgroundTableRow(num) {
					return `<tr class='pseudoslideshow-table-row'><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-checkbox' onmousedown='_PseudoSlideshow.checkMouseDown(this, event);'><svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path></svg></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-image'><div class='pseudoslideshow-table-image-div'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value=''></input><input type='file' accept='image/*' class='pseudoslideshow-table-input-file' id='pseudoslideshow-table-input-file-` + num + `' onchange='_PseudoSlideshow.backgroundFileSelect(this)'></input><label class='pseudoslideshow-table-input-file-label' for='pseudoslideshow-table-input-file-` + num + `'>Select<br />File</label></div></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-opacity'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value=''></input></td><td class='pseudoslideshow-table-row-obj pseudoslideshow-table-color'><input class='pseudoslideshow-table-input' onkeydown='_PseudoSlideshow.backgroundInput(this)' value=''></input></td></tr>`;
				}
				
				// Set check at element to given status
				toggleCheck(ele, status) {
					if (status) {
						ele.appendChild(radioCircleTemplate.cloneNode());
					} else {
						if (ele.children.length > 1) {
							ele.children[1].remove();
						}
					}
				}
				
				// Update all checks to ensure only the current background is set
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
				
				// Run when a check is clicked to set it and unset all others
				check(ele) {
					var svg = ele.children[0];
					var row = ele.parentElement;
					// Get index
					var eleId = parseInt(Array.prototype.indexOf.call(row.parentElement.children, row) - 1);
					if (eleId < backgrounds.length) {
						// Set check
						this.toggleCheck(svg, true);
						// Unset other checks
						var rows = ele.parentElement.parentElement.children;
						for (var i = 0; i < backgrounds.length; i++) {
							if (i != eleId)
								this.toggleCheck(rows[i + 1].children[0].children[0], false);
						}
						// Set current background to checked index
						backgroundIndex = eleId;
						this.stopInterval();
						this.resetImage();
						if (this.settings.general.delay > 0) {
							this.startInterval();
						}
					}
				}
				
				// Add element to overlay node and create overlay node if required
				// Disables clicking on Discord
				addOverlayElement(ele) {
					if (overlayNode == null) {
						var appMount = document.getElementById('app-mount');
						overlayNode = document.createElement("div");
						overlayNode.id = "pseudoslideshow-overlay";
						appMount.appendChild(overlayNode);
					}
					overlayNode.appendChild(ele);
					overlayNode.style.pointerEvents = "auto";
				}
				
				// Run when mouse is clicked on a row
				checkMouseDown(ele, e) {
					var row = ele.parentElement;
					var eleId = parseInt(Array.prototype.indexOf.call(row.parentElement.children, row) - 1);
					// If row clicked is not empty row
					if (eleId < backgrounds.length) {
						// Setup drag-and-drop
						tableDragData = {dragging: false, tableElem: row.parentElement.parentElement, rowElem: row, rowCheckElem: ele, rowVisualizerElem: null, rowPlaceholderIndex: 0, rowIndex: 0, x: e.clientX, y: e.clientY, initX: 0, initY: 0, tableSize: null, tableOffsetHeight: 0, tableRowHeight: 0};
						document.addEventListener('mousemove', _PseudoSlideshow.checkMouseMove);
						document.addEventListener('mouseup', _PseudoSlideshow.checkMouseUp);
						window.addEventListener('blur', _PseudoSlideshow.lostFocus);
					}
				}
				
				// Run when Discord loses focus
				lostFocus(e) {
					// Cancel drag-and-drop event listeners
					document.removeEventListener('mousemove', _PseudoSlideshow.checkMouseMove);
					document.removeEventListener('mouseup', _PseudoSlideshow.checkMouseUp);
					window.removeEventListener('blur', _PseudoSlideshow.lostFocus);
					// Fix table and restore original positions
					if (tableDragData.rowPlaceholderIndex != tableDragData.rowIndex) {
						if (tableDragData.rowIndex > tableDragData.rowPlaceholderIndex) {
							tableDragData.rowElem.parentElement.insertBefore(tableDragData.rowElem, tableDragData.rowElem.parentElement.children[tableDragData.rowIndex + 2]);
						} else {
							tableDragData.rowElem.parentElement.insertBefore(tableDragData.rowElem, tableDragData.rowElem.parentElement.children[tableDragData.rowIndex + 1]);
						}
						tableDragData.rowPlaceholderIndex = tableDragData.rowIndex;
					}
					tableDragData.rowElem.classList.remove("pseudoslideshow-table-row-placeholder");
					// Clear overlay and restore clicking to Discord
					if (overlayNode != null)
						overlayNode.style.pointerEvents = "none";
					if (tableDragData.rowVisualizerElem != null)
						tableDragData.rowVisualizerElem.remove();
					// End drag-and-drop
					tableDragData = null;
				}
				
				// Run when mouse moves on the window
				checkMouseMove(e) {
					if (tableDragData != null) {
						if (tableDragData.dragging) {
							// Update visualizer position
							tableDragData.rowVisualizerElem.style.transform = "translate(" + (tableDragData.initX + (e.clientX - tableDragData.x)) + "px," + (tableDragData.initY + (e.clientY - tableDragData.y)) + "px)";
							_PseudoSlideshow.checkMouseMoveTable(e);
						} else {
							// Check if mouse has moved far enough to count as "dragging"
							if (Math.abs(e.clientX - tableDragData.x) > 5 || Math.abs(e.clientY - tableDragData.y) > 5) {
								// Start drag-and-drop
								tableDragData.dragging = true;
								tableDragData.rowVisualizerElem = tableDragData.rowElem.cloneNode(true);
								// Setup overlay visualizer element
								var size = tableDragData.rowElem.getBoundingClientRect();
								tableDragData.initX = size.x;
								tableDragData.initY = size.y;
								tableDragData.rowVisualizerElem.style.width = size.width + "px";
								tableDragData.rowVisualizerElem.style.height = size.height + "px";
								tableDragData.rowVisualizerElem.style.position = "fixed";
								tableDragData.rowVisualizerElem.style.left = 0;
								tableDragData.rowVisualizerElem.style.top = 0;
								tableDragData.rowVisualizerElem.style.transform = "translate(" + (tableDragData.initX + (e.clientX - tableDragData.x)) + "px," + (tableDragData.initY + (e.clientY - tableDragData.y)) + "px)";
								tableDragData.rowVisualizerElem.classList.add("pseudoslideshow-table-row-visualizer");
								tableDragData.rowVisualizerElem.classList.add("defaultColor-1_ajX0");
								// Fix column sizes on element
								for (var i = 0; i < tableDragData.rowVisualizerElem.children.length; i++) {
									tableDragData.rowVisualizerElem.children[i].style.width = tableDragData.rowElem.children[i].offsetWidth + "px";
								}
								_PseudoSlideshow.addOverlayElement(tableDragData.rowVisualizerElem);
								// Hide original table row
								tableDragData.rowElem.classList.add("pseudoslideshow-table-row-placeholder");
								// Setup original index and placeholder index for managing dragging
								tableDragData.rowIndex = parseInt(Array.prototype.indexOf.call(tableDragData.rowElem.parentElement.children, tableDragData.rowElem) - 1);
								tableDragData.rowPlaceholderIndex = tableDragData.rowIndex;
								// Calculate visible table size, offset height of header and row height
								tableDragData.tableSize = _PseudoSlideshow.visibleBoundingRect(tableDragData.tableElem);
								tableDragData.tableOffsetHeight = tableDragData.tableElem.children[0].children[0].offsetHeight - tableDragData.tableSize.scrollTop;
								tableDragData.tableRowHeight = tableDragData.tableElem.children[0].children[1].offsetHeight;
							}
						}
					} else {
						// Not dragging-and-dropping, remove all data/event listeners
						// Clear overlay and restore clicking to Discord
						if (overlayNode != null)
							overlayNode.style.pointerEvents = "none";
						document.removeEventListener('mousemove', _PseudoSlideshow.checkMouseMove);
						document.removeEventListener('mouseup', _PseudoSlideshow.checkMouseUp);
						window.removeEventListener('blur', _PseudoSlideshow.lostFocus);
					}
				}
				
				// Run to check for mouse moving over the table
				checkMouseMoveTable(e) {
					// Check if mouse is over table
					if (tableDragData.tableSize != null && e.clientX >= tableDragData.tableSize.x && e.clientX <= tableDragData.tableSize.x + tableDragData.tableSize.width && e.clientY >= tableDragData.tableSize.y && e.clientY <= tableDragData.tableSize.y + tableDragData.tableSize.height) {
						// Calculate index mouse is hovering over
						var index = Math.floor((e.clientY - tableDragData.tableSize.y - tableDragData.tableOffsetHeight) / tableDragData.tableRowHeight);
						// Bound index
						if (index < 0)
							index = 0;
						if (index >= backgrounds.length)
							index = backgrounds.length - 1;
						// If index is different from placeholder position, move placeholder to match
						if (tableDragData.rowPlaceholderIndex != index) {
							if (tableDragData.rowElem != null) {
								if (index > tableDragData.rowPlaceholderIndex) {
									tableDragData.rowElem.parentElement.insertBefore(tableDragData.rowElem, tableDragData.rowElem.parentElement.children[index + 2]);
								} else {
									tableDragData.rowElem.parentElement.insertBefore(tableDragData.rowElem, tableDragData.rowElem.parentElement.children[index + 1]);
								}
								tableDragData.rowPlaceholderIndex = index;
							}
						}
					} else {
						// Restore original row position
						if (tableDragData.rowPlaceholderIndex != tableDragData.rowIndex) {
							if (tableDragData.rowIndex > tableDragData.rowPlaceholderIndex) {
								tableDragData.rowElem.parentElement.insertBefore(tableDragData.rowElem, tableDragData.rowElem.parentElement.children[tableDragData.rowIndex + 2]);
							} else {
								tableDragData.rowElem.parentElement.insertBefore(tableDragData.rowElem, tableDragData.rowElem.parentElement.children[tableDragData.rowIndex + 1]);
							}
							tableDragData.rowPlaceholderIndex = tableDragData.rowIndex;
						}
					}
				}
				
				// Calculate bounding rectangle of visible element
				visibleBoundingRect(node) {
					// Get original bounding rectangle (extends beyond what is visible)
					var nodeSize = node.getBoundingClientRect();
					// Setup data
					var o = {width: node.offsetWidth, height: node.offsetHeight, x: node.offsetLeft, y: node.offsetTop, top: 0, bottom: 0, left: 0, right: 0, scrollTop: 0, scrollLeft: 0}, // size and position
					offsetParent = node.offsetParent, // Offset parent of node
					css, x, y;
					while ((node = node.parentNode) !== null) {  // Loop up through DOM
						css = window.getComputedStyle(node);
						if (css && (css.overflowX !== 'visible' || css.overflowY !== 'visible')) {  // If element has overflow
							var parentSize = node.getBoundingClientRect(); // Assumes only 1 element is overflowing
							if (node.scrollLeft <= o.x) // Adjust position for slight scrolling
								o.x -= node.scrollLeft;
							else { // Scrolled where edge is no longer visible
								o.scrollLeft = node.scrollLeft - o.x;
								o.x = 0;
							}
							if (node.scrollTop <= o.y) // Adjust position for slight scrolling
								o.y -= node.scrollTop;
							else { // Scrolled where edge is no longer visible
								o.scrollTop = node.scrollTop - o.y;
								o.y = 0;
							}
							x = node.offsetWidth - o.x; // Calculate visible x
							y = node.offsetHeight - o.y; // Calculate visible y
							if (node !== offsetParent) { // Check if this is not an offset parent
								x += (node.offsetLeft || 0); // Adjust x
								y += (node.offsetTop || 0); // Adjust y
							}
							if (x < o.width) // Check if width is out of bounds
								o.width = (x < 0) ? 0 : x;
							if (y < o.height) // Check if height is out of bounds
								o.height = (y < 0) ? 0 : y;
							o.x += parentSize.x; // Adds x position of overflowing parent
							o.y += parentSize.y; // Adds y position of overflowing parent
							o.left = o.x;
							o.right = o.x + o.width;
							if (o.right > nodeSize.right) { // If calculated right bound extends beyond real right bound, adjust
								var diff = o.right - nodeSize.right;
								o.right = nodeSize.right;
								o.width -= diff;
							}
							o.top = o.y;
							o.bottom = o.y + o.height;
							if (o.bottom > nodeSize.bottom) { // If calculated bottom bound extends beyond real bottom bound, adjust
								var diff = o.bottom - nodeSize.bottom;
								o.bottom = nodeSize.bottom;
								o.height -= diff;
							}
							return o; // Return data (assumes only 1 element is overflowing)
						}
						if (node === offsetParent) { // Updates offsets
							o.x += (node.offsetLeft || 0);
							o.y += (node.offsetTop || 0);
							offsetParent = node.offsetParent;
						}
					}
					o.left = o.x;
					o.right = o.x + o.width;
					if (o.right > nodeSize.right) { // If calculated right bound extends beyond real right bound, adjust
						var diff = o.right - nodeSize.right;
						o.right = nodeSize.right;
						o.width - diff;
					}
					o.top = o.y;
					o.bottom = o.y + o.height;
					if (o.bottom > nodeSize.bottom) { // If calculated bottom bound extends beyond real bottom bound, adjust
						var diff = o.bottom - nodeSize.bottom;
						o.bottom = nodeSize.bottom;
						o.height - diff;
					}
					return o; // Return data (no hidden parts of element)
				}
				
				// Run when mouse is unclicked on the window
				checkMouseUp(e) {
					// Removes all listeners
					document.removeEventListener('mousemove', _PseudoSlideshow.checkMouseMove);
					document.removeEventListener('mouseup', _PseudoSlideshow.checkMouseUp);
					window.removeEventListener('blur', _PseudoSlideshow.lostFocus);
					// Checks if dragging-and-dropping
					if (tableDragData != null) {
						// Check if element has been "dragged"
						if (tableDragData.dragging) {
							// Check if index of element has changed from original
							if (tableDragData.rowPlaceholderIndex != tableDragData.rowIndex) {
								// Make placeholder visible
								tableDragData.rowElem.classList.remove("pseudoslideshow-table-row-placeholder");
								// Iterate through rows and update file selection label IDs
								var rows = tableDragData.tableElem.children[0].children;
								for (var i = 1; i < rows.length; i++) {
									var image = rows[i].children[1].children[0];
									image.children[1].id = "pseudoslideshow-table-input-file-" + (i - 1);
									image.children[2].htmlFor = "pseudoslideshow-table-input-file-" + (i - 1);
								}
								// Move background images to match table
								if (tableDragData.rowIndex > tableDragData.rowPlaceholderIndex) {
									backgroundNode.insertBefore(backgroundNode.children[tableDragData.rowIndex], backgroundNode.children[tableDragData.rowPlaceholderIndex]);
									var old = backgrounds.splice(tableDragData.rowIndex, 1);
									backgrounds.splice(tableDragData.rowPlaceholderIndex, 0, old[0]);
								} else {
									backgroundNode.insertBefore(backgroundNode.children[tableDragData.rowIndex], backgroundNode.children[tableDragData.rowPlaceholderIndex + 1]);
									var old = backgrounds.splice(tableDragData.rowIndex, 1);
									backgrounds.splice(tableDragData.rowPlaceholderIndex, 0, old[0]);
								}
								// If current image index matches moved row, adjust index to match new position
								if (backgroundIndex == tableDragData.rowIndex) {
									backgroundIndex = tableDragData.rowPlaceholderIndex;
									BdApi.setData(_PseudoSlideshow.getName(), "index", backgroundIndex);
								}
								// Save new data
								_PseudoSlideshow.saveBackgrounds();
							} else {
								// Element has not been moved, make placeholder visible again
								tableDragData.rowElem.classList.remove("pseudoslideshow-table-row-placeholder");
							}
						// Element has not been dragged, only clicked
						} else {
							// Select/"check" element
							if (tableDragData.rowCheckElem != null) {
								_PseudoSlideshow.check(tableDragData.rowCheckElem);
							}
						}
					}
					// Not dragging-and-dropping, remove all data
					// Clear overlay and restore clicking to Discord
					if (overlayNode != null)
						overlayNode.style.pointerEvents = "none";
					if (tableDragData.rowVisualizerElem != null)
						tableDragData.rowVisualizerElem.remove();
					tableDragData = null;
				}
				
				// Run when data is inputted to the table
				backgroundInput(ele) {
					if (event.key === 'Enter') {
						this.updateBackgroundInput(ele);
					}
				}
				
				// Run when the file selector has chosen a file
				backgroundFileSelect(ele) {
					// Check if a file has been chosen
					if (ele.files.length > 0) {
						var file = ele.files[0];
						var row = DOMTools.parents(ele, '.pseudoslideshow-table-row')[0];
						var eleId = parseInt(Array.prototype.indexOf.call(row.parentElement.children, row) - 1);
						var eleImage = row.children[1].children[0].children[0];
						// Check if file is valid
						if (this.isValidFile(file.path)) {
							// Update path in input
							eleImage.parentElement.classList.remove("pseudoslideshow-input-invalid");
							eleImage.value = file.path;
							this.updateBackgroundInput(ele);
						} else {
							eleImage.parentElement.classList.add("pseudoslideshow-input-invalid");
						}
						ele.value = '';
					}
				}
				
				// Table has new data
				updateBackgroundInput(ele) {
					// Get data row and elements
					var row = DOMTools.parents(ele, '.pseudoslideshow-table-row')[0];
					var eleId = parseInt(Array.prototype.indexOf.call(row.parentElement.children, row) - 1);
					var eleImage = row.children[1].children[0].children[0];
					var eleOpacity = row.children[2].children[0];
					var eleColor = row.children[3].children[0];
					var newImage = eleImage.value;
					var newOpacity = eleOpacity.value;
					var newColor = eleColor.value;
					// Check if row is the empty bottom row
					if (eleId >= backgrounds.length) {
						// Check if all data is valid
						if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
							try {
								// Check if URL/path is a path
								if (this.isValidFile(newImage)) {
									// Add local image if this is a file
									backgrounds.push({link:newImage, opacity:parseFloat(newOpacity), color:newColor, local:true});
								} else {
									// Add remote URL if this is a URL
									backgrounds.push({link:newImage, opacity:parseFloat(newOpacity), color:newColor, local:false});
								}
								// Add the image to the background node
								var imageNode = document.createElement("div");
								imageNode.style.zIndex = "-3";
								imageNode.style.backgroundImage = this.genBackgroundImage(eleId);
								imageNode.classList.add("pseudoslideshow-image");
								backgroundNode.appendChild(imageNode);
								// Restart the slideshow to ensure it is updated
								this.stopInterval();
								if (this.settings.general.delay > 0) {
									this.startInterval();
								}
								// Add a new empty row to the table
								var template = document.createElement("template");
								template.innerHTML = this.getEmptyBackgroundTableRow(backgrounds.length);
								row.parentElement.appendChild(template.content.firstChild);
								// Save data
								this.saveBackgrounds();
							} catch (err) {
							}
						}
					// Old row has been edited
					} else {
						var bgEle = backgroundNode.children[eleId];
						// Check if row is now empty
						if (newImage.length == 0 && newOpacity.length == 0 && newColor.length == 0) {
							// Remove row from background data and background node
							if (eleId <= backgroundIndex) {
								backgroundIndex--;
							}
							backgrounds.splice(eleId, 1);
							bgEle.remove();
							row.remove();
							// Restart the slideshow to ensure it is updated
							this.stopInterval();
							this.resetImage();
							// Update selected check for incase current image was removed
							this.updateChecks();
							if (this.settings.general.delay > 0) {
								this.startInterval();
							}
							// Save data
							this.saveBackgrounds();
						} else {
							// Check if new data is valid
							if (newImage.length != 0 && newOpacity.length != 0 && newColor.length != 0 && this.isOpacityValid(newOpacity, eleOpacity) && this.isColorValid(newColor, eleColor) && this.isImageValid(newImage, eleImage)) {
								try {
									// Update background data
									backgrounds[eleId].link = newImage;
									backgrounds[eleId].opacity = parseFloat(newOpacity);
									backgrounds[eleId].color = newColor;
									// Check if URL or file
									if (this.isValidFile(newImage)) {
										backgrounds[eleId].local = true;
									} else {
										backgrounds[eleId].local = false;
									}
									bgEle.style.backgroundImage = this.genBackgroundImage(eleId);
									// Save data
									this.saveBackgrounds();
								} catch (err) {
								}
							}
						}
					}
				}
				
				// Checks if an image URL/path is valid in the given input element
				isImageValid(inputUrl, elem) {
					if (this.isValidUrl(inputUrl) || this.isValidFile(inputUrl)) {
						elem.parentElement.classList.remove("pseudoslideshow-input-invalid");
						return true;
					} else {
						elem.parentElement.classList.add("pseudoslideshow-input-invalid");
						return false;
					}
				}
				
				// Checks if a URL looks valid
				isValidUrl(url) {
					return /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url);
				}
				
				// Checks if a file path is accessible
				isValidFile(path) {
					try {
						fs.accessSync(path);
						return true;
					} catch (err) {
						return false;
					}
				}
				
				// Checks if an opacity value is valid
				isOpacityValid(inputOpacity, elem) {
					var op = parseFloat(inputOpacity);
					if (!isNaN(op) && op >= 0 && op <= 1) {
						elem.parentElement.classList.remove("pseudoslideshow-input-invalid");
						return true;
					} else {
						elem.parentElement.classList.add("pseudoslideshow-input-invalid");
						return false;
					}
				}
				
				// Checks if a color value is valid
				isColorValid(inputColor, elem) {
					var split = inputColor.trim().split(",");
					if (split.length == 3 && this.checkRGBVal(split[0]) && this.checkRGBVal(split[1]) && this.checkRGBVal(split[2])) {
						elem.parentElement.classList.remove("pseudoslideshow-input-invalid");
						return true;
					} else {
						elem.parentElement.classList.add("pseudoslideshow-input-invalid");
						return false;
					}
				}
				
				// Checks if an individual RGB value is valid
				checkRGBVal(val) {
					var num = parseInt(val);
					if (!isNaN(num) && num >= 0 && num <= 255)
						return true;
					return false;
				}
				
				// Generates the background image data from a URL or file path
				genBackgroundImage(i) {
					// Checks if the image is a local file
					if (backgrounds[i].local) {
						// Gets the base64 image data
						var base64 = fs.readFileSync(backgrounds[i].link, {encoding:'base64'});
						// Gets the image mime type
						var mimeType = mime.lookup(backgrounds[i].link);
						// Returns the CSS of the image and colored screen
						return 'linear-gradient(to right,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 0%,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 100%),url("data:' + mimeType + ';base64,' + base64 + '")';
					} else {
						// Returns the CSS of the image and colored screen
						return 'linear-gradient(to right,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 0%,rgba(' + backgrounds[i].color + ', ' + backgrounds[i].opacity + ') 100%),url("' + backgrounds[i].link + '")';
					}
				}
				
				// Save the current background data
				saveBackgrounds() {
					var str = JSON.stringify(backgrounds);
					BdApi.setData(_PseudoSlideshow.getName(), "backgrounds", str);
				}
			}
			
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
