/**
 * @name FileCompressor
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js
 */

module.exports = (() => {
	const config = {
		info: {
			name: "FileCompressor",
			authors: [
				{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "1.2.3",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [
			{
				title: "Video Compression",
				type: "added",
				items: [
					"Uses FFmpeg to compress video"
				]
			},
			{
				title: "Fixed",
				type: "fixed",
				items: [
					"Fixed automatic channel switch option with threads",
					"Fixed FFmpeg download prompt modal",
					"Tuned FFmpeg to reach 8MB targets with better quality"
				]
			}
		],
		defaultConfig: [
			{
				type: 'category',
				id: 'upload',
				name: 'Upload Settings',
				collapsible: true,
				shown: false,
				settings: [
					{
						name: 'Auto Channel Switch',
						note: 'Automatically switch to the required channel when a file is ready to be uploaded.',
						id: 'autoChannelSwitch',
						type: 'switch',
						value: true
					},
					{
						name: 'Immediate Upload',
						note: 'Immediately upload files without showing a preview.',
						id: 'immediateUpload',
						type: 'switch',
						value: false
					}
				]
			},
			{
				type: 'category',
				id: 'compressor',
				name: 'Compressor Settings',
				collapsible: true,
				shown: false,
				settings: [
					{
						name: 'Concurrent Compression Threads',
						note: 'Number of compression jobs that can be processing simultaneously.',
						id: 'concurrentThreads',
						type: 'slider',
						min: 1,
						max: 5,
						value: 3,
						markers: [1, 2, 3, 4, 5],
						stickToMarkers: true
					},
					{
						name: 'Cache Location',
						note: 'Custom file cache location to use (Leave empty to use default location).',
						id: 'cachePath',
						type: 'textbox',
						value: ""
					},
					{
						name: 'Use FFmpeg',
						note: 'Enable the use of FFmpeg for compressing video and audio.',
						id: 'ffmpeg',
						type: 'switch',
						value: false
					},
					{
						name: 'Download FFmpeg',
						note: 'Should FFmpeg be automatically downloaded? Disable this to use a custom installation.',
						id: 'ffmpegDownload',
						type: 'switch',
						value: true
					},
					{
						name: 'FFmpeg Install Location',
						note: 'Custom FFmpeg install location to use (Leave empty to use default location).',
						id: 'ffmpegPath',
						type: 'textbox',
						value: ""
					}
				]
			}
		]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
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
			const { Logger, Patcher, UserSettingsStore, Modals, DiscordModules, DiscordClasses, Utilities, DOMTools, PluginUtilities, DiscordAPI, WebpackModules } = Api;
			
			// Node modules
			const fs = require('fs');
			const path = require('path');
			const child_process = require('child_process');
			const uuidv4 = require('uuid/v4');
			const cryptoModule = require('crypto');
			const mime = require('mime-types');
			// Real multithreading
			// const { Worker } = require('worker_threads');

			// Cache container
			let cache = null;

			// FFmpeg container
			let ffmpeg = null;
			let tempDataPath = null;

			const ffmpegVersion = "4.4";
			const ffmpegSourceUrl = "https://github.com/FFmpeg/FFmpeg/tree/n4.4";
			const ffmpegLicense = "GPL Version 2";
			const ffmpegLicenseUrl = "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html";
			const ffmpegDownloadUrls = {
				win32: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-win.exe",
				darwin: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-osx",
				amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-amd64",
				arm64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-arm64",
				armhf: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-armhf",
				i686: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-i686"
			};
			const ffprobeDownloadUrls = {
				win32: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-win.exe",
				darwin: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-osx",
				amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-amd64",
				arm64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-arm64",
				armhf: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-armhf",
				i686: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-i686"
			};
			const librarySuffixes = {
				win32: "-win.exe",
				darwin: "-osx",
				amd64: "-linux-amd64",
				arm64: "-linux-arm64",
				armhf: "-linux-armhf",
				i686: "-linux-i686"
			};
			
			const encoderSettings = {
				"libx264": {
					fileType: "mp4"
				},
				"libvpx-vp9": {
					fileType: "webm"
				}
			};
			
			// Queue for files waiting to be compressed
			let processingQueue = [];
			// Number of files currently being processed
			let processingThreadCount = 0;
			// List of currently running processes
			let runningProcesses = [];
			
			// Discord related data
			const Markdown = BdApi.findModule(m => m.displayName === "Markdown" && m.rules);
			let uploadModalClass = null;
			let appNode = null;
			let uploadNode = null;
			// Custom elements
			let toastNode = null;
			// Map of current toasts
			const uploadToasts = new Map();
			// Toast icon SVGs
			const loadingSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M12,0v2C6.48,2,2,6.48,2,12c0,3.05,1.37,5.78,3.52,7.61l1.15-1.66C5.04,16.48,4,14.36,4,12c0-4.41,3.59-8,8-8v2l2.59-1.55l2.11-1.26L17,3L12,0z"/><path d="M18.48,4.39l-1.15,1.66C18.96,7.52,20,9.64,20,12c0,4.41-3.59,8-8,8v-2l-2.59,1.55L7.3,20.82L7,21l5,3v-2c5.52,0,10-4.48,10-10C22,8.95,20.63,6.22,18.48,4.39z"/></svg>`;
			const queueSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M21.84,1H2.16l7.15,11L2.16,23h19.68l-7.15-11L21.84,1z M11.69,12L5.84,3h12.31l-5.85,9H11.69z"/></svg>`;
			
			// Original Discord upload function before patch
			let originalUploadFunction = null
			
			// Current upload cap
			let maxUploadSize = 8388608;
			
			const imageSizeMultiplier = 0.9;
			const imageMaxIterations = 50;
			
			let FFmpeg = class {
				constructor(ffmpegFolder) {
					if (fs.existsSync(ffmpegFolder)) {
						this.ffmpeg = path.join(ffmpegFolder, "ffmpeg");
						this.ffprobe = path.join(ffmpegFolder, "ffmpeg");
						if (process.platform == "win32") {
							this.ffmpeg += ".exe";
							this.ffprobe += ".exe";
						}
						if (!fs.existsSync(this.ffmpeg) || !fs.existsSync(this.ffprobe)) {
							this.ffmpeg = path.join(ffmpegFolder, "ffmpeg");
							switch (process.platform) {
								case "win32":
								case "darwin":
									this.ffmpeg += librarySuffixes[process.platform];
									break;
								default:
									switch (process.arch) {
										case "arm":
									this.ffmpeg += librarySuffixes["armhf"];
											break;
										case "arm64":
											this.ffmpeg += librarySuffixes["arm64"];
											break;
										case "x64":
											this.ffmpeg += librarySuffixes["amd64"];
											break;
										case "ia32":
										case "x32":
										default:
											this.ffmpeg += librarySuffixes["i686"];
											break;
									}
							}
							this.ffprobe = path.join(ffmpegFolder, "ffprobe");
							switch (process.platform) {
								case "win32":
								case "darwin":
									this.ffprobe += librarySuffixes[process.platform];
									break;
								default:
									switch (process.arch) {
										case "arm":
											this.ffprobe += librarySuffixes["armhf"];
											break;
										case "arm64":
											this.ffprobe += librarySuffixes["arm64"];
											break;
										case "x64":
											this.ffprobe += librarySuffixes["amd64"];
											break;
										case "ia32":
										case "x32":
										default:
											this.ffprobe += librarySuffixes["i686"];
											break;
									}
							}
						}
						if (fs.existsSync(this.ffmpeg) && fs.existsSync(this.ffprobe)) {
							Logger.info(config.info.name, "Running FFmpeg -version");
							Logger.debug(config.info.name, child_process.execFileSync(this.ffmpeg, ["-version"], {timeout: 10000}).toString());
						} else {
							throw new Error("Unable to find FFmpeg");
						}
					} else {
						throw new Error("Unable to find FFmpeg");
					}
				}
				
				runWithArgs(args) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.ffmpeg)) {
							Logger.info(config.info.name, "Running FFmpeg with " + args.join(' '));
							const process = child_process.execFile(this.ffmpeg, args, (err, stdout, stderr) => {
								if (err) {
									console.error(stderr);
									reject(e);
								}
								try {
									resolve({data: stdout, error: err});
								} catch (e) {
									console.error(e);
									reject(e);
								}
								const index = runningProcesses.indexOf(process);
								if (index > -1)
									runningProcesses.splice(index, 1);
							});
							runningProcesses.push(process);
						} else {
							throw new Error("Unable to find FFmpeg");
						}
					});
				}
				
				runProbeWithArgs(args) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.ffprobe)) {
							Logger.info(config.info.name, "Running FFprobe with " + args.join(' '));
							const process = child_process.execFile(this.ffprobe, args, (err, stdout, stderr) => {
								if (err) {
									console.error(stderr);
									reject(e);
								}
								try {
									resolve({data: stdout, error: err});
								} catch (e) {
									console.error(e);
									reject(e);
								}
								const index = runningProcesses.indexOf(process);
								if (index > -1)
									runningProcesses.splice(index, 1);
							});
							runningProcesses.push(process);
						} else {
							throw new Error("Unable to find FFprobe");
						}
					});
				}
				
				checkFFmpeg() {
					return fs.existsSync(this.ffmpeg) && fs.existsSync(this.ffprobe);
				}
			};

			let FileCache = class {
				constructor(cacheFolder) {
					this.getFile = this.getFile.bind(this);
					this.getCachePath = this.getCachePath.bind(this);
					this.saveAndCache = this.saveAndCache.bind(this);
					this.addToCache = this.addToCache.bind(this);
					this.removeFile = this.removeFile.bind(this);
					this.clear = this.clear.bind(this);
					this.cachePath = cacheFolder;
					this.cache = [];
					this.cacheLookup = new Map();
					if (!fs.existsSync(this.cachePath)) {
						fs.mkdirSync(this.cachePath, {recursive: true});
					}
					fs.accessSync(this.cachePath, fs.constants.R_OK | fs.constants.W_OK);
					this.clear();
				}

				async hash(file) {
					const hash = cryptoModule.createHash('md5');
					const fileStreamReader = file.stream().getReader();
					const hashPromise = new Promise((resolve, reject) => {
						fileStreamReader.read().then(function processData({done, value}) {
							try {
								if (done) {
									resolve(hash.digest('hex'));
									return;
								}
								hash.update(value);
								return fileStreamReader.read().then(processData);
							} catch (err) {
								console.error(err);
								reject();
								return;
							}
						});
					});
					try {
						return await hashPromise;
					} catch (e) {
					}
					return;
				}

				getFile(hash) {
					let entry = this.cacheLookup.get(hash);
					if (entry) {
						if (fs.existsSync(entry.path)) {
							return new File([Uint8Array.from(Buffer.from(fs.readFileSync(entry.path))).buffer], entry.name, {type: mime.contentType(entry.path)});
						} else {
							this.removeFile(hash);
						}
					}
					return null;
				}
				
				getCachePath() {
					return this.cachePath;
				}

				async saveAndCache(file, hash) {
					try {
						let nameSplit = file.name.split('.');
						let name = nameSplit.slice(0, nameSplit.length - 1).join(".");
						let extension = nameSplit[nameSplit.length - 1];
						for (let i = 0; i < 5; i++) {
							let filePath = path.join(this.cachePath, name + "." + uuidv4() + "." + extension);
							if (!fs.existsSync(filePath)) {
								let fr = new FileReader();
								fr.readAsBinaryString(file);
								fr.onloadend = e => {
									fs.writeFileSync(filePath, fr.result, {encoding: 'binary'});
									this.addToCache(filePath, file.name, hash);
								};
								fr.onerror = e => {
									Logger.err(config.info.name, fr.error);
									BdApi.showToast("Error caching file!", {type: "error"});
								};
								return;
							}
						}
						Logger.err(config.info.name, "Too many overlapping files in cache for " + file.name);
						BdApi.showToast("Error caching file!", {type: "error"});
					} catch (err) {
						Logger.err(config.info.name, err);
						BdApi.showToast("Error caching file!", {type: "error"});
					}
				}

				addToCache(path, name, hash) {
					let entry = {path: path, name: name, expiry: Date.now() + 86400000, hash: hash};
					this.cache.push(entry);
					this.cacheLookup.set(hash, entry);
				}

				removeFile(hash) {
					let entry = this.cacheLookup.get(hash);
					if (entry) {
						this.cacheLookup.delete(hash);
						let index = this.cache.indexOf(entry);
						if (index >= 0) {
							this.cache.splice(index, 1);
						}
					}
				}

				clear() {
					if (this.cacheLookup != null) {
						this.cacheLookup.clear();
					}
					this.cache = [];
					fs.readdir(this.cachePath, (err, files) => {
						if (err) throw err;
						for (const file of files) {
							fs.unlink(path.join(this.cachePath, file), err => {
								if (err) {
									Logger.err(config.info.name, "Error deleting temp file: " + file);
									Logger.err(config.info.name, err);
								}
							});
						}
					});
				}
			}

			return class FileCompressor extends Plugin {
				constructor() {
					super();
					this.updateCache = this.updateCache.bind(this);
					this.handleUpload = this.handleUpload.bind(this);
					this.uploadFileQueue = this.uploadFileQueue.bind(this);
					this.uploadFile = this.uploadFile.bind(this);
					this.processFileList = this.processFileList.bind(this);
					this.checkCompressFile = this.checkCompressFile.bind(this);
					this.compressFile = this.compressFile.bind(this);
					this.compressFileType = this.compressFileType.bind(this);
					this.finishProcessing = this.finishProcessing.bind(this);
					this.processNextFile = this.processNextFile.bind(this);
					this.initFfmpeg = this.initFfmpeg.bind(this);
					this.downloadLibrary = this.downloadLibrary.bind(this);
					this.initTempFolder = this.initTempFolder.bind(this);
					this.compressVideo = this.compressVideo.bind(this);
					this.compressImage = this.compressImage.bind(this);
					this.compressImageLoop = this.compressImageLoop.bind(this);
					this.saveSettings = this.saveSettings.bind(this);
					this.onStart = this.onStart.bind(this);
					this.onStop = this.onStop.bind(this);
				}
	
				onStart() {
					// Patch upload event to listen for file uploads
					const promptToUploadModule = BdApi.findModuleByProps("promptToUpload");
					if (promptToUploadModule) {
						this.originalUploadFunction = promptToUploadModule.promptToUpload;
						const uploadFunc = this.handleUpload;
						const originalFunc = this.originalUploadFunction;
						if (this.originalUploadFunction && this.originalUploadFunction.length === 7) {
							promptToUploadModule.promptToUpload = function(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft, fileCompressorCompressedFile = false) {
								if (fileCompressorCompressedFile) {
									return originalFunc(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft);
								} else {
									return uploadFunc(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft);
								}
							};
						} else {
							BdApi.showToast("Unable to hook into Discord upload handler!", {type: "error"});
							if (this.originalUploadFunction) {
								console.erroror("Unable to hook into Discord upload handler! Method " + this.originalUploadFunction + (this.originalUploadFunction ? " has " + this.originalUploadFunction.length + " arguments!" : " doesn't exist!"));
							} else {
								console.erroror("Unable to hook into Discord upload handler! Method doesn't exist in promptToUpload: " + promptToUploadModule);
							}
							promptToUploadModule.promptToUpload = this.originalUploadFunction;
							this.originalUploadFunction = null;
						}
					} else {
						BdApi.showToast("Unable to hook into Discord upload handler!", {type: "error"});
						console.erroror("Unable to hook into Discord upload handler! promptToUpload module doesn't exist!");
					}
					// Add event listeners
					DiscordModules.UserSettingsStore.addChangeListener(this.handleUserSettingsChange);
					// Get Discord related variables
					appNode = document.getElementById('app-mount');
					uploadModalClass = BdApi.findModuleByProps('uploadModal').uploadModal.split(' ')[0];
					// Setup cache
					this.updateCache();
					// Setup toasts
					this.addToastArea();
					PluginUtilities.addStyle('FileCompressor-CSS',`
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
					`);
				}
	
				onStop() {
					// Remove patches
					Patcher.unpatchAll();
					if (this.originalUploadFunction) {
						BdApi.findModuleByProps("promptToUpload").promptToUpload = this.originalUploadFunction;
					}
					// Remove event listeners
					DiscordModules.UserSettingsStore.removeChangeListener(this.handleUserSettingsChange);
					// Remove upload node
					if (toastNode != null) {
						toastNode.remove();
						toastNode = null;
					}
					// Killing running processes
					runningProcesses.filter(process => {
						process.kill("SIGKILL");
						return false;
					});
					uploadToasts.clear();
					appNode = null;
					processingQueue = [];
					processingThreadCount = 0;
					// Clear cache
					try {
						if (this.cache) {
							this.cache.clear();
						}
					} catch (err) {
						Logger.err(config.info.name, err);
					}
					this.cache = null;
					PluginUtilities.removeStyle('FileCompressor-CSS');
				}

				updateCache() {
					if (this.cache) {
						try {
							this.cache.clear();
						} catch (err) {
							Logger.err(config.info.name, err);
						}
					}
					// Setup cache
					try {
						this.cache = new FileCache(this.settings.compressor.cachePath ? this.settings.compressor.cachePath : path.join(BdApi.Plugins.folder, "CompressorCache"));
					} catch (err) {
						BdApi.showToast("Error setting up cache!", {type: "error"});
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
									toastMsg.innerHTML = "Compressing " + remaining + (remaining === 1 ? " file" : " files");
									break;
								case "QUEUEING":
									toastMsg.innerHTML = remaining + (remaining === 1 ? " file" : " files") + " to be compressed";
									break;
								case "DOWNLOADING":
									toastMsg.innerHTML = "Downloading libraries";
									break;
							}
							
						} else {
							let toast = null;
							switch (type) {
								default:
								case "COMPRESSING":
									toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon spin">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
										message: "Compressing " + remaining + (remaining === 1 ? " file" : " files"),
										icon: loadingSvg
									}));
									break;
								case "QUEUEING":
									toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
										message: remaining + (remaining === 1 ? " file" : " files") + " to be compressed",
										icon: queueSvg
									}));
									break;
								case "DOWNLOADING":
									toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
										message: "Downloading libraries",
										icon: queueSvg
									}));
									break;
							}
							toastNode.appendChild(toast);
							uploadToasts.set(type, toast);
						}
					}
				}
				
				async handleUpload(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft) {
					let guildId = null;
					let channelId = null;
					let threadId = null;
					let sidebar = false;
					if (channel.threadMetadata) {
						// Thread
						guildId = channel.guild_id;
						channelId = channel.parent_id;
						threadId = channel.id;
						sidebar = DiscordAPI.currentChannel ? DiscordAPI.currentChannel.discordObject.id !== threadId : false;
					} else {
						// Normal channel
						guildId = channel.guild_id;
						channelId = channel.id;
					}
					this.processFileList(fileList, guildId, channelId, threadId, sidebar);
					return true;
				}

				uploadFileQueue(files, guildId, channelId, threadId, sidebar) {
					this.uploadFile(files, guildId, channelId, threadId, sidebar);
					if (this.settings.upload.autoChannelSwitch) {
						this.switchChannel(guildId, channelId, threadId, sidebar);
					}
				}
				
				wrapFile(file) {
					const dt = new DataTransfer();
					dt.items.add(file);
					return dt.files;
				}
				
				switchChannel(guildId, channelId, threadId, sidebar) {
					if (!channelId)
						return false;
					const originalGuildId = DiscordAPI.currentChannel ? DiscordAPI.currentChannel.discordObject.guild_id : null;
					const originalChannelId = DiscordAPI.currentChannel ? (DiscordAPI.currentChannel.discordObject.threadMetadata ? DiscordAPI.currentChannel.discordObject.parent_id : DiscordAPI.currentChannel.discordObject.id) : null;
					const originalThreadId = DiscordAPI.currentChannel ? (DiscordAPI.currentChannel.discordObject.threadMetadata ? DiscordAPI.currentChannel.discordObject.id : null) : null;
					let sidebarThreadData = BdApi.findModuleByProps('getThreadSidebarState').getThreadSidebarState(originalChannelId);
					const sidebarThreadId = (DiscordAPI.currentChannel && !originalThreadId) ? (sidebarThreadData ? sidebarThreadData.channelId : null) : null;
					if (threadId) {
						if (threadId !== sidebarThreadId && threadId !== originalThreadId) {
							if (sidebar) {
								DiscordModules.NavigationUtils.transitionToThread(!guildId ? "@me" : guildId, channelId);
								BdApi.findModuleByProps('gotoThread').gotoThread(null, {id: threadId});
							} else {
								DiscordModules.NavigationUtils.transitionToThread(!guildId ? "@me" : guildId, threadId);
							}
						}
					} else {
						DiscordModules.NavigationUtils.transitionToGuild(!guildId ? "@me" : guildId, channelId);
					}
					sidebarThreadData = BdApi.findModuleByProps('getThreadSidebarState').getThreadSidebarState(DiscordAPI.currentChannel.discordObject.id);
					if ((guildId ? DiscordAPI.currentChannel.discordObject.guild_id === guildId : !DiscordAPI.currentChannel.discordObject.guild_id) && (threadId ? ((DiscordAPI.currentChannel.discordObject.id === threadId && DiscordAPI.currentChannel.discordObject.parent_id === channelId) || DiscordAPI.currentChannel.discordObject.id === channelId && (sidebarThreadData ? sidebarThreadData.channelId : null) === threadId) : DiscordAPI.currentChannel.discordObject.id === channelId)) {
						return true;
					} else {
						BdApi.showToast("Unable to return to channel to upload files!", {type: "error"});
						if (originalThreadId)
							DiscordModules.NavigationUtils.transitionToThread(!originalGuildId ? "@me" : originalGuildId, originalThreadId);
						else
							DiscordModules.NavigationUtils.transitionToGuild(!originalGuildId ? "@me" : originalGuildId, originalChannelId);
					}
					return false;
				}
				
				uploadFile(files, guildId, channelId, threadId, sidebar) {
					try {
						const channelObj = threadId ? DiscordModules.ChannelStore.getChannel(threadId) : DiscordModules.ChannelStore.getChannel(channelId);
						channelObj.fileCompressorCompressedFile = true;
						BdApi.findModuleByProps("promptToUpload").promptToUpload(files, channelObj, 0, true, !(this.settings.upload.immediateUpload), false, false, true /*Special boolean to mark file as processed and prevent loops*/);
					} catch (e) {
						Logger.err(config.info.name, e);
						BdApi.showToast("Error uploading files!", {type: "error"});
					}
				}
				
				processFileList(files, guildId, channelId, threadId, sidebar) {
					// Check account status and update max file upload size
					try {
						maxUploadSize = DiscordModules.DiscordConstants.PremiumUserLimits[DiscordAPI.currentUser.discordObject.premiumType ? DiscordAPI.currentUser.discordObject.premiumType : 0].fileSize;
					} catch (e) {
						Logger.err(config.info.name, e);
						BdApi.showToast("Error getting account info!", {type: "error"});
						maxUploadSize = 8388608;
					}
					// Synthetic DataTransfer to generate FileList
					const originalDt = new DataTransfer();
					const tempFiles = [];
					let queuedFiles = 0;
					for (let i = 0; i < files.length; i++) {
						let file = files[i];
						if (file.size >= maxUploadSize) {
							// If file is returned, it was incompressible
							let tempFile = this.checkCompressFile(file, file.type.split('/')[0], guildId, channelId, threadId, sidebar);
							// Check if no files will be uploaded, and if so, trigger Discord's file too large modal by passing through large file
							if (tempFile) {
								if (i === files.length - 1 && originalDt.items.length === 0 && queuedFiles === 0) {
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
						BdApi.showToast(num + (num === 1 ? " file was " : " files were ") + "too large to upload!", {type: "error"});
					}
					if (originalDt.files.length > 0) {
						this.uploadFileQueue(originalDt.files, guildId, channelId, threadId, sidebar);
					}
				}
				
				// Initial check if a large file is compressible
				// Returns the original file if not compressible, otherwise sends all files to compressFile for compression queue
				checkCompressFile(file, type, guildId, channelId, threadId, sidebar) {
					switch (type) {
						case "image":
							this.compressFile(file, type, guildId, channelId, threadId, sidebar);
							break;
						case "video":
							this.compressFile(file, type, guildId, channelId, threadId, sidebar);
							break;
						default:
							return file;
					}
					return null;
				}
				
				// Asks the user for settings to use when compressing the file and compresses the file if possible, or queues it for later
				async compressFile(file, type, guildId, channelId, threadId, sidebar) {
					let hash = await this.cache.hash(file);
					let cacheFile;
					if (this.cache) {
						try {
							cacheFile = this.cache.getFile(hash);
						} catch (err) {
							Logger.err(config.info.name, err);
						}
					}
					let options = {useCache: true};
					// If cached file exists, ask user if they want to use cached options
					switch (type) {
						case "image":
							// Ask for compression settings
							break;
						case "video":
							// Ask for compression settings
							//options.encoder = "libvpx-vp9";
							options.encoder = "libx264";
							//options.sizeCap = "8388608" // Max size in bytes
							//options.maxHeight = 720;
							break;
					}
					// If user wants to use cached options & cached file exists
					if (cacheFile && options.useCache) {
						this.uploadFileQueue(this.wrapFile(cacheFile), guildId, channelId, threadId, sidebar);
					} else {
						if (processingThreadCount < this.settings.compressor.concurrentThreads) {
							this.setStatusToast("COMPRESSING", ++processingThreadCount);
							this.compressFileType(file, type, guildId, channelId, threadId, sidebar, options, hash);
						} else {
							processingQueue.push({file: file, type: type, guildId: guildId, channelId: channelId, threadId: threadId, sidebar: sidebar, options: options, originalHash, hash});
							this.setStatusToast("QUEUEING", processingQueue.length);
						}
					}
				}
				
				// Sends the file to the appropriate compressor once all checks have passed
				compressFileType(file, type, guildId, channelId, threadId, sidebar, options, originalHash) {
					switch (type) {
						case "image":
							this.finishProcessing(this.compressImage(file, options), guildId, channelId, threadId, sidebar, originalHash, true);
							// https://github.com/davejm/client-compress
							break;
						case "video":
							this.finishProcessing(this.compressVideo(file, options, originalHash), guildId, channelId, threadId, sidebar, originalHash, false);
							break;
					}
				}
				
				// When a file is done processing, add it to the upload queue and check if a new file can be processed
				finishProcessing(promise, guildId, channelId, threadId, sidebar, originalHash, shouldCache) {
					promise.then(file => {
						if (file != null) {
							this.uploadFileQueue(this.wrapFile(file), guildId, channelId, threadId, sidebar);
							if (this.cache && shouldCache) {
								this.cache.saveAndCache(file, originalHash);
							}
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
							this.compressFileType(entry.file, entry.type, entry.guildId, entry.channelId, entry.threadId, entry.sidebar, entry.options, entry.originalHash);
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

				initFfmpeg() {
					return new Promise((resolve, reject) => {
						let ffmpegPath = this.settings.compressor.ffmpegPath ? this.settings.compressor.ffmpegPath : path.join(BdApi.Plugins.folder, "CompressorLibraries");
						let noFfmpeg = false;
						let installedFfmpeg = BdApi.getData(config.info.name, "ffmpeg.version");
						if (installedFfmpeg && installedFfmpeg != ffmpegVersion) {
							noFfmpeg = true;
						} else {
							if (this.settings.compressor.ffmpeg) {
								if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
									try {
										ffmpeg = new FFmpeg(ffmpegPath);
										resolve();
									} catch (err) {
										Logger.err(config.info.name, err);
										noFfmpeg = true;
										ffmpeg = null;
									}
								}
							} else {
								noFfmpeg = true;
								ffmpeg = null;
							}
						}
						if (noFfmpeg) {
							if (this.settings.compressor.ffmpegDownload) {
								BdApi.showConfirmationModal("FFmpeg " + ffmpegVersion + " Required",
									DiscordModules.React.createElement("div", {},
										[
											DiscordModules.React.createElement(Markdown, {}, "To compress video/audio, " + config.info.name + " needs to use FFmpeg."),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, "If you would like to specify a custom FFmpeg installation, please press cancel and add setup FFmpeg in the " + config.info.name + " plugin settings. Otherwise, click  install to automatically download and install FFmpeg."),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, "FFmpeg " + ffmpegVersion + " source code is available here: " + ffmpegSourceUrl),
											DiscordModules.React.createElement(Markdown, {}, "FFmpeg is licensed under " + ffmpegLicense + ", available to read here: " + ffmpegLicenseUrl)
										]
									),
									{
										danger: false,
										onConfirm: () => {
											this.saveSettings("compressor", "ffmpeg", true);
											this.downloadLibrary(ffmpegPath, ffmpegDownloadUrls, "FFmpeg", () => {
												this.downloadLibrary(ffmpegPath, ffprobeDownloadUrls, "FFprobe", () => {
													try {
														ffmpeg = new FFmpeg(ffmpegPath);
														BdApi.setData(config.info.name, "ffmpeg.version", ffmpegVersion);
														BdApi.showToast("FFmpeg successfully downloaded", {type: "success"});
														reject();
													} catch (err) {
														Logger.err(config.info.name, "Unable to fetch FFmpeg");
														Logger.err(config.info.name, err);
														BdApi.showToast("Error downloading FFmpeg", {type: "error"});
														ffmpeg = null;
														reject(err);
													}
												});
											});
										}
									}
								);
							} else {
								Modals.showAlertModal("FFmpeg " + ffmpegVersion + " Required", "To compress video/audio, " + config.info.name + " needs to use FFmpeg. The path to FFmpeg specified in the " + config.info.name + " settings is invalid!\n\nPlease check the path and ensure FFmpeg use is enabled.");
							}
						}
						reject();
					});
				}

				downloadLibrary(downloadPath, downloadUrls, name, callback) {
					fs.mkdirSync(downloadPath, {recursive: true});
					const request = require('request');
					let dlUrl = "";
					switch (process.platform) {
						case "win32":
						case "darwin":
							dlUrl = downloadUrls[process.platform];
							break;
						default:
							switch (process.arch) {
								case "arm":
									dlUrl = downloadUrls["armhf"];
									break;
								case "arm64":
									dlUrl = downloadUrls["arm64"];
									break;
								case "x64":
									dlUrl = downloadUrls["amd64"];
									break;
								case "ia32":
								case "x32":
								default:
									dlUrl = downloadUrls["i686"];
									break;
							}
					}
					const regexp = /filename=(.*?)(?=;|$)/gi;
					const plugin = this;
					const req = request.get(dlUrl).on('response', function(result) {
						if (result.statusCode === 200) {
							try {
								const filename = regexp.exec(result.headers['content-disposition'])[1];
								const fileStream = fs.createWriteStream(path.join(downloadPath, filename));
								plugin.setStatusToast("DOWNLOADING", 1);
								result.pipe(fileStream);
								fileStream.on('error', function (e) {
									// Handle write errors
									Logger.err(config.info.name, "Error while downloading " + name);
									Logger.err(config.info.name, e);
								});
								fileStream.on('finish', function () {
									// The file has been downloaded
									plugin.setStatusToast("DOWNLOADING", 0);
									if (callback) {
										callback();
									}
								});
							} catch (e) {
								// Handle request errors
								Logger.err(config.info.name, "Error while downloading" + name);
								Logger.err(config.info.name, e);
							}
						} else {
							Logger.err(config.info.name, "HTML status code when downloading " + name + ": " + result.statusCode);
							BdApi.showToast("Error downloading " + name, {type: "error"});
						}
						plugin.setStatusToast("DOWNLOADING", 0);
					});
				}
				
				async initTempFolder() {
					if (!this.tempDataPath) {
						this.tempDataPath = require('os').tmpdir.apply();
					}
					if (fs.existsSync(this.tempDataPath)) {
						try {
							fs.accessSync(this.tempDataPath, fs.constants.R_OK | fs.constants.W_OK);
							return true;
						} catch (e) {}
					}
					return false;
				}
				
				async compressVideo(file, options, originalHash) {
					return new Promise((resolve, reject) => {
						(async () => {
							if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
								this.initFfmpeg();
							}
							if (ffmpeg && ffmpeg.checkFFmpeg()) {
								if (this.initTempFolder()) {
									const nameSplit = file.name.split('.');
									const name = nameSplit.slice(0, nameSplit.length - 1).join(".");
									const extension = nameSplit[nameSplit.length - 1];
									const tempPath = path.join(this.tempDataPath, name + "." + uuidv4() + "." + extension);
									const tempAudioPath = path.join(this.tempDataPath, name + "." + uuidv4() + ".opus");
									const tempVideoPath = path.join(this.tempDataPath, name + "." + uuidv4() + "." + encoderSettings[options.encoder].fileType);
									const compressedPathPre = path.join(this.tempDataPath, name + "." + uuidv4() + ".mkv");
									let compressedPath = "";
									if (this.cache) {
										compressedPath = path.join(this.cache.getCachePath(), name + "." + uuidv4() + ".webm");
									} else {
										compressedPath = path.join(this.tempDataPath, name + "." + uuidv4() + ".webm");
									}
									const fileStream = file.stream();
									const fileStreamReader = fileStream.getReader();
									const writeStream = fs.createWriteStream(tempPath);
									const writeFilePromise = new Promise((resolve1, reject1) => {
										fileStreamReader.read().then(function processData({done, value}) {
											try {
												if (done) {
													writeStream.close();
													resolve1();
													return;
												}
												writeStream.write(value);
												return fileStreamReader.read().then(processData);
											} catch (err) {
												console.error(err);
												reject1();
												return false;
											}
										});
									});
									try {
										await writeFilePromise;
									} catch (e) {
										reject(e);
										return;
									}
									writeStream.close();
									try {
										const data = await ffmpeg.runProbeWithArgs(["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=height", "-of", "default=noprint_wrappers=1:nokey=1", tempPath]);
										if (data) {
											try {
												const dataSplit = data.data.split(/\r?\n/);
												const originalHeight = parseInt(dataSplit[0]);
												const duration = Math.ceil(dataSplit[1]);
												let audioBitrate = 1320000 / duration + 10000;
												if (audioBitrate > 32768)
													audioBitrate = 32768;
												else if (audioBitrate < 10240)
													audioBitrate = 10240;
												try {
													await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-vn", "-c:a", "libopus", "-b:a", audioBitrate, "-ac", "1", "-sn", "-map_chapters", "-1", tempAudioPath]);
												} catch (e) {
													Logger.err(config.info.name, "Unable to run FFmpeg");
													BdApi.showToast("Unable to compress video", {type: "error"});
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
													reject(e);
												}
												if (!fs.existsSync(tempAudioPath)) {
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													return;
												}
												const audioStats = fs.statSync(tempAudioPath);
												const audioSize = audioStats ? audioStats.size : 0;
												const cappedFileSize = Math.floor((options.sizeCap < maxUploadSize ? options.sizeCap : maxUploadSize) - 250000);
												let videoBitrate = Math.floor((((cappedFileSize - audioSize) * 8) / 1024) / duration);
												videoBitrate = videoBitrate > 2 ? videoBitrate - 1 : videoBitrate;
												let maxVideoHeight = options.maxHeight;
												if (videoBitrate < 100)
													maxVideoHeight = 144;
												else if (videoBitrate < 200)
													maxVideoHeight = 240;
												else if (videoBitrate < 500)
													maxVideoHeight = 360;
												else if (videoBitrate < 850)
													maxVideoHeight = 480;
												else if (videoBitrate < 1250)
													maxVideoHeight = 720;
												else if (videoBitrate < 2500)
													maxVideoHeight = 1080;
												else if (videoBitrate < 6000)
													maxVideoHeight = 1440;
												else if (videoBitrate < 10000)
													maxVideoHeight = 2160;
												maxVideoHeight = (options.maxHeight && options.maxHeight < maxVideoHeight) ? options.maxHeight : maxVideoHeight;
												try {
													if (maxVideoHeight && originalHeight > maxVideoHeight)
														await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-vf", "scale=-1:" + maxVideoHeight + ", scale=trunc(iw/2)*2:" + maxVideoHeight, "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", options.encoder, "-pass", "1", "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")]);
													else
														await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", options.encoder, "-pass", "1", "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")]);
												} catch (e) {
													Logger.err(config.info.name, "Unable to run FFmpeg");
													BdApi.showToast("Unable to compress video", {type: "error"});
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
													try {
														fs.rmSync(tempVideoPath);
													} catch (e) {}
													reject(e);
												}
												try {
													if (maxVideoHeight && originalHeight > maxVideoHeight)
														await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-vf", "scale=-1:" + maxVideoHeight + ", scale=trunc(iw/2)*2:" + maxVideoHeight, "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", options.encoder, "-pass", "2", tempVideoPath]);
													else
														await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", options.encoder, "-pass", "2", tempVideoPath]);
												} catch (e) {
													Logger.err(config.info.name, "Unable to run FFmpeg");
													BdApi.showToast("Unable to compress video", {type: "error"});
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
													try {
														fs.rmSync(tempVideoPath);
													} catch (e) {}
													reject(e);
												}
												if (!fs.existsSync(tempVideoPath)) {
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
													return;
												}
												try {
													await ffmpeg.runWithArgs(["-y", "-i", tempAudioPath, "-i", tempVideoPath, "-c", "copy", compressedPathPre]);
												} catch (e) {
													Logger.err(config.info.name, "Unable to run FFmpeg");
													BdApi.showToast("Unable to compress video", {type: "error"});
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
													try {
														fs.rmSync(tempVideoPath);
													} catch (e) {}
													try {
														fs.rmSync(compressedPathPre);
													} catch (e) {}
													reject(e);
												}
												if (fs.existsSync(compressedPathPre)) {
													fs.renameSync(compressedPathPre, compressedPath);
												}
												if (fs.existsSync(compressedPath)) {
													if (this.cache) {
														this.cache.addToCache(compressedPath,  name + ".webm", originalHash);
													}
													const retFile = new File([Uint8Array.from(Buffer.from(fs.readFileSync(compressedPath))).buffer], name + ".webm", {type: file.type});
													try {
														fs.rmSync(tempPath);
													} catch (e) {}
													try {
														fs.rmSync(compressedPathPre);
													} catch (e) {}
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
													try {
														fs.rmSync(tempVideoPath);
													} catch (e) {}
													resolve(retFile);
													if (!this.cache) {
														try {
															fs.rmSync(compressedPath);
														} catch (e) {}
													}
												}
											} catch (e) {
												Logger.err(config.info.name, e);
												try {
													fs.rmSync(tempPath);
												} catch (e) {}
												reject(e);
											}
										}
									} catch (e) {}
								} else {
									Logger.err(config.info.name, "Unable to access temp data directory");
									BdApi.showToast("Unable to compress video", {type: "error"});
									reject();
								}
							}
							reject();
						})();
					});
				}
				
				async compressImage(file, options) {
					const objectUrl = URL.createObjectURL(file);
					const img = new window.Image();
					await this.loadImageElement(img, objectUrl);
					URL.revokeObjectURL(objectUrl);
					const image = {file: file, data: img, outputData: null, width: img.naturalWidth, height: img.naturalHeight, iterations: 0};
					if (await this.compressImageLoop(image, options) !== null) {
						return new File([image.outputData], image.file.name, {type: image.file.type});
					}
					return null;
				}
				
				async compressImageLoop(image, options) {
					image.iterations++;
					image.outputData = await this.compressImageCanvas(image);
					if (image.outputData.size >= maxUploadSize) {
						if (image.iterations >= imageMaxIterations) {
							BdApi.showToast("Unable to comress impage!", {type: "error"});
							return null;
						} else {
							return await this.compressImageLoop(image, options);
						}
					} else {
						return image;
					}
				}
				
				async compressImageCanvas(image) {
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d");
					const multiplier = Math.pow(imageSizeMultiplier, image.iterations);
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
					switch (category) {
						case "compressor":
							switch (setting) {
								case "cachePath":
									this.updateCache();
									break;
								case "ffmpegPath":
									this.initFfmpeg();
									break;
							}
							break;
					}
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
