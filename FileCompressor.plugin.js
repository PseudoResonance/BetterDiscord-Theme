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
			version: "1.0.0",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [
			{
				title: "Initial Release",
				type: "added",
				items: [
					"Automatically reduce image size for files that are too large to send"
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
			const { PluginUtilities, DiscordAPI } = Api;
			
			// File system for reading local files
			const fs = require('fs');
			
			var appNode = null;
			var uploadNode = null;
			var blankDt = null;
			var originalUploadNode = null;
			
			const uploadCaps = new Map([["DEFAULT", 8388608], ["NITROCLASSIC", 52428800], ["NITRO", 104857600]]);
			var maxUploadSize = 8388608;
			
			const sizeMultiplier = 0.9;
			const maxIterations = 50;

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
						`
					);
					// Remove old upload node
					uploadNode = document.getElementById('pseudocompressor-upload');
					if (uploadNode != null) {
						uploadNode.remove();
						uploadNode = null;
					}
					// Generate new upload area node
					this.addUploadArea();
					blankDt = new DataTransfer();
					blankDt.dropEffect = "copy";
					blankDt.effectAllowed = "all";
					appNode = document.getElementById('app-mount');
				}
	
				onStop()
				{
					// Remove upload node
					if (uploadNode != null) {
						uploadNode.remove();
						uploadNode = null;
					}
					appNode = null;
					// Remove event listener
					window.removeEventListener("drop", _FileCompressor.drop, true);
					document.removeEventListener("paste", _FileCompressor.paste, true);
					PluginUtilities.removeStyle('FileCompressor-CSS');
				}
				
				addUploadArea() {
					// Generate new upload area node
					originalUploadNode = document.querySelector('[class*="uploadArea-"]');
					if (originalUploadNode != null) {
						uploadNode = document.createElement("div");
						uploadNode.id = "pseudocompressor-upload";
						uploadNode.className = originalUploadNode.className;
						originalUploadNode.parentElement.insertBefore(uploadNode, originalUploadNode);
						// Add events listener
						window.addEventListener("drop", _FileCompressor.drop, true);
						document.addEventListener("paste", _FileCompressor.paste, true);
					}
				}
				
				async paste(event) {
					if (event.isTrusted && event.clipboardData !== null && event.clipboardData.files.length != 0) {
						// Stop event from propagating
						event.stopPropagation();
						// Dispatch new event
						var dt = await _FileCompressor.processDataTransfer(event.clipboardData);
						appNode.tabIndex = -1;
						appNode.focus();
						document.dispatchEvent(new ClipboardEvent("paste", {"clipboardData": dt}));
					}
				}
				
				async drop(event) {
					if (event.isTrusted && event.dataTransfer !== null && event.dataTransfer.files.length != 0) {
						if (originalUploadNode != null) {
							if (_FileCompressor.listStartsWith(originalUploadNode.classList, "droppable-")) {
								// Stop event from propagating
								event.stopPropagation();
								// Dispatch new event
								var dt = await _FileCompressor.processDataTransfer(event.dataTransfer);
								if (_FileCompressor.listStartsWith(originalUploadNode.classList, "droppable-")) {
									originalUploadNode.dispatchEvent(new DragEvent("drop", {"dataTransfer": dt}));
								} else {
									appNode.tabIndex = -1;
									appNode.focus();
									document.dispatchEvent(new ClipboardEvent("paste", {"clipboardData": dt}));
								}
							}
						}
					}
				}
				
				async processDataTransfer(dt) {
					var premiumType = DiscordAPI.currentUser.discordObject.premiumType;
					switch (premiumType) {
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
					const retDt = new DataTransfer();
					retDt.dropEffect = "copy";
					retDt.effectAllowed = "all";
					var files = dt.files;
					for (let i = 0; i < files.length; i++) {
						var file = files[i];
						if (file.size >= maxUploadSize) {
							switch (file.type.split('/')[0]) {
								case "image":
									var imgFile = await _FileCompressor.compressImage(file);
									if (imgFile != null) {
										retDt.items.add(imgFile);
									}
									//https://github.com/davejm/client-compress
									break;
								default:
									if (i == files.length - 1) {
										retDt.items.add(file);
									}
									break;
							}
						} else {
							retDt.items.add(file);
						}
					}
					if (dt.files.length > retDt.files.length) {
						var num = (dt.files.length - retDt.files.length);
						BdApi.showToast(num + (num == 1 ? " file was " : " files were ") + "too large to upload!", {type: "error"});
					}
					if (retDt.files.length > 0) {
						return retDt;
					}
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
						var file = new File([image.outputData], image.file.name, {type: image.file.type});
						return file;
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
