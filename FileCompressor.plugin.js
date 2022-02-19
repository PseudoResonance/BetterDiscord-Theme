/**
 * @name FileCompressor
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js
 */

//TODO Allow for the selection of different cached files from runs with different options
//TODO Get file properties before asking for options to pre-populate fields with current settings and allow for additional options - which audio tracks to mix, which subtitle track to burn, which video track to use
//TODO Add plugin settings for default options
//TODO Add button to bypass compression
//TODO Add setting to screen all files to check if Discord can embed them and reencode if not
//TODO Refactor to use state-based processing of video/audio and store data to config file to attempt compression recovery if Discord/plugin is stopped
//TODO iPhone compatibility mode

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
			version: "1.5.23",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [{
				title: "Added",
				type: "added",
				items: [
					"Option to save error logs for debugging if compression fails",
					"Output file information along with logs"
				]
			}, {
				title: "Fixed",
				type: "fixed",
				items: [
					"Tuned audio encoding"
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
							return i18n.MESSAGES.SETTINGS_TOAST_POSITION
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_TOAST_POSITION_DESC
						},
						id: 'toastPosition',
						type: 'dropdown',
						value: 'bottomright',
						options: [{
								get label() {
									return i18n.MESSAGES.SETTINGS_HIDDEN
								},
								value: 'hidden'
							}, {
								get label() {
									return i18n.MESSAGES.SETTINGS_BOTTOM_RIGHT
								},
								value: 'bottomright'
							}, {
								get label() {
									return i18n.MESSAGES.SETTINGS_BOTTOM_LEFT
								},
								value: 'bottomleft'
							}, {
								get label() {
									return i18n.MESSAGES.SETTINGS_TOP_RIGHT
								},
								value: 'topright'
							}, {
								get label() {
									return i18n.MESSAGES.SETTINGS_TOP_LEFT
								},
								value: 'topleft'
							}
						]
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_IMAGE
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_IMAGE_DESC
						},
						id: 'promptOptionsImage',
						type: 'switch',
						value: false
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_VIDEO
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_VIDEO_DESC
						},
						id: 'promptOptionsVideo',
						type: 'switch',
						value: true
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_AUDIO
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_PROMPT_FOR_OPTIONS_AUDIO_DESC
						},
						id: 'promptOptionsAudio',
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
			SETTINGS_TOAST_POSITION: 'Toast Position',
			SETTINGS_TOAST_POSITION_DESC: 'Position of compression status toasts.',
			SETTINGS_HIDDEN: 'Hidden',
			SETTINGS_BOTTOM_RIGHT: 'Bottom Right',
			SETTINGS_BOTTOM_LEFT: 'Bottom Left',
			SETTINGS_TOP_RIGHT: 'Top Right',
			SETTINGS_TOP_LEFT: 'Top Left',
			SETTINGS_PROMPT_FOR_OPTIONS_IMAGE: 'Prompt for Options (Images)',
			SETTINGS_PROMPT_FOR_OPTIONS_IMAGE_DESC: 'Prompt for compression options before compressing images.',
			SETTINGS_PROMPT_FOR_OPTIONS_VIDEO: 'Prompt for Options (Video)',
			SETTINGS_PROMPT_FOR_OPTIONS_VIDEO_DESC: 'Prompt for compression options before compressing video.',
			SETTINGS_PROMPT_FOR_OPTIONS_AUDIO: 'Prompt for Options (Audio)',
			SETTINGS_PROMPT_FOR_OPTIONS_AUDIO_DESC: 'Prompt for compression options before compressing audio.',
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
			SETTINGS_KEEP_TEMP: 'Keep Temp Files',
			SETTINGS_KEEP_TEMP_DESC: 'Retain temporary files after compression.',
			COMPRESSION_OPTIONS_TITLE: '{$0$} Compression Options',
			COMPRESSION_OPTIONS_CATEGORIES_CACHE: 'Cache Options',
			COMPRESSION_OPTIONS_CATEGORIES_BASIC: 'Basic Options',
			COMPRESSION_OPTIONS_CATEGORIES_ADVANCED: 'Advanced Options',
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
			COMPRESSION_OPTIONS_AUTO_CROP: 'Auto Crop',
			COMPRESSION_OPTIONS_AUTO_CROP_DESC: 'Automatically detect and crop out black bars',
			COMPRESSION_OPTIONS_SEND_AS_VIDEO: 'Send as Video',
			COMPRESSION_OPTIONS_SEND_AS_VIDEO_DESC: 'Send with blank video to allow mobile playback.',
			SAVE_DEBUG_LOG: 'Save debug log to report the error?',
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
			COMPRESSING_AUDIO_PASS_PERCENT: 'Compressing Audio Pass {$0$} {$1$}%',
			COMPRESSING_VIDEO_PASS_PERCENT: 'Compressing Video Pass {$0$} {$1$}%',
			COMPRESSING_TRY_NUMBER: 'Compressing Attempt {$0$}',
			PACKAGING: 'Packaging',
			PACKAGING_PERCENT: 'Packaging {$0$}%',
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
			SETTINGS_TOAST_POSITION: 'トースト通知の位置',
			SETTINGS_TOAST_POSITION_DESC: '圧縮ステータスのトースト通知の位置。',
			SETTINGS_HIDDEN: '隠す',
			SETTINGS_BOTTOM_RIGHT: '右下',
			SETTINGS_BOTTOM_LEFT: '左下',
			SETTINGS_TOP_RIGHT: '右上',
			SETTINGS_TOP_LEFT: '左上',
			SETTINGS_PROMPT_FOR_OPTIONS_IMAGE: 'オプションのプロンプト　（画像）',
			SETTINGS_PROMPT_FOR_OPTIONS_IMAGE_DESC: '画像の圧縮を開始前にオプションのプロンプト。',
			SETTINGS_PROMPT_FOR_OPTIONS_VIDEO: 'オプションのプロンプト　（動画）',
			SETTINGS_PROMPT_FOR_OPTIONS_VIDEO_DESC: '動画の圧縮を開始前にオプションのプロンプト。',
			SETTINGS_PROMPT_FOR_OPTIONS_AUDIO: 'オプションのプロンプト　（音声）',
			SETTINGS_PROMPT_FOR_OPTIONS_AUDIO_DESC: '音声の圧縮を開始前にオプションのプロンプト。',
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
			SETTINGS_KEEP_TEMP: '一時ファイルを保持',
			SETTINGS_KEEP_TEMP_DESC: '圧縮後に一時ファイルを保持する。',
			COMPRESSION_OPTIONS_TITLE: '{$0$}　圧縮設定',
			COMPRESSION_OPTIONS_CATEGORIES_CACHE: 'キャッシュ設定',
			COMPRESSION_OPTIONS_CATEGORIES_BASIC: '基本設定',
			COMPRESSION_OPTIONS_CATEGORIES_ADVANCED: '高度設定',
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
			COMPRESSION_OPTIONS_AUTO_CROP: '自動的クロッピング',
			COMPRESSION_OPTIONS_AUTO_CROP_DESC: '黒いボーダーを自動的に検出して切り取る。',
			COMPRESSION_OPTIONS_SEND_AS_VIDEO: '動画で送信',
			COMPRESSION_OPTIONS_SEND_AS_VIDEO_DESC: 'モバイル再生できるように、空白の動画で送信する。',
			SAVE_DEBUG_LOG: 'エラーを報告するためにデバッグログを保存する？',
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
			COMPRESSING_AUDIO_PASS_PERCENT: '音声圧縮中 {$0$} 回目　{$1$}％',
			COMPRESSING_VIDEO_PASS_PERCENT: '動画圧縮中 {$0$} 回目　{$1$}％',
			COMPRESSING_TRY_NUMBER: '圧縮試行番　{$0$}',
			PACKAGING: 'パッケージング中',
			PACKAGING_PERCENT: 'パッケージング中　{$0$}％',
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
				Settings,
				ReactTools,
				WebpackModules
			} = Api;

			// Node modules
			const fs = require('fs');
			const path = require('path');
			const childProcess = require('child_process');
			const uuidv4 = require('uuid/v4');
			const cryptoModule = require('crypto');
			const mime = require('mime-types');
			const osModule = require('os');

			// Cache container
			let cache = null;

			// FFmpeg container
			let ffmpeg = null;
			// FFmpeg library constants
			const ffmpegConstants = {
				name: "FFmpeg",
				version: "5.0",
				sourceUrl: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-source.zip",
				license: "GPL Version 2",
				licenseUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
				downloadUrls: {
					FFmpeg: {
						win_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-win-amd64.exe",
							size: 119959040,
							hash: "4ca02c7908169391cbd95435b986b8b9296706cfe48164475c9abb88f684d6bd6fa841a971fbcc27e630fa67282aba5a57b007bb3fa0ab1f7c626d9c28cfcac9"
						},
						darwin_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-darwin-amd64",
							size: 78138880,
							hash: "50e09b80001ff2387cbc66cdc4784630e9ef47a87c27a2e0dc52fb6e776653e663547b95f87a7574c9f2c3c80d007c0ba33c3a90917db429855cf788e8794f76"
						},
						linux_i686: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-linux-i686",
							size: 50856012,
							hash: "c22abe13fada3790900ace3d01c1453862c9c87fecfa60877d11bfe41fc8805d9677a6d0db3d5def24bb9e03760b32014ffbd4b9f9d0f0dbc88161002dba51a2"
						},
						linux_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-linux-amd64",
							size: 78317376,
							hash: "ee247090c8ad936a702bc1ee214fe2aab6c6b2043703a951e2ff073db55eb0999c6824a12f60ed324b7d197fe2c0c9e713fd26d86aa74e07cf305a74552a62a1"
						},
						linux_armhf: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-linux-armhf",
							size: 30711516,
							hash: "dce6817062c787888995b7ff21e9623d0d648744db5b0b13f99ea86ac24470a551748d0608c601e0d384a6f186aef5244e49bdb70a39b0f69d99fc1e5c9fe2de"
						},
						linux_arm64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffmpeg-linux-arm64",
							size: 49628720,
							hash: "3d499d52e74803af75c4f8cc6e5f0ef8942205d0314a06edd6ccc76ee8aa80a9440a8d848f7f5c6028cc4222ea70a20530ef1bd8e635d9d36e9d67890775d115"
						}
					},
					FFprobe: {
						win_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffprobe-win-amd64.exe",
							size: 119863296,
							hash: "5b9ccb803f12b5cea98913aa8647f3b7995c9092d5e0bf95963a6df5f13f380d031ad1c2f5a0f967f6d0c4970d566492f3f9339d58abc00fb9745f9841f2861f"
						},
						darwin_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffprobe-darwin-amd64",
							size: 78073216,
							hash: "23d68f33bb53c2fd91cb69f135635cf82b50174b56556f39475146fb9c17ed7b7333817ba767509481da4c624f84a38dc11f1b94277116c0b4f15e2b12b26d97"
						},
						linux_i686: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffprobe-linux-i686",
							size: 50724300,
							hash: "1d2e67859245563e3c530e8f23b4d41d08d5d05214046655d14fe605e1d706c13cce92e102d3594207504a58f6a875dd0986aeecf0fe9307159097e5e1691fe0"
						},
						linux_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffprobe-linux-amd64",
							size: 78215520,
							hash: "93832f28a8eff04d72930aad457022bc0455f9a3909d50bd3f043fe9e444549dc2b8945a623555bd5e927d2880d0bc90b95b55dc72d078dc614fe87ed26ef4dc"
						},
						linux_armhf: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffprobe-linux-armhf",
							size: 30624652,
							hash: "edc28aa8e0eda8e2cfc64ac002f58a9cfa3c4cd929f24b85175c404c400185988b3fef5ccbf03b4a9dd3de9a7ec0cc0db67964bbc142c440c53f2f46b97638d4"
						},
						linux_arm64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/5.0/ffprobe-linux-arm64",
							size: 49543216,
							hash: "3c43d3c78cd5e2f1604f26b1052846a4e9a07c8f6efb26d6e3572c6a423bda95e0a68759d1d2dd96c11b3d62454a9753da61d0e0e49e29eb029bb29b51a53412"
						}
					}
				}
			};
			// MKVmerge container
			let mkvmerge = null;
			// MKVmerge library constants
			const mkvmergeConstants = {
				name: "MKVmerge",
				version: "58.0.0",
				sourceUrl: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-source.tar.xz",
				license: "GPL Version 2",
				licenseUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
				downloadUrls: {
					MKVmerge: {
						win_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-win-amd64.exe",
							size: 12389416,
							hash: "ff4f1b349de9e440121f7dc7de94d90f638709bd2f336e9ab28237e86febe6ab493c5b2737b1c02e40ba75378dd045daf653d6dff4df71055b05faa558e893b2"
						},
						darwin_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-darwin-amd64",
							size: 10417720,
							hash: "59c574561f6567222adda67b01fefcafba3cc03a61c8b4565789411cca9b0b43a6705857ef0f639babe119d0a63f93ff8d0974d4c90d8021c7f2d5df8e44fb4f"
						},
						linux_i686: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-i686",
							size: 13558924,
							hash: "ef845b83a59ea0a93ecfcd593abbb066593137e820678242d7a2010c9da1fb9925f9726eca34077bf474df8fdab4c2190fc316c153a76fac656463eb50e7a5a7"
						},
						linux_amd64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-amd64",
							size: 13070840,
							hash: "b14ea5ede6019fd612985ddd864925326ad5ae5c6f4851a8701cde555d4ef499d61b67c2a382f5ef4fc313f9ad9aba17847eb3820766d0c4bcc97ff40d0c89b8"
						},
						linux_armhf: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-armhf",
							size: 8573116,
							hash: "b428b35c36a2f4e43ac16369be6212724787e926041b49826e429f4c806805b25cb346c2a2d4cbe563c29294fd04985263a9786e5c933b585cc0e0ed530bdbaf"
						},
						linux_arm64: {
							url: "https://github.com/PseudoResonance/BetterDiscord-Theme/releases/download/58.0.0/mkvmerge-linux-arm64",
							size: 11509304,
							hash: "03223a4a3b6baf55d26ff582a6f79857db4fa41bad24074ee267d9f2b592e36ff337b952f03c60508888737c34fe79258bd31ea49337c04131f8e82b3cd90ae9"
						}
					}
				}
			};
			const librarySuffixes = {
				win_amd64: "-win-amd64.exe",
				darwin_amd64: "-darwin-amd64",
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
			const regexPatternCrop = /crop=(\d+:\d+:\d+:\d+)/;
			const regexPatternProgress = /Progress: (\d{1,3})%/;

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
							Logger.debug(config.info.name, childProcess.execFileSync(this.ffmpeg, ["-version"], {
									timeout: 10000
								}).toString());
						} else {
							throw new Error("FFmpeg not found");
						}
					} else {
						throw new Error("FFmpeg not found");
					}
				}

				runWithArgs(args, outputFilters = []) {
					return new Promise((resolve, reject) => {
						const filterArr = [];
						const processArr = [];
						for (const key in outputFilters) {
							if (typeof(outputFilters[key].filter) == "function" && typeof(outputFilters[key].process) == "function") {
								filterArr.push(outputFilters[key].filter);
								processArr.push(outputFilters[key].process);
							}
						}
						if (fs.existsSync(this.ffmpeg)) {
							const rollingOutputBuffer = [];
							Logger.info(config.info.name, 'Running FFmpeg ' + args.join(' '));
							const process = childProcess.spawn(this.ffmpeg, args);
							osModule.setPriority(process.pid, 10);
							process.on('error', err => {
								Logger.err(config.info.name, err);
								reject(err);
								const index = runningProcesses?.indexOf(process);
								if (index > -1)
									runningProcesses?.splice(index, 1);
							});
							process.on('exit', (code, signal) => {
								if (code == 0) {
									resolve(true);
								} else {
									Logger.err(config.info.name, rollingOutputBuffer.join("\r\n"));
									reject();
								}
								const index = runningProcesses?.indexOf(process);
								if (index > -1)
									runningProcesses?.splice(index, 1);
							});
							process.stderr.on('data', data => {
								const str = data.toString();
								// Keep rolling buffer of output strings to output errors if FFmpeg crashes
								if (rollingOutputBuffer.length >= 10)
									rollingOutputBuffer.shift();
								rollingOutputBuffer.push(str);
								for (let index = 0; index < filterArr.length; index++) {
									if (filterArr[index](str)) {
										processArr[index](str);
									}
								}
							});
							runningProcesses?.push(process);
						} else {
							throw new Error("FFmpeg not found");
						}
					});
				}

				runProbeWithArgs(args) {
					return new Promise((resolve, reject) => {
						if (fs.existsSync(this.ffprobe)) {
							Logger.info(config.info.name, 'Running FFprobe ' + args.join(' '));
							const process = childProcess.execFile(this.ffprobe, args, (err, stdout, stderr) => {
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
								const index = runningProcesses?.indexOf(process);
								if (index > -1)
									runningProcesses?.splice(index, 1);
							});
							osModule.setPriority(process.pid, 10);
							runningProcesses?.push(process);
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
									this.mkvmerge += librarySuffixes["darwin_amd64"];
									break;
								case "x64":
								default:
									/**
									try {
									if (childProcess.execSync("sysctl -n sysctl.proc_translated").toString().startsWith("1")) {
									this.mkvmerge += librarySuffixes["darwin_arm64"];
									break;
									}
									} catch {}
									 */
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
							Logger.debug(config.info.name, childProcess.execFileSync(this.mkvmerge, ["--version"], {
									timeout: 10000
								}).toString());
						} else {
							throw new Error("MKVmerge not found");
						}
					} else {
						throw new Error("MKVmerge not found");
					}
				}

				runWithArgs(args, outputFilters = []) {
					return new Promise((resolve, reject) => {
						const filterArr = [];
						const processArr = [];
						for (const key in outputFilters) {
							if (typeof(outputFilters[key].filter) == "function" && typeof(outputFilters[key].process) == "function") {
								filterArr.push(outputFilters[key].filter);
								processArr.push(outputFilters[key].process);
							}
						}
						if (fs.existsSync(this.mkvmerge)) {
							const rollingOutputBuffer = [];
							Logger.info(config.info.name, 'Running MKVmerge ' + args.join(' '));
							const process = childProcess.spawn(this.mkvmerge, args);
							osModule.setPriority(process.pid, 10);
							process.on('error', err => {
								Logger.err(config.info.name, err);
								reject(err);
								const index = runningProcesses?.indexOf(process);
								if (index > -1)
									runningProcesses?.splice(index, 1);
							});
							process.on('exit', (code, signal) => {
								if (code == 0) {
									resolve(true);
								} else {
									Logger.err(config.info.name, rollingOutputBuffer.join("\r\n"));
									reject();
								}
								const index = runningProcesses?.indexOf(process);
								if (index > -1)
									runningProcesses?.splice(index, 1);
							});
							process.stdout.on('data', data => {
								const str = data.toString();
								// Keep rolling buffer of output strings to output errors if MKVmerge crashes
								if (rollingOutputBuffer.length >= 10)
									rollingOutputBuffer.shift();
								rollingOutputBuffer.push(str);
								for (let index = 0; index < filterArr.length; index++) {
									if (filterArr[index](str)) {
										processArr[index](str);
									}
								}
							});
							runningProcesses?.push(process);
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
								return new File([fs.readFileSync(entry.path).buffer], entry.name, {
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
					this.validToasts = [];
					// Check for existing upload node
					this.toastNode = document.getElementById('pseudocompressor-toasts');
					if (this.toastNode == null) {
						this.toastNode = document.createElement('div');
						this.toastNode.id = 'pseudocompressor-toasts';
						document.getElementById('app-mount')?.appendChild(this.toastNode);
					}
				}

				createToast(jobId) {
					this.validToasts.push(jobId);
				}

				setToast(jobId, message) {
					if (!message) {
						if (this.currentToasts.has(jobId)) {
							const toast = this.currentToasts.get(jobId);
							toast.remove();
							this.currentToasts.delete(jobId);
						}
					} else if (this.validToasts.includes(jobId)) {
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

				removeToast(jobId) {
					const index = this.validToasts.indexOf(jobId);
					if (index >= 0) {
						this.validToasts.splice(index, 1);
					}
					if (this.currentToasts.has(jobId)) {
						const toast = this.currentToasts.get(jobId);
						toast.remove();
						this.currentToasts.delete(jobId);
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

			return class FileCompressor extends Plugin {
				constructor() {
					super();
					this.onStart = this.onStart.bind(this);
					this.onStop = this.onStop.bind(this);
					this.updateToastCSS = this.updateToastCSS.bind(this);
					this.monkeyPatch = this.monkeyPatch.bind(this);
					this.updateCache = this.updateCache.bind(this);
					this.initFfmpeg = this.initFfmpeg.bind(this);
					this.downloadLibrary = this.downloadLibrary.bind(this);
					this.downloadFile = this.downloadFile.bind(this);
					this.initTempFolder = this.initTempFolder.bind(this);
					this.handleUploadEvent = this.handleUploadEvent.bind(this);
					this.sendUploadFileList = this.sendUploadFileList.bind(this);
					this.sendUploadFileListInternal = this.sendUploadFileListInternal.bind(this);
					this.switchChannel = this.switchChannel.bind(this);
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
					i18n.updateLocale(DiscordModules.UserSettingsStore.locale);
					PluginUtilities.addStyle('FileCompressor-CSS', `
						#pseudocompressor-toasts {
							position:fixed;
							top:30px;
							bottom:30px;
							left:30px;
							right:30px;
							z-index:5000;
							pointer-events:none;
							display:flex;
							flex-direction:column;
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
					this.updateToastCSS();
					toasts.createToast(0);
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

				updateToastCSS() {
					PluginUtilities.removeStyle('FileCompressor-Toast-CSS');
					switch (this.settings.compressor.toastPosition) {
					case 'bottomright':
						PluginUtilities.addStyle('FileCompressor-Toast-CSS', `
							#pseudocompressor-toasts {
								align-items:flex-end;
								justify-content:flex-end;
							}
						`);
						break;
					case 'bottomleft':
						PluginUtilities.addStyle('FileCompressor-Toast-CSS', `
							#pseudocompressor-toasts {
								align-items:flex-start;
								justify-content:flex-end;
							}
						`);
						break;
					case 'topright':
						PluginUtilities.addStyle('FileCompressor-Toast-CSS', `
							#pseudocompressor-toasts {
								align-items:flex-end;
								justify-content:flex-end;
								flex-direction:column-reverse;
							}
						`);
						break;
					case 'topleft':
						PluginUtilities.addStyle('FileCompressor-Toast-CSS', `
							#pseudocompressor-toasts {
								align-items:flex-start;
								justify-content:flex-end;
								flex-direction:column-reverse;
							}
						`);
						break;
					default:
					case 'hidden':
						PluginUtilities.addStyle('FileCompressor-Toast-CSS', `
							#pseudocompressor-toasts {
								display:none;
							}
						`);
						break;
					}
				}

				monkeyPatch() {
					const promptToUploadModule = BdApi.findModuleByProps("promptToUpload");
					if (promptToUploadModule) {
						this.originalUploadFunction = promptToUploadModule.promptToUpload;
						const uploadFunc = this.handleUploadEvent;
						const originalFunc = this.originalUploadFunction;
						if (this.originalUploadFunction && this.originalUploadFunction.length === 4) {
							promptToUploadModule.promptToUpload = function (fileList, channel, draftType, uploadOptions) {
								if (uploadOptions.fileCompressorCompressedFile) {
									return originalFunc(fileList, channel, draftType, uploadOptions);
								} else {
									return uploadFunc(fileList, channel, draftType, uploadOptions);
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
						if (installedFfmpeg && installedFfmpeg != ffmpegConstants.version) {
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
								BdApi.showConfirmationModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', ffmpegConstants.name, ffmpegConstants.version),
									DiscordModules.React.createElement("div", {},
										[
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_COMPRESSION', config.info.name, ffmpegConstants.name)),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_CUSTOM_INSTALL', config.info.name, ffmpegConstants.name)),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_SOURCE_LOCATION', ffmpegConstants.name, ffmpegConstants.version, ffmpegConstants.sourceUrl)),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_LICENSE_INFO', ffmpegConstants.name, ffmpegConstants.license, ffmpegConstants.licenseUrl))
										]), {
									danger: false,
									onConfirm: () => {
										let ffmpegPromise,
										ffprobePromise;
										try {
											this.saveSettings("compressor", "ffmpeg", true);
											ffmpegPromise = this.downloadLibrary(ffmpegPath, ffmpegConstants.downloadUrls, "FFmpeg");
											ffmpegPromise.then(filePath => {
												try {
													fs.chmodSync(filePath, 755);
												} catch (ex) {
													Logger.err(config.info.name, "Unable to download FFmpeg", ex);
													BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFmpeg'), {
														type: "error"
													});
													reject(ex);
												}
											}).catch(ex => {
												Logger.err(config.info.name, "Unable to download FFmpeg", ex);
												BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFmpeg'), {
													type: "error"
												});
												reject(ex);
											});
										} catch (e) {
											Logger.err(config.info.name, "Unable to download FFmpeg", e);
											BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFmpeg'), {
												type: "error"
											});
											reject(e);
										}
										try {
											ffprobePromise = this.downloadLibrary(ffmpegPath, ffmpegConstants.downloadUrls, "FFprobe");
											ffprobePromise.then(filePath => {
												try {
													fs.chmodSync(filePath, 755);
												} catch (ex) {
													Logger.err(config.info.name, "Unable to download FFprobe", ex);
													BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFprobe'), {
														type: "error"
													});
													reject(ex);
												}
											}).catch(ex => {
												Logger.err(config.info.name, "Unable to download FFprobe", ex);
												BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFprobe'), {
													type: "error"
												});
												reject(ex);
											});
										} catch (e) {
											Logger.err(config.info.name, "Unable to download FFprobe", e);
											BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'FFprobe'), {
												type: "error"
											});
											reject(e);
										}
										Promise.all([ffmpegPromise, ffprobePromise]).then(() => {
											BdApi.saveData(config.info.name, "ffmpeg.version", ffmpegConstants.version);
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
								Modals.showAlertModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "FFmpeg", ffmpegConstants.version), i18n.FORMAT('LIBRARY_CUSTOM_PATH_INVALID', config.info.name, "FFmpeg"));
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
						if (installedMkvmerge && installedMkvmerge != mkvmergeConstants.version) {
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
								BdApi.showConfirmationModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', mkvmergeConstants.name, mkvmergeConstants.version),
									DiscordModules.React.createElement("div", {},
										[
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_COMPRESSION', config.info.name, mkvmergeConstants.name)),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_REQUIRED_CUSTOM_INSTALL', config.info.name, mkvmergeConstants.name)),
											DiscordModules.React.createElement("hr"),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_SOURCE_LOCATION', mkvmergeConstants.name, mkvmergeConstants.version, mkvmergeConstants.sourceUrl)),
											DiscordModules.React.createElement(Markdown, {}, i18n.FORMAT('LIBRARY_LICENSE_INFO', mkvmergeConstants.name, mkvmergeConstants.license, mkvmergeConstants.licenseUrl))
										]), {
									danger: false,
									onConfirm: () => {
										try {
											this.saveSettings("compressor", "mkvmerge", true);
											this.downloadLibrary(mkvmergePath, mkvmergeConstants.downloadUrls, "MKVmerge").then(filePath => {
												try {
													fs.chmodSync(filePath, 755);
													BdApi.saveData(config.info.name, "mkvmerge.version", mkvmergeConstants.version);
													resolve(this.initMkvmerge());
												} catch (ex) {
													Logger.err(config.info.name, "Unable to download MKVmerge", ex);
													BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'MKVmerge'), {
														type: "error"
													});
													reject(ex);
												}
											}).catch(ex => {
												Logger.err(config.info.name, "Unable to download MKVmerge", ex);
												BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'MKVmerge'), {
													type: "error"
												});
												reject(ex);
											});
										} catch (e) {
											Logger.err(config.info.name, "Unable to download MKVmerge", e);
											BdApi.showToast(i18n.FORMAT('ERROR_DOWNLOADING_PROGRAM', 'MKVmerge'), {
												type: "error"
											});
											reject(e);
										}
									},
									onCancel: () => {
										reject();
									},
									confirmText: i18n.MESSAGES.INSTALL_AUTOMATICALLY,
									cancelText: i18n.MESSAGES.CANCEL
								});
							} else {
								Modals.showAlertModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "MKVmerge", mkvmergeConstants.version), i18n.FORMAT('LIBRARY_CUSTOM_PATH_INVALID', config.info.name, "MKVmerge"));
								reject();
							}
						}
					});
				}

				async downloadLibrary(downloadPath, downloadUrls, name) {
					fs.mkdirSync(downloadPath, {
						recursive: true
					});
					let dlInfo = "";
					switch (process.platform) {
					case "win32":
						dlInfo = downloadUrls[name].win_amd64;
						break;
					case "darwin":
						switch (process.arch) {
						case "arm":
						case "arm64":
							dlInfo = downloadUrls[name].darwin_arm64;
							if (!dlInfo)
								dlInfo = downloadUrls[name].darwin_amd64;
							break;
						case "x64":
						default:
							dlInfo = downloadUrls[name].darwin_amd64;
							break;
						}
						break;
					default:
						switch (process.arch) {
						case "arm":
							dlInfo = downloadUrls[name].linux_armhf;
							break;
						case "arm64":
							dlInfo = downloadUrls[name].linux_arm64;
							break;
						case "x64":
							dlInfo = downloadUrls[name].linux_amd64;
							break;
						case "ia32":
						case "x32":
						default:
							dlInfo = downloadUrls[name].linux_i686;
							break;
						}
						break;
					}
					// Wait for file download to complete - .tmp appended to filename to prevent it from being run accidentally until verified
					const tmpJobId = "-" + uuidv4().replace(/-/g, "");
					toasts.createToast(tmpJobId);
					const filePath = await this.downloadFile(tmpJobId, dlInfo.url, downloadPath, name);
					// Check file size
					const fileStats = fs.statSync(filePath);
					const fileSize = fileStats ? fileStats.size : 0;
					if (fileSize !== dlInfo.size) {
						toasts.removeToast(tmpJobId);
						try {
							fs.rmSync(filePath);
						} catch (e) {
							Logger.err(config.info.name, "Error deleting " + filePath, e);
						}
						throw new Error("Size for downloaded " + name + " does not match! Downloaded: " + fileSize + " Expected: " + dlInfo.size);
					}
					// Wait until file is hashed
					const fileHash = await this.hashDownloadedFile(tmpJobId, filePath, fileSize);
					toasts.setToast(tmpJobId);
					// Check file hash
					if (fileHash !== dlInfo.hash) {
						toasts.removeToast(tmpJobId);
						try {
							fs.rmSync(filePath);
						} catch (e) {
							Logger.err(config.info.name, "Error deleting " + filePath, e);
						}
						throw new Error("Hash for downloaded " + name + " does not match! Calculated: " + fileHash + " Expected: " + dlInfo.hash);
					}
					// Rename file for use if checks pass
					const newPath = filePath.slice(0, -4);
					fs.renameSync(filePath, newPath);
					toasts.removeToast(tmpJobId);
					return newPath;
				}

				hashDownloadedFile(jobId, file, fileSize) {
					return new Promise((resolve, reject) => {
						let bytesProcessed = 0;
						const hash = cryptoModule.createHash('sha512');
						const fileReadStream = fs.createReadStream(file);
						toasts.setToast(jobId, i18n.FORMAT('HASHING_PERCENT', '0'));
						fileReadStream.on('end', () => {
							try {
								resolve(hash.digest('hex'));
							} catch (err) {
								Logger.err(config.info.name, err);
								reject();
							}
						});
						fileReadStream.on('error', (e) => {
							reject(new Error("Error while hashing " + file, {
									cause: e
								}));
						});
						fileReadStream.on('data', (chunk) => {
							bytesProcessed += chunk.length;
							const percent = Math.round((bytesProcessed / fileSize) * 100);
							toasts.setToast(jobId, i18n.FORMAT('HASHING_PERCENT', percent ? percent : 0));
						});
						fileReadStream.pipe(hash);
					});
				}

				downloadFile(jobId, downloadUrl, downloadPath, name) {
					return new Promise((resolve, reject) => {
						const toastsModule = toasts;
						const https = require('https');
						const req = https.request(downloadUrl);
						req.on('response', result => {
							if (result.statusCode === 200) {
								const regexp = /filename=(.*?)(?=;|$)/gi;
								const originalFileName = regexp.exec(result.headers['content-disposition'])[1];
								const totalLength = result.headers['content-length'];
								let writtenLength = 0;
								const fileStream = fs.createWriteStream(path.join(downloadPath, originalFileName + ".tmp"));
								toastsModule.setToast(jobId, i18n.FORMAT('DOWNLOADING_PROGRAM_PERCENT', name, '0'));
								result.on('data', chunk => {
									writtenLength += chunk.length;
									const percent = Math.round((writtenLength / totalLength) * 100);
									toastsModule.setToast(jobId, i18n.FORMAT('DOWNLOADING_PROGRAM_PERCENT', name, percent ? percent : 0));
								});
								result.pipe(fileStream);
								fileStream.on('error', (e) => {
									// Handle write errors
									reject(new Error("Error while downloading " + downloadUrl + " for " + name, {
											cause: e
										}));
								});
								fileStream.on('finish', function () {
									// The file has been downloaded
									toastsModule.removeToast(jobId);
									resolve(path.join(downloadPath, originalFileName + ".tmp"));
								});
							} else if (result.statusCode === 302) {
								const location = result.headers['location'];
								if (location) {
									resolve(this.downloadFile(jobId, location, downloadPath, name));
								} else {
									reject(new Error("Invalid file URL: " + downloadUrl + " for downloading " + name));
								}
							} else {
								reject(new Error("Server returned " + result.statusCode + " at " + downloadUrl + " for downloading " + name));
							}
						});
						req.end();
					});
				}

				getCurrentUser() {
					return DiscordModules.UserStore.getCurrentUser();
				}

				getCurrentChannel() {
					return DiscordModules.ChannelStore.getChannel(DiscordModules.SelectedChannelStore.getChannelId());
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

				async handleUploadEvent(fileList, channel, draftType, uploadOptions) {
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
							sidebar = this.getCurrentChannel() ? this.getCurrentChannel().id !== threadId : false;
						} else {
							// Normal channel
							guildId = channel.guild_id;
							channelId = channel.id;
						}
						this.processUploadFileList(fileList, guildId, channelId, threadId, sidebar);
						return true;
					} else {
						Logger.err(config.info.name, "Invalid upload event: fileList:", fileList, "channel:", channel, "draftType:", draftType, "uploadOptions:", uploadOptions);
						BdApi.showToast(i18n.MESSAGES.ERROR_UPLOADING, {
							type: "error"
						});
					}
				}

				processUploadFileList(files, guildId, channelId, threadId, sidebar) {
					// Check account status and update max file upload size
					const settingsMaxSize = this.settings.upload.maxFileSize != 0 ? this.settings.upload.maxFileSize : 0;
					try {
						maxUploadSize = DiscordModules.DiscordConstants.PremiumUserLimits[this.getCurrentUser().premiumType ? this.getCurrentUser().premiumType : 0].fileSize;
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
					const originalGuildId = this.getCurrentChannel() ? this.getCurrentChannel().guild_id : null;
					const originalChannelId = this.getCurrentChannel() ? (this.getCurrentChannel().threadMetadata ? this.getCurrentChannel().parent_id : this.getCurrentChannel().id) : null;
					const originalThreadId = this.getCurrentChannel() ? (this.getCurrentChannel().threadMetadata ? this.getCurrentChannel().id : null) : null;
					const sidebarThreadId = (this.getCurrentChannel() && !originalThreadId) ? BdApi.findModuleByProps('getCurrentSidebarChannelId').getCurrentSidebarChannelId(originalChannelId) : null;
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
					if ((guildId ? this.getCurrentChannel().guild_id === guildId : !this.getCurrentChannel().guild_id) && (threadId ? ((this.getCurrentChannel().id === threadId && this.getCurrentChannel().parent_id === channelId) || this.getCurrentChannel().id === channelId && BdApi.findModuleByProps('getCurrentSidebarChannelId').getCurrentSidebarChannelId(this.getCurrentChannel().id) === threadId) : this.getCurrentChannel().id === channelId)) {
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
						BdApi.findModuleByProps("promptToUpload").promptToUpload(files, channelObj, 0, {
							requireConfirm: true,
							showLargeMessageDialog: true,
							fileCompressorCompressedFile: true /*Special boolean to mark file as processed and prevent loops*/
						});
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
							options: {},
							optionsCategories: {},
							compressionData: {},
							logs: []
						});
						break;
					default:
						return file;
					}
					return null;
				}

				// Asks the user for settings to use when compressing the file and compresses the file if possible, or queues it for later
				async compressFile(job) {
					toasts.createToast(job.jobId);
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
					if (!await this.populateCompressionOptions(job, cacheFile))
						return false;
					// If user wants to use cached options & cached file exists
					if (cacheFile && job.options.cache.useCache.value) {
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

				async populateCompressionOptions(job, cacheFile) {
					const nameSplit = job.file.name.split('.');
					job.compressionData.name = nameSplit.slice(0, nameSplit.length - 1).join(".");
					job.compressionData.extension = nameSplit[nameSplit.length - 1];
					job.optionsCategories = {
						cache: {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_CATEGORIES_CACHE,
							shown: true
						},
						basic: {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_CATEGORIES_BASIC,
							shown: true
						},
						advanced: {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_CATEGORIES_ADVANCED,
							shown: false
						}
					};
					// If cached file exists, ask user if they want to use cached options
					if (cacheFile) {
						job.options.cache = {};
						job.options.cache.useCache = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_USE_CACHE,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_USE_CACHE_DESC,
							type: "switch",
							defaultValue: true,
							onChange: (value, allCategories, allOptions) => {
								for (const[key, category]of Object.entries(allCategories)) {
									if (key != "cache") {
										category.style.display = (value ? "none" : null);
									}
								}
							}
						};
					}
					job.options.basic = {};
					job.options.advanced = {};
					job.options.basic.sizeCap = {
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
						job.options.basic.sizeMultiplier = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_MULTIPLIER,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_MULTIPLIER_DESC,
							type: "textbox",
							defaultValue: 0.9,
							validation: value => {
								return (!isNaN(value) && !isNaN(parseFloat(value)) && value < 1 && value > 0);
							}
						};
						job.options.basic.maxIterations = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_ITERATIONS,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_ITERATIONS_DESC,
							type: "textbox",
							defaultValue: 50,
							validation: value => {
								return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						if (await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options, job.optionsCategories, this.settings.compressor.promptOptionsImage))
							return true;
						break;
					case "video":
						if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
							await this.initFfmpeg();
						}
						if (!(ffmpeg && ffmpeg.checkFFmpeg())) {
							return false;
						}
						job.originalFilePath = job.file.path;
						job.isOriginalTemporary = false;
						if (!job.originalFilePath) {
							job.isOriginalTemporary = true;
							job.originalFilePath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + job.compressionData.extension);
							const fileStream = job.file.stream();
							const fileStreamReader = fileStream.getReader();
							const writeStream = fs.createWriteStream(job.originalFilePath);
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
											this.jobLoggerInfo(job, "Copied: " + bytesWritten + " bytes");
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
						job.probeData = await ffmpeg.runProbeWithArgs(["-v", "error", "-show_format", "-show_streams", "-print_format", "json", job.originalFilePath]);
						const encoderValuesArray = [];
						for (const name of Object.getOwnPropertyNames(videoEncoderSettings)) {
							encoderValuesArray.push({
								value: name,
								label: name
							});
						}
						job.options.basic.videoEncoder = {
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
						job.options.basic.videoEncoderPreset = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_ENCODER_PRESET,
							type: "dropdown",
							defaultValue: "balanced",
							props: {
								values: encoderPresetsValuesArray
							}
						};
						job.options.advanced.maxHeight = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_HEIGHT,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								return (!isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						job.options.basic.maxFps = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MAX_FPS,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								return (!isNaN(value) && !isNaN(parseFloat(value)) && value > 0);
							}
						};
						job.options.advanced.interlace = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_INTERLACE_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_INTERLACE_VIDEO_DESC,
							type: "switch",
							defaultValue: false
						};
						job.options.basic.stripAudio = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_AUDIO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_AUDIO_DESC,
							type: "switch",
							defaultValue: false
						};
						job.options.basic.stripVideo = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_STRIP_VIDEO_DESC,
							type: "switch",
							defaultValue: false,
							tags: ["audioValid"],
							onChange: (value, allCategories, allOptions) => {
								for (const[key, category]of Object.entries(allOptions)) {
									if (key != "cache") {
										for (const[categoryOption, element]of Object.entries(category)) {
											if (element.tags.includes("audioOnly")) {
												element.inputWrapper.style.display = (value ? null : "none");
											} else if (!element.tags.includes("audioValid")) {
												element.inputWrapper.style.display = (value ? "none" : null);
											}
										}
									}
								}
							}
						};
						job.options.basic.startTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STARTING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const[index, val]of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							},
							tags: ["audioValid"]
						};
						job.options.basic.endTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_ENDING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const[index, val]of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							},
							tags: ["audioValid"]
						};
						job.options.advanced.autoCrop = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_AUTO_CROP,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_AUTO_CROP_DESC,
							type: "switch",
							defaultValue: false
						};
						job.options.advanced.sendAsVideo = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_SEND_AS_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_SEND_AS_VIDEO_DESC,
							type: "switch",
							defaultValue: false,
							tags: ["audioValid", "audioOnly"]
						};
						if (await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options, job.optionsCategories, this.settings.compressor.promptOptionsVideo))
							return true;
						break;
					case "audio":
						if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
							await this.initFfmpeg();
						}
						if (!(ffmpeg && ffmpeg.checkFFmpeg())) {
							return false;
						}
						job.originalFilePath = job.file.path;
						job.isOriginalTemporary = false;
						if (!job.originalFilePath) {
							job.isOriginalTemporary = true;
							job.originalFilePath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + job.compressionData.extension);
							const fileStream = job.file.stream();
							const fileStreamReader = fileStream.getReader();
							const writeStream = fs.createWriteStream(job.originalFilePath);
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
											this.jobLoggerInfo(job, "Copied: " + bytesWritten + " bytes");
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
						job.probeData = await ffmpeg.runProbeWithArgs(["-v", "error", "-show_format", "-show_streams", "-print_format", "json", job.originalFilePath]);
						job.options.basic.startTimestamp = {
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
						job.options.basic.endTimestamp = {
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
						job.options.advanced.sendAsVideo = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_SEND_AS_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_SEND_AS_VIDEO_DESC,
							type: "switch",
							defaultValue: false
						};
						if (await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options, job.optionsCategories, this.settings.compressor.promptOptionsAudio))
							return true;
						break;
					}
					return false;
				}

				showSettings(title, options, optionsCategories, shouldPrompt) {
					return new Promise((resolve, reject) => {
						// If options should be shown
						if (shouldPrompt) {
							const settingsElements = new Map();
							const settingsElementNames = new Map();
							const settingsGroups = new Map();
							const settingsPanels = new Map();
							const settingsPanelsReact = new Map();
							for (const category in options) {
								for (const setting in options[category]) {
									// Set current value to default value
									options[category][setting].value = options[category][setting].defaultValue;
									// Get option category and store an array for each category
									if (!settingsElements[category])
										settingsElements[category] = [];
									if (!settingsElementNames[category])
										settingsElementNames[category] = new Map();
									// Add setting object to array
									const newSettingElem = this.createSettingField(options[category][setting].type, options[category][setting].name, options[category][setting].description, options[category][setting].defaultValue, value => {
										// onChange function
										// Only set value if validation function doesn't exist, or if function exists and returns true
										if (typeof(options[category][setting].validation) != "function" || options[category][setting].validation(value)) {
											// Set value
											options[category][setting].value = value;
											// Run custom onChange function when value is set
											if (typeof(options[category][setting].onChange) == "function")
												options[category][setting].onChange(value, settingsPanels, settingsElementNames);
										}
									}, options[category][setting].props, options[category][setting].tags)
										settingsElements[category].push(newSettingElem);
									settingsElementNames[category][setting] = newSettingElem;
								}
							}
							// Add elements to SettingGroups
							for (const[key, value]of Object.entries(settingsElements)) {
								settingsGroups[key] = new Settings.SettingGroup(optionsCategories[key].name, {
									shown: optionsCategories[key].shown,
									collapsible: true
								}).append(...value);
							}
							// Convert elements to HTML SettingPanel objects
							for (const[key, value]of Object.entries(settingsGroups))
								settingsPanels[key] = Settings.SettingPanel.build(null, value);
							// Convert HTML to React elements
							for (const[key, value]of Object.entries(settingsPanels))
								settingsPanelsReact[key] = ReactTools.createWrappedElement(value);
							// Run all onChange functions with default values for setup
							for (const category in options) {
								for (const setting in options[category]) {
									if (typeof(options[category][setting].onChange) == "function")
										options[category][setting].onChange(options[category][setting].value, settingsPanels, settingsElementNames);
								}
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
							for (const category in options) {
								for (const setting in options[category]) {
									// Set current value to default value
									options[category][setting].value = options[category][setting].defaultValue;
								}
							}
							resolve(true);
						}
					});
				}

				createSettingField(type, name, description, defaultValue, onChange, props, tags = []) {
					let elem = null;
					switch (type) {
					case "color":
						elem = new Settings.ColorPicker(name, description, defaultValue, onChange, props);
						break;
					case "dropdown":
						elem = new Settings.Dropdown(name, description, defaultValue, props.values, onChange, props);
						break;
					case "file":
						elem = new Settings.FilePicker(name, description, onChange, props);
						break;
					case "keybind":
						elem = new Settings.Keybind(name, description, defaultValue, onChange, props);
						break;
					case "radiogroup":
						elem = new Settings.RadioGroup(name, description, defaultValue, props.values, onChange, props);
						break;
					case "slider":
						elem = new Settings.Slider(name, description, props.min, props.max, defaultValue, onChange, props);
						break;
					case "switch":
						elem = new Settings.Switch(name, description, defaultValue, onChange, props);
						break;
					case "textbox":
						elem = new Settings.Textbox(name, description, defaultValue, onChange, props);
						break;
					default:
						return null;
					}
					elem.tags = tags;
					return elem;
				}

				// Sends the file to the appropriate compressor once all checks have passed
				compressFileType(job) {
					for (const category in job.options) {
						for (const setting in job.options[category]) {
							// Output all selected options to logs
							this.jobLoggerInfo(job, "Option: " + category + "." + setting + " " + job.options[category][setting].value);
						}
					}
					job.startCompressionTime = new Date();
					this.jobLoggerInfo(job, "Start time: " + job.startCompressionTime.toLocaleString());
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
					promise.then(returnFile => {
						job.endCompressionTime = new Date();
						this.jobLoggerInfo(job, "End time: " + job.endCompressionTime.toLocaleString());
						let compressionTimeDiff = (job.endCompressionTime - job.startCompressionTime) / 1000;
						const compressionTimeSeconds = compressionTimeDiff % 60;
						compressionTimeDiff = (compressionTimeDiff - compressionTimeSeconds) / 60;
						const compressionTimeMinutes = compressionTimeDiff % 60;
						const compressionTimeHours = (compressionTimeDiff - compressionTimeMinutes) / 60;
						this.jobLoggerInfo(job, "Time to compress: " + (compressionTimeHours.toFixed(0) + ":" + compressionTimeMinutes.toFixed(0).padStart(2, 0) + ":" + compressionTimeSeconds.toFixed(3).padStart(6, 0)));
						if (returnFile) {
							this.sendUploadFileList(this.wrapFileInList(returnFile), job.guildId, job.channelId, job.threadId, job.isSidebar);
						}
						toasts.removeToast(job.jobId);
						const index = runningJobs.indexOf(job);
						if (index >= 0)
							runningJobs.splice(index, 1);
						this.processNextFile();
					}).catch(error => {
						job.endCompressionTime = new Date();
						this.jobLoggerInfo(job, "End time: " + job.endCompressionTime.toLocaleString());
						let compressionTimeDiff = (job.endCompressionTime - job.startCompressionTime) / 1000;
						const compressionTimeSeconds = compressionTimeDiff % 60;
						compressionTimeDiff = (compressionTimeDiff - compressionTimeSeconds) / 60;
						const compressionTimeMinutes = compressionTimeDiff % 60;
						const compressionTimeHours = (compressionTimeDiff - compressionTimeMinutes) / 60;
						this.jobLoggerInfo(job, "Time to error: " + (compressionTimeHours.toFixed(0) + ":" + compressionTimeMinutes.toFixed(0).padStart(2, 0) + ":" + compressionTimeSeconds.toFixed(3).padStart(6, 0)));
						BdApi.showToast(i18n.MESSAGES.ERROR_COMPRESSING, {
							type: "error"
						});
						this.jobLoggerError(job, error);
						// Ask to save error logs for debugging
						BdApi.showConfirmationModal(i18n.MESSAGES.SAVE_DEBUG_LOG, "", {
							onConfirm: () => {
								// Convert logs to blob and trigger file download of blob
								const downloadUrl = window.URL.createObjectURL(new Blob([job.logs.join("\n"), ...(job.probeData ? ["\n", job.probeData.data] : [])]));
								const downloadLink = document.createElement("a");
								downloadLink.href = downloadUrl;
								downloadLink.setAttribute('download', `FileCompressorError.log`);
								downloadLink.style.display = "none";
								document.body.appendChild(downloadLink);
								downloadLink.click();
								downloadLink.remove();
							}
						});
						toasts.removeToast(job.jobId);
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

				// Helper function to output to info log and save log to job data simultaneously
				jobLoggerInfo(job, ...message) {
					if (!Array.isArray(message))
						message = [message];
					message.unshift("[" + job.file.name + "]")
					Logger.info(config.info.name, ...message);
					job.logs.push(message.join(" "));
				}

				// Helper function to output to error log and save log to job data simultaneously
				jobLoggerError(job, ...message) {
					if (!Array.isArray(message))
						message = [message];
					message.unshift("[" + job.file.name + "]")
					Logger.err(config.info.name, ...message);
					job.logs.push(message.join(" "));
				}

				// Main function to compress a given audio file
				async compressAudio(job) {
					if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
						await this.initFfmpeg();
					}
					if (ffmpeg && ffmpeg.checkFFmpeg()) {
						if (await this.initTempFolder()) {
							job.compressionData.compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + (job.options.advanced.sendAsVideo.value ? ".mkv" : ".opus"));
							job.compressionData.videoPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".mkv");
							if (cache) {
								job.compressionData.compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + (job.options.advanced.sendAsVideo.value ? ".webm" : ".ogg"));
							} else {
								job.compressionData.compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + (job.options.advanced.sendAsVideo.value ? ".webm" : ".ogg"));
							}
							toasts.setToast(job.jobId, i18n.MESSAGES.CALCULATING);
							if (job.probeData) {
								const probeOutputData = JSON.parse(job.probeData.data);
								try {
									let streamIndex = -1;
									for (const streamData of probeOutputData.streams) {
										if (streamData.codec_type == "audio") {
											streamIndex = streamData.index;
											break;
										}
									}
									const originalDuration = probeOutputData.format.duration ? parseFloat(probeOutputData.format.duration) : 0;
									const bitDepth = probeOutputData.streams[streamIndex].bits_per_raw_sample ? parseInt(probeOutputData.streams[streamIndex].bits_per_raw_sample) : null;
									const numChannels = probeOutputData.streams[streamIndex].channels ? parseInt(probeOutputData.streams[streamIndex].channels) : null;
									if (originalDuration <= 0)
										throw new Error("Invalid file duration");
									let duration = originalDuration;
									const startSecondsSplit = job.options.basic.startTimestamp.value.split(':');
									let startSeconds = 0;
									for (const[index, val]of startSecondsSplit.entries())
										startSeconds += Math.pow(60, (startSecondsSplit.length - (index + 1))) * (index + 1 == startSecondsSplit.length ? parseFloat(val) : parseInt(val));
									if (startSeconds < 0 || isNaN(startSeconds) || startSeconds >= duration)
										startSeconds = 0;
									const endSecondsSplit = job.options.basic.endTimestamp.value.split(':');
									let endSeconds = 0;
									for (const[index, val]of endSecondsSplit.entries())
										endSeconds += Math.pow(60, (endSecondsSplit.length - (index + 1))) * (index + 1 == endSecondsSplit.length ? parseFloat(val) : parseInt(val));
									endSeconds -= startSeconds;
									if (endSeconds <= 0 || isNaN(endSeconds) || endSeconds > duration)
										endSeconds = -1;
									duration = endSeconds > 0 ? endSeconds : originalDuration - startSeconds;
									if (duration <= 0)
										duration = originalDuration;
									let emptyVideoSize = 0;
									if (job.options.advanced.sendAsVideo.value) {
										endSeconds = startSeconds + duration;
										try {
											toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', '1', '0'));
											const ffmpegArgs = ["-y", "-t", duration, "-f", "lavfi", "-i", "color=c=black:s=256x144", "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-vsync", "2", "-r", "1", job.compressionData.videoPath];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await ffmpeg.runWithArgs(ffmpegArgs);
										} catch (e) {
											if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(job.originalFilePath);
												} catch (e) {}
											}
											if (!this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(job.compressionData.videoPath);
												} catch (e) {}
											}
											throw e;
										}
										if (fs.existsSync(job.compressionData.videoPath)) {
											let videoStats = fs.statSync(job.compressionData.videoPath);
											emptyVideoSize = videoStats ? videoStats.size : 0;
											this.jobLoggerInfo(job, "Empty video size: " + emptyVideoSize + " bytes");
											emptyVideoSize += 5000;
										} else {
											if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(job.originalFilePath);
												} catch (e) {}
											}
											throw new Error("Cannot find FFmpeg output");
										}
									}
									const cappedFileSize = Math.floor((job.options.basic.sizeCap.value && parseInt(job.options.basic.sizeCap.value) < maxUploadSize ? parseInt(job.options.basic.sizeCap.value) : maxUploadSize)) - 10000 - emptyVideoSize;
									let audioBitrate = Math.floor((cappedFileSize * 8) / duration);
									if (audioBitrate < 500)
										audioBitrate = 500;
									let outputChannels = numChannels;
									if (!numChannels || (audioBitrate / numChannels < 50000)) {
										if (Math.floor(audioBitrate / 30000) > 2)
											outputChannels = 2;
										else
											outputChannels = 1;
									}
									if (audioBitrate > (256000 * outputChannels))
										audioBitrate = (256000 * outputChannels);
									let outputBitDepth;
									if ((!bitDepth || bitDepth > 16) && ((audioBitrate / outputChannels) < 96000))
										outputBitDepth = 16;
									const fileStats = fs.statSync(job.originalFilePath);
									this.jobLoggerInfo(job, "Original file size: " + (fileStats ? fileStats.size : 0) + " bytes");
									this.jobLoggerInfo(job, "Max file size: " + cappedFileSize + " bytes");
									this.jobLoggerInfo(job, "File length: " + originalDuration + " seconds");
									this.jobLoggerInfo(job, "Clipped length: " + duration + " seconds");
									this.jobLoggerInfo(job, "Target bitrate: " + audioBitrate + " bits/second");
									this.jobLoggerInfo(job, "Number of channels: " + numChannels + " channels");
									this.jobLoggerInfo(job, "Number of output channels: " + outputChannels + " channels");
									this.jobLoggerInfo(job, "Target audio bitrate per channel: " + (audioBitrate / outputChannels) + " bits/second");
									this.jobLoggerInfo(job, "Bit depth: " + bitDepth + " bits");
									this.jobLoggerInfo(job, "Output bit depth: " + (outputBitDepth ? outputBitDepth : bitDepth) + " bits");
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', '1', '0'));
										const ffmpegArgs = ["-y", "-ss", startSeconds, "-vn", "-i", job.originalFilePath, ...(job.options.advanced.sendAsVideo.value ? ["-i", job.compressionData.videoPath] : []), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate, "-sn", "-map_chapters", "-1", "-c:a", "libopus", "-map", "0:a", ...((outputBitDepth && (outputBitDepth < bitDepth || !bitDepth)) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, ...(job.options.advanced.sendAsVideo.value ? ["-map", "1:v", "-shortest"] : []), job.compressionData.compressedPathPre];
										job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
										await ffmpeg.runWithArgs(ffmpegArgs, [{
													filter: str => {
														return str.includes("time=");
													},
													process: str => {
														try {
															const timeStr = regexPatternTime.exec(str);
															if (timeStr?.length > 1) {
																const timeStrParts = timeStr[1].split(':');
																const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
																const percent = Math.round((elapsedTime / duration) * 100);
																toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', '1', percent ? percent : 0));
															}
														} catch (e) {
															this.jobLoggerError(job, e);
														}
													}
												}
											]);
									} catch (e) {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.videoPath);
											} catch (e) {}
										}
										throw e;
									}
									if (fs.existsSync(job.compressionData.compressedPathPre)) {
										let audioStats = fs.statSync(job.compressionData.compressedPathPre);
										let audioSize = audioStats ? audioStats.size : 0;
										const originalAudioSize = audioSize;
										this.jobLoggerInfo(job, "Expected audio size: " + (duration * (audioBitrate / 8)) + " bytes");
										this.jobLoggerInfo(job, "Final audio size: " + audioSize + " bytes");
										for (let compressionPass = 2; compressionPass <= 3; compressionPass++) {
											if (audioSize > cappedFileSize) {
												const sizeDiff = (originalAudioSize - cappedFileSize) + (compressionPass == 2 ? 5000 : 100000);
												const audioBitrateDiff = (sizeDiff * 8) / duration;
												const audioBitrateAdjusted = Math.floor(audioBitrate - audioBitrateDiff);
												this.jobLoggerInfo(job, "Adjusted target bitrate: " + audioBitrateAdjusted + " bits/second");
												this.jobLoggerInfo(job, "Adjusted target audio bitrate per channel: " + (audioBitrateAdjusted / outputChannels) + " bits/second");
												try {
													toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, '0'));
													const ffmpegArgs = ["-y", "-ss", startSeconds, "-vn", "-i", job.originalFilePath, ...(job.options.advanced.sendAsVideo.value ? ["-i", job.compressionData.videoPath] : []), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrateAdjusted, "-maxrate", audioBitrateAdjusted, "-bufsize", audioBitrateAdjusted, "-sn", "-map_chapters", "-1", "-c:a", "libopus", "-map", "0:a", ...((outputBitDepth && (outputBitDepth < bitDepth || !bitDepth)) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, ...(job.options.advanced.sendAsVideo.value ? ["-map", "1:v", "-shortest"] : []), job.compressionData.compressedPathPre];
													job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
													await ffmpeg.runWithArgs(ffmpegArgs, [{
																filter: str => {
																	return str.includes("time=");
																},
																process: str => {
																	try {
																		const timeStr = regexPatternTime.exec(str);
																		if (timeStr?.length > 1) {
																			const timeStrParts = timeStr[1].split(':');
																			const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
																			const percent = Math.round((elapsedTime / duration) * 100);
																			toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, percent ? percent : 0));
																		}
																	} catch (e) {
																		this.jobLoggerError(job, e);
																	}
																}
															}
														]);
												} catch (e) {
													if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
														try {
															fs.rmSync(job.originalFilePath);
														} catch (e) {}
													}
													if (!this.settings.compressor.keepTemp) {
														try {
															fs.rmSync(job.compressionData.compressedPathPre);
														} catch (e) {}
													}
													if (!this.settings.compressor.keepTemp) {
														try {
															fs.rmSync(job.compressionData.videoPath);
														} catch (e) {}
													}
													throw e;
												}
												if (fs.existsSync(job.compressionData.compressedPathPre)) {
													audioStats = fs.statSync(job.compressionData.compressedPathPre);
													audioSize = audioStats ? audioStats.size : 0;
													this.jobLoggerInfo(job, "Expected audio size: " + (duration * (audioBitrateAdjusted / 8)) + " bytes");
													this.jobLoggerInfo(job, "Final audio size: " + audioSize + " bytes");
												} else {
													if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
														try {
															fs.rmSync(job.originalFilePath);
														} catch (e) {}
													}
													if (!this.settings.compressor.keepTemp) {
														try {
															fs.rmSync(job.compressionData.videoPath);
														} catch (e) {}
													}
													throw new Error("Cannot find FFmpeg output");
												}
											}
										}
										fs.renameSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
									} else {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.videoPath);
											} catch (e) {}
										}
										throw new Error("Cannot find FFmpeg output");
									}
									if (fs.existsSync(job.compressionData.compressedPath)) {
										if (fs.existsSync(job.compressionData.compressedPath)) {
											const finalFileStats = fs.statSync(job.compressionData.compressedPath);
											const finalFileSize = finalFileStats ? finalFileStats.size : 0;
											this.jobLoggerInfo(job, "Final file size: " + finalFileSize + " bytes");
											this.jobLoggerInfo(job, "Upload size cap: " + maxUploadSize + " bytes");
											if (finalFileSize > maxUploadSize) {
												throw new Error("File bigger allowed by Discord");
											}
										}
										if (cache) {
											cache.addToCache(job.compressionData.compressedPath, job.compressionData.name + (job.options.advanced.sendAsVideo.value ? ".webm" : ".ogg"), job.fileKey);
										}
										const retFile = new File([fs.readFileSync(job.compressionData.compressedPath).buffer], job.compressionData.name + (job.options.advanced.sendAsVideo.value ? ".webm" : ".ogg"), {
											type: job.file.type
										});
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
										}
										if (!cache && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.compressedPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.videoPath);
											} catch (e) {}
										}
										return retFile;
									} else {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.videoPath);
											} catch (e) {}
										}
										throw new Error("Cannot find FFmpeg output");
									}
								} catch (e) {
									if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
										try {
											fs.rmSync(job.originalFilePath);
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

				// Main function to compress a given video
				async compressVideo(job) {
					if (!ffmpeg || !ffmpeg.checkFFmpeg()) {
						await this.initFfmpeg();
					}
					if (!mkvmerge || !mkvmerge.checkMKVmerge()) {
						await this.initMkvmerge();
					}
					if (ffmpeg && ffmpeg.checkFFmpeg()) {
						if (await this.initTempFolder()) {
							let stripAudio = job.options.basic.stripAudio.value && job.options.basic.stripVideo.value ? false : job.options.basic.stripAudio.value;
							const stripVideo = job.options.basic.stripAudio.value && job.options.basic.stripVideo.value ? false : job.options.basic.stripVideo.value;
							job.compressionData.tempAudioPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".opus");
							job.compressionData.tempVideoPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + videoEncoderSettings[job.options.basic.videoEncoder.value].fileType);
							job.compressionData.tempVideoTwoPassPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							job.compressionData.compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".mkv");
							if (cache) {
								job.compressionData.compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + (!stripVideo ? ".webm" : ".ogg"));
							} else {
								job.compressionData.compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + (!stripVideo ? ".webm" : ".ogg"));
							}
							toasts.setToast(job.jobId, i18n.MESSAGES.CALCULATING);
							if (job.probeData) {
								const probeOutputData = JSON.parse(job.probeData.data);
								try {
									let audioStreamIndex = -1;
									let videoStreamIndex = -1;
									for (const streamData of probeOutputData.streams) {
										if (streamData.codec_type == "audio") {
											audioStreamIndex = streamData.index;
											break;
										}
									}
									for (const streamData of probeOutputData.streams) {
										if (streamData.codec_type == "video") {
											videoStreamIndex = streamData.index;
											break;
										}
									}
									if (audioStreamIndex < 0)
										stripAudio = true;
									if (stripVideo) {
										return this.compressAudio(job);
									}
									const videoFiltersPass1 = [];
									const videoFiltersPass2 = [];
									const autoCropSettings = [-1, -1, -1, -1];
									if (job.options.advanced.autoCrop.value) {
										videoFiltersPass1.push("cropdetect=round=2");
									}
									if (job.options.advanced.interlace.value) {
										videoFiltersPass1.push("interlace=lowpass=2");
										videoFiltersPass2.push("interlace=lowpass=2");
									}
									const cappedFileSize = Math.floor((job.options.basic.sizeCap.value && parseInt(job.options.basic.sizeCap.value) < maxUploadSize ? parseInt(job.options.basic.sizeCap.value) : maxUploadSize)) - 150000;
									const frameRateMatchesSplit = probeOutputData.streams[videoStreamIndex].r_frame_rate ? probeOutputData.streams[videoStreamIndex].r_frame_rate.split('/') : null;
									const originalDuration = probeOutputData.format.duration ? parseFloat(probeOutputData.format.duration) : 0;
									const originalHeight = probeOutputData.streams[videoStreamIndex].height ? parseInt(probeOutputData.streams[videoStreamIndex].height) : null;
									const colorPrimaries = probeOutputData.streams[videoStreamIndex].color_primaries ? probeOutputData.streams[videoStreamIndex].color_primaries : null;
									const bitDepth = audioStreamIndex >= 0 && probeOutputData.streams[audioStreamIndex].bits_per_raw_sample ? parseInt(probeOutputData.streams[audioStreamIndex].bits_per_raw_sample) : null;
									const numChannels = audioStreamIndex >= 0 && probeOutputData.streams[audioStreamIndex].channels ? parseInt(probeOutputData.streams[audioStreamIndex].channels) : null;
									const isHDR = hdrColorPrimaries.includes(colorPrimaries);
									if (isHDR) {
										videoFiltersPass1.push("zscale=transfer=linear,tonemap=hable,zscale=transfer=bt709");
										videoFiltersPass2.push("zscale=transfer=linear,tonemap=hable,zscale=transfer=bt709");
									}
									const frameRate = frameRateMatchesSplit?.length > 1 ? (parseFloat(frameRateMatchesSplit[0]) / parseFloat(frameRateMatchesSplit[1])) : null;
									if (originalDuration == 0) {
										throw new Error("Invalid file duration");
									}
									let duration = originalDuration;
									const startSecondsSplit = job.options.basic.startTimestamp.value.split(':');
									let startSeconds = 0;
									for (const[index, val]of startSecondsSplit.entries())
										startSeconds += Math.pow(60, (startSecondsSplit.length - (index + 1))) * (index + 1 == startSecondsSplit.length ? parseFloat(val) : parseInt(val));
									if (startSeconds < 0 || isNaN(startSeconds) || startSeconds >= duration)
										startSeconds = 0;
									const endSecondsSplit = job.options.basic.endTimestamp.value.split(':');
									let endSeconds = 0;
									for (const[index, val]of endSecondsSplit.entries())
										endSeconds += Math.pow(60, (endSecondsSplit.length - (index + 1))) * (index + 1 == endSecondsSplit.length ? parseFloat(val) : parseInt(val));
									endSeconds -= startSeconds;
									if (endSeconds <= 0 || isNaN(endSeconds) == NaN || endSeconds > duration)
										endSeconds = -1;
									duration = endSeconds > 0 ? endSeconds : originalDuration - startSeconds;
									if (duration <= 0)
										duration = originalDuration;
									const fileStats = fs.statSync(job.originalFilePath);
									this.jobLoggerInfo(job, "Original file size: " + (fileStats ? fileStats.size : 0) + " bytes");
									this.jobLoggerInfo(job, "Max file size: " + cappedFileSize + " bytes");
									this.jobLoggerInfo(job, "File length: " + originalDuration + " seconds");
									this.jobLoggerInfo(job, "Clipped length: " + duration + " seconds");
									this.jobLoggerInfo(job, "Video height: " + originalHeight + " pixels");
									this.jobLoggerInfo(job, "Frame rate: " + frameRate + " fps");
									this.jobLoggerInfo(job, "Color primaries: " + colorPrimaries + (isHDR ? " (HDR)" : " (SDR)"));
									let audioSize = 0;
									let videoSize = 0;
									if (!stripAudio) {
										let audioBitrate = ((cappedFileSize * 8) * (stripVideo ? 1 : videoEncoderSettings[job.options.basic.videoEncoder.value].encoderPresets[job.options.basic.videoEncoderPreset.value].audioFilePercent)) / duration;
										if (audioBitrate < 10240)
											audioBitrate = 10240;
										let outputChannels = numChannels;
										if (!numChannels || (audioBitrate / numChannels < 50000)) {
											if (Math.floor(audioBitrate / 30000) > 2)
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
										let outputBitDepth;
										if ((!bitDepth || bitDepth > 16) && ((audioBitrate / outputChannels) < 96000))
											outputBitDepth = 16;
										/*
										TODO: Cap audio bitrate if video bitrate would be too low
										if (audioBitrate > 32768)
										audioBitrate = 32768;
										 */
										this.jobLoggerInfo(job, "Target audio bitrate: " + audioBitrate + " bits/second");
										this.jobLoggerInfo(job, "Number of audio channels: " + numChannels + " channels");
										this.jobLoggerInfo(job, "Number of audio output channels: " + outputChannels + " channels");
										this.jobLoggerInfo(job, "Target audio bitrate per channel: " + (audioBitrate / outputChannels) + " bits/second");
										this.jobLoggerInfo(job, "Audio bit depth: " + bitDepth + " bits");
										this.jobLoggerInfo(job, "Output audio bit depth: " + (outputBitDepth ? outputBitDepth : bitDepth) + " bits");
										try {
											toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PERCENT', '0'));
											const ffmpegArgs = ["-y", "-ss", startSeconds, "-i", job.originalFilePath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate, "-vn", "-sn", "-map_chapters", "-1", "-c:a", "libopus", "-map", "0:a", ...(outputBitDepth && (outputBitDepth < bitDepth || !bitDepth) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, job.compressionData.tempAudioPath];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await ffmpeg.runWithArgs(ffmpegArgs, [{
														filter: str => {
															return str.includes("time=");
														},
														process: str => {
															try {
																const timeStr = regexPatternTime.exec(str);
																if (timeStr?.length > 1) {
																	const timeStrParts = timeStr[1].split(':');
																	const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
																	const percent = Math.round((elapsedTime / duration) * 100);
																	toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PERCENT', percent ? percent : 0));
																}
															} catch (e) {
																this.jobLoggerError(job, e);
															}
														}
													}
												]);
										} catch (e) {
											if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(job.originalFilePath);
												} catch (e) {}
											}
											if (!this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(job.compressionData.tempAudioPath);
												} catch (e) {}
											}
											throw e;
										}
										const audioStats = fs.statSync(job.compressionData.tempAudioPath);
										audioSize = audioStats ? audioStats.size : 0;
										this.jobLoggerInfo(job, "Expected audio size: " + (duration * (audioBitrate / 8)) + " bytes");
										this.jobLoggerInfo(job, "Final audio size: " + audioSize + " bytes");
									}
									let maxFrameRate = frameRate;
									if (job.options.basic.maxFps.value && (job.options.basic.maxFps.value < frameRate || !frameRate)) {
										maxFrameRate = job.options.basic.maxFps.value;
										videoFiltersPass1.push("fps=fps=" + maxFrameRate);
										videoFiltersPass2.push("fps=fps=" + maxFrameRate);
									}
									let videoBitrate = Math.floor(((cappedFileSize - audioSize) * 8) / duration);
									let maxVideoHeight = videoEncoderSettings[job.options.basic.videoEncoder.value].encoderPresets[job.options.basic.videoEncoderPreset.value].videoHeightCapFunction(videoBitrate);
									if (job.options.advanced.maxHeight.value && (job.options.advanced.maxHeight.value < originalHeight || !originalHeight)) {
										maxVideoHeight = job.options.advanced.maxHeight.value;
									}
									if (maxVideoHeight < originalHeight || (!originalHeight && maxVideoHeight)) {
										videoFiltersPass1.push("scale=-1:" + maxVideoHeight + ",scale=trunc(iw/2)*2:" + maxVideoHeight);
										videoFiltersPass2.push("scale=-1:" + maxVideoHeight + ",scale=trunc(iw/2)*2:" + maxVideoHeight);
									}
									this.jobLoggerInfo(job, "Max frame rate: " + maxFrameRate + " fps");
									this.jobLoggerInfo(job, "Target video bitrate: " + videoBitrate + " bits/second");
									this.jobLoggerInfo(job, "Max frame height: " + maxVideoHeight + " pixels");
									this.jobLoggerInfo(job, "Output frame height: " + (maxVideoHeight < originalHeight || (!originalHeight && maxVideoHeight) ? maxVideoHeight : originalHeight) + " pixels");
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_VIDEO_PASS_PERCENT', '1', '0'));
										const ffmpegArgs = ["-y", "-ss", startSeconds, "-i", job.originalFilePath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:v", videoBitrate, "-maxrate", videoBitrate, "-bufsize", videoBitrate, ...(videoFiltersPass1.length > 0 ? ["-vf", videoFiltersPass1.join(",")] : []), "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.basic.videoEncoder.value, "-pass", "1", "-passlogfile", job.compressionData.tempVideoTwoPassPath, "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")];
										job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
										await ffmpeg.runWithArgs(ffmpegArgs, [{
													filter: str => {
														return str.includes("time=");
													},
													process: str => {
														try {
															const timeStr = regexPatternTime.exec(str);
															if (timeStr?.length > 1) {
																const timeStrParts = timeStr[1].split(':');
																const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
																const percent = Math.round((elapsedTime / duration) * 100);
																toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_VIDEO_PASS_PERCENT', '1', percent ? percent : 0));
															}
														} catch (e) {
															this.jobLoggerError(job, e);
														}
													}
												}, ...(job.options.advanced.autoCrop.value ? [{
															filter: str => {
																return str.includes("crop=");
															},
															process: str => {
																try {
																	const cropStr = regexPatternCrop.exec(str);
																	if (cropStr?.length > 1) {
																		const cropStrParts = cropStr[1].split(':');
																		if (cropStrParts.length == 4) {
																			const tempCropSettings = cropStrParts.map(val => parseInt(val));
																			if (tempCropSettings.every(val => !isNaN(val))) {
																				if (tempCropSettings[0] > autoCropSettings[0]) {
																					autoCropSettings[0] = tempCropSettings[0];
																				}
																				if (tempCropSettings[1] > autoCropSettings[1]) {
																					autoCropSettings[1] = tempCropSettings[1];
																				}
																				if (tempCropSettings[2] < autoCropSettings[2] || autoCropSettings[2] == -1) {
																					autoCropSettings[2] = tempCropSettings[2];
																				}
																				if (tempCropSettings[3] < autoCropSettings[3] || autoCropSettings[3] == -1) {
																					autoCropSettings[3] = tempCropSettings[3];
																				}
																			}
																		}
																	}
																} catch (e) {
																	this.jobLoggerError(job, e);
																}
															}
														}
													]
													 : [])
											]);
									} catch (e) {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!stripAudio && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempVideoPath);
											} catch (e) {}
										}
										throw e;
									}
									if (job.options.advanced.autoCrop.value && autoCropSettings.length == 4 && autoCropSettings.every(val => typeof val !== 'undefined')) {
										const autoCropSettingsStr = autoCropSettings.join(':');
										this.jobLoggerInfo(job, "Video crop settings: " + autoCropSettingsStr);
										videoFiltersPass2.unshift("crop=" + autoCropSettingsStr);
									}
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_VIDEO_PASS_PERCENT', '2', '0'));
										const ffmpegArgs = ["-y", "-ss", startSeconds, "-i", job.originalFilePath, ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:v", videoBitrate, "-maxrate", videoBitrate, "-bufsize", videoBitrate, ...(videoFiltersPass2.length > 0 ? ["-vf", videoFiltersPass2.join(",")] : []), "-an", "-sn", "-map_chapters", "-1", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.basic.videoEncoder.value, "-pass", "2", "-passlogfile", job.compressionData.tempVideoTwoPassPath, job.compressionData.tempVideoPath];
										job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
										await ffmpeg.runWithArgs(ffmpegArgs, [{
													filter: str => {
														return str.includes("time=");
													},
													process: str => {
														try {
															const timeStr = regexPatternTime.exec(str);
															if (timeStr?.length > 1) {
																const timeStrParts = timeStr[1].split(':');
																const elapsedTime = (parseFloat(timeStrParts[0]) * 360) + (parseFloat(timeStrParts[1]) * 60) + parseFloat(timeStrParts[2]);
																const percent = Math.round((elapsedTime / duration) * 100);
																toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_VIDEO_PASS_PERCENT', '2', percent ? percent : 0));
															}
														} catch (e) {
															this.jobLoggerError(job, e);
														}
													}
												}
											]);
									} catch (e) {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.tempVideoPath);
											} catch (e) {}
										}
										throw e;
									}
									if (!fs.existsSync(job.compressionData.tempVideoPath)) {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
										}
										throw new Error("Cannot find FFmpeg output");
									} else {
										const fileStats = fs.statSync(job.compressionData.tempVideoPath);
										videoSize = fileStats ? fileStats.size : 0;
										this.jobLoggerInfo(job, "Expected video only size: " + (duration * (videoBitrate / 8)) + " bytes");
										this.jobLoggerInfo(job, "Final video only size: " + videoSize + " bytes");
									}
									try {
										if (!mkvmerge) {
											toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
											const ffmpegArgs = ["-y", ...(!stripAudio ? ["-i", job.compressionData.tempAudioPath] : []), "-i", job.compressionData.tempVideoPath, "-c", "copy", job.compressionData.compressedPathPre];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await ffmpeg.runWithArgs(ffmpegArgs);
										} else {
											toasts.setToast(job.jobId, i18n.FORMAT('PACKAGING_PERCENT', '0'));
											const mkvmergeArgs = ["-o", job.compressionData.compressedPathPre, job.compressionData.tempVideoPath, ...(!stripAudio ? [job.compressionData.tempAudioPath] : [])];
											job.logs.push("[" + job.file.name + "] Running MKVmerge with " + mkvmergeArgs.join(" "));
											await mkvmerge.runWithArgs(mkvmergeArgs, str => {
												return str.includes("Progress: ");
											}, str => {
												try {
													const progressStr = regexPatternProgress.exec(str);
													if (progressStr?.length > 1)
														toasts.setToast(job.jobId, i18n.FORMAT('PACKAGING_PERCENT', progressStr[1]));
												} catch (e) {
													this.jobLoggerError(job, e);
												}
											});
										}
									} catch (e) {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.tempVideoPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
										}
										throw e;
									}
									if (fs.existsSync(job.compressionData.compressedPathPre)) {
										fs.renameSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
									} else {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.tempVideoPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
										}
										throw new Error("Cannot find MKVmerge output");
									}
									if (fs.existsSync(job.compressionData.compressedPath)) {
										if (fs.existsSync(job.compressionData.compressedPath)) {
											const finalFileStats = fs.statSync(job.compressionData.compressedPath);
											const finalFileSize = finalFileStats ? finalFileStats.size : 0;
											this.jobLoggerInfo(job, "Final file size: " + finalFileSize + " bytes");
											this.jobLoggerInfo(job, "Upload size cap: " + maxUploadSize + " bytes");
											if (finalFileSize > maxUploadSize) {
												throw new Error("File bigger allowed by Discord");
											}
										}
										if (cache) {
											cache.addToCache(job.compressionData.compressedPath, job.compressionData.name + ".webm", job.fileKey);
										}
										const retFile = new File([fs.readFileSync(job.compressionData.compressedPath).buffer], job.compressionData.name + ".webm", {
											type: job.file.type
										});
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.tempVideoPath);
											} catch (e) {}
										}
										if (!cache && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.compressedPath);
											} catch (e) {}
										}
										return retFile;
									} else {
										if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.originalFilePath);
											} catch (e) {}
										}
										if (!this.settings.compressor.keepTemp) {
											try {
												fs.rmSync(job.compressionData.tempAudioPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.tempVideoPath);
											} catch (e) {}
											try {
												fs.rmSync(job.compressionData.compressedPathPre);
											} catch (e) {}
										}
										throw new Error("Cannot find MKVmerge output");
									}
								} catch (e) {
									if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
										try {
											fs.rmSync(job.originalFilePath);
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

				// Wait for image to finish loading
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

				// Main function to compress a given image
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
						toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
						const retFile = new File([image.outputData], image.file.name, {
							type: image.file.type
						});
						if (cache) {
							cache.saveAndCache(retFile, job.fileKey);
						}
						return retFile;
					}
					throw new Error("Unable to compress image");
				}

				// Internal recursive loop
				async compressImageLoop(job, image) {
					image.iterations++;
					toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_TRY_NUMBER', image.iterations));
					image.outputData = await this.compressImageCanvas(image, job.options);
					if (image.outputData.size >= maxUploadSize) {
						if (image.iterations >= job.options.basic.maxIterations.value) {
							throw new Error("Max iterations reached while compressing image");
						} else {
							return await this.compressImageLoop(job, image);
						}
					} else {
						return image;
					}
				}

				// Compress HTML canvas to target size
				async compressImageCanvas(image, options) {
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d");
					const multiplier = Math.pow(options.basic.sizeMultiplier.value, image.iterations);
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
						case "toastPosition":
							this.updateToastCSS();
							break;
						case "cachePath":
							this.updateCache();
							break;
						}
						break;
					}
				}

				async handleUserSettingsChange() {
					i18n.updateLocale(DiscordModules.UserSettingsStore.locale);
				}

			};

		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
