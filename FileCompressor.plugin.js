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
			version: "1.1.0",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [
			{
				title: "Efficient Compression",
				type: "added",
				items: [
					"Records the channel that each file is supposed to be sent to and ensure the file is only sent there",
					"Compression is multi-threaded and more efficient"
				]
			}
		],
		defaultConfig: [
			{
				type: 'category',
				id: 'compressor',
				name: 'Compressor Settings',
				collapsible: true,
				shown: true,
				settings: [
					{
						name: 'Concurrent Compression Threads',
						note: 'Number of compression jobs that can be processing simultaneously',
						id: 'concurrentThreads',
						type: 'slider',
						min: 1,
						max: 5,
						value: 3,
						markers: [1, 2, 3, 4, 5],
						stickToMarkers:  true
					}
				]
			}
		]
	};

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
			const { Patcher, UserSettingsStore, Modals, DiscordModules, Utilities, DOMTools, PluginUtilities, DiscordAPI } = Api;
			
			// File system for reading local files
			const fs = require('fs');
			
			var uploadQueue = [];
			var processingQueue = [];
			var processingThreadCount = 0;
			
			var uploadModalClass = null;
			var appNode = null;
			var originalUploadNode = null;
			var toastNode = null;
			const uploadToasts = new Map();
			const loadingSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M12,0v2C6.48,2,2,6.48,2,12c0,3.05,1.37,5.78,3.52,7.61l1.15-1.66C5.04,16.48,4,14.36,4,12c0-4.41,3.59-8,8-8v2l2.59-1.55l2.11-1.26L17,3L12,0z"/><path d="M18.48,4.39l-1.15,1.66C18.96,7.52,20,9.64,20,12c0,4.41-3.59,8-8,8v-2l-2.59,1.55L7.3,20.82L7,21l5,3v-2c5.52,0,10-4.48,10-10C22,8.95,20.63,6.22,18.48,4.39z"/></svg>`;
			const uploadSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><polygon points="12.1,2 5,9 10,9 10,18 14,18 14,9 19,9"/><polygon points="20,14 20,20 4,20 4,14 2,14 2,22 22,22 22,14"/></svg>`;
			const queueSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M21.84,1H2.16l7.15,11L2.16,23h19.68l-7.15-11L21.84,1z M11.69,12L5.84,3h12.31l-5.85,9H11.69z"/></svg>`;
			
			const uploadCaps = new Map([["DEFAULT", 8388608], ["NITROCLASSIC", 52428800], ["NITRO", 104857600]]);
			var maxUploadSize = 8388608;
			
			const imageSizeMultiplier = 0.9;
			const imageMaxIterations = 50;
			
			return class FileCompressor extends Plugin
			{
				constructor()
				{
					super();
					this.closeUploadModal = this.closeUploadModal.bind(this);
					this.paste = this.paste.bind(this);
					this.drop = this.drop.bind(this);
					this.uploadFileQueue = this.uploadFileQueue.bind(this);
					this.uploadFile = this.uploadFile.bind(this);
					this.processDataTransfer = this.processDataTransfer.bind(this);
					this.checkCompressFile = this.checkCompressFile.bind(this);
					this.compressFile = this.compressFile.bind(this);
					this.compressFileType = this.compressFileType.bind(this);
					this.finishProcessing = this.finishProcessing.bind(this);
					this.processNextFile = this.processNextFile.bind(this);
					this.compressImage = this.compressImage.bind(this);
					this.compressImageLoop = this.compressImageLoop.bind(this);
					this.saveSettings = this.saveSettings.bind(this);
				}
	
				onStart()
				{
					Patcher.after(BdApi.findModule(m => m.displayName === "UploadModal").prototype, "close", _ => {
						this.closeUploadModal();
					});
					DiscordModules.UserSettingsStore.addChangeListener(this.handleUserSettingsChange);
					uploadModalClass = BdApi.findModuleByProps('uploadModal').uploadModal.split(' ')[0];
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
						}
						.pseudocompressor-toast-icon.spin {
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
					processingThreadCount = 0;
					// Add event listeners
					window.addEventListener("drop", this.drop, true);
					document.addEventListener("paste", this.paste, true);
				}
	
				onStop()
				{
					Patcher.unpatchAll();
					DiscordModules.UserSettingsStore.removeChangeListener(this.handleUserSettingsChange);
					// Remove upload node
					if (toastNode != null) {
						toastNode.remove();
						toastNode = null;
					}
					appNode = null;
					uploadToasts.clear();
					uploadQueue = [];
					processingQueue = [];
					processingThreadCount = 0;
					// Remove event listeners
					window.removeEventListener("drop", this.drop, true);
					document.removeEventListener("paste", this.paste, true);
					PluginUtilities.removeStyle('FileCompressor-CSS');
				}
				
				async closeUploadModal() {
					if (uploadQueue.length > 0) {
						let entry = uploadQueue.shift();
						this.setStatusToast("UPLOADING", uploadQueue.length);
						setTimeout(() => {
							this.uploadFile(entry.dt, entry.guildId, entry.channelId);
						}, 300);
					}
				}
				
				addToastArea() {
					// Remove old upload node
					toastNode = document.getElementById('pseudocompressor-toasts');
					if (toastNode == null) {
						toastNode = document.createElement("div");
						toastNode.id = "pseudocompressor-toasts";
						appNode.appendChild(toastNode);
					}
				}
				
				async setStatusToast(type, remaining) {
					this.addToastArea();
					if (remaining <= 0) {
						if (uploadToasts.has(type)) {
							let toast = uploadToasts.get(type);
							toast.remove();
							uploadToasts.delete(type);
						}
					} else {
						if (uploadToasts.has(type)) {
							let toast = uploadToasts.get(type);
							let toastMsg = toast.querySelector('.pseudocompressor-toast-message');
							switch (type) {
								default:
								case "COMPRESSING":
									toastMsg.innerHTML = "Compressing " + remaining + (remaining == 1 ? " file" : " files");
									break;
								case "UPLOADING":
									toastMsg.innerHTML = remaining + (remaining == 1 ? " file" : " files") + " to be uploaded";
									break;
								case "QUEUEING":
									toastMsg.innerHTML = remaining + (remaining == 1 ? " file" : " files") + " to be compressed";
									break;
							}
							
						} else {
							let toast = null;
							switch (type) {
								default:
								case "COMPRESSING":
									toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon spin">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
										message: "Compressing " + remaining + (remaining == 1 ? " file" : " files"),
										icon: loadingSvg
									}));
									break;
								case "UPLOADING":
									toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
										message: remaining + (remaining == 1 ? " file" : " files") + " to be uploaded",
										icon: uploadSvg
									}));
									break;
								case "QUEUEING":
									toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
										message: remaining + (remaining == 1 ? " file" : " files") + " to be compressed",
										icon: queueSvg
									}));
									break;
							}
							toastNode.appendChild(toast);
							uploadToasts.set(type, toast);
						}
					}
				}
				
				// Modals.showConfirmationModal("FFmpeg Required", "To compress video/audio, the FFmpeg program is required. FFmpeg is licensed under GPL Version 2.", {danger: false, confirmText: "Install FFmpeg", onConfirm: () => {console.log("confirm");}, onCancel: () => {console.log("cancel");}});
				// https://rauenzi.github.io/BDPluginLibrary/docs/ui_modals.js.html
				
				// Store each file to be processed with channel/guild ID, when file is done processing and upload each finished file consecutively once upload modal is gone
				
				async paste(event) {
					if (event.isTrusted && event.clipboardData !== null && event.clipboardData.files.length != 0) {
						// Stop event from propagating
						event.stopPropagation();
						// Dispatch new event
						const guildId = DiscordAPI.currentChannel !== null ? DiscordAPI.currentChannel.discordObject.guild_id : null;
						const channelId = DiscordAPI.currentChannel !== null ? DiscordAPI.currentChannel.discordObject.id : null;
						this.processDataTransfer(event.clipboardData, guildId, channelId);
					}
				}
				
				async drop(event) {
					if (event.isTrusted && event.dataTransfer !== null && event.dataTransfer.files.length != 0) {
						if (originalUploadNode == null) {
							originalUploadNode = document.querySelector('[class*="uploadArea-"]');
						}
						if (originalUploadNode != null) {
							if (this.listStartsWith(originalUploadNode.classList, "droppable-")) {
								// Stop event from propagating
								event.stopPropagation();
								// Dispatch new event
								const guildId = DiscordAPI.currentChannel !== null ? DiscordAPI.currentChannel.discordObject.guild_id : null;
								const channelId = DiscordAPI.currentChannel !== null ? DiscordAPI.currentChannel.discordObject.id : null;
								this.processDataTransfer(event.dataTransfer, guildId, channelId);
							}
						}
					}
				}
				
				uploadFileQueue(dt, guildId, channelId) {
					if (document.querySelector('[class*="uploadModal-"]') != null) {
						uploadQueue.push({dt: dt, guildId: guildId, channelId: channelId});
						this.setStatusToast("UPLOADING", uploadQueue.length);
						/*const uploadModal = document.getElementsByClassName(uploadModalClass)[0];
						const stateNode = uploadModal.__reactInternalInstance$.return.stateNode;*/
					} else {
						this.uploadFile(dt, guildId, channelId);
					}
				}
				
				wrapFile(file) {
					const dt = new DataTransfer();
					dt.dropEffect = "copy";
					dt.effectAllowed = "all";
					dt.items.add(file);
					return dt;
				}
				
				uploadFile(dt, guildId, channelId) {
					const originalGuildId = DiscordAPI.currentChannel !== null ? DiscordAPI.currentChannel.discordObject.guild_id : null;
					const originalChannelId = DiscordAPI.currentChannel !== null ? DiscordAPI.currentChannel.discordObject.id : null;
					if (channelId && (DiscordAPI.currentChannel == null || (DiscordAPI.currentChannel.discordObject.guild_id != guildId || DiscordAPI.currentChannel.discordObject.id != channelId))) {
						DiscordModules.NavigationUtils.transitionToGuild(!guildId ? "@me" : guildId, channelId);
					}
					if ((!guildId && !channelId) || (DiscordAPI.currentChannel !== null && (!guildId ? DiscordAPI.currentChannel.discordObject.guild_id == null : DiscordAPI.currentChannel.discordObject.guild_id == guildId) && DiscordAPI.currentChannel.discordObject.id == channelId)) {
						try {
							if (originalUploadNode != null && this.listStartsWith(originalUploadNode.classList, "droppable-")) {
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
					} else {
						BdApi.showToast("Unable to return to channel to upload " + dt.files.length + (dt.files.length == 1 ? " file" : " files") + "!", {type: "error"});
						if (originalChannelId && (DiscordAPI.currentChannel == null || (DiscordAPI.currentChannel.discordObject.guild_id != originalGuildId || DiscordAPI.currentChannel.discordObject.id != originalChannelId))) {
							DiscordModules.NavigationUtils.transitionToGuild(!originalGuildId ? "@me" : originalGuildId, originalChannelId);
						}
					}
				}
				
				async processDataTransfer(dt, guildId, channelId) {
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
					const originalDt = new DataTransfer();
					originalDt.dropEffect = "copy";
					originalDt.effectAllowed = "all";
					var files = dt.files;
					var tempFiles = [];
					var queuedFiles = 0;
					for (let i = 0; i < files.length; i++) {
						let file = files[i];
						if (file.size >= maxUploadSize) {
							// If file is returned, it was incompressible
							let tempFile = this.checkCompressFile(file, file.type.split('/')[0]);
							// Check if no files will be uploaded, and if so, trigger Discord's file too large modal by passing through large file
							if (tempFile) {
								if (i == files.length - 1 && originalDt.items.length == 0 && queuedFiles == 0) {
									originalDt.items.add(file);
								}
							} else {
								queuedFiles++;
							}
						} else {
							// Add files that are small enough
							originalDt.items.add(file);
						}
					}
					// Show toast saying a file was too large to upload if some files are being uploaded, but not others
					if (originalDt.files.length > 0 && files.length > (originalDt.files.length + queuedFiles)) {
						let num = (files.length - (originalDt.files.length + queuedFiles));
						BdApi.showToast(num + (num == 1 ? " file was " : " files were ") + "too large to upload!", {type: "error"});
					}
					if (originalDt.files.length > 0) {
						this.uploadFileQueue(originalDt, guildId, channelId);
					}
				}
				
				// Initial check if a large file is compressible
				// Returns the original file if not compressible, otherwise sends all files to compressFile for compression queue
				checkCompressFile(file, type, guildId, channelId) {
					switch (type) {
						case "image":
							this.compressFile(file, type, guildId, channelId);
							break;
						default:
							return file;
					}
					return null;
				}
				
				// Asks the user for settings to use when compressing the file and compresses the file if possible, or queues it for later
				compressFile(file, type, guildId, channelId) {
					var options = {test: true};
					switch (type) {
						case "image":
							// Ask for compression settings
							break;
					}
					if (processingThreadCount < this.settings.compressor.concurrentThreads) {
						this.setStatusToast("COMPRESSING", ++processingThreadCount);
						this.compressFileType(file, type, guildId, channelId, options);
					} else {
						processingQueue.push({file: file, type: type, guildId: guildId, channelId: channelId, options: options});
						this.setStatusToast("QUEUEING", processingQueue.length);
					}
				}
				
				// Sends the file to the appropriate compressor once all checks have passed
				compressFileType(file, type, guildId, channelId, options) {
					switch (type) {
						case "image":
							this.finishProcessing(this.compressImage(file, options), guildId, channelId);
							//https://github.com/davejm/client-compress
							break;
					}
				}
				
				// When a file is done processing, add it to the upload queue and check if a new file can be processed
				finishProcessing(filePromise, guildId, channelId) {
					filePromise.then(file => {
						if (file != null) {
							this.uploadFileQueue(this.wrapFile(file), guildId, channelId);
						}
						this.processNextFile();
					}).catch(error => {
						BdApi.showToast("Error compressing file!", {type: "error"});
						this.processNextFile();
					});
				}
				
				// Start processing a new file if possible
				processNextFile() {
					if (processingQueue.length > 0) {
						if (processingThreadCount <= this.settings.compressor.concurrentThreads) {
							let entry = processingQueue.shift();
							this.setStatusToast("QUEUEING", processingQueue.length);
							this.compressFileType(entry.file, entry.type, entry.guildId, entry.channelId, entry.options);
						}
					} else {
						this.setStatusToast("COMPRESSING", --processingThreadCount);
					}
				}
				
				loadImageElement = (img, src) => {
					return new Promise((resolve, reject) => {
						img.addEventListener("load", () => {resolve(img)}, false);
						img.addEventListener("error", (err) => {reject(err)}, false);
						img.src = src;
					});
				};
				
				async compressImage(file, options) {
					const objectUrl = URL.createObjectURL(file);
					const img = new window.Image();
					await this.loadImageElement(img, objectUrl);
					URL.revokeObjectURL(objectUrl);
					const image = {file: file, data: img, outputData: null, width: img.naturalWidth, height: img.naturalHeight, iterations: 0};
					if (await this.compressImageLoop(image) !== null) {
						return new File([image.outputData], image.file.name, {type: image.file.type});
					}
					return null;
				}
				
				async compressImageLoop(image) {
					image.iterations++;
					var blob = await this.compressImageCanvas(image);
					image.outputData = blob;
					if (image.outputData.size >= maxUploadSize) {
						if (image.iterations >= imageMaxIterations) {
							BdApi.showToast("Unable to comress impage!", {type: "error"});
							return null;
						} else {
							await this.compressImageLoop(image);
						}
					} else {
						return image;
					}
				}
				
				async compressImageCanvas(image) {
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d");
					var multiplier = Math.pow(imageSizeMultiplier, image.iterations);
					canvas.width = Math.round(image.width * multiplier);
					canvas.height = Math.round(image.height * multiplier);
					context.drawImage(image.data, 0, 0, canvas.width, canvas.height);
					return new Promise((resolve, reject) => {
						canvas.toBlob((blob) => {resolve(blob);}, image.file.type);
					});
				}
				
				getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}
				
				// https://github.com/jaimeadf/BetterDiscordPlugins/blob/84a8d3e7cf454d3a25c2caa337a3612529d5fee3/src/GuildProfile/index.jsx#L55
				// https://github.com/QWERTxD/BetterDiscordPlugins/blob/main/InAppNotifications/InAppNotifications.plugin.js#L35
				saveSettings(category, setting, value) {
					this.settings[category][setting] = value;
					PluginUtilities.saveSettings(config.info.name, this.settings);
				}

				async handleUserSettingsChange() {
					// Update lang
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
				
			};
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
