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
			authors: [{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "1.3.7",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [{
				title: "Fixed",
				type: "fixed",
				items: [
					"Simplified encoder selection",
					"Fixed automatic download of FFmpeg",
					"Fixed audio files from being converted to mono",
					"Fix improper reading of FFprobe output data"
				]
			}, {
				title: "Added",
				type: "added",
				items: [
					"Added compression options modal to fine-tune compression",
					"Hooks into message attachment menu + button",
					"Global default for file size cap",
					"Cap video framerates",
					"Strip audio from video",
					"Interlace video"
				]
			}, {
				title: "Known Bugs",
				type: "improved",
				items: [
					"FFmpeg 4.4 has a FLAC decoding bug",
					"Audio files sometimes end up greater than target size"
				]
			}
		],
		defaultConfig: [{
				type: 'category',
				id: 'upload',
				name: 'Upload Settings',
				collapsible: true,
				shown: false,
				settings: [{
						name: 'Auto Channel Switch',
						note: 'Automatically switch to the required channel when a file is ready to be uploaded.',
						id: 'autoChannelSwitch',
						type: 'switch',
						value: true
					}, {
						name: 'Immediate Upload',
						note: 'Immediately upload files without showing a preview.',
						id: 'immediateUpload',
						type: 'switch',
						value: false
					}, {
						name: 'Max File Size (bytes)',
						note: 'Default to this maximum file size for slower networks.',
						id: 'maxFileSize',
						type: 'textbox',
						value: 0
					}
				]
			}, {
				type: 'category',
				id: 'compressor',
				name: 'Compressor Settings',
				collapsible: true,
				shown: false,
				settings: [{
						name: 'Prompt for Options',
						note: 'Prompt for compression options before compressing',
						id: 'promptOptions',
						type: 'switch',
						value: true
					}, {
						name: 'Concurrent Compression Threads',
						note: 'Number of compression jobs that can be processing simultaneously.',
						id: 'concurrentThreads',
						type: 'slider',
						min: 1,
						max: 5,
						value: 3,
						markers: [1, 2, 3, 4, 5],
						stickToMarkers: true
					}, {
						name: 'Cache Location',
						note: 'Custom file cache location to use (Leave empty to use default location).',
						id: 'cachePath',
						type: 'textbox',
						value: ""
					}, {
						name: 'Use FFmpeg',
						note: 'Enable the use of FFmpeg for compressing video and audio.',
						id: 'ffmpeg',
						type: 'switch',
						value: false
					}, {
						name: 'Download FFmpeg',
						note: 'Should FFmpeg be automatically downloaded? Disable this to use a custom installation.',
						id: 'ffmpegDownload',
						type: 'switch',
						value: true
					}, {
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
		constructor() {
			this._config = config;
		}

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async(err, res, body) => {
						if (err)
							return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}

		start() {}
		stop() {}
	}
	 : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) => {
			const {
				Logger,
				Patcher,
				Modals,
				DiscordModules,
				Utilities,
				DOMTools,
				PluginUtilities,
				DiscordAPI,
				Settings,
				ReactTools
			} = Api;

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
			// FFmpeg constants
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
			// Default encoder settings
			const encoderSettings = {
				"libx264": {
					fileType: "mp4"
				},
				"libvpx-vp9": {
					fileType: "webm"
				}
			};
			const regexPatternTime = /time=(\d+:\d+:\d+.\d+)/;
			const regexPatternDuration = /duration=([\d.]+)/;
			const regexPatternChannels = /channels=(\d+)/;
			const regexPatternHeight = /height=(\d+)/;
			const regexPatternFrameRate = /r_frame_rate=(\d+\/\d+)/;

			// Persistent toasts container
			let toasts = null;

			// Temp folder
			let tempDataPath = null;

			// Queue for files waiting to be compressed
			let processingQueue = [];
			// List of currently running jobs
			let runningJobs = [];
			// List of currently running processes
			let runningProcesses = [];

			// Discord related data
			const Markdown = BdApi.findModule(m => m.displayName === "Markdown" && m.rules);
			// Toast icon SVGs
			const loadingSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M12,0v2C6.48,2,2,6.48,2,12c0,3.05,1.37,5.78,3.52,7.61l1.15-1.66C5.04,16.48,4,14.36,4,12c0-4.41,3.59-8,8-8v2l2.59-1.55l2.11-1.26L17,3L12,0z"/><path d="M18.48,4.39l-1.15,1.66C18.96,7.52,20,9.64,20,12c0,4.41-3.59,8-8,8v-2l-2.59,1.55L7.3,20.82L7,21l5,3v-2c5.52,0,10-4.48,10-10C22,8.95,20.63,6.22,18.48,4.39z"/></svg>`;
			const queueSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M21.84,1H2.16l7.15,11L2.16,23h19.68l-7.15-11L21.84,1z M11.69,12L5.84,3h12.31l-5.85,9H11.69z"/></svg>`;

			// Original Discord upload function before patch
			let originalUploadFunction = null;

			// Current upload cap
			let maxUploadSize = 8388608;

			const FFmpeg = class {
				constructor(ffmpegFolder) {
					if (fs.existsSync(ffmpegFolder)) {
						this.ffmpeg = path.join(ffmpegFolder, "ffmpeg");
						this.ffprobe = path.join(ffmpegFolder, "ffprobe");
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
							Logger.debug(config.info.name, child_process.execFileSync(this.ffmpeg, ["-version"], {
									timeout: 10000
								}).toString());
						} else {
							throw new Error("Unable to find FFmpeg");
						}
					} else {
						throw new Error("Unable to find FFmpeg");
					}
				}

				runWithArgs(args, outputFilter, outputCallback) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.ffmpeg)) {
							Logger.info(config.info.name, "Running FFmpeg with " + args.join(' '));
							const process = child_process.spawn(this.ffmpeg, args);
							process.on('error', err => {
								Logger.err(config.info.name, err);
								reject(err);
								const index = runningProcesses.indexOf(process);
								if (index > -1)
									runningProcesses.splice(index, 1);
							});
							process.on('exit', (code, signal) => {
								if (code == 0) {
									resolve(true);
								} else {
									reject();
								}
								const index = runningProcesses.indexOf(process);
								if (index > -1)
									runningProcesses.splice(index, 1);
							});
							process.stderr.on('data', data => {
								const str = data.toString();
								if (typeof(outputFilter) == "function" && typeof(outputCallback) == "function" && outputFilter(str)) {
									outputCallback(str);
								}
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
									Logger.err(config.info.name, stderr);
									reject(err);
								}
								try {
									resolve({
										data: stdout,
										error: err
									});
								} catch (e) {
									Logger.err(config.info.name, e);
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

			const FileCache = class {
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
						fs.mkdirSync(this.cachePath, {
							recursive: true
						});
					}
					fs.accessSync(this.cachePath, fs.constants.R_OK | fs.constants.W_OK);
					this.clear();
				}

				async hash(file, percentageCallback) {
					const totalBytes = file.size;
					let bytesProcessed = 0;
					const hash = cryptoModule.createHash('md5');
					const fileStreamReader = file.stream().getReader();
					const hashPromise = new Promise((resolve, reject) => {
						fileStreamReader.read().then(function processData({
								done,
								value
							}) {
							try {
								if (typeof(percentageCallback) == "function" && value) {
									bytesProcessed += value.byteLength;
									percentageCallback(Math.round((bytesProcessed / totalBytes) * 100));
								}
								if (done) {
									resolve(hash.digest('hex'));
									return;
								}
								hash.update(value);
								return fileStreamReader.read().then(processData);
							} catch (err) {
								Logger.err(config.info.name, err);
								reject();
								return;
							}
						});
					});
					try {
						return await hashPromise;
					} catch (e) {}
					return;
				}

				getFile(hash) {
					let entry = this.cacheLookup.get(hash);
					if (entry) {
						if (fs.existsSync(entry.path)) {
							return new File([Uint8Array.from(Buffer.from(fs.readFileSync(entry.path))).buffer], entry.name, {
								type: mime.contentType(entry.path)
							});
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
							let filePath = path.join(this.cachePath, uuidv4().replace(/-/g, "") + "." + extension);
							if (!fs.existsSync(filePath)) {
								let fr = new FileReader();
								fr.readAsBinaryString(file);
								fr.onloadend = e => {
									fs.writeFileSync(filePath, fr.result, {
										encoding: 'binary'
									});
									this.addToCache(filePath, file.name, hash);
								};
								fr.onerror = e => {
									Logger.err(config.info.name, fr.error);
									BdApi.showToast("Error caching file!", {
										type: "error"
									});
								};
								return;
							}
						}
						Logger.err(config.info.name, "Too many overlapping files in cache for " + file.name);
						BdApi.showToast("Error caching file!", {
							type: "error"
						});
					} catch (err) {
						Logger.err(config.info.name, err);
						BdApi.showToast("Error caching file!", {
							type: "error"
						});
					}
				}

				addToCache(path, name, hash) {
					let entry = {
						path: path,
						name: name,
						expiry: Date.now() + 86400000,
						hash: hash
					};
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
						if (err)
							throw err;
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

			const Toasts = class {
				constructor() {
					this.currentToasts = new Map();
					// Check for existing upload node
					this.toastNode = document.getElementById('pseudocompressor-toasts');
					if (this.toastNode == null) {
						this.toastNode = document.createElement('div');
						this.toastNode.id = 'pseudocompressor-toasts';
						document.getElementById('app-mount')?.appendChild(this.toastNode);
					}
				}

				setToast(jobId, message) {
					if (!message) {
						if (this.currentToasts.has(jobId)) {
							const toast = this.currentToasts.get(jobId);
							toast.remove();
							this.currentToasts.delete(jobId);
						}
					} else {
						if (this.currentToasts.has(jobId)) {
							this.currentToasts.get(jobId).querySelector('.pseudocompressor-toast-message').innerHTML = message;
						} else {
							let toast = null;
							if (jobId <= 0) {
								toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
											message: message,
											icon: queueSvg
										}));
							} else {
								toast = DOMTools.parseHTML(Utilities.formatString(`<div class="pseudocompressor-toast"><div class="pseudocompressor-toast-icon spin">{{icon}}</div><div class="pseudocompressor-toast-message">{{message}}</div></div>`, {
											message: message,
											icon: loadingSvg
										}));
							}
							this.toastNode.appendChild(toast);
							this.currentToasts.set(jobId, toast);
						}
					}
				}

				remove() {
					this.currentToasts.forEach(value => {
						value.remove();
					});
					this.currentToasts.clear();
					this.toastNode.remove();
				}
			};

			return class FileCompressor extends Plugin {
				constructor() {
					super();
					this.onStart = this.onStart.bind(this);
					this.onStop = this.onStop.bind(this);
					this.monkeyPatch = this.monkeyPatch.bind(this);
					this.updateCache = this.updateCache.bind(this);
					this.initFfmpeg = this.initFfmpeg.bind(this);
					this.downloadLibrary = this.downloadLibrary.bind(this);
					this.downloadFile = this.downloadFile.bind(this);
					this.initTempFolder = this.initTempFolder.bind(this);
					this.handleUploadEvent = this.handleUploadEvent.bind(this);
					this.sendUploadFileList = this.sendUploadFileList.bind(this);
					this.sendUploadFileListInternal = this.sendUploadFileListInternal.bind(this);
					this.processUploadFileList = this.processUploadFileList.bind(this);
					this.checkIsCompressible = this.checkIsCompressible.bind(this);
					this.compressFile = this.compressFile.bind(this);
					this.showSettings = this.showSettings.bind(this);
					this.compressFileType = this.compressFileType.bind(this);
					this.finishProcessing = this.finishProcessing.bind(this);
					this.processNextFile = this.processNextFile.bind(this);
					this.compressVideo = this.compressVideo.bind(this);
					this.compressImage = this.compressImage.bind(this);
					this.compressImageLoop = this.compressImageLoop.bind(this);
					this.saveSettings = this.saveSettings.bind(this);
				}

				onStart() {
					// Monkey patch to hook into upload events
					this.monkeyPatch();
					// Add event listeners
					DiscordModules.UserSettingsStore.addChangeListener(this.handleUserSettingsChange);
					// Setup cache
					this.updateCache();
					// Setup toasts
					toasts = new Toasts();
					PluginUtilities.addStyle('FileCompressor-CSS', `
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
					if (toasts)
						toasts.remove();
					toasts = null;
					// Killing running processes
					runningProcesses.filter(process => {
						process.kill("SIGKILL");
						return false;
					});
					processingQueue = [];
					runningJobs = [];
					// Clear cache
					try {
						if (cache) {
							cache.clear();
						}
					} catch (err) {
						Logger.err(config.info.name, err);
					}
					cache = null;
					PluginUtilities.removeStyle('FileCompressor-CSS');
				}

				monkeyPatch() {
					const promptToUploadModule = BdApi.findModuleByProps("promptToUpload");
					if (promptToUploadModule) {
						this.originalUploadFunction = promptToUploadModule.promptToUpload;
						const uploadFunc = this.handleUploadEvent;
						const originalFunc = this.originalUploadFunction;
						if (this.originalUploadFunction && this.originalUploadFunction.length === 7) {
							promptToUploadModule.promptToUpload = function (fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft, fileCompressorCompressedFile = false) {
								if (fileCompressorCompressedFile) {
									return originalFunc(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft);
								} else {
									return uploadFunc(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft);
								}
							};
						} else {
							BdApi.showToast("Unable to hook into Discord upload handler!", {
								type: "error"
							});
							if (this.originalUploadFunction) {
								Logger.err(config.info.name, "Unable to hook into Discord upload handler! Method " + this.originalUploadFunction + (this.originalUploadFunction ? " has " + this.originalUploadFunction.length + " arguments!" : " doesn't exist!"));
							} else {
								Logger.err(config.info.name, "Unable to hook into Discord upload handler! Method doesn't exist in promptToUpload: " + promptToUploadModule);
							}
							promptToUploadModule.promptToUpload = this.originalUploadFunction;
							this.originalUploadFunction = null;
						}
					} else {
						BdApi.showToast("Unable to hook into Discord upload handler!", {
							type: "error"
						});
						Logger.err(config.info.name, "Unable to hook into Discord upload handler! promptToUpload module doesn't exist!");
					}
					Patcher.before(BdApi.findModuleByDisplayName("FileInput").prototype, "render", (t, args) => {
						// Bypass initial file size check
						t.props.maxSize = Infinity;
					});
				}

				updateCache() {
					if (cache) {
						try {
							cache.clear();
						} catch (err) {
							Logger.err(config.info.name, err);
						}
					}
					// Setup cache
					try {
						cache = new FileCache(this.settings.compressor.cachePath ? this.settings.compressor.cachePath : path.join(BdApi.Plugins.folder, "CompressorCache"));
					} catch (err) {
						BdApi.showToast("Error setting up cache!", {
							type: "error"
						});
					}
				}

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
										resolve(true);
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
											DiscordModules.React.createElement(Markdown, {}, "If you would like to specify a custom FFmpeg installation, please press cancel and add setup FFmpeg in the " + config.info.name + " plugin settings. Otherwise, click install to automatically download and install FFmpeg."),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, "FFmpeg " + ffmpegVersion + " source code is available here: " + ffmpegSourceUrl),
											DiscordModules.React.createElement(Markdown, {}, "FFmpeg is licensed under " + ffmpegLicense + ", available to read here: " + ffmpegLicenseUrl)
										]), {
									danger: false,
									onConfirm: () => {
										this.saveSettings("compressor", "ffmpeg", true);
										const ffmpegPromise = this.downloadLibrary(ffmpegPath, ffmpegDownloadUrls, "FFmpeg");
										ffmpegPromise.catch(e => {
											Logger.err(config.info.name, "Unable to download FFmpeg", e);
											BdApi.showToast("Error downloading FFmpeg", {
												type: "error"
											});
											reject(e);
										});
										const ffprobePromise = this.downloadLibrary(ffmpegPath, ffprobeDownloadUrls, "FFprobe");
										ffprobePromise.catch(e => {
											Logger.err(config.info.name, "Unable to download FFprobe", e);
											BdApi.showToast("Error downloading FFprobe", {
												type: "error"
											});
											reject(e);
										});
										Promise.all([ffmpegPromise, ffprobePromise]).then(() => {
											resolve(this.initFfmpeg());
										});
									},
									onCancel: () => {
										reject();
									}
								});
							} else {
								Modals.showAlertModal("FFmpeg " + ffmpegVersion + " Required", "To compress video/audio, " + config.info.name + " needs to use FFmpeg. The path to FFmpeg specified in the " + config.info.name + " settings is invalid!\n\nPlease check the path and ensure FFmpeg use is enabled.");
								reject();
							}
						}
					});
				}

				async downloadLibrary(downloadPath, downloadUrls, name) {
					fs.mkdirSync(downloadPath, {
						recursive: true
					});
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
					return this.downloadFile("-" + uuidv4().replace(/-/g, ""), dlUrl, downloadPath, name);
				}

				downloadFile(jobId, url, downloadPath, name) {
					return new Promise((resolve, reject) => {
						const toastsModule = toasts;
						const https = require('https');
						const req = https.request(url);
						req.on('response', result => {
							if (result.statusCode === 200) {
								const regexp = /filename=(.*?)(?=;|$)/gi;
								const filename = regexp.exec(result.headers['content-disposition'])[1];
								const totalLength = result.headers['content-length'];
								let writtenLength = 0;
								const fileStream = fs.createWriteStream(path.join(downloadPath, filename));
								toastsModule.setToast(jobId, "Downloading " + name + " 0%");
								result.on('data', chunk => {
									writtenLength += chunk.length;
									toastsModule.setToast(jobId, "Downloading " + name + " " + Math.round((writtenLength / totalLength) * 100) + "%");
								});
								result.pipe(fileStream);
								fileStream.on('error', function (e) {
									// Handle write errors
									reject(new Error("Error while downloading " + url + " for " + name));
								});
								fileStream.on('finish', function () {
									// The file has been downloaded
									toastsModule.setToast(jobId);
									resolve(true);
								});
							} else if (result.statusCode === 302) {
								const location = result.headers['location'];
								if (location) {
									resolve(this.downloadFile(jobId, location, downloadPath, name));
								} else {
									reject(new Error("Invalid file URL: " + url + " for downloading " + name));
								}
							} else {
								reject(new Error("Server returned " + result.statusCode + " at " + url + " for downloading " + name));
							}
						});
						req.end();
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

				async handleUploadEvent(fileList, channel, draftType, instantBackdrop, requireConfirmation, showLargeMessageDialog, ignoreDraft) {
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
					this.processUploadFileList(fileList, guildId, channelId, threadId, sidebar);
					return true;
				}

				processUploadFileList(files, guildId, channelId, threadId, sidebar) {
					// Check account status and update max file upload size
					try {
						maxUploadSize = DiscordModules.DiscordConstants.PremiumUserLimits[DiscordAPI.currentUser.discordObject.premiumType ? DiscordAPI.currentUser.discordObject.premiumType : 0].fileSize;
					} catch (e) {
						Logger.err(config.info.name, e);
						BdApi.showToast("Error getting account info!", {
							type: "error"
						});
						maxUploadSize = 8388608;
					}
					// Synthetic DataTransfer to generate FileList
					const originalDt = new DataTransfer();
					const tempFiles = [];
					let queuedFiles = 0;
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						if (file.size >= maxUploadSize) {
							// If file is returned, it was incompressible
							const tempFile = this.checkIsCompressible(file, file.type.split('/')[0], guildId, channelId, threadId, sidebar);
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
						const num = (files.length - (originalDt.files.length + queuedFiles));
						BdApi.showToast(num + (num === 1 ? " file was " : " files were ") + "too large to upload!", {
							type: "error"
						});
					}
					if (originalDt.files.length > 0) {
						this.sendUploadFileList(originalDt.files, guildId, channelId, threadId, sidebar);
					}
				}

				sendUploadFileList(files, guildId, channelId, threadId, sidebar) {
					this.sendUploadFileListInternal(files, guildId, channelId, threadId, sidebar);
					if (this.settings.upload.autoChannelSwitch) {
						this.switchChannel(guildId, channelId, threadId, sidebar);
					}
				}

				wrapFileInList(file) {
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
								BdApi.findModuleByProps('gotoThread').gotoThread(null, {
									id: threadId
								});
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
						BdApi.showToast("Unable to return to channel to upload files!", {
							type: "error"
						});
						if (originalThreadId)
							DiscordModules.NavigationUtils.transitionToThread(!originalGuildId ? "@me" : originalGuildId, originalThreadId);
						else
							DiscordModules.NavigationUtils.transitionToGuild(!originalGuildId ? "@me" : originalGuildId, originalChannelId);
					}
					return false;
				}

				sendUploadFileListInternal(files, guildId, channelId, threadId, sidebar) {
					try {
						const channelObj = threadId ? DiscordModules.ChannelStore.getChannel(threadId) : DiscordModules.ChannelStore.getChannel(channelId);
						channelObj.fileCompressorCompressedFile = true;
						BdApi.findModuleByProps("promptToUpload").promptToUpload(files, channelObj, 0, true, !(this.settings.upload.immediateUpload), false, false, true /*Special boolean to mark file as processed and prevent loops*/);
					} catch (e) {
						Logger.err(config.info.name, e);
						BdApi.showToast("Error uploading files!", {
							type: "error"
						});
					}
				}

				// Initial check if a large file is compressible
				// Returns the original file if not compressible, otherwise sends all files to compressFile for compression queue
				checkIsCompressible(file, type, guildId, channelId, threadId, sidebar) {
					switch (type) {
					case "image":
					case "video":
					case "audio":
						// Async function schedules file to be compressed without blocking
						this.compressFile({
							jobId: uuidv4(),
							file: file,
							compressedFile: null,
							hash: null,
							type: type,
							guildId: guildId,
							channelId: channelId,
							threadId: threadId,
							isSidebar: sidebar,
							options: {}
						});
						break;
					default:
						return file;
					}
					return null;
				}

				// Asks the user for settings to use when compressing the file and compresses the file if possible, or queues it for later
				async compressFile(job) {
					let cacheFile;
					if (cache) {
						toasts.setToast(job.jobId, "Hashing 0%");
						job.hash = await cache.hash(job.file, percentage => {
							toasts.setToast(job.jobId, "Hashing " + percentage + "%");
						});
						try {
							cacheFile = cache.getFile(job.hash);
						} catch (err) {
							Logger.err(config.info.name, err);
						}
						toasts.setToast(job.jobId);
					}
					if (cacheFile) {
						job.options.useCache = {
							name: "Use Cache",
							description: "Use the previously cached file if available",
							type: "switch",
							defaultValue: true
						};
					}
					job.options.sizeCap = {
						name: "Size Cap (bytes)",
						description: "Max file size in bytes",
						type: "textbox",
						defaultValue: (this.settings.upload.maxFileSize != 0 ? this.settings.upload.maxFileSize : ""),
						validation: value => {
							return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
						}
					};
					// If cached file exists, ask user if they want to use cached options
					switch (job.type) {
					case "image":
						// Ask for compression settings
						job.options.sizeMultiplier = {
							name: "Iterative Size Multiplier",
							description: "Amount to multiply image size by with each attempt",
							type: "textbox",
							defaultValue: 0.9,
							validation: value => {
								return (!isNaN(value) && !isNaN(parseFloat(value)) && value < 1 && value > 0);
							}
						};
						job.options.maxIterations = {
							name: "Max Iterations",
							description: "Maximum number of attempts to resize image",
							type: "textbox",
							defaultValue: 50,
							validation: value => {
								return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						if (!await this.showSettings("Image Compression Options", job.options))
							return false;
						break;
					case "video":
						// Ask for compression settings
						job.options.encoder = {
							name: "Encoder",
							type: "dropdown",
							defaultValue: "libx264",
							props: {
								values: Object.getOwnPropertyNames(encoderSettings)
							}
						};
						job.options.maxHeight = {
							name: "Max Video Height",
							type: "textbox",
							defaultValue: "",
							validation: value => {
								return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						job.options.maxFps = {
							name: "Max Video FPS",
							type: "textbox",
							defaultValue: "60",
							validation: value => {
								return (!isNaN(value) && !isNaN(parseFloat(value)) && value > 0);
							}
						};
						job.options.interlace = {
							name: "Interlace Video",
							description: "Not recommended except for the largest videos",
							type: "switch",
							defaultValue: false
						};
						job.options.stripAudio = {
							name: "Strip Audio",
							description: "Remove all audio from the video.",
							type: "switch",
							defaultValue: false
						};
						if (!await this.showSettings("Video Compression Options", job.options))
							return false;
						break;
					case "audio":
						// Ask for compression settings
						if (!await this.showSettings("Audio Compression Options", job.options))
							return false;
						break;
					}
					// If user wants to use cached options & cached file exists
					if (cacheFile && job.options.useCache.value) {
						this.sendUploadFileList(this.wrapFileInList(cacheFile), job.guildId, job.channelId, job.threadId, job.isSidebar);
					} else {
						if (runningJobs.length < this.settings.compressor.concurrentThreads) {
							toasts.setToast(job.jobId, "Initializing");
							runningJobs.push(job);
							this.compressFileType(job);
						} else {
							processingQueue.push(job);
							toasts.setToast(0, (processingQueue.length === 1 ? " file" : " files") + " to be compressed");
						}
					}
				}

				showSettings(title, options) {
					return new Promise((resolve, reject) => {
						if (this.settings.compressor.promptOptions) {
							const settingsElements = [];
							for (const setting in options) {
								options[setting].value = options[setting].defaultValue;
								settingsElements.push(this.createSettingField(options[setting].type, options[setting].name, options[setting].description, options[setting].defaultValue, value => {
										if (typeof(options[setting].validation) != "function" || options[setting].validation(value))
											options[setting].value = value;
									}, options[setting].props));
							}
							const settingsPanel = Settings.SettingPanel.build(null, ...settingsElements);
							BdApi.showConfirmationModal(title, ReactTools.createWrappedElement(settingsPanel), {
								onConfirm: () => {
									resolve(true);
								},
								onCancel: () => {
									resolve(false);
								}
							});
						} else {
							for (const setting in options) {
								options[setting].value = options[setting].defaultValue;
							}
							resolve(true);
						}
					});
				}

				createSettingField(type, name, description, defaultValue, onChange, props) {
					switch (type) {
					case "color":
						return new Settings.ColorPicker(name, description, defaultValue, onChange, props);
					case "dropdown":
						return new Settings.Dropdown(name, description, defaultValue, props.values, onChange, props);
					case "file":
						return new Settings.FilePicker(name, description, onChange, props);
					case "keybind":
						return new Settings.Keybind(name, description, defaultValue, onChange, props);
					case "radiogroup":
						return new Settings.RadioGroup(name, description, defaultValue, props.values, onChange, props);
					case "slider":
						return new Settings.Slider(name, description, props.min, props.max, defaultValue, onChange, props);
					case "switch":
						return new Settings.Switch(name, description, defaultValue, onChange, props);
					case "textbox":
						return new Settings.Textbox(name, description, defaultValue, onChange, props);
					default:
						return null;
					}
				}

				// Sends the file to the appropriate compressor once all checks have passed
				compressFileType(job) {
					switch (job.type) {
					case "image":
						this.finishProcessing(job, this.compressImage(job));
						// https://github.com/davejm/client-compress
						break;
					case "video":
						this.finishProcessing(job, this.compressVideo(job));
						break;
					case "audio":
						this.finishProcessing(job, this.compressAudio(job));
						break;
					}
				}

				// When a file is done processing, add it to the upload queue and check if a new file can be processed
				finishProcessing(job, promise) {
					promise.then(returnJob => {
						if (returnJob != null) {
							if (returnJob.compressedFile) {
								this.sendUploadFileList(this.wrapFileInList(returnJob.compressedFile), returnJob.guildId, returnJob.channelId, returnJob.threadId, returnJob.isSidebar);
							}
						}
						toasts.setToast(job.jobId);
						const index = runningJobs.indexOf(job);
						if (index >= 0)
							runningJobs.splice(index, 1);
						this.processNextFile();
					}).catch(error => {
						BdApi.showToast("Error compressing file!", {
							type: "error"
						});
						Logger.err(error);
						toasts.setToast(job.jobId);
						const index = runningJobs.indexOf(job);
						if (index >= 0)
							runningJobs.splice(index, 1);
						this.processNextFile();
					});
				}

				// Start processing a new file if possible
				processNextFile() {
					if (processingQueue.length > 0) {
						if (runningJobs.length <= this.settings.compressor.concurrentThreads) {
							const job = processingQueue.shift();
							toasts.setToast(0, (processingQueue.length === 1 ? " file" : " files") + " to be compressed");
							runningJobs.push(job);
							this.compressFileType(job);
						}
					}
				}

				async compressAudio(job) {
					if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
						await this.initFfmpeg();
					}
					if (ffmpeg && ffmpeg.checkFFmpeg()) {
						if (await this.initTempFolder()) {
							const nameSplit = job.file.name.split('.');
							const name = nameSplit.slice(0, nameSplit.length - 1).join(".");
							const extension = nameSplit[nameSplit.length - 1];
							const tempPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + extension);
							const compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".opus");
							let compressedPath = "";
							if (cache) {
								compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + ".ogg");
							} else {
								compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".ogg");
							}
							const fileStream = job.file.stream();
							const fileStreamReader = fileStream.getReader();
							const writeStream = fs.createWriteStream(tempPath);
							const totalBytes = job.file.size;
							let bytesWritten = 0;
							await new Promise((resolve1, reject1) => {
								fileStreamReader.read().then(function processData({
										done,
										value
									}) {
									try {
										if (value) {
											bytesWritten += value.byteLength;
											toasts.setToast(job.jobId, Math.round((bytesWritten / totalBytes) * 100) + "% Copied");
										}
										if (done) {
											writeStream.destroy();
											resolve1(true);
											return;
										}
										const writeReady = writeStream.write(value);
										if (writeReady) {
											return fileStreamReader.read().then(processData);
										} else {
											writeStream.once('drain', () => {
												fileStreamReader.read().then(processData);
											});
											return true;
										}
									} catch (err) {
										Logger.err(config.info.name, err);
										reject1();
										return false;
									}
								});
							});
							writeStream.destroy();
							toasts.setToast(job.jobId, "Calculating");
							const data = await ffmpeg.runProbeWithArgs(["-v", "error", "-select_streams", "a", "-show_entries", "format=duration", "-show_entries", "stream=channels", "-of", "default=noprint_wrappers=1", tempPath]);
							if (data) {
								const outputStr = data.data;
								try {
									const durationMatches = regexPatternDuration.exec(outputStr);
									const channelsMatches = regexPatternChannels.exec(outputStr);
									const duration = Math.ceil(durationMatches[1]);
									const numChannels = parseInt(channelsMatches[1]);
									if (duration == 0)
										throw new Error("Invalid file duration");
									const cappedFileSize = Math.floor((job.options.sizeCap.value && parseInt(job.options.sizeCap.value) < maxUploadSize ? parseInt(job.options.sizeCap.value) : maxUploadSize) - 500000);
									let audioBitrate = Math.floor((cappedFileSize * 8) / duration);
									if (audioBitrate > 256000)
										audioBitrate = 256000;
									if (audioBitrate < 500)
										audioBitrate = 500;
									let outputChannels = numChannels;
									if (audioBitrate / numChannels < 50000) {
										if (Math.floor(audioBitrate / 50000) > 2)
											outputChannels = 2;
										else
											outputChannels = 1;
									}
									try {
										toasts.setToast(job.jobId, "Compressing 0%");
										await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-vn", "-c:a", "libopus", "-b:a", audioBitrate, "-ac", outputChannels, "-sn", "-map_chapters", "-1", compressedPathPre], str => {
											return str.includes("time=")
										}, str => {
											try {
												const timeStr = regexPatternTime.exec(str);
												if (timeStr) {
													const timeStrParts = timeStr[1].split(':');
													const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
													toasts.setToast(job.jobId, "Compressing " + Math.round((elapsedTime / duration) * 100) + "%");
												}
											} catch (e) {
												Logger.err(config.info.name, e);
											}
										});
									} catch (e) {
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										try {
											fs.rmSync(compressedPathPre);
										} catch (e) {}
										throw e;
									}
									toasts.setToast(job.jobId, "Packaging");
									if (fs.existsSync(compressedPathPre)) {
										fs.renameSync(compressedPathPre, compressedPath);
									} else {
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										throw new Error("Cannot find FFmpeg output");
									}
									if (fs.existsSync(compressedPath)) {
										if (cache) {
											cache.addToCache(compressedPath, name + ".ogg", job.hash);
										}
										const retFile = new File([Uint8Array.from(Buffer.from(fs.readFileSync(compressedPath))).buffer], name + ".ogg", {
											type: job.file.type
										});
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										try {
											fs.rmSync(compressedPathPre);
										} catch (e) {}
										job.compressedFile = retFile;
										if (!cache) {
											try {
												fs.rmSync(compressedPath);
											} catch (e) {}
										}
										return job;
									} else {
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										try {
											fs.rmSync(compressedPathPre);
										} catch (e) {}
										throw new Error("Cannot find FFmpeg output");
									}
								} catch (e) {
									try {
										fs.rmSync(tempPath);
									} catch (e) {}
									throw e;
								}
							} else {
								throw new Error("Cannot read FFprobe output");
							}
						} else {
							throw new Error("Unable to access temp data directory");
						}
					} else {
						throw new Error("Unable to run FFmpeg");
					}
				}

				async compressVideo(job) {
					if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
						await this.initFfmpeg();
					}
					if (ffmpeg && ffmpeg.checkFFmpeg()) {
						if (await this.initTempFolder()) {
							const nameSplit = job.file.name.split('.');
							const name = nameSplit.slice(0, nameSplit.length - 1).join(".");
							const extension = nameSplit[nameSplit.length - 1];
							const tempPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + extension);
							const tempAudioPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".opus");
							const tempVideoPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + encoderSettings[job.options.encoder.value].fileType);
							const compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".mkv");
							let compressedPath = "";
							if (cache) {
								compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + ".webm");
							} else {
								compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".webm");
							}
							const fileStream = job.file.stream();
							const fileStreamReader = fileStream.getReader();
							const writeStream = fs.createWriteStream(tempPath);
							const totalBytes = job.file.size;
							let bytesWritten = 0;
							await new Promise((resolve1, reject1) => {
								fileStreamReader.read().then(function processData({
										done,
										value
									}) {
									try {
										if (value) {
											bytesWritten += value.byteLength;
											toasts.setToast(job.jobId, Math.round((bytesWritten / totalBytes) * 100) + "% Copied");
										}
										if (done) {
											writeStream.destroy();
											resolve1(true);
											return;
										}
										const writeReady = writeStream.write(value);
										if (writeReady) {
											return fileStreamReader.read().then(processData);
										} else {
											writeStream.once('drain', () => {
												fileStreamReader.read().then(processData);
											});
											return true;
										}
									} catch (err) {
										Logger.err(config.info.name, err);
										reject1();
										return false;
									}
								});
							});
							writeStream.destroy();
							toasts.setToast(job.jobId, "Calculating");
							const data = await ffmpeg.runProbeWithArgs(["-v", "error", "-select_streams", "v", "-show_entries", "format=duration", "-show_entries", "stream=height", "-show_entries", "stream=r_frame_rate", "-of", "default=noprint_wrappers=1", tempPath]);
							if (data) {
								const outputStr = data.data;
								try {
									const durationMatches = regexPatternDuration.exec(outputStr);
									const heightMatches = regexPatternHeight.exec(outputStr);
									const frameRateMatches = regexPatternFrameRate.exec(outputStr);
									const duration = Math.ceil(durationMatches[1]);
									const originalHeight = parseInt(heightMatches[1]);
									const frameRate = parseFloat(frameRateMatches[1]);
									if (duration == 0)
										throw new Error("Invalid file duration");
									let audioSize = 0;
									if (!job.options.stripAudio.value) {
										let audioBitrate = 1320000 / duration + 10000;
										if (audioBitrate > 32768)
											audioBitrate = 32768;
										else if (audioBitrate < 10240)
											audioBitrate = 10240;
										try {
											toasts.setToast(job.jobId, "Compressing Audio 0%");
											await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-vn", "-c:a", "libopus", "-b:a", audioBitrate, "-ac", "1", "-sn", "-map_chapters", "-1", tempAudioPath], str => {
												return str.includes("time=")
											}, str => {
												try {
													const timeStr = regexPatternTime.exec(str);
													if (timeStr) {
														const timeStrParts = timeStr[1].split(':');
														const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
														toasts.setToast(job.jobId, "Compressing Audio " + Math.round((elapsedTime / duration) * 100) + "%");
													}
												} catch (e) {
													Logger.err(config.info.name, e);
												}
											});
										} catch (e) {
											try {
												fs.rmSync(tempPath);
											} catch (e) {}
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
											throw e;
										}
										if (!fs.existsSync(tempAudioPath)) {
											try {
												fs.rmSync(tempPath);
											} catch (e) {}
											throw new Error("Cannot find FFmpeg output");
										}
										const audioStats = fs.statSync(tempAudioPath);
										audioSize = audioStats ? audioStats.size : 0;
									}
									let maxFrameRate = frameRate;
									if (job.options.maxFps.value && job.options.maxFps.value < frameRate)
										maxFrameRate = job.options.maxFps.value;
									const cappedFileSize = Math.floor((job.options.sizeCap.value && parseInt(job.options.sizeCap.value) < maxUploadSize ? parseInt(job.options.sizeCap.value) : maxUploadSize) - 250000);
									let videoBitrate = Math.floor((((cappedFileSize - audioSize) * 8) / 1024) / duration);
									videoBitrate = videoBitrate > 2 ? videoBitrate - 1 : videoBitrate;
									let maxVideoHeight = job.options.maxHeight.value;
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
									maxVideoHeight = (job.options.maxHeight.value && job.options.maxHeight.value < maxVideoHeight) ? job.options.maxHeight.value : maxVideoHeight;
									try {
										toasts.setToast(job.jobId, "Compressing 1st Pass 0%");
										if (maxVideoHeight && originalHeight > maxVideoHeight)
											await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-vf", "fps=fps=" + maxFrameRate + "," + (job.options.interlace.value ? "interlace=lowpass=2," : "") + "scale=-1:" + maxVideoHeight + ", scale=trunc(iw/2)*2:" + maxVideoHeight, "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.encoder.value, "-pass", "1", "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")], str => {
												return str.includes("time=")
											}, str => {
												try {
													const timeStr = regexPatternTime.exec(str);
													if (timeStr) {
														const timeStrParts = timeStr[1].split(':');
														const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
														toasts.setToast(job.jobId, "Compressing 1st Pass " + Math.round((elapsedTime / duration) * 100) + "%");
													}
												} catch (e) {
													Logger.err(config.info.name, e);
												}
											});
										else
											await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-vf", "fps=fps=" + maxFrameRate + (job.options.interlace.value ? ",interlace=lowpass=2," : ""), "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.encoder.value, "-pass", "1", "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")], str => {
												return str.includes("time=")
											}, str => {
												try {
													const timeStr = regexPatternTime.exec(str);
													if (timeStr) {
														const timeStrParts = timeStr[1].split(':');
														const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
														toasts.setToast(job.jobId, "Compressing 1st Pass " + Math.round((elapsedTime / duration) * 100) + "%");
													}
												} catch (e) {
													Logger.err(config.info.name, e);
												}
											});
									} catch (e) {
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										if (!job.options.stripAudio.value) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
										}
										try {
											fs.rmSync(tempVideoPath);
										} catch (e) {}
										throw e;
									}
									try {
										toasts.setToast(job.jobId, "Compressing 2nd Pass 0%");
										if (maxVideoHeight && originalHeight > maxVideoHeight)
											await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-vf", "fps=fps=" + maxFrameRate + "," + (job.options.interlace.value ? "interlace=lowpass=2," : "") + "scale=-1:" + maxVideoHeight + ", scale=trunc(iw/2)*2:" + maxVideoHeight, "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.encoder.value, "-pass", "2", tempVideoPath], str => {
												return str.includes("time=")
											}, str => {
												try {
													const timeStr = regexPatternTime.exec(str);
													if (timeStr) {
														const timeStrParts = timeStr[1].split(':');
														const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
														toasts.setToast(job.jobId, "Compressing 2nd Pass " + Math.round((elapsedTime / duration) * 100) + "%");
													}
												} catch (e) {
													Logger.err(config.info.name, e);
												}
											});
										else
											await ffmpeg.runWithArgs(["-y", "-i", tempPath, "-b:v", videoBitrate + "K", "-vf", "fps=fps=" + maxFrameRate + (job.options.interlace.value ? ",interlace=lowpass=2," : ""), "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.encoder.value, "-pass", "2", tempVideoPath], str => {
												return str.includes("time=")
											}, str => {
												try {
													const timeStr = regexPatternTime.exec(str);
													if (timeStr) {
														const timeStrParts = timeStr[1].split(':');
														const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
														toasts.setToast(job.jobId, "Compressing 2nd Pass " + Math.round((elapsedTime / duration) * 100) + "%");
													}
												} catch (e) {
													Logger.err(config.info.name, e);
												}
											});
									} catch (e) {
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										try {
											fs.rmSync(tempAudioPath);
										} catch (e) {}
										try {
											fs.rmSync(tempVideoPath);
										} catch (e) {}
										throw e;
									}
									if (!fs.existsSync(tempVideoPath)) {
										try {
											fs.rmSync(tempPath);
										} catch (e) {}
										try {
											fs.rmSync(tempAudioPath);
										} catch (e) {}
										throw new Error("Cannot find FFmpeg output");
									}
									try {
										toasts.setToast(job.jobId, "Packaging 0%");
										await ffmpeg.runWithArgs(["-y", ...(!job.options.stripAudio.value ? ["-i", tempAudioPath] : []), "-i", tempVideoPath, "-c", "copy", compressedPathPre], str => {
											return str.includes("time=")
										}, str => {
											try {
												const timeStr = regexPatternTime.exec(str);
												if (timeStr) {
													const timeStrParts = timeStr[1].split(':');
													const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
													toasts.setToast(job.jobId, "Packaging " + Math.round((elapsedTime / duration) * 100) + "%");
												}
											} catch (e) {
												Logger.err(config.info.name, e);
											}
										});
									} catch (e) {
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
										throw e;
									}
									if (fs.existsSync(compressedPathPre)) {
										fs.renameSync(compressedPathPre, compressedPath);
									} else {
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
										throw new Error("Cannot find FFmpeg output");
									}
									if (fs.existsSync(compressedPath)) {
										if (cache) {
											cache.addToCache(compressedPath, name + ".webm", job.hash);
										}
										const retFile = new File([Uint8Array.from(Buffer.from(fs.readFileSync(compressedPath))).buffer], name + ".webm", {
											type: job.file.type
										});
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
										job.compressedFile = retFile;
										if (!cache) {
											try {
												fs.rmSync(compressedPath);
											} catch (e) {}
										}
										return job;
									} else {
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
										throw new Error("Cannot find FFmpeg output");
									}
								} catch (e) {
									try {
										fs.rmSync(tempPath);
									} catch (e) {}
									throw e;
								}
							} else {
								throw new Error("Cannot read FFprobe output");
							}
						} else {
							throw new Error("Unable to access temp data directory");
						}
					} else {
						throw new Error("Unable to run FFmpeg");
					}
				}

				loadImageElement(img, src) {
					return new Promise((resolve, reject) => {
						img.addEventListener("load", () => {
							resolve(img)
						}, false);
						img.addEventListener("error", (err) => {
							reject(err)
						}, false);
						img.src = src;
					});
				}

				async compressImage(job) {
					const objectUrl = URL.createObjectURL(job.file);
					const img = new window.Image();
					await this.loadImageElement(img, objectUrl);
					URL.revokeObjectURL(objectUrl);
					const image = {
						file: job.file,
						data: img,
						outputData: null,
						width: img.naturalWidth,
						height: img.naturalHeight,
						iterations: 0
					};
					if (await this.compressImageLoop(job, image)) {
						toasts.setToast(job.jobId, "Packaging");
						job.compressedFile = new File([image.outputData], image.file.name, {
							type: image.file.type
						});
						if (cache) {
							cache.saveAndCache(job.compressedFile, job.hash);
						}
						return job;
					}
					return null;
				}

				async compressImageLoop(job, image) {
					image.iterations++;
					toasts.setToast(job.jobId, "Compression Try " + image.iterations);
					image.outputData = await this.compressImageCanvas(image, job.options);
					if (image.outputData.size >= maxUploadSize) {
						if (image.iterations >= job.options.maxIterations.value) {
							BdApi.showToast("Unable to comress impage!", {
								type: "error"
							});
							return null;
						} else {
							return await this.compressImageLoop(job, image);
						}
					} else {
						return image;
					}
				}

				async compressImageCanvas(image, options) {
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d");
					const multiplier = Math.pow(options.sizeMultiplier.value, image.iterations);
					canvas.width = Math.round(image.width * multiplier);
					canvas.height = Math.round(image.height * multiplier);
					context.drawImage(image.data, 0, 0, canvas.width, canvas.height);
					return new Promise((resolve, reject) => {
						canvas.toBlob((blob) => {
							resolve(blob);
						}, image.file.type);
					});
				}

				getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}

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
