/**
 * @name FileCompressor
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js
 */

//TODO Allow for the selection of different cached files from runs with different options
//TODO Get file properties before asking for options to pre-populate fields with current settings and allow for additional options - which audio tracks to mix, which subtitle track to burn, which video track to use
//TODO Add plugin settings for default options
//TODO Add plugin settings for toast position on screen
//TODO Add button to bypass compression

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
			version: "1.5.7",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [{
				title: "Added",
				type: "added",
				items: [
					"Added MKVmerge for merging completed video files - greatly reduces file size over FFmpeg",
					"Debug compression time output"
				]
			}, {
				title: "Fixed",
				type: "fixed",
				items: [
					"Don't fail compression when file headers are missing data",
					"Don't forcefully cap compression size to value in settings"
				]
			}, {
				title: "Improved",
				type: "improved",
				items: [
					"Tuned VP9 bitrate to video size calculations",
					"Maximize number of audio channels and bit depth in video compression"
				]
			}, {
				title: "Known Bugs",
				type: "improved",
				items: [
					"FFmpeg 4.4 has a FLAC decoding bug"
				]
			}
		],
		defaultConfig: [{
				type: 'category',
				id: 'upload',
				get name() {
					return i18n.MESSAGES.SETTINGS_UPLOAD_CATEGORY
				},
				collapsible: true,
				shown: false,
				settings: [{
						get name() {
							return i18n.MESSAGES.SETTINGS_AUTO_CHANNEL_SWITCH
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_AUTO_CHANNEL_SWITCH_DESC
						},
						id: 'autoChannelSwitch',
						type: 'switch',
						value: true
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_IMMEDIATE_UPLOAD
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_IMMEDIATE_UPLOAD_DESC
						},
						id: 'immediateUpload',
						type: 'switch',
						value: false
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_MAX_FILE_SIZE
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_MAX_FILE_SIZE_DESC
						},
						id: 'maxFileSize',
						type: 'textbox',
						value: 0
					}
				]
			}, {
				type: 'category',
				id: 'compressor',
				get name() {
					return i18n.MESSAGES.SETTINGS_COMPRESSOR_CATEGORY
				},
				collapsible: true,
				shown: false,
				settings: [{
						get name() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_DESC
						},
						id: 'promptOptions',
						type: 'switch',
						value: true
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_CONCURRENT_THREADS
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_CONCURRENT_THREADS_DESC
						},
						id: 'concurrentThreads',
						type: 'slider',
						min: 1,
						max: 5,
						value: 3,
						markers: [1, 2, 3, 4, 5],
						stickToMarkers: true
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_CACHE_PATH
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_CACHE_PATH_DESC
						},
						id: 'cachePath',
						type: 'textbox',
						value: ""
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_FFMPEG
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_FFMPEG_DESC
						},
						id: 'ffmpeg',
						type: 'switch',
						value: false
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_FFMPEG_DOWNLOAD
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_FFMPEG_DOWNLOAD_DESC
						},
						id: 'ffmpegDownload',
						type: 'switch',
						value: true
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_FFMPEG_PATH
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_FFMPEG_PATH_DESC
						},
						id: 'ffmpegPath',
						type: 'textbox',
						value: ""
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_MKVMERGE
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_MKVMERGE_DESC
						},
						id: 'mkvmerge',
						type: 'switch',
						value: false
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_MKVMERGE_DOWNLOAD
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_MKVMERGE_DOWNLOAD_DESC
						},
						id: 'mkvmergeDownload',
						type: 'switch',
						value: true
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_MKVMERGE_PATH
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_MKVMERGE_PATH_DESC
						},
						id: 'mkvmergePath',
						type: 'textbox',
						value: ""
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_DEBUG
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_DEBUG_DESC
						},
						id: 'debug',
						type: 'switch',
						value: false
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_KEEP_TEMP
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_KEEP_TEMP_DESC
						},
						id: 'keepTemp',
						type: 'switch',
						value: false
					}
				]
			}
		]
	};

	const i18n = {
		en: {
			SETTINGS_UPLOAD_CATEGORY: 'Upload Settings',
			SETTINGS_AUTO_CHANNEL_SWITCH: 'Auto Channel Switch',
			SETTINGS_AUTO_CHANNEL_SWITCH_DESC: 'Automatically switch to the required channel when a file is ready to be uploaded.',
			SETTINGS_IMMEDIATE_UPLOAD: 'Immediate Upload',
			SETTINGS_IMMEDIATE_UPLOAD_DESC: 'Immediately upload files without showing a preview.',
			SETTINGS_MAX_FILE_SIZE: 'Max File Size (bytes)',
			SETTINGS_MAX_FILE_SIZE_DESC: 'Default to this maximum file size for slower networks.',
			SETTINGS_COMPRESSOR_CATEGORY: 'Compressor Settings',
			SETTINGS_PROMPT_FOR_OPTIONS: 'Prompt for Options',
			SETTINGS_PROMPT_FOR_OPTIONS_DESC: 'Prompt for compression options before compressing.',
			SETTINGS_CONCURRENT_THREADS: 'Concurrent Compression Jobs',
			SETTINGS_CONCURRENT_THREADS_DESC: 'Number of compression jobs that can be processing simultaneously.',
			SETTINGS_CACHE_PATH: 'Cache Location',
			SETTINGS_CACHE_PATH_DESC: 'Custom file cache location to use (Leave empty to use default location).',
			SETTINGS_FFMPEG: 'Use FFmpeg',
			SETTINGS_FFMPEG_DESC: 'Enable the use of FFmpeg for compressing video and audio.',
			SETTINGS_FFMPEG_DOWNLOAD: 'Download FFmpeg',
			SETTINGS_FFMPEG_DOWNLOAD_DESC: 'Should FFmpeg be automatically downloaded? Disable this to use a custom installation.',
			SETTINGS_FFMPEG_PATH: 'FFmpeg Install Location',
			SETTINGS_FFMPEG_PATH_DESC: 'Custom FFmpeg install location to use (Leave empty to use default location).',
			SETTINGS_MKVMERGE: 'Use MKVmerge',
			SETTINGS_MKVMERGE_DESC: 'Enable the use of MKVmerge for compressing video.',
			SETTINGS_MKVMERGE_DOWNLOAD: 'Download MKVmerge',
			SETTINGS_MKVMERGE_DOWNLOAD_DESC: 'Should MKVmerge be automatically downloaded? Disable this to use a custom installation.',
			SETTINGS_MKVMERGE_PATH: 'MKVmerge Install Location',
			SETTINGS_MKVMERGE_PATH_DESC: 'Custom MKVmerge install location to use (Leave empty to use default location).',
			SETTINGS_DEBUG: 'Debug Output',
			SETTINGS_DEBUG_DESC: 'Outputs extra debug messages to the console during compression.',
			SETTINGS_KEEP_TEMP: 'Keep Temp Files',
			SETTINGS_KEEP_TEMP_DESC: 'Retain temporary files after compression.',
			COMPRESSION_OPTIONS_TITLE: '{$0$} Compression Options',
			COMPRESSION_OPTIONS_USE_CACHE: 'Use Cached File',
			COMPRESSION_OPTIONS_USE_CACHE_DESC: 'Use the previously cached file.',
			COMPRESSION_OPTIONS_SIZE_CAP: 'Size Cap (bytes)',
			COMPRESSION_OPTIONS_SIZE_CAP_DESC: 'Max file size to compress under.',
			COMPRESSION_OPTIONS_SIZE_MULTIPLIER: 'Iterative Size Multiplier',
			COMPRESSION_OPTIONS_SIZE_MULTIPLIER_DESC: 'Amount to multiply image size by with each attempt.',
			COMPRESSION_OPTIONS_MAX_ITERATIONS: 'Max Iterations',
			COMPRESSION_OPTIONS_MAX_ITERATIONS_DESC: 'Maximum number of attempts to resize image.',
			COMPRESSION_OPTIONS_ENCODER: 'Encoder',
			COMPRESSION_OPTIONS_ENCODER_PRESET: 'Encoder Preset',
			COMPRESSION_OPTIONS_ENCODER_PRESET_PRESERVE_VIDEO: 'Preserve Video',
			COMPRESSION_OPTIONS_ENCODER_PRESET_BALANCED: 'Balanced',
			COMPRESSION_OPTIONS_ENCODER_PRESET_PRESERVE_AUDIO: 'Preserve Audio',
			COMPRESSION_OPTIONS_MAX_HEIGHT: 'Max Video Height (pixels)',
			COMPRESSION_OPTIONS_MAX_FPS: 'Max Video FPS',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO: 'Interlace Video',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO_DESC: 'Not recommended except for the largest videos.',
			COMPRESSION_OPTIONS_STRIP_AUDIO: 'Strip Audio',
			COMPRESSION_OPTIONS_STRIP_AUDIO_DESC: 'Remove all audio from the video.',
			COMPRESSION_OPTIONS_STRIP_VIDEO: 'Strip Video',
			COMPRESSION_OPTIONS_STRIP_VIDEO_DESC: 'Only send the audio from the video.',
			COMPRESSION_OPTIONS_STARTING_TIMESTAMP: 'Starting Timestamp',
			COMPRESSION_OPTIONS_ENDING_TIMESTAMP: 'Ending Timestamp',
			ERROR_CACHING: 'Error caching file',
			ERROR_CACHE_SETUP: 'Error setting up cache',
			ERROR_HOOKING_UPLOAD: 'Unable to hook into Discord upload handler',
			LIBRARY_VERSION_REQUIRED: '{$0$} {$1$} Required',
			LIBRARY_REQUIRED_COMPRESSION: 'To compress video/audio, {$0$} needs to use {$1$}.',
			LIBRARY_REQUIRED_CUSTOM_INSTALL: 'If you would like to specify a custom {$1$} installation, please press cancel and setup {$1$} in the {$0$} plugin settings. Otherwise, by clicking "Install Automatically", you are agreeing to the licensing terms, and {$1$} will be automatically installed.',
			LIBRARY_SOURCE_LOCATION: '{$0$} {$1$} source code is available here: {$2$}',
			LIBRARY_LICENSE_INFO: '{$0$} is licensed under {$1$}, available to read here: {$2$}',
			LIBRARY_CUSTOM_PATH_INVALID: 'To compress video/audio, {$0$} needs to use {$1$}. The path to {$1$} specified in the {$0$} settings is invalid!\n\nPlease check the path and ensure "Use {$1$}" is enabled.',
			ERROR_DOWNLOADING_PROGRAM: 'Error downloading {$0$}',
			CANCEL: 'Cancel',
			INSTALL_AUTOMATICALLY: 'Install Automatically',
			BEGIN_COMPRESSION: 'Begin Compression',
			DOWNLOADING_PROGRAM_PERCENT: 'Downloading {$0$} {$1$}%',
			HASHING_PERCENT: 'Hashing {$0$}%',
			INITIALIZING: 'Initializing',
			COPYING_PERCENT: 'Copying {$0$}%',
			CALCULATING: 'Calculating',
			COMPRESSING_PERCENT: 'Compressing {$0$}%',
			COMPRESSING_AUDIO_PERCENT: 'Compressing Audio {$0$}%',
			COMPRESSING_PASS_1_PERCENT: 'Compressing Pass 1 {$0$}%',
			COMPRESSING_PASS_2_PERCENT: 'Compressing Pass 2 {$0$}%',
			COMPRESSING_TRY_NUMBER: 'Compressing Attempt {$0$}',
			PACKAGING: 'Packaging',
			ERROR_GETTING_ACCOUNT_INFO: 'Error getting account info',
			FILES_TOO_LARGE_TO_UPLOAD: 'Files too large to upload: {$0$}',
			UNABLE_TO_RETURN_TO_CHANNEL: 'Unable to return to channel',
			ERROR_UPLOADING: 'Error uploading file',
			ERROR_COMPRESSING: 'Error compressing file',
			QUEUED_FILES_NUM: 'Files to be compressed: {$0$}'
		},
		ja: {
			SETTINGS_UPLOAD_CATEGORY: 'アップロード設定',
			SETTINGS_AUTO_CHANNEL_SWITCH: '自動的でチャネルにジャンプ',
			SETTINGS_AUTO_CHANNEL_SWITCH_DESC: 'ファイルアップロードの準備ができたら自動的でチャネルにジャンプ。',
			SETTINGS_IMMEDIATE_UPLOAD: '直接アップロード',
			SETTINGS_IMMEDIATE_UPLOAD_DESC: 'プレビューなしで直接アップロード。',
			SETTINGS_MAX_FILE_SIZE: '最大ファイルサイズ（bytes）',
			SETTINGS_MAX_FILE_SIZE_DESC: '低速ネットワークの場合で最大ファイルサイズのデフォルト。',
			SETTINGS_COMPRESSOR_CATEGORY: '圧縮設定',
			SETTINGS_PROMPT_FOR_OPTIONS: 'オプションのプロンプト',
			SETTINGS_PROMPT_FOR_OPTIONS_DESC: '圧縮を開始前にオプションのプロンプト。',
			SETTINGS_CONCURRENT_THREADS: '同時圧縮ジョブ',
			SETTINGS_CONCURRENT_THREADS_DESC: '同時で圧縮できるジョブの数。',
			SETTINGS_CACHE_PATH: 'キャッシュの所在',
			SETTINGS_CACHE_PATH_DESC: 'ファイルキャッシュの所在（デフォルト使うには空のまま）。',
			SETTINGS_FFMPEG: 'FFmpegを使用',
			SETTINGS_FFMPEG_DESC: '動画と音声の圧縮にFFmpegを使用。',
			SETTINGS_FFMPEG_DOWNLOAD: 'FFmpegをダウンロード',
			SETTINGS_FFMPEG_DOWNLOAD_DESC: 'FFmpegを自動的にダウンロード？カスタムインストール所在使うには無効します。',
			SETTINGS_FFMPEG_PATH: 'FFmpegのインストール所在',
			SETTINGS_FFMPEG_PATH_DESC: 'FFmpegのインストール所在（デフォルト使うには空のまま）。',
			SETTINGS_MKVMERGE: 'MKVmergeを使用',
			SETTINGS_MKVMERGE_DESC: '動画の圧縮にMKVmergeを使用。',
			SETTINGS_MKVMERGE_DOWNLOAD: 'MKVmergeをダウンロード',
			SETTINGS_MKVMERGE_DOWNLOAD_DESC: 'MKVmergeを自動的にダウンロード？カスタムインストール所在使うには無効します。',
			SETTINGS_MKVMERGE_PATH: 'MKVmergeのインストール所在',
			SETTINGS_MKVMERGE_PATH_DESC: 'MKVmergeのインストール所在（デフォルト使うには空のまま）。',
			SETTINGS_DEBUG: 'デバッグ出力',
			SETTINGS_DEBUG_DESC: '圧縮中で追加のデバッグメッセージをコンソールに出力する。',
			SETTINGS_KEEP_TEMP: '一時ファイルを保持',
			SETTINGS_KEEP_TEMP_DESC: '圧縮後に一時ファイルを保持する。',
			COMPRESSION_OPTIONS_TITLE: '{$0$}　圧縮設定',
			COMPRESSION_OPTIONS_USE_CACHE: 'キャッシュされたファイルュを使用',
			COMPRESSION_OPTIONS_USE_CACHE_DESC: '以前にキャッシュされたファイルを使用する。',
			COMPRESSION_OPTIONS_SIZE_CAP: '最大ファイルサイズ（bytes）',
			COMPRESSION_OPTIONS_SIZE_CAP_DESC: '圧縮するときの最大なファイルサイズ。',
			COMPRESSION_OPTIONS_SIZE_MULTIPLIER: '試行ごとに画像のサイズ変更係数',
			COMPRESSION_OPTIONS_SIZE_MULTIPLIER_DESC: '試行ごとに画像のサイズがこの係数で乗算します。',
			COMPRESSION_OPTIONS_MAX_ITERATIONS: '最大試行回数',
			COMPRESSION_OPTIONS_MAX_ITERATIONS_DESC: '画像圧縮の最大試行回数。',
			COMPRESSION_OPTIONS_ENCODER: 'エンコーダー',
			COMPRESSION_OPTIONS_ENCODER_PRESET: 'エンコーダープリセット',
			COMPRESSION_OPTIONS_ENCODER_PRESET_PRESERVE_VIDEO: '動画を保存',
			COMPRESSION_OPTIONS_ENCODER_PRESET_BALANCED: 'バランス',
			COMPRESSION_OPTIONS_ENCODER_PRESET_PRESERVE_AUDIO: '音声を保存',
			COMPRESSION_OPTIONS_MAX_HEIGHT: '最大動画の高さ（ピクセル）',
			COMPRESSION_OPTIONS_MAX_FPS: '最大動画のFPS',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO: '動画をインターレース',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO_DESC: '最大の動画以外に推奨されません。',
			COMPRESSION_OPTIONS_STRIP_AUDIO: '音声を消去する',
			COMPRESSION_OPTIONS_STRIP_AUDIO_DESC: '動画から全ての音声を消去する。',
			COMPRESSION_OPTIONS_STRIP_VIDEO: '動画を消去する',
			COMPRESSION_OPTIONS_STRIP_VIDEO_DESC: '動画の音声のみを保持。',
			COMPRESSION_OPTIONS_STARTING_TIMESTAMP: '開始タイムスタンプ',
			COMPRESSION_OPTIONS_ENDING_TIMESTAMP: '終了タイムスタンプ',
			ERROR_CACHING: 'ファイルキャッシュ中でエラー',
			ERROR_CACHE_SETUP: 'キャッシュセットアップでエラー',
			ERROR_HOOKING_UPLOAD: 'Discordのアップロードハンドラにフックできません',
			LIBRARY_VERSION_REQUIRED: '{$0$}　{$1$}が必要です',
			LIBRARY_REQUIRED_COMPRESSION: '動画と音声の圧縮に{$0$}には{$1$}が必要です。',
			LIBRARY_REQUIRED_CUSTOM_INSTALL: 'カスタムな{$1$}のインストール使用するにはキャンセルを押して{$0$}プラグインの設定で{$1$}をセットアップしてください。それ以外、「自動的でインストール」を押すとライセンス条項に同意したことになりますので、{$1$}は自動的でインストールされます。',
			LIBRARY_SOURCE_LOCATION: '{$0$}　{$1$}のソースコードはこちらです：　{$2$}',
			LIBRARY_LICENSE_INFO: '{$0$}は{$1$}の下でライセンスされています、こちらで読むことができます：　{$2$}',
			LIBRARY_CUSTOM_PATH_INVALID: '動画と音声の圧縮に{$0$}には{$1$}が必要です。{$0$}プラグインの設定で{$1$}の所在は無効です！\n\n所在と「{$1$}を使用」が有効されているのを確認してください。',
			ERROR_DOWNLOADING_PROGRAM: '{$0$}のダウンロード中でエラー',
			CANCEL: 'キャンセル',
			INSTALL_AUTOMATICALLY: '自動的でインストール',
			BEGIN_COMPRESSION: '圧縮を開始',
			DOWNLOADING_PROGRAM_PERCENT: '{$0$}ダウンロード中　{$1$}％',
			HASHING_PERCENT: 'ハッシュ中　{$0$}％',
			INITIALIZING: '初期化中',
			COPYING_PERCENT: 'コピー中　{$0$}％',
			CALCULATING: '計算中',
			COMPRESSING_PERCENT: '圧縮中　{$0$}％',
			COMPRESSING_AUDIO_PERCENT: '音声圧縮中　{$0$}％',
			COMPRESSING_PASS_1_PERCENT: '圧縮中１回目　{$0$}％',
			COMPRESSING_PASS_2_PERCENT: '圧縮中２回目　{$0$}％',
			COMPRESSING_TRY_NUMBER: '圧縮試行番　{$0$}',
			PACKAGING: 'パッケージング中',
			ERROR_GETTING_ACCOUNT_INFO: 'アカウント情報フェッチ中でエラー',
			FILES_TOO_LARGE_TO_UPLOAD: 'アップロードするには大きすぎたファイル：　{$0$}',
			UNABLE_TO_RETURN_TO_CHANNEL: 'チャネルに戻ることができません',
			ERROR_UPLOADING: 'ファイルアップロード中でエラー',
			ERROR_COMPRESSING: 'ファイル圧縮中でエラー',
			QUEUED_FILES_NUM: '圧縮するファイル：　{$0$}'
		},
		DEFAULT_LOCALE: "en",
		FORMAT: function (key, ...args) {
			if (args.length > 0)
				return this.MESSAGES[key].replace(/{\$([0-9]+)\$}/g, (_, p1) => {
					return String(args[p1]);
				});
			return this.MESSAGES[key];
		},
		updateLocale: function (newLocale) {
			newLocale = newLocale.toLowerCase();
			if (this.locale != newLocale) {
				this.locale = newLocale;
				let localeMessages = this[this.locale];
				if (!localeMessages) {
					const localeShort = this.locale.substring(0, 2);
					localeMessages = this[localeShort];
					if (localeMessages) {
						console.log(config.info.name + " Missing locale " + this.locale + ", falling back to " + localeShort);
					} else {
						console.log(config.info.name + " Missing locale " + this.locale);
					}
				}
				this.MESSAGES = {
					...this.defaultMessages,
					...localeMessages
				};
			}
		},
		init: function () {
			this.locale = this.DEFAULT_LOCALE;
			this.MESSAGES = this.defaultMessages = this[this.DEFAULT_LOCALE];
			return this;
		}
	}
	.init();

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
				ReactTools,
				WebpackModules
			} = Api;

			// Node modules
			const fs = require('fs');
			const path = require('path');
			const child_process = require('child_process');
			const uuidv4 = require('uuid/v4');
			const cryptoModule = require('crypto');
			const mime = require('mime-types');

			// Cache container
			let cache = null;

			// FFmpeg container
			let ffmpeg = null;
			// FFmpeg constants
			const ffmpegVersion = "4.4";
			const ffmpegSourceUrl = "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-source.zip";
			const ffmpegLicense = "GPL Version 2";
			const ffmpegLicenseUrl = "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html";
			const ffmpegDownloadUrls = {
				win_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-win-amd64.exe",
				darwin_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-darwin-amd64",
				linux_i686: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-i686",
				linux_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-amd64",
				linux_armhf: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-armhf",
				linux_arm64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffmpeg-linux-arm64"
			};
			const ffprobeDownloadUrls = {
				win_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-win-amd64.exe",
				darwin_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-darwin-amd64",
				linux_i686: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-i686",
				linux_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-amd64",
				linux_armhf: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-armhf",
				linux_arm64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/4.4/ffprobe-linux-arm64"
			};
			// MKVmerge container
			let mkvmerge = null;
			// MKVmerge constants
			const mkvmergeVersion = "58.0.0";
			const mkvmergeSourceUrl = "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-source.tar.xz";
			const mkvmergeLicense = "GPL Version 2";
			const mkvmergeLicenseUrl = "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html";
			const mkvmergeDownloadUrls = {
				win_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-win-amd64.exe",
				darwin_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-darwin-amd64",
				darwin_arm64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-darwin-arm64",
				linux_i686: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-i686",
				linux_amd64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-amd64",
				linux_armhf: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-armhf",
				linux_arm64: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-arm64"
			};
			const librarySuffixes = {
				win_amd64: "-win-amd64.exe",
				darwin_amd64: "-darwin-amd64",
				darwin_arm64: "-darwin-arm64",
				linux_i686: "-linux-i686",
				linux_amd64: "-linux-amd64",
				linux_armhf: "-linux-armhf",
				linux_arm64: "-linux-arm64"
			};
			// Default encoder settings
			const videoEncoderSettings = {
				"libx264": {
					fileType: "mkv",
					encoderPresets: {
						"preserveVideo": {
							audioFilePercent: 0.019,
							videoHeightCapFunction: (bitrate) => {
								if (bitrate < 102400)
									return 144;
								else if (bitrate < 204800)
									return 240;
								else if (bitrate < 512000)
									return 360;
								else if (bitrate < 870400)
									return 480;
								else if (bitrate < 1280000)
									return 720;
								else if (bitrate < 2560000)
									return 1080;
								else if (bitrate < 6144000)
									return 1440;
								else if (bitrate < 10240000)
									return 2160;
							}
						},
						"balanced": {
							audioFilePercent: 0.032,
							videoHeightCapFunction: (bitrate) => {
								if (bitrate < 102400)
									return 144;
								else if (bitrate < 204800)
									return 240;
								else if (bitrate < 512000)
									return 360;
								else if (bitrate < 870400)
									return 480;
								else if (bitrate < 1280000)
									return 720;
								else if (bitrate < 2560000)
									return 1080;
								else if (bitrate < 6144000)
									return 1440;
								else if (bitrate < 10240000)
									return 2160;
							}
						},
						"preserveAudio": {
							audioFilePercent: 0.044,
							videoHeightCapFunction: (bitrate) => {
								if (bitrate < 102400)
									return 144;
								else if (bitrate < 204800)
									return 240;
								else if (bitrate < 512000)
									return 360;
								else if (bitrate < 870400)
									return 480;
								else if (bitrate < 1280000)
									return 720;
								else if (bitrate < 2560000)
									return 1080;
								else if (bitrate < 6144000)
									return 1440;
								else if (bitrate < 10240000)
									return 2160;
							}
						}
					}
				},
				"libvpx-vp9": {
					fileType: "webm",
					encoderPresets: {
						"preserveVideo": {
							audioFilePercent: 0.03,
							videoHeightCapFunction: (bitrate) => {
								if (bitrate < 51200)
									return 144;
								else if (bitrate < 102400)
									return 240;
								else if (bitrate < 256000)
									return 360;
								else if (bitrate < 435200)
									return 480;
								else if (bitrate < 640000)
									return 720;
								else if (bitrate < 1280000)
									return 1080;
								else if (bitrate < 3072000)
									return 1440;
								else if (bitrate < 5120000)
									return 2160;
							}
						},
						"balanced": {
							audioFilePercent: 0.05,
							videoHeightCapFunction: (bitrate) => {
								if (bitrate < 51200)
									return 144;
								else if (bitrate < 102400)
									return 240;
								else if (bitrate < 256000)
									return 360;
								else if (bitrate < 435200)
									return 480;
								else if (bitrate < 640000)
									return 720;
								else if (bitrate < 1280000)
									return 1080;
								else if (bitrate < 3072000)
									return 1440;
								else if (bitrate < 5120000)
									return 2160;
							}
						},
						"preserveAudio": {
							audioFilePercent: 0.1,
							videoHeightCapFunction: (bitrate) => {
								if (bitrate < 51200)
									return 144;
								else if (bitrate < 102400)
									return 240;
								else if (bitrate < 256000)
									return 360;
								else if (bitrate < 435200)
									return 480;
								else if (bitrate < 640000)
									return 720;
								else if (bitrate < 1280000)
									return 1080;
								else if (bitrate < 3072000)
									return 1440;
								else if (bitrate < 5120000)
									return 2160;
							}
						}
					}
				}
			};
			const videoEncoderPresets = {
				"preserveVideo": "COMPRESSION_OPTIONS_ENCODER_PRESET_PRESERVE_VIDEO",
				"balanced": "COMPRESSION_OPTIONS_ENCODER_PRESET_BALANCED",
				"preserveAudio": "COMPRESSION_OPTIONS_ENCODER_PRESET_PRESERVE_AUDIO",
			};
			// Color primaries that will be detected as HDR and will be tonemapped
			const hdrColorPrimaries = ["bt2020"];
			const regexPatternTime = /time=(\d+:\d+:\d+.\d+)/;
			const regexPatternDuration = /duration=([\d.]+)/;
			const regexPatternChannels = /channels=(\d+)/;
			const regexPatternBitDepth = /bits_per_raw_sample=(\d+)/;
			const regexPatternHeight = /height=(\d+)/;
			const regexPatternFrameRate = /r_frame_rate=(\d+\/\d+)/;
			const regexPatternColorPrimaries = /color_primaries=(\w+)/;

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
			const Markdown = BdApi.findModule(m => m?.displayName === "Markdown" && m?.rules);
			const DiscordDropdown = BdApi.findModuleByDisplayName('SelectTempWrapper');

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
								this.ffmpeg += librarySuffixes["win_amd64"];
								break;
							case "darwin":
								this.ffmpeg += librarySuffixes["darwin_amd64"];
								break;
							default:
								switch (process.arch) {
								case "arm":
									this.ffmpeg += librarySuffixes["linux_armhf"];
									break;
								case "arm64":
									this.ffmpeg += librarySuffixes["linux_arm64"];
									break;
								case "x64":
									this.ffmpeg += librarySuffixes["linux_amd64"];
									break;
								case "ia32":
								case "x32":
								default:
									this.ffmpeg += librarySuffixes["linux_i686"];
									break;
								}
							}
							this.ffprobe = path.join(ffmpegFolder, "ffprobe");
							switch (process.platform) {
							case "win32":
								this.ffprobe += librarySuffixes["win_amd64"];
								break;
							case "darwin":
								this.ffprobe += librarySuffixes["darwin_amd64"];
								break;
							default:
								switch (process.arch) {
								case "arm":
									this.ffprobe += librarySuffixes["linux_armhf"];
									break;
								case "arm64":
									this.ffprobe += librarySuffixes["linux_arm64"];
									break;
								case "x64":
									this.ffprobe += librarySuffixes["linux_amd64"];
									break;
								case "ia32":
								case "x32":
								default:
									this.ffprobe += librarySuffixes["linux_i686"];
									break;
								}
								break;
							}
						}
						if (fs.existsSync(this.ffmpeg) && fs.existsSync(this.ffprobe)) {
							Logger.info(config.info.name, 'Running FFmpeg -version');
							Logger.debug(config.info.name, child_process.execFileSync(this.ffmpeg, ["-version"], {
									timeout: 10000
								}).toString());
						} else {
							throw new Error("FFmpeg not found");
						}
					} else {
						throw new Error("FFmpeg not found");
					}
				}

				runWithArgs(args, outputFilter, processOutput) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.ffmpeg)) {
							const rollingOutputBuffer = [];
							Logger.info(config.info.name, 'Running FFmpeg ' + args.join(' '));
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
									Logger.err(config.info.name, rollingOutputBuffer.join("\r\n"));
									reject();
								}
								const index = runningProcesses.indexOf(process);
								if (index > -1)
									runningProcesses.splice(index, 1);
							});
							process.stderr.on('data', data => {
								const str = data.toString();
								// Keep rolling buffer of output strings to output errors if FFmpeg crashes
								if (rollingOutputBuffer.length >= 10)
									rollingOutputBuffer.shift();
								rollingOutputBuffer.push(str);
								if (typeof(outputFilter) == "function" && typeof(processOutput) == "function" && outputFilter(str)) {
									processOutput(str);
								}
							});
							runningProcesses.push(process);
						} else {
							throw new Error("FFmpeg not found");
						}
					});
				}

				runProbeWithArgs(args) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.ffprobe)) {
							Logger.info(config.info.name, 'Running FFprobe ' + args.join(' '));
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
							throw new Error("FFprobe not found");
						}
					});
				}

				checkFFmpeg() {
					return fs.existsSync(this.ffmpeg) && fs.existsSync(this.ffprobe);
				}
			};

			const MKVmerge = class {
				constructor(mkvmergeFolder) {
					if (fs.existsSync(mkvmergeFolder)) {
						this.mkvmerge = path.join(mkvmergeFolder, "mkvmerge");
						if (process.platform == "win32") {
							this.mkvmerge += ".exe";
						}
						if (!fs.existsSync(this.mkvmerge)) {
							this.mkvmerge = path.join(mkvmergeFolder, "mkvmerge");
							switch (process.platform) {
							case "win32":
								this.mkvmerge += librarySuffixes["win_amd64"];
								break;
							case "darwin":
								switch (process.arch) {
								case "arm":
								case "arm64":
									this.mkvmerge += librarySuffixes["darwin_arm64"];
									break;
								case "x64":
								default:
									this.mkvmerge += librarySuffixes["darwin_amd64"];
									break;
								}
								break;
							default:
								switch (process.arch) {
								case "arm":
									this.mkvmerge += librarySuffixes["linux_armhf"];
									break;
								case "arm64":
									this.mkvmerge += librarySuffixes["linux_arm64"];
									break;
								case "x64":
									this.mkvmerge += librarySuffixes["linux_amd64"];
									break;
								case "ia32":
								case "x32":
								default:
									this.mkvmerge += librarySuffixes["linux_i686"];
									break;
								}
								break;
							}
						}
						if (fs.existsSync(this.mkvmerge)) {
							Logger.info(config.info.name, 'Running MKVmerge --version');
							Logger.debug(config.info.name, child_process.execFileSync(this.mkvmerge, ["--version"], {
									timeout: 10000
								}).toString());
						} else {
							throw new Error("MKVmerge not found");
						}
					} else {
						throw new Error("MKVmerge not found");
					}
				}

				runWithArgs(args, outputFilter, processOutput) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.mkvmerge)) {
							const rollingOutputBuffer = [];
							Logger.info(config.info.name, 'Running MKVmerge ' + args.join(' '));
							const process = child_process.spawn(this.mkvmerge, args);
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
									Logger.err(config.info.name, rollingOutputBuffer.join("\r\n"));
									reject();
								}
								const index = runningProcesses.indexOf(process);
								if (index > -1)
									runningProcesses.splice(index, 1);
							});
							process.stderr.on('data', data => {
								const str = data.toString();
								// Keep rolling buffer of output strings to output errors if MKVmerge crashes
								if (rollingOutputBuffer.length >= 10)
									rollingOutputBuffer.shift();
								rollingOutputBuffer.push(str);
								if (typeof(outputFilter) == "function" && typeof(processOutput) == "function" && outputFilter(str)) {
									processOutput(str);
								}
							});
							runningProcesses.push(process);
						} else {
							throw new Error("MKVmerge not found");
						}
					});
				}

				checkMKVmerge() {
					return fs.existsSync(this.mkvmerge);
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
									const percent = Math.round((bytesProcessed / totalBytes) * 100);
									percentageCallback(percent ? percent : 0);
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

				getFileKey(file) {
					if (file) {
						if (file.path && file.size && file.lastModified) {
							return file.size + file.lastModified + file.path;
						}
					}
					return null;
				}

				getFile(fileKey) {
					if (fileKey) {
						let entry = this.cacheLookup.get(fileKey);
						if (entry) {
							if (fs.existsSync(entry.path)) {
								return new File([Uint8Array.from(Buffer.from(fs.readFileSync(entry.path))).buffer], entry.name, {
									type: mime.contentType(entry.path)
								});
							} else {
								this.removeFile(fileKey);
							}
						}
					}
					return null;
				}

				getCachePath() {
					return this.cachePath;
				}

				async saveAndCache(file, fileKey) {
					if (fileKey) {
						try {
							let nameSplit = file.name.split('.');
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
										this.addToCache(filePath, file.name, fileKey);
									};
									fr.onerror = e => {
										Logger.err(config.info.name, fr.error);
										BdApi.showToast(i18n.MESSAGES.ERROR_CACHING, {
											type: "error"
										});
									};
									return;
								}
							}
							Logger.err(config.info.name, "Unable to find unused UUID for cache");
							BdApi.showToast(i18n.MESSAGES.ERROR_CACHING, {
								type: "error"
							});
						} catch (err) {
							Logger.err(config.info.name, err);
							BdApi.showToast(i18n.MESSAGES.ERROR_CACHING, {
								type: "error"
							});
						}
					}
				}

				addToCache(path, name, fileKey) {
					if (fileKey) {
						let entry = {
							path: path,
							name: name,
							fileKey: fileKey
						};
						this.cache.push(entry);
						this.cacheLookup.set(fileKey, entry);
					}
				}

				removeFile(fileKey) {
					if (fileKey) {
						let entry = this.cacheLookup.get(fileKey);
						if (entry) {
							this.cacheLookup.delete(fileKey);
							let index = this.cache.indexOf(entry);
							if (index >= 0) {
								this.cache.splice(index, 1);
							}
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
					this.toastNode = null;
				}
			};

			const FileSelector = {
				remove: function () {
					// Check for and remove existing file selector node
					document.getElementById('pseudocompressor-file-selector')?.remove();
				},
				open: function () {
					return new Promise((resolve, reject) => {
						// Check for existing file selector node
						let selectorNode = document.getElementById('pseudocompressor-file-selector');
						if (selectorNode)
							selectorNode.remove();
						selectorNode = document.createElement('input');
						selectorNode.type = 'file';
						selectorNode.id = 'pseudocompressor-file-selector';
						selectorNode.style.display = 'none';
						selectorNode.multiple = true;
						document.getElementById('app-mount')?.appendChild(selectorNode);
						selectorNode.onchange = function () {
							resolve(this.files);
							selectorNode.remove();
						};
						selectorNode.click();
					});
				}
			};

			const Dropdown = class extends Settings.SettingField {
				/**
				 * @param {string} name - name label of the setting
				 * @param {string} note - help/note to show underneath or above the setting
				 * @param {*} defaultValue - currently selected value
				 * @param {Array<module:Settings~DropdownItem>} values - array of all options available
				 * @param {callable} onChange - callback to perform on setting change, callback item value
				 * @param {object} [options] - object of options to give to the setting
				 * @param {boolean} [options.clearable=false] - should be able to empty the field value
				 * @param {boolean} [options.searchable=false] - should user be able to search the dropdown
				 * @param {boolean} [options.disabled=false] - should the setting be disabled
				 */
				constructor(name, note, defaultValue, values, onChange, options = {}) {
					const {
						clearable = false,
						searchable = false,
						disabled = false
					} = options;
					super(name, note, onChange, DiscordDropdown, {
						clearable: clearable,
						searchable: searchable,
						disabled: disabled,
						options: values,
						onChange: dropdown => opt => {
							dropdown.props.value = opt && opt.value;
							dropdown.forceUpdate();
							this.onChange(opt && opt.value);
						},
						value: defaultValue
					});
				}
			}

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
					i18n.updateLocale(DiscordAPI.UserSettings.locale);
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
					// Remove toasts module
					if (toasts)
						toasts.remove();
					toasts = null;
					// Remove file selector module
					FileSelector.remove();
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
							BdApi.showToast(i18n.MESSAGES.ERROR_HOOKING_UPLOAD, {
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
						BdApi.showToast(i18n.MESSAGES.ERROR_HOOKING_UPLOAD, {
							type: "error"
						});
						Logger.err(config.info.name, "Unable to hook into Discord upload handler! promptToUpload module doesn't exist!");
					}
					Patcher.instead(WebpackModules.find(m => m.prototype.activateUploadDialogue && m.displayName === "FileInput").prototype, "activateUploadDialogue", (t, args, originalFunc) => {
						// Run custom file selector
						FileSelector.open().then(fileList => {
							// If selector returns file list, run Discord's onChange
							t.props.onChange({
								currentTarget: {
									files: [...fileList]
								},
								stopPropagation: () => {},
								preventDefault: () => {}
							});
						});
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
						cache = new FileCache(this.settings.compressor.cachePath ? this.settings.compressor.cachePath : path.join(BdApi.Plugins.folder, "compressorcache"));
					} catch (err) {
						BdApi.showToast(i18n.MESSAGES.ERROR_CACHE_SETUP, {
							type: "error"
						});
					}
				}

				initFfmpeg() {
					return new Promise((resolve, reject) => {
						let ffmpegPath = this.settings.compressor.ffmpegPath ? this.settings.compressor.ffmpegPath : path.join(BdApi.Plugins.folder, "compressorlibraries");
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
								BdApi.showConfirmationModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "FFmpeg", ffmpegVersion),
									DiscordModules.React.createElement("div", {},
										[
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_COMPRESSION', config.info.name, "FFmpeg")),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_CUSTOM_INSTALL', config.info.name, "FFmpeg")),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_SOURCE_LOCATION', "FFmpeg", ffmpegVersion, ffmpegSourceUrl)),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_LICENSE_INFO', "FFmpeg", ffmpegLicense, ffmpegLicenseUrl))
										]), {
									danger: false,
									onConfirm: () => {
										this.saveSettings("compressor", "ffmpeg", true);
										const ffmpegPromise = this.downloadLibrary(ffmpegPath, ffmpegDownloadUrls, "FFmpeg");
										ffmpegPromise.then(filePath => {
											fs.chmodSync(filePath, 755);
										}).catch(e => {
											Logger.err(config.info.name, "Unable to download FFmpeg", e);
											BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFmpeg'), {
												type: "error"
											});
											reject(e);
										});
										const ffprobePromise = this.downloadLibrary(ffmpegPath, ffprobeDownloadUrls, "FFprobe");
										ffprobePromise.then(filePath => {
											fs.chmodSync(filePath, 755);
										}).catch(e => {
											Logger.err(config.info.name, "Unable to download FFprobe", e);
											BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFprobe'), {
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
									},
									confirmText: i18n.MESSAGES.INSTALL_AUTOMATICALLY,
									cancelText: i18n.MESSAGES.CANCEL
								});
							} else {
								Modals.showAlertModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "FFmpeg", ffmpegVersion), i18n.FORMAT('LIBRARY_CUSTOM_PATH_INVALID', config.info.name, "FFmpeg"));
								reject();
							}
						}
					});
				}

				initMkvmerge() {
					return new Promise((resolve, reject) => {
						let mkvmergePath = this.settings.compressor.mkvmergePath ? this.settings.compressor.mkvmergePath : path.join(BdApi.Plugins.folder, "compressorlibraries");
						let noMkvmerge = false;
						let installedMkvmerge = BdApi.getData(config.info.name, "mkvmerge.version");
						if (installedMkvmerge && installedMkvmerge != mkvmergeVersion) {
							noMkvmerge = true;
						} else {
							if (this.settings.compressor.mkvmerge) {
								if (!mkvmerge || !mkvmerge.checkMKVmerge()) {
									try {
										mkvmerge = new MKVmerge(mkvmergePath);
										resolve(true);
									} catch (err) {
										Logger.err(config.info.name, err);
										noMkvmerge = true;
										mkvmerge = null;
									}
								}
							} else {
								noMkvmerge = true;
								mkvmerge = null;
							}
						}
						if (noMkvmerge) {
							if (this.settings.compressor.mkvmergeDownload) {
								BdApi.showConfirmationModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "MKVmerge", mkvmergeVersion),
									DiscordModules.React.createElement("div", {},
										[
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_COMPRESSION', config.info.name, "MKVmerge")),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_CUSTOM_INSTALL', config.info.name, "MKVmerge")),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_SOURCE_LOCATION', "MKVmerge", mkvmergeVersion, mkvmergeSourceUrl)),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_LICENSE_INFO', "MKVmerge", mkvmergeLicense, mkvmergeLicenseUrl))
										]), {
									danger: false,
									onConfirm: () => {
										this.saveSettings("compressor", "mkvmerge", true);
										this.downloadLibrary(mkvmergePath, mkvmergeDownloadUrls, "MKVmerge").then(filePath => {
											fs.chmodSync(filePath, 755);
											resolve(this.initMkvmerge());
										}).catch(e => {
											Logger.err(config.info.name, "Unable to download MKVmerge", e);
											BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'MKVmerge'), {
												type: "error"
											});
											reject(e);
										});
									},
									onCancel: () => {
										reject();
									},
									confirmText: i18n.MESSAGES.INSTALL_AUTOMATICALLY,
									cancelText: i18n.MESSAGES.CANCEL
								});
							} else {
								Modals.showAlertModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "MKVmerge", mkvmergeVersion), i18n.FORMAT('LIBRARY_CUSTOM_PATH_INVALID', config.info.name, "MKVmerge"));
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
						dlUrl = downloadUrls["win_amd64"];
						break;
					case "darwin":
						switch (process.arch) {
						case "arm":
						case "arm64":
							dlUrl = downloadUrls["darwin_arm64"];
							if (!dlUrl)
								dlUrl = downloadUrls["darwin_amd64"];
							break;
						case "x64":
						default:
							dlUrl = downloadUrls["darwin_amd64"];
							break;
						}
						break;
					default:
						switch (process.arch) {
						case "arm":
							dlUrl = downloadUrls["linux_armhf"];
							break;
						case "arm64":
							dlUrl = downloadUrls["linux_arm64"];
							break;
						case "x64":
							dlUrl = downloadUrls["linux_amd64"];
							break;
						case "ia32":
						case "x32":
						default:
							dlUrl = downloadUrls["linux_i686"];
							break;
						}
						break;
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
								const originalFileName = regexp.exec(result.headers['content-disposition'])[1];
								const totalLength = result.headers['content-length'];
								let writtenLength = 0;
								const fileStream = fs.createWriteStream(path.join(downloadPath, originalFileName));
								toastsModule.setToast(jobId, i18n.FORMAT('DOWNLOADING_PROGRAM_PERCENT', name, '0'));
								result.on('data', chunk => {
									writtenLength += chunk.length;
									const percent = Math.round((writtenLength / totalLength) * 100);
									toastsModule.setToast(jobId, i18n.FORMAT('DOWNLOADING_PROGRAM_PERCENT', name, percent ? percent : 0));
								});
								result.pipe(fileStream);
								fileStream.on('error', function (e) {
									// Handle write errors
									reject(new Error("Error while downloading " + url + " for " + name));
								});
								fileStream.on('finish', function () {
									// The file has been downloaded
									toastsModule.setToast(jobId);
									resolve(path.join(downloadPath, originalFileName));
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
					if (typeof fileList[Symbol.iterator] === 'function' && channel) {
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
					} else {
						Logger.err(config.info.name, "Invalid upload event: fileList:", fileList, "channel:", channel, "draftType:", draftType, "instantBackdrop:", instantBackdrop, "requireConfirmation", requireConfirmation, "showLargeMessageDialog", showLargeMessageDialog, "ignoreDraft", ignoreDraft);
						BdApi.showToast(i18n.MESSAGES.ERROR_UPLOADING, {
							type: "error"
						});
					}
				}

				processUploadFileList(files, guildId, channelId, threadId, sidebar) {
					// Check account status and update max file upload size
					const settingsMaxSize = this.settings.upload.maxFileSize != 0 ? this.settings.upload.maxFileSize : 0;
					try {
						maxUploadSize = DiscordModules.DiscordConstants.PremiumUserLimits[DiscordAPI.currentUser.discordObject.premiumType ? DiscordAPI.currentUser.discordObject.premiumType : 0].fileSize;
					} catch (e) {
						Logger.err(config.info.name, e);
						BdApi.showToast(i18n.MESSAGES.ERROR_GETTING_ACCOUNT_INFO, {
							type: "error"
						});
						maxUploadSize = 8388608;
					}
					const uploadSizeCap = (settingsMaxSize > 0 && settingsMaxSize < maxUploadSize) ? settingsMaxSize : maxUploadSize
					// Synthetic DataTransfer to generate FileList
					const originalDt = new DataTransfer();
					const tempFiles = [];
					let queuedFiles = 0;
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						if (file.size > uploadSizeCap) {
							// If file is returned, it was incompressible
							let type = file.type;
							if (!type && file.path)
								type = mime.contentType(file.path);
							const tempFile = this.checkIsCompressible(file, type ? type.split('/')[0] : "", guildId, channelId, threadId, sidebar);
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
						BdApi.showToast(i18n.FORMAT('FILES_TOO_LARGE_TO_UPLOAD', num), {
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
						BdApi.showToast(i18n.MESSAGES.UNABLE_TO_RETURN_TO_CHANNEL, {
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
						BdApi.showToast(i18n.MESSAGES.ERROR_UPLOADING, {
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
						job.fileKey = cache.getFileKey(job.file);
						if (!job.fileKey) {
							// If unable to get key from path, size and modify date, hash file instead - generally used with screenshots and images in the clipboard
							toasts.setToast(job.jobId, i18n.FORMAT('HASHING_PERCENT', '0'));
							job.fileKey = await cache.hash(job.file, percentage => {
								toasts.setToast(job.jobId, i18n.FORMAT('HASHING_PERCENT', percentage));
							});
						}
						try {
							cacheFile = cache.getFile(job.fileKey);
						} catch (err) {
							Logger.err(config.info.name, err);
						}
						toasts.setToast(job.jobId);
					}
					// If cached file exists, ask user if they want to use cached options
					if (cacheFile) {
						job.options.useCache = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_USE_CACHE,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_USE_CACHE_DESC,
							type: "switch",
							defaultValue: true,
							category: "cache",
							onChange: (value, allCategories) => {
								const defaultCategory = allCategories["default"];
								if (defaultCategory)
									defaultCategory.style.display = (value ? "none" : null);
							}
						};
					}
					job.options.sizeCap = {
						name: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_CAP,
						description: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_CAP_DESC,
						type: "textbox",
						defaultValue: (this.settings.upload.maxFileSize != 0 ? this.settings.upload.maxFileSize : ""),
						validation: value => {
							return (!value || !isNaN(value) && !isNaN(parseInt(value)) && value > 0);
						}
					};
					switch (job.type) {
					case "image":
						job.options.sizeMultiplier = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_MULTIPLIER,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_MULTIPLIER_DESC,
							type: "textbox",
							defaultValue: 0.9,
							validation: value => {
								return (!isNaN(value) && !isNaN(parseFloat(value)) && value < 1 && value > 0);
							}
						};
						job.options.maxIterations = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_ITERATIONS,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_ITERATIONS_DESC,
							type: "textbox",
							defaultValue: 50,
							validation: value => {
								return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						if (!await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options))
							return false;
						break;
					case "video":
						const encoderValuesArray = [];
						for (const name of Object.getOwnPropertyNames(videoEncoderSettings)) {
							encoderValuesArray.push({
								value: name,
								label: name
							});
						}
						job.options.encoder = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_ENCODER,
							type: "dropdown",
							defaultValue: "libx264",
							props: {
								values: encoderValuesArray
							}
						};
						const encoderPresetsValuesArray = [];
						for (const preset of Object.getOwnPropertyNames(videoEncoderPresets)) {
							encoderPresetsValuesArray.push({
								value: preset,
								label: i18n.MESSAGES[videoEncoderPresets[preset]]
							});
						}
						job.options.encoderPreset = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_ENCODER_PRESET,
							type: "dropdown",
							defaultValue: "balanced",
							props: {
								values: encoderPresetsValuesArray
							}
						};
						job.options.maxHeight = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_HEIGHT,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						job.options.maxFps = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_FPS,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								return (!isNaN(value) && !isNaN(parseFloat(value)) && value > 0);
							}
						};
						job.options.interlace = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_INTERLACE_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_INTERLACE_VIDEO_DESC,
							type: "switch",
							defaultValue: false
						};
						job.options.stripAudio = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_AUDIO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_AUDIO_DESC,
							type: "switch",
							defaultValue: false
						};
						job.options.stripVideo = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_VIDEO_DESC,
							type: "switch",
							defaultValue: false
						};
						job.options.startTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STARTING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const[index, val]of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							}
						};
						job.options.endTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_ENDING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const[index, val]of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							}
						};
						if (!await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options))
							return false;
						break;
					case "audio":
						job.options.startTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STARTING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const[index, val]of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							}
						};
						job.options.endTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_ENDING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const[index, val]of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							}
						};
						if (!await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options))
							return false;
						break;
					}
					// If user wants to use cached options & cached file exists
					if (cacheFile && job.options.useCache.value) {
						this.sendUploadFileList(this.wrapFileInList(cacheFile), job.guildId, job.channelId, job.threadId, job.isSidebar);
					} else {
						if (runningJobs.length < this.settings.compressor.concurrentThreads) {
							toasts.setToast(job.jobId, i18n.MESSAGES.INITIALIZING);
							runningJobs.push(job);
							this.compressFileType(job);
						} else {
							processingQueue.push(job);
							toasts.setToast(0, i18n.FORMAT('QUEUED_FILES_NUM', processingQueue.length));
						}
					}
				}

				showSettings(title, options) {
					return new Promise((resolve, reject) => {
						// If options should be shown
						if (this.settings.compressor.promptOptions) {
							const settingsElements = new Map();
							const settingsPanels = new Map();
							const settingsPanelsReact = new Map();
							for (const setting in options) {
								// Set current value to default value
								options[setting].value = options[setting].defaultValue;
								// Get option category and store an array for each category
								const category = options[setting].category ? options[setting].category : "default";
								if (!settingsElements[category])
									settingsElements[category] = [];
								// Add setting object to array
								settingsElements[category].push(this.createSettingField(options[setting].type, options[setting].name, options[setting].description, options[setting].defaultValue, value => {
										// onChange function
										// Only set value if validation function doesn't exist, or if function exists and returns true
										if (typeof(options[setting].validation) != "function" || options[setting].validation(value)) {
											// Set value
											options[setting].value = value;
											// Run custom onChange function when value is set
											if (typeof(options[setting].onChange) == "function")
												options[setting].onChange(value, settingsPanels);
										}
									}, options[setting].props));
							}
							// Convert elements to HTML SettingPanel objects
							for (const[key, value]of Object.entries(settingsElements))
								settingsPanels[key] = Settings.SettingPanel.build(null, ...value);
							// Convert HTML to React elements
							for (const[key, value]of Object.entries(settingsPanels))
								settingsPanelsReact[key] = ReactTools.createWrappedElement(value);
							// Run all onChange functions with default values for setup
							for (const setting in options) {
								if (typeof(options[setting].onChange) == "function")
									options[setting].onChange(options[setting].value, settingsPanels);
							}
							// Display modal with React elements
							BdApi.showConfirmationModal(title, Object.values(settingsPanelsReact), {
								onConfirm: () => {
									resolve(true);
								},
								onCancel: () => {
									resolve(false);
								},
								confirmText: i18n.MESSAGES.BEGIN_COMPRESSION,
								cancelText: i18n.MESSAGES.CANCEL
							});
						} else {
							for (const setting in options) {
								// Set current value to default value
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
						return new Dropdown(name, description, defaultValue, props.values, onChange, props);
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
						BdApi.showToast(i18n.MESSAGES.ERROR_COMPRESSING, {
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
							if (processingQueue.length > 0)
								toasts.setToast(0, i18n.FORMAT('QUEUED_FILES_NUM', processingQueue.length));
							else
								toasts.setToast(0);
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
							const startCompressionTime = new Date();
							if (this.settings.compressor.debug)
								Logger.info(config.info.name, "[" + job.file.name + "] Start time: " + startCompressionTime.toLocaleString());
							const nameSplit = job.file.name.split('.');
							const name = nameSplit.slice(0, nameSplit.length - 1).join(".");
							const extension = nameSplit[nameSplit.length - 1];
							let originalPath = job.file.path;
							let isOriginalTemporary = false;
							if (!originalPath) {
								isOriginalTemporary = true;
								originalPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + extension);
								const fileStream = job.file.stream();
								const fileStreamReader = fileStream.getReader();
								const writeStream = fs.createWriteStream(originalPath);
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
												const percent = Math.round((bytesWritten / totalBytes) * 100);
												toasts.setToast(job.jobId, i18n.FORMAT('COPYING_PERCENT', percent ? percent : 0));
											}
											if (done) {
												if (this.settings.compressor.debug)
													Logger.info(config.info.name, "[" + job.file.name + "] Copied: " + bytesWritten + " bytes");
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
							}
							const compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".opus");
							let compressedPath = "";
							if (cache) {
								compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + ".ogg");
							} else {
								compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".ogg");
							}
							toasts.setToast(job.jobId, i18n.MESSAGES.CALCULATING);
							const audioData = await ffmpeg.runProbeWithArgs(["-v", "error", "-select_streams", "a", "-show_entries", "format=duration:stream=channels,bits_per_raw_sample", "-of", "default=noprint_wrappers=1", originalPath]);
							if (audioData) {
								const audioOutputStr = audioData.data;
								try {
									const durationMatches = regexPatternDuration.exec(audioOutputStr);
									const channelsMatches = regexPatternChannels.exec(audioOutputStr);
									const bitDepthMatches = regexPatternBitDepth.exec(audioOutputStr);
									const originalDuration = durationMatches?.length > 1 ? parseFloat(durationMatches[1]) : 0;
									const bitDepth = bitDepthMatches?.length > 1 ? parseInt(bitDepthMatches[1]) : null;
									const numChannels = channelsMatches?.length > 1 ? parseInt(channelsMatches[1]) : null;
									if (originalDuration == 0)
										throw new Error("Invalid file duration");
									let duration = originalDuration;
									const startSecondsSplit = job.options.startTimestamp.value.split(':');
									let startSeconds = 0;
									for (const[index, val]of startSecondsSplit.entries())
										startSeconds += Math.pow(60, (startSecondsSplit.length - (index + 1))) * (index + 1 == startSecondsSplit.length ? parseFloat(val) : parseInt(val));
									if (startSeconds < 0 || isNaN(startSeconds) || startSeconds >= duration)
										startSeconds = 0;
									const endSecondsSplit = job.options.endTimestamp.value.split(':');
									let endSeconds = 0;
									for (const[index, val]of endSecondsSplit.entries())
										endSeconds += Math.pow(60, (endSecondsSplit.length - (index + 1))) * (index + 1 == endSecondsSplit.length ? parseFloat(val) : parseInt(val));
									endSeconds -= startSeconds;
									if (endSeconds <= 0 || isNaN(endSeconds) || endSeconds > duration)
										endSeconds = -1;
									duration = endSeconds > 0 ? endSeconds : originalDuration - startSeconds;
									if (duration <= 0)
										duration = originalDuration;
									const cappedFileSize = Math.floor((job.options.sizeCap.value && parseInt(job.options.sizeCap.value) < maxUploadSize ? parseInt(job.options.sizeCap.value) : maxUploadSize)) - 10000;
									let audioBitrate = Math.floor((cappedFileSize * 8) / duration);
									if (audioBitrate < 500)
										audioBitrate = 500;
									let outputChannels = numChannels;
									if (!numChannels || (audioBitrate / numChannels < 50000)) {
										if (Math.floor(audioBitrate / 50000) > 2)
											outputChannels = 2;
										else
											outputChannels = 1;
									}
									if (audioBitrate > (256000 * outputChannels))
										audioBitrate = (256000 * outputChannels);
									let outputBitDepth = bitDepth;
									if ((!bitDepth || bitDepth > 16) && ((audioBitrate / outputChannels) < 96000))
										outputBitDepth = 16;
									if (this.settings.compressor.debug) {
										const fileStats = fs.statSync(originalPath);
										Logger.info(config.info.name, "[" + job.file.name + "] Original file size: " + (fileStats ? fileStats.size : 0) + " bytes");
										Logger.info(config.info.name, "[" + job.file.name + "] Max file size: " + cappedFileSize + " bytes");
										Logger.info(config.info.name, "[" + job.file.name + "] File length: " + originalDuration + " seconds");
										Logger.info(config.info.name, "[" + job.file.name + "] Clipped length: " + duration + " seconds");
										Logger.info(config.info.name, "[" + job.file.name + "] Target bitrate: " + audioBitrate + " bits/second");
										Logger.info(config.info.name, "[" + job.file.name + "] Number of channels: " + numChannels + " channels");
										Logger.info(config.info.name, "[" + job.file.name + "] Number of output channels: " + outputChannels + " channels");
										Logger.info(config.info.name, "[" + job.file.name + "] Bit depth: " + bitDepth + " bits");
										Logger.info(config.info.name, "[" + job.file.name + "] Output bit depth: " + outputBitDepth + " bits");
									}
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_PERCENT', '0'));
										await ffmpeg.runWithArgs(["-y", "-ss", startSeconds, "-i", originalPath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-vn", "-c:a", "libopus", "-map", "0:a", "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate, ...((outputBitDepth && (outputBitDepth < bitDepth || !bitDepth)) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, "-sn", "-map_chapters", "-1", compressedPathPre], str => {
											return str.includes("time=")
										}, str => {
											try {
												const timeStr = regexPatternTime.exec(str);
												if (timeStr) {
													const timeStrParts = timeStr[1].split(':');
													const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
													const percent = Math.round((elapsedTime / duration) * 100);
													toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_PERCENT', percent ? percent : 0));
												}
											} catch (e) {
												Logger.err(config.info.name, e);
											}
										});
									} catch (e) {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
										}
										throw e;
									}
									toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
									if (fs.existsSync(compressedPathPre)) {
										fs.renameSync(compressedPathPre, compressedPath);
									} else {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										throw new Error("Cannot find FFmpeg output");
									}
									if (fs.existsSync(compressedPath)) {
										if (this.settings.compressor.debug) {
											const endCompressionTime = new Date();
											Logger.info(config.info.name, "[" + job.file.name + "] End time: " + endCompressionTime.toLocaleString());
											let compressionTimeDiff = (endCompressionTime - startTime) / 1000;
											const compressionTimeSeconds = compressionTimeDiff % 60;
											compressionTimeDiff = (compressionTimeDiff - compressionTimeSeconds) / 60;
											const compressionTimeMinutes = compressionTimeDiff % 60;
											const compressionTimeHours = (compressionTimeDiff - compressionTimeMinutes) / 60;
											Logger.info(config.info.name, "[" + job.file.name + "] Time to compress: " + (compressionTimeHours.toFixed(0) + ":" + compressionTimeMinutes.toFixed(0) + ":" + compressionTimeSeconds.toFixed(3)));
											const fileStats = fs.statSync(compressedPath);
											Logger.info(config.info.name, "[" + job.file.name + "] Expected audio size: " + (duration * (audioBitrate / 8)) + " bytes");
											Logger.info(config.info.name, "[" + job.file.name + "] Final audio size: " + (fileStats ? fileStats.size : 0) + " bytes");
										}
										if (cache) {
											cache.addToCache(compressedPath, name + ".ogg", job.fileKey);
										}
										const retFile = new File([Uint8Array.from(Buffer.from(fs.readFileSync(compressedPath))).buffer], name + ".ogg", {
											type: job.file.type
										});
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
										}
										job.compressedFile = retFile;
										if (!cache && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(compressedPath);
											} catch (e) {}
										}
										return job;
									} else {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
										}
										throw new Error("Cannot find FFmpeg output");
									}
								} catch (e) {
									if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
										try {
											fs.rmSync(originalPath);
										} catch (e) {}
									}
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
					if (!mkvmerge || !mkvmerge.checkMKVmerge()) {
						await this.initMkvmerge();
					}
					if (ffmpeg && ffmpeg.checkFFmpeg()) {
						if (await this.initTempFolder()) {
							const startCompressionTime = new Date();
							if (this.settings.compressor.debug)
								Logger.info(config.info.name, "[" + job.file.name + "] Start time: " + startCompressionTime.toLocaleString());
							const nameSplit = job.file.name.split('.');
							const name = nameSplit.slice(0, nameSplit.length - 1).join(".");
							const extension = nameSplit[nameSplit.length - 1];
							let originalPath = job.file.path;
							let isOriginalTemporary = false;
							if (!originalPath) {
								isOriginalTemporary = true;
								originalPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + extension);
								const fileStream = job.file.stream();
								const fileStreamReader = fileStream.getReader();
								const writeStream = fs.createWriteStream(originalPath);
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
												const percent = Math.round((bytesWritten / totalBytes) * 100);
												toasts.setToast(job.jobId, i18n.FORMAT('COPYING_PERCENT', percent ? percent : 0));
											}
											if (done) {
												if (this.settings.compressor.debug)
													Logger.info(config.info.name, "[" + job.file.name + "] Copied: " + bytesWritten + " bytes");
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
							}
							const stripAudio = job.options.stripAudio.value && job.options.stripVideo.value ? false : job.options.stripAudio.value;
							const stripVideo = job.options.stripAudio.value && job.options.stripVideo.value ? false : job.options.stripVideo.value;
							const tempAudioPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".opus");
							const tempVideoPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + videoEncoderSettings[job.options.encoder.value].fileType);
							const tempVideoTwoPassPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							const compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".mkv");
							let compressedPath = "";
							if (cache) {
								compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + (!stripVideo ? ".webm" : ".ogg"));
							} else {
								compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + (!stripVideo ? ".webm" : ".ogg"));
							}
							toasts.setToast(job.jobId, i18n.MESSAGES.CALCULATING);
							const videoData = await ffmpeg.runProbeWithArgs(["-v", "error", "-select_streams", "v:0", "-show_entries", "format=duration:stream=height,r_frame_rate,color_primaries", "-of", "default=noprint_wrappers=1", originalPath]);
							const audioData = await ffmpeg.runProbeWithArgs(["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels,bits_per_raw_sample", "-of", "default=noprint_wrappers=1", originalPath]);
							if (videoData && audioData) {
								const videoOutputStr = videoData.data;
								const audioOutputStr = audioData.data;
								try {
									const videoFilters = [];
									if (job.options.interlace.value) {
										videoFilters.push("interlace=lowpass=2");
									}
									const cappedFileSize = Math.floor((job.options.sizeCap.value && parseInt(job.options.sizeCap.value) < maxUploadSize ? parseInt(job.options.sizeCap.value) : maxUploadSize)) - 150000;
									const durationMatches = regexPatternDuration.exec(videoOutputStr);
									const heightMatches = regexPatternHeight.exec(videoOutputStr);
									const frameRateMatches = regexPatternFrameRate.exec(videoOutputStr);
									const colorPrimariesMatches = regexPatternColorPrimaries.exec(videoOutputStr);
									const channelsMatches = regexPatternChannels.exec(audioOutputStr);
									const bitDepthMatches = regexPatternBitDepth.exec(audioOutputStr);
									const frameRateMatchesSplit = frameRateMatches.length > 1 ? frameRateMatches[1].split('/') : null;
									const originalDuration = durationMatches?.length > 1 ? parseFloat(durationMatches[1]) : 0;
									const originalHeight = heightMatches?.length > 1 ? parseInt(heightMatches[1]) : null;
									const colorPrimaries = colorPrimariesMatches?.length > 1 ? colorPrimariesMatches[1] : null;
									const bitDepth = bitDepthMatches?.length > 1 ? parseInt(bitDepthMatches[1]) : null;
									const numChannels = channelsMatches?.length > 1 ? parseInt(channelsMatches[1]) : null;
									const isHDR = hdrColorPrimaries.includes(colorPrimaries);
									if (isHDR) {
										videoFilters.push("zscale=transfer=linear,tonemap=hable,zscale=transfer=bt709");
									}
									const frameRate = frameRateMatchesSplit?.length > 1 ? (parseFloat(frameRateMatchesSplit[0]) / parseFloat(frameRateMatchesSplit[1])) : null;
									if (originalDuration == 0)
										throw new Error("Invalid file duration");
									let duration = originalDuration;
									const startSecondsSplit = job.options.startTimestamp.value.split(':');
									let startSeconds = 0;
									for (const[index, val]of startSecondsSplit.entries())
										startSeconds += Math.pow(60, (startSecondsSplit.length - (index + 1))) * (index + 1 == startSecondsSplit.length ? parseFloat(val) : parseInt(val));
									if (startSeconds < 0 || isNaN(startSeconds) || startSeconds >= duration)
										startSeconds = 0;
									const endSecondsSplit = job.options.endTimestamp.value.split(':');
									let endSeconds = 0;
									for (const[index, val]of endSecondsSplit.entries())
										endSeconds += Math.pow(60, (endSecondsSplit.length - (index + 1))) * (index + 1 == endSecondsSplit.length ? parseFloat(val) : parseInt(val));
									endSeconds -= startSeconds;
									if (endSeconds <= 0 || isNaN(endSeconds) == NaN || endSeconds > duration)
										endSeconds = -1;
									duration = endSeconds > 0 ? endSeconds : originalDuration - startSeconds;
									if (duration <= 0)
										duration = originalDuration;
									if (this.settings.compressor.debug) {
										const fileStats = fs.statSync(originalPath);
										Logger.info(config.info.name, "[" + job.file.name + "] Original file size: " + (fileStats ? fileStats.size : 0) + " bytes");
										Logger.info(config.info.name, "[" + job.file.name + "] Max file size: " + cappedFileSize + " bytes");
										Logger.info(config.info.name, "[" + job.file.name + "] File length: " + originalDuration + " seconds");
										Logger.info(config.info.name, "[" + job.file.name + "] Clipped length: " + duration + " seconds");
										Logger.info(config.info.name, "[" + job.file.name + "] Video height: " + originalHeight + " pixels");
										Logger.info(config.info.name, "[" + job.file.name + "] Frame rate: " + frameRate + " fps");
										Logger.info(config.info.name, "[" + job.file.name + "] Color primaries: " + colorPrimaries + (isHDR ? " (HDR)" : " (SDR)"));
									}
									let audioSize = 0;
									let videoSize = 0;
									if (!stripAudio) {
										//TODO check per-channel bitrate and keep as many audio channels as possible
										let audioBitrate = ((cappedFileSize * 8) * (stripVideo ? 1 : videoEncoderSettings[job.options.encoder.value].encoderPresets[job.options.encoderPreset.value].audioFilePercent)) / duration;
										if (audioBitrate < 10240)
											audioBitrate = 10240;
										let outputChannels = numChannels;
										if (!numChannels || (audioBitrate / numChannels < 50000)) {
											if (Math.floor(audioBitrate / 50000) > 2)
												outputChannels = 2;
											else
												outputChannels = 1;
										}
										if (outputChannels > 2) {
											if ((audioBitrate / outputChannels) < 96000) {
												const bitrateIdealOutputChannels = Math.floor(audioBitrate / 96000);
												if (bitrateIdealOutputChannels < outputChannels) {
													if (bitrateIdealOutputChannels >= 8) {
														outputChannels = 8;
													} else if (bitrateIdealOutputChannels >= 6) {
														outputChannels = 6;
													} else if (bitrateIdealOutputChannels >= 2) {
														outputChannels = 2;
													} else if (bitrateIdealOutputChannels == 1) {
														outputChannels = 1;
													}
												}
											}
										}
										if (audioBitrate > (256000 * outputChannels))
											audioBitrate = (256000 * outputChannels);
										let outputBitDepth = null;
										if ((!bitDepth || bitDepth > 16) && ((audioBitrate / outputChannels) < 96000))
											outputBitDepth = 16;
										/*
										TODO: Cap audio bitrate if video bitrate would be too low
										if (audioBitrate > 32768)
										audioBitrate = 32768;
										 */
										if (this.settings.compressor.debug) {
											Logger.info(config.info.name, "[" + job.file.name + "] Target audio bitrate: " + audioBitrate + " bits/second");
											Logger.info(config.info.name, "[" + job.file.name + "] Number of audio channels: " + numChannels + " channels");
											Logger.info(config.info.name, "[" + job.file.name + "] Number of audio output channels: " + outputChannels + " channels");
											Logger.info(config.info.name, "[" + job.file.name + "] Audio bit depth: " + bitDepth + " bits");
											Logger.info(config.info.name, "[" + job.file.name + "] Output audio bit depth: " + outputBitDepth + " bits");
										}
										try {
											toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PERCENT', '0'));
											await ffmpeg.runWithArgs(["-y", "-ss", startSeconds, "-i", originalPath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-vn", "-c:a", "libopus", "-map", "0:a", "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate, ...(outputBitDepth && (outputBitDepth < bitDepth || !bitDepth) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, "-sn", "-map_chapters", "-1", tempAudioPath], str => {
												return str.includes("time=");
											}, str => {
												try {
													const timeStr = regexPatternTime.exec(str);
													if (timeStr) {
														const timeStrParts = timeStr[1].split(':');
														const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
														const percent = Math.round((elapsedTime / duration) * 100);
														toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PERCENT', percent ? percent : 0));
													}
												} catch (e) {
													Logger.err(config.info.name, e);
												}
											});
										} catch (e) {
											if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(originalPath);
												} catch (e) {}
											}
											if (!this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(tempAudioPath);
												} catch (e) {}
											}
											throw e;
										}
										const audioStats = fs.statSync(tempAudioPath);
										audioSize = audioStats ? audioStats.size : 0;
										if (this.settings.compressor.debug) {
											Logger.info(config.info.name, "[" + job.file.name + "] Expected audio size: " + (duration * (audioBitrate / 8)) + " bytes");
											Logger.info(config.info.name, "[" + job.file.name + "] Final audio size: " + audioSize + " bytes");
										}
										if (stripVideo) {
											// Return early if video is to be stripped
											toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
											if (fs.existsSync(tempAudioPath)) {
												fs.renameSync(tempAudioPath, compressedPath);
											} else {
												if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
													try {
														fs.rmSync(originalPath);
													} catch (e) {}
												}
												throw new Error("Cannot find FFmpeg output");
											}
											if (fs.existsSync(compressedPath)) {
												if (this.settings.compressor.debug) {
													const endCompressionTime = new Date();
													Logger.info(config.info.name, "[" + job.file.name + "] End time: " + endCompressionTime.toLocaleString());
													let compressionTimeDiff = (endCompressionTime - startCompressionTime) / 1000;
													const compressionTimeSeconds = compressionTimeDiff % 60;
													compressionTimeDiff = (compressionTimeDiff - compressionTimeSeconds) / 60;
													const compressionTimeMinutes = compressionTimeDiff % 60;
													const compressionTimeHours = (compressionTimeDiff - compressionTimeMinutes) / 60;
													Logger.info(config.info.name, "[" + job.file.name + "] Time to compress: " + (compressionTimeHours.toFixed(0) + ":" + compressionTimeMinutes.toFixed(0) + ":" + compressionTimeSeconds.toFixed(3)));
												}
												if (cache) {
													cache.addToCache(compressedPath, name + ".ogg", job.fileKey);
												}
												const retFile = new File([Uint8Array.from(Buffer.from(fs.readFileSync(compressedPath))).buffer], name + ".ogg", {
													type: job.file.type
												});
												if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
													try {
														fs.rmSync(originalPath);
													} catch (e) {}
												}
												if (!this.settings.compressor.keepTemp) {
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
												}
												job.compressedFile = retFile;
												if (!cache && !this.settings.compressor.keepTemp) {
													try {
														fs.rmSync(compressedPath);
													} catch (e) {}
												}
												return job;
											} else {
												if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
													try {
														fs.rmSync(originalPath);
													} catch (e) {}
												}
												if (!this.settings.compressor.keepTemp) {
													try {
														fs.rmSync(tempAudioPath);
													} catch (e) {}
												}
												throw new Error("Cannot find FFmpeg output");
											}
										}
									}
									let maxFrameRate = frameRate;
									if (job.options.maxFps.value && (job.options.maxFps.value < frameRate || !frameRate)) {
										maxFrameRate = job.options.maxFps.value;
										videoFilters.push("fps=fps=" + maxFrameRate);
									}
									let videoBitrate = Math.floor(((cappedFileSize - audioSize) * 8) / duration);
									console.log(videoEncoderSettings);
									console.log(videoEncoderSettings[job.options.encoder.value]);
									console.log(videoEncoderSettings[job.options.encoder.value].encoderPresets[job.options.encoderPreset.value]);
									console.log(videoBitrate);
									console.log(videoEncoderSettings[job.options.encoder.value].encoderPresets[job.options.encoderPreset.value].videoHeightCapFunction(videoBitrate));
									let maxVideoHeight = videoEncoderSettings[job.options.encoder.value].encoderPresets[job.options.encoderPreset.value].videoHeightCapFunction(videoBitrate);
									if (job.options.maxHeight.value && (job.options.maxHeight.value < originalHeight || !originalHeight)) {
										maxVideoHeight = job.options.maxHeight.value;
									}
									if (maxVideoHeight < originalHeight || !originalHeight) {
										videoFilters.push("scale=-1:" + maxVideoHeight + ",scale=trunc(iw/2)*2:" + maxVideoHeight);
									}
									if (this.settings.compressor.debug) {
										Logger.info(config.info.name, "[" + job.file.name + "] Max frame rate: " + maxFrameRate + " fps");
										Logger.info(config.info.name, "[" + job.file.name + "] Target video bitrate: " + videoBitrate + " bits/second");
										Logger.info(config.info.name, "[" + job.file.name + "] Max frame height: " + maxVideoHeight + " pixels");
										Logger.info(config.info.name, "[" + job.file.name + "] Capped frame height: " + ((maxVideoHeight && originalHeight > maxVideoHeight) || !originalHeight ? maxVideoHeight : originalHeight) + " pixels");
									}
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_PASS_1_PERCENT', '0'));
										await ffmpeg.runWithArgs(["-y", "-ss", startSeconds, "-i", originalPath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:v", videoBitrate, "-maxrate", videoBitrate, "-bufsize", videoBitrate, ...(videoFilters.length > 0 ? ["-vf", videoFilters.join(",")] : []), "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.encoder.value, "-pass", "1", "-passlogfile", tempVideoTwoPassPath, "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")], str => {
											return str.includes("time=")
										}, str => {
											try {
												const timeStr = regexPatternTime.exec(str);
												if (timeStr) {
													const timeStrParts = timeStr[1].split(':');
													const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
													const percent = Math.round((elapsedTime / duration) * 100);
													toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_PASS_1_PERCENT', percent ? percent : 0));
												}
											} catch (e) {
												Logger.err(config.info.name, e);
											}
										});
									} catch (e) {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!stripAudio && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempVideoPath);
											} catch (e) {}
										}
										throw e;
									}
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_PASS_2_PERCENT', '0'));
										await ffmpeg.runWithArgs(["-y", "-ss", startSeconds, "-i", originalPath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:v", videoBitrate, "-maxrate", videoBitrate, "-bufsize", videoBitrate, ...(videoFilters.length > 0 ? ["-vf", videoFilters.join(",")] : []), "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.encoder.value, "-pass", "2", "-passlogfile", tempVideoTwoPassPath, tempVideoPath], str => {
											return str.includes("time=")
										}, str => {
											try {
												const timeStr = regexPatternTime.exec(str);
												if (timeStr) {
													const timeStrParts = timeStr[1].split(':');
													const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
													const percent = Math.round((elapsedTime / duration) * 100);
													toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_PASS_2_PERCENT', percent ? percent : 0));
												}
											} catch (e) {
												Logger.err(config.info.name, e);
											}
										});
									} catch (e) {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(tempVideoPath);
											} catch (e) {}
										}
										throw e;
									}
									if (!fs.existsSync(tempVideoPath)) {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
										}
										throw new Error("Cannot find FFmpeg output");
									} else {
										if (this.settings.compressor.debug) {
											const fileStats = fs.statSync(tempVideoPath);
											videoSize = fileStats ? fileStats.size : 0;
											Logger.info(config.info.name, "[" + job.file.name + "] Expected video only size: " + (duration * (videoBitrate / 8)) + " bytes");
											Logger.info(config.info.name, "[" + job.file.name + "] Final video only size: " + videoSize + " bytes");
										}
									}
									try {
										toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
										if (!mkvmerge)
											await ffmpeg.runWithArgs(["-y", ...(!stripAudio ? ["-i", tempAudioPath] : []), "-i", tempVideoPath, "-c", "copy", compressedPathPre]);
										else
											await mkvmerge.runWithArgs(["-o", compressedPathPre, tempVideoPath, ...(!stripAudio ? [tempAudioPath] : [])]);
									} catch (e) {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(tempVideoPath);
											} catch (e) {}
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
										}
										throw e;
									}
									if (fs.existsSync(compressedPathPre)) {
										fs.renameSync(compressedPathPre, compressedPath);
									} else {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(tempVideoPath);
											} catch (e) {}
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
										}
										throw new Error("Cannot find MKVmerge output");
									}
									if (fs.existsSync(compressedPath)) {
										if (this.settings.compressor.debug) {
											const endCompressionTime = new Date();
											Logger.info(config.info.name, "[" + job.file.name + "] End time: " + endCompressionTime.toLocaleString());
											let compressionTimeDiff = (endCompressionTime - startCompressionTime) / 1000;
											const compressionTimeSeconds = compressionTimeDiff % 60;
											compressionTimeDiff = (compressionTimeDiff - compressionTimeSeconds) / 60;
											const compressionTimeMinutes = compressionTimeDiff % 60;
											const compressionTimeHours = (compressionTimeDiff - compressionTimeMinutes) / 60;
											Logger.info(config.info.name, "[" + job.file.name + "] Time to compress: " + (compressionTimeHours.toFixed(0) + ":" + compressionTimeMinutes.toFixed(0) + ":" + compressionTimeSeconds.toFixed(3)));
											const fileStats = fs.statSync(compressedPath);
											Logger.info(config.info.name, "[" + job.file.name + "] Expected video size: " + (audioSize + videoSize) + " bytes");
											Logger.info(config.info.name, "[" + job.file.name + "] Final video size: " + (fileStats ? fileStats.size : 0) + " bytes");
										}
										if (cache) {
											cache.addToCache(compressedPath, name + ".webm", job.fileKey);
										}
										const retFile = new File([Uint8Array.from(Buffer.from(fs.readFileSync(compressedPath))).buffer], name + ".webm", {
											type: job.file.type
										});
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(tempVideoPath);
											} catch (e) {}
										}
										job.compressedFile = retFile;
										if (!cache && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(compressedPath);
											} catch (e) {}
										}
										return job;
									} else {
										if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(originalPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(tempVideoPath);
											} catch (e) {}
											try {
												fs.rmSync(compressedPathPre);
											} catch (e) {}
										}
										throw new Error("Cannot find MKVmerge output");
									}
								} catch (e) {
									if (isOriginalTemporary && !this.settings.compressor.keepTemp) {
										try {
											fs.rmSync(originalPath);
										} catch (e) {}
									}
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
					const startCompressionTime = new Date();
					if (this.settings.compressor.debug)
						Logger.info(config.info.name, "[" + job.file.name + "] Start time: " + startCompressionTime.toLocaleString());
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
						toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
						job.compressedFile = new File([image.outputData], image.file.name, {
							type: image.file.type
						});
						if (this.settings.compressor.debug) {
							const endCompressionTime = new Date();
							Logger.info(config.info.name, "[" + job.file.name + "] End time: " + endCompressionTime.toLocaleString());
							let compressionTimeDiff = (endCompressionTime - startCompressionTime) / 1000;
							const compressionTimeSeconds = compressionTimeDiff % 60;
							compressionTimeDiff = (compressionTimeDiff - compressionTimeSeconds) / 60;
							const compressionTimeMinutes = compressionTimeDiff % 60;
							const compressionTimeHours = (compressionTimeDiff - compressionTimeMinutes) / 60;
							Logger.info(config.info.name, "[" + job.file.name + "] Time to compress: " + (compressionTimeHours.toFixed(0) + ":" + compressionTimeMinutes.toFixed(0) + ":" + compressionTimeSeconds.toFixed(3)));
						}
						if (cache) {
							cache.saveAndCache(job.compressedFile, job.fileKey);
						}
						return job;
					}
					throw new Error("Unable to compress image");
				}

				async compressImageLoop(job, image) {
					image.iterations++;
					toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_TRY_NUMBER', image.iterations));
					image.outputData = await this.compressImageCanvas(image, job.options);
					if (image.outputData.size >= maxUploadSize) {
						if (image.iterations >= job.options.maxIterations.value) {
							throw new Error("Max iterations reached while compressing image");
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
					i18n.updateLocale(DiscordAPI.UserSettings.locale);
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
