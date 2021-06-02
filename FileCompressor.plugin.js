/**
 * @name FileCompressor
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "FileCompressor",
			authors:
			[
				{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "1.0.2",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [
			{
				title: "Status Toast",
				type: "added",
				items: [
					"Toast to indicate when compression is ongoing"
				]
			},
			{
				title: "Multiple Toast",
				type: "fixed",
				items: [
					"Properly display multiple toasts simultaneously"
				]
			}
		]
	};
	
	var _FileCompressor = null; // Global variable for events/callbacks

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
			const { Utilities, DOMTools, PluginUtilities, DiscordAPI } = Api;
			
			// File system for reading local files
			const fs = require('fs');
			
			var appNode = null;
			var toastNode = null;
			var originalUploadNode = null;
			
			const uploadCaps = new Map([["DEFAULT", 8388608], ["NITROCLASSIC", 52428800], ["NITRO", 104857600]]);
			var maxUploadSize = 8388608;
			
			const sizeMultiplier = 0.9;
			const maxIterations = 50;
			
			const uploadToasts = new Map();
			const loadingSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M12,0v2C6.48,2,2,6.48,2,12c0,3.05,1.37,5.78,3.52,7.61l1.15-1.66C5.04,16.48,4,14.36,4,12c0-4.41,3.59-8,8-8v2l2.59-1.55l2.11-1.26L17,3L12,0z"/><path d="M18.48,4.39l-1.15,1.66C18.96,7.52,20,9.64,20,12c0,4.41-3.59,8-8,8v-2l-2.59,1.55L7.3,20.82L7,21l5,3v-2c5.52,0,10-4.48,10-10C22,8.95,20.63,6.22,18.48,4.39z"/></svg>`;

			return class FileCompressor extends Plugin
			{
				constructor()
				{
					super();
					_FileCompressor = this;
				}
	
				onStart()
				{
					PluginUtilities.addStyle(
						'FileCompressor-CSS',
						`
						#pseudocompressor-toasts {
							position:fixed;
							top:0;
							bottom:30px;
							left:0;
							right:30px;
							z-index:5000;
							pointer-events:none;
							display:flex;
							flex-direction:column;
							align-items:flex-end;
							justify-content:flex-end;
						}
						.pseudocompressor-toast {
							background-color:#43b581;
							padding:7px;
							margin-top:10px;
							border-radius:5px;
							font-size:14px;
							font-weight:500;
							box-shadow:var(--elevation-medium),var(--elevation-stroke);
							color:var(--header-primary);
							user-select:none;
							display:flex;
							flex-flow:row nowrap;
							align-items:center;
						}
						.pseudocompressor-toast-icon {
							order:1;
							flex-grow:0;
							flex-shrink:0;
							width:24px;
							height:24px;
							animation:spin 1.5s linear infinite;
						}
						.pseudocompressor-toast-message {
							order:2;
							padding-left:5px;
						}
						@keyframes spin {
							100% {
								-webkit-transform:rotate(360deg);
								transform:rotate(360deg);
							}
						}
						`
					);
					// Generate new upload area node
					appNode = document.getElementById('app-mount');
					this.addToastArea();
					// Add event listeners
					window.addEventListener("drop", this.drop, true);
					document.addEventListener("paste", this.paste, true);
				}
	
				onStop()
				{
					// Remove upload node
					if (toastNode != null) {
						toastNode.remove();
						toastNode = null;
					}
					appNode = null;
					uploadToasts.clear();
					// Remove event listeners
					window.removeEventListener("drop", this.drop, true);
					document.removeEventListener("paste", this.paste, true);
					PluginUtilities.removeStyle('FileCompressor-CSS');
				}
				
				addToastArea() {
					// Remove old upload node
					toastNode = document.getElementById('pseudocompressor-toasts');
					if (toastNode != null) {
						toastNode.remove();
						toastNode = null;
					}
					toastNode = document.createElement("div");
					toastNode.id = "pseudocompressor-toasts";
					appNode.appendChild(toastNode);
				}
				
				setUploadToast(dt, remaining) {
					if (uploadToasts.has(dt)) {
						let toast = uploadToasts.get(dt);
						let toastMsg = toast.querySelector('.pseudocompressor-toast-message');
						toastMsg.innerHTML = "Compressing " + remaining + (remaining == 1 ? " file" : " files");
					} else {
						let toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
							message: "Compressing " + remaining + (remaining == 1 ? " file" : " files"),
							icon: loadingSvg
						}));
						toastNode.appendChild(toast);
						uploadToasts.set(dt, toast);
					}
				}
				
				removeUploadToast(dt) {
					if (uploadToasts.has(dt)) {
						let toast = uploadToasts.get(dt);
						toast.remove();
						uploadToasts.delete(dt);
					}
				}
				
				async paste(event) {
					if (event.isTrusted && event.clipboardData !== null && event.clipboardData.files.length != 0) {
						// Stop event from propagating
						event.stopPropagation();
						// Dispatch new event
						try {
							let dt = await _FileCompressor.processDataTransfer(event.clipboardData);
							appNode.tabIndex = -1;
							appNode.focus();
							document.dispatchEvent(new ClipboardEvent("paste", {"clipboardData": dt}));
						} catch (e) {
							console.error(e);
							BdApi.showToast("Error uploading files!", {type: "error"});
						}
					}
				}
				
				async drop(event) {
					if (event.isTrusted && event.dataTransfer !== null && event.dataTransfer.files.length != 0) {
						if (originalUploadNode == null) {
							originalUploadNode = document.querySelector('[class*="uploadArea-"]');
						}
						if (originalUploadNode != null) {
							if (_FileCompressor.listStartsWith(originalUploadNode.classList, "droppable-")) {
								// Stop event from propagating
								event.stopPropagation();
								// Dispatch new event
								try {
									let dt = await _FileCompressor.processDataTransfer(event.dataTransfer);
									if (_FileCompressor.listStartsWith(originalUploadNode.classList, "droppable-")) {
										originalUploadNode.dispatchEvent(new DragEvent("drop", {"dataTransfer": dt}));
									} else {
										appNode.tabIndex = -1;
										appNode.focus();
										document.dispatchEvent(new ClipboardEvent("paste", {"clipboardData": dt}));
									}
								} catch (e) {
									console.error(e);
									BdApi.showToast("Error uploading files!", {type: "error"});
								}
							}
						}
					}
				}
				
				async processDataTransfer(dt) {
					// Check account status and update max file upload size
					switch (DiscordAPI.currentUser.discordObject.premiumType) {
						default:
						case 0:
							maxUploadSize = uploadCaps.get("DEFAULT");
							break;
						case 1:
							maxUploadSize = uploadCaps.get("NITROCLASSIC");
							break;
						case 2:
							maxUploadSize = uploadCaps.get("NITRO");
							break;
					}
					// Synthetic return DataTransfer
					const retDt = new DataTransfer();
					retDt.dropEffect = "copy";
					retDt.effectAllowed = "all";
					var files = dt.files;
					var tempFiles = [];
					for (let i = 0; i < files.length; i++) {
						let file = files[i];
						if (file.size >= maxUploadSize) {
							// Check file MIME type
							switch (file.type.split('/')[0]) {
								case "image":
									tempFiles.push(file);
									break;
								default:
									// If no files have are compressible and return is still empty, add file to trigger Discord's file too large modal
									if (i == files.length - 1 && retDt.items.length == 0 && tempFiles.length == 0) {
										retDt.items.add(file);
									}
									break;
							}
						} else {
							// Add files that are small enough
							retDt.items.add(file);
						}
					}
					for (let i = 0; i < tempFiles.length; i++) {
						let file = tempFiles[i];
						// Check file MIME type
						switch (file.type.split('/')[0]) {
							case "image":
								_FileCompressor.setUploadToast(dt, tempFiles.length - i);
								let compressedFile = await _FileCompressor.compressImage(file);
								if (compressedFile != null) {
									retDt.items.add(compressedFile);
								}
								//https://github.com/davejm/client-compress
								break;
							default:
								break;
						}
					}
					_FileCompressor.removeUploadToast(dt);
					// Show toast saying a file was too large to upload if some files are being uploaded, but not others
					if (retDt.files.length > 0 && files.length > retDt.files.length) {
						let num = (files.length - retDt.files.length);
						BdApi.showToast(num + (num == 1 ? " file was " : " files were ") + "too large to upload!", {type: "error"});
					}
					return retDt;
				}
				
				loadImageElement = (img, src) => {
					return new Promise((resolve, reject) => {
						img.addEventListener("load", () => {resolve(img)}, false);
						img.addEventListener("error", (err) => {reject(err)}, false);
						img.src = src;
					});
				}
				
				async compressImage(file) {
					const objectUrl = URL.createObjectURL(file);
					const img = new window.Image();
					await _FileCompressor.loadImageElement(img, objectUrl);
					URL.revokeObjectURL(objectUrl);
					const image = {file: file, data: img, outputData: null, width: img.naturalWidth, height: img.naturalHeight, iterations: 0};
					if (await _FileCompressor.compressImageLoop(image) !== null) {
						return new File([image.outputData], image.file.name, {type: image.file.type});
					}
					return null;
				}
				
				async compressImageLoop(image) {
					image.iterations++;
					var blob = await _FileCompressor.compressImageCanvas(image);
					image.outputData = blob;
					if (image.outputData.size >= maxUploadSize) {
						if (image.iterations >= maxIterations) {
							BdApi.showToast("Unable to comress impage!", {type: "error"});
							return null;
						} else {
							await _FileCompressor.compressImageLoop(image);
						}
					} else {
						return image;
					}
				}
				
				async compressImageCanvas(image) {
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d");
					var multiplier = Math.pow(sizeMultiplier, image.iterations)
					canvas.width = Math.round(image.width * multiplier);
					canvas.height = Math.round(image.height * multiplier);
					context.drawImage(image.data, 0, 0, canvas.width, canvas.height);
					return new Promise((resolve, reject) => {
						canvas.toBlob((blob) => {resolve(blob)}, image.file.type);
					});
				}
				
				listStartsWith(list, str) {
					if (list != null) {
						for (let value of list.entries()) {
							if (value[1].startsWith(str)) {
								return true;
							}
						}
					}
					return false;
				}
				
			}
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
