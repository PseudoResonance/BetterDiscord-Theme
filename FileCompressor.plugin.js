/**
 * @name FileCompressor
 * @author PseudoResonance
 * @version 2.0.14
 * @description Automatically compress files that are too large to send.
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js
 * @updateUrl https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js
 */

//TODO Allow for the selection of different cached files from runs with different options
//TODO Get file properties before asking for options to pre-populate fields with current settings and allow for additional options - which audio tracks to mix, which subtitle track to burn, which video track to use
//TODO Add button to bypass compression
//TODO Add setting to screen all files to check if Discord can embed them and reencode if not
//TODO Refactor to use state-based processing of video/audio and store data to config file to attempt compression recovery if Discord/plugin is stopped

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
			version: "2.0.14",
			description: "Automatically compress files that are too large to send.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/FileCompressor.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/FileCompressor.plugin.js"
		},
		changelog: [{
				title: "Added",
				type: "added",
				items: [
					"Global option to use included ReplayGain tags to speed up audio normalization (off by default)",
				]
			}, {
				title: "Broken",
				type: "removed",
				items: [
					"Several features are still broken such as automatic channel switcing"
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
							return i18n.MESSAGES.SETTINGS_COMPRESS_ALL
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_COMPRESS_ALL_DESC
						},
						id: 'compressAll',
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
							return i18n.MESSAGES.SETTINGS_AUDIO_NORMALIZATION_USE_REPLAYGAIN
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_AUDIO_NORMALIZATION_USE_REPLAYGAIN_DESC
						},
						id: 'useReplaygain',
						type: 'switch',
						value: false
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
							return i18n.MESSAGES.SETTINGS_COMPANION_APP
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_COMPANION_APP_DESC
						},
						id: 'companionApp',
						type: 'switch',
						value: false
					}, {
						get name() {
							return i18n.MESSAGES.SETTINGS_COMPANION_PORT
						},
						get note() {
							return i18n.MESSAGES.SETTINGS_COMPANION_PORT_DESC
						},
						id: 'companionPort',
						type: 'textbox',
						value: 38494
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
			SETTINGS_COMPRESS_ALL: 'Compress All',
			SETTINGS_COMPRESS_ALL_DESC: 'Prompt to compress all compressible files.',
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
			SETTINGS_AUDIO_NORMALIZATION_USE_REPLAYGAIN: 'Normalize Audio With ReplayGain Tags Where Possible',
			SETTINGS_AUDIO_NORMALIZATION_USE_REPLAYGAIN_DESC: 'Use included ReplayGain tags instead of FFmpeg to normalize audio.',
			SETTINGS_CONCURRENT_THREADS: 'Concurrent Compression Jobs',
			SETTINGS_CONCURRENT_THREADS_DESC: 'Number of compression jobs that can be processing simultaneously.',
			SETTINGS_CACHE_PATH: 'Cache Location',
			SETTINGS_CACHE_PATH_DESC: 'Custom file cache location to use (Leave empty to use default location).',
			SETTINGS_COMPANION_APP: 'Use Companion App',
			SETTINGS_COMPANION_APP_DESC: 'Use companion app for video/audio compression.',
			SETTINGS_COMPANION_PORT: 'Companion App Port',
			SETTINGS_COMPANION_PORT_DESC: 'Port used to connect to companion app.',
			SETTINGS_KEEP_TEMP: 'Keep Temp Files',
			SETTINGS_KEEP_TEMP_DESC: 'Retain temporary files after compression.',
			COMPRESSION_OPTIONS_TITLE: '{$0$} Compression Options',
			COMPRESSION_OPTIONS_CATEGORIES_CACHE: 'Cache Options',
			COMPRESSION_OPTIONS_CATEGORIES_TRACK: 'Track Options',
			COMPRESSION_OPTIONS_CATEGORIES_BASIC: 'Basic Options',
			COMPRESSION_OPTIONS_CATEGORIES_ADVANCED: 'Advanced Options',
			COMPRESSION_OPTIONS_VIDEO_TRACK: 'Video Track',
			COMPRESSION_OPTIONS_VIDEO_TRACK_INFO: '{$0$}: {$1$} ({$2$}×{$3$})',
			COMPRESSION_OPTIONS_AUDIO_TRACK: 'Audio Track',
			COMPRESSION_OPTIONS_AUDIO_TRACK_INFO: '{$0$}: {$1$} ({$2$} Channels)',
			COMPRESSION_OPTIONS_SUBTITLE_TRACK: 'Subtitle Track',
			COMPRESSION_OPTIONS_SUBTITLE_TRACK_INFO: '{$0$}: {$1$}',
			COMPRESSION_OPTIONS_BURN_SUBTITLES: 'Burn Subtitles',
			COMPRESSION_OPTIONS_BURN_SUBTITLES_DESC: 'Burns subtitles permanently into the video',
			COMPRESSION_OPTIONS_USE_CACHE: 'Use Cached File',
			COMPRESSION_OPTIONS_USE_CACHE_DESC: 'Use the previously cached file.',
			COMPRESSION_OPTIONS_SIZE_CAP: 'Size Cap (bytes)',
			COMPRESSION_OPTIONS_SIZE_CAP_DESC: 'Max file size to compress under.',
			COMPRESSION_OPTIONS_MINIMUM_PIXELS: 'Minimum Total Pixels in Image',
			COMPRESSION_OPTIONS_MINIMUM_PIXELS_DESC: 'Image is downscaled until it is smaller than this size. (Width × Height)',
			COMPRESSION_OPTIONS_QUALITY_STEP: 'Image Quality Step (0-1)',
			COMPRESSION_OPTIONS_QUALITY_STEP_DESC: 'Each iteration, the image quality is reduced by this amount.',
			COMPRESSION_OPTIONS_MAX_ITERATIONS: 'Max Iterations',
			COMPRESSION_OPTIONS_MAX_ITERATIONS_DESC: 'Maximum number of attempts to resize image.',
			COMPRESSION_OPTIONS_FILE_FORMAT: 'File Format',
			COMPRESSION_OPTIONS_VIDEO_ENCODER: 'Video Encoder',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET: 'Video Encoder Preset',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_PRESERVE_VIDEO: 'Preserve Video',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_BALANCED: 'Balanced',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_PRESERVE_AUDIO: 'Preserve Audio',
			COMPRESSION_OPTIONS_AUDIO_ENCODER: 'Audio Encoder',
			COMPRESSION_OPTIONS_MAX_HEIGHT: 'Max Video Height (pixels)',
			COMPRESSION_OPTIONS_MAX_FPS: 'Max Video FPS',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO: 'Interlace Video',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO_DESC: 'Not recommended except for the largest videos.',
			COMPRESSION_OPTIONS_DEINTERLACE_VIDEO: 'Deinterlace Video',
			COMPRESSION_OPTIONS_DEINTERLACE_VIDEO_DESC: 'For interlaced videos only.',
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
			COMPRESSION_OPTIONS_NORMALIZE_AUDIO: 'Normalize Audio',
			COMPRESSION_OPTIONS_NORMALIZE_AUDIO_DESC: 'Adjusts volume to broadcast standards.',
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
			SETTINGS_COMPRESS_ALL: 'すべてを圧縮',
			SETTINGS_COMPRESS_ALL_DESC: 'すべての圧縮可能なファイルを圧縮するプロンプト。',
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
			SETTINGS_AUDIO_NORMALIZATION_USE_REPLAYGAIN: 'ReplayGainのタグで音声をノーマライズ',
			SETTINGS_AUDIO_NORMALIZATION_USE_REPLAYGAIN_DESC: '音声をノーマライズするのにReplayGainのタグが存在するときにはFFmpegの代わりに使う。',
			SETTINGS_CONCURRENT_THREADS: '同時圧縮ジョブ',
			SETTINGS_CONCURRENT_THREADS_DESC: '同時で圧縮できるジョブの数。',
			SETTINGS_CACHE_PATH: 'キャッシュの所在',
			SETTINGS_CACHE_PATH_DESC: 'ファイルキャッシュの所在（デフォルト使うには空のまま）。',
			SETTINGS_COMPANION_APP: 'コンパニオンアプリを使用する',
			SETTINGS_COMPANION_APP_DESC: '動画と音声を圧縮するためにコンパニオンアプリを使用する。',
			SETTINGS_COMPANION_PORT: 'コンパニオンアプリのポート',
			SETTINGS_COMPANION_PORT_DESC: 'コンパニオンアプリへの通信ポート。',
			SETTINGS_KEEP_TEMP: '一時ファイルを保持',
			SETTINGS_KEEP_TEMP_DESC: '圧縮後に一時ファイルを保持する。',
			COMPRESSION_OPTIONS_TITLE: '{$0$}　圧縮設定',
			COMPRESSION_OPTIONS_CATEGORIES_CACHE: 'キャッシュ設定',
			COMPRESSION_OPTIONS_CATEGORIES_TRACK: 'トラック設定',
			COMPRESSION_OPTIONS_CATEGORIES_BASIC: '基本設定',
			COMPRESSION_OPTIONS_CATEGORIES_ADVANCED: '高度設定',
			COMPRESSION_OPTIONS_VIDEO_TRACK: '動画トラック',
			COMPRESSION_OPTIONS_VIDEO_TRACK_INFO: '{$0$}: {$1$} ({$2$}×{$3$})',
			COMPRESSION_OPTIONS_AUDIO_TRACK: '音声トラック',
			COMPRESSION_OPTIONS_AUDIO_TRACK_INFO: '{$0$}: {$1$} ({$2$}チャンネル)',
			COMPRESSION_OPTIONS_SUBTITLE_TRACK: '字幕トラック',
			COMPRESSION_OPTIONS_SUBTITLE_TRACK_INFO: '{$0$}: {$1$}',
			COMPRESSION_OPTIONS_BURN_SUBTITLES: '字幕を書き込む',
			COMPRESSION_OPTIONS_BURN_SUBTITLES_DESC: '動画に字幕を恒久的に書き込む',
			COMPRESSION_OPTIONS_USE_CACHE: 'キャッシュされたファイルュを使用',
			COMPRESSION_OPTIONS_USE_CACHE_DESC: '以前にキャッシュされたファイルを使用する。',
			COMPRESSION_OPTIONS_SIZE_CAP: '最大ファイルサイズ（bytes）',
			COMPRESSION_OPTIONS_SIZE_CAP_DESC: '圧縮するときの最大なファイルサイズ。',
			COMPRESSION_OPTIONS_MINIMUM_PIXELS: '画像の最小ピクセル数',
			COMPRESSION_OPTIONS_MINIMUM_PIXELS_DESC: 'このサイズより小さくなるまで画像のサイズが縮小されます。　（横×縦）',
			COMPRESSION_OPTIONS_QUALITY_STEP: '試行ごとに画像の画質ステップ　（0-1）',
			COMPRESSION_OPTIONS_QUALITY_STEP_DESC: '試行ごとに画像の画質がこの量で低下します。',
			COMPRESSION_OPTIONS_MAX_ITERATIONS: '最大試行回数',
			COMPRESSION_OPTIONS_MAX_ITERATIONS_DESC: '画像圧縮の最大試行回数。',
			COMPRESSION_OPTIONS_FILE_FORMAT: 'ファイル形式',
			COMPRESSION_OPTIONS_VIDEO_ENCODER: '動画エンコーダー',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET: '動画エンコーダープリセット',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_PRESERVE_VIDEO: '動画を保存',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_BALANCED: 'バランス',
			COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_PRESERVE_AUDIO: '音声を保存',
			COMPRESSION_OPTIONS_AUDIO_ENCODER: '音声エンコーダー',
			COMPRESSION_OPTIONS_MAX_HEIGHT: '最大動画の高さ（ピクセル）',
			COMPRESSION_OPTIONS_MAX_FPS: '最大動画のFPS',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO: '動画をインターレース',
			COMPRESSION_OPTIONS_INTERLACE_VIDEO_DESC: '最大の動画以外に推奨されません。',
			COMPRESSION_OPTIONS_DEINTERLACE_VIDEO: '動画をインターレース解除',
			COMPRESSION_OPTIONS_DEINTERLACE_VIDEO_DESC: 'インターレース動画のみ。',
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
			COMPRESSION_OPTIONS_NORMALIZE_AUDIO: '音声をノーマライズ',
			COMPRESSION_OPTIONS_NORMALIZE_AUDIO_DESC: '音量を放送規格に調整。',
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

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

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
			const uuidv4 = () => crypto.randomUUID().replaceAll('-', '');

			// Cache container
			let cache = null;

			// Subtitle information
			const imageSubtitleFormats = ["hdmv_pgs_subtitle", "dvdsub"];
			// Video container settings
			const videoContainerSettings = {
				"mkv": {
					containerFormat: "matroska",
					fileTypeDiscord: "webm"
				},
				"mp4": {
					containerFormat: "mp4",
					fileTypeDiscord: "mp4"
				}
			};
			// Default video encoder settings
			const videoEncoderSettings = {
				"libx264": {
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
					},
					encoderFlags: [],
					defaultContainer: "mp4",
					defaultAudioEncoder: "aac"
				},
				"libvpx-vp9": {
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
					},
					encoderFlags: ["-row-mt", "1"],
					defaultContainer: "mkv",
					defaultAudioEncoder: "libopus"
				}
			};
			const videoEncoderPresets = {
				"preserveVideo": "COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_PRESERVE_VIDEO",
				"balanced": "COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_BALANCED",
				"preserveAudio": "COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET_PRESERVE_AUDIO",
			};
			// Audio container settings
			const audioContainerSettings = {
				"m4a": {
					containerFormat: "ipod",
					fileTypeDiscord: "m4a"
				},
				"mp3": {
					containerFormat: "mp3",
					fileTypeDiscord: "mp3"
				},
				"opus": {
					containerFormat: "opus",
					fileTypeDiscord: "ogg"
				}
			};
			// Default audio encoder settings
			const audioEncoderSettings = {
				"aac": {
					encoderOptions: {
						bitDepthFunction: (bitrate, numChannels, bitDepth) => {
							if ((bitrate / numChannels) < 45000)
								return 16;
							else if (!bitDepth)
								return null;
							else if ((bitrate / numChannels) < 90000)
								return 24;
							return null;
						},
						numChannelsFunction: (bitrate, numChannels) => {
							if (!numChannels)
								return 1;
							if (bitrate / numChannels < 70000) {
								if (Math.floor(bitrate / 45000) > 2)
									return 2;
								else
									return 1;
							}
							return numChannels;
						},
						bitRateMinClampFunction: (bitrate) => {
							return bitrate;
						},
						bitRateMinClampVideoFunction: (bitrate) => {
							if (bitrate < 20480)
								return 20480;
							return bitrate;
						},
						bitRateMaxClampFunction: (bitrate, numChannels) => {
							return bitrate;
						}
					},
					encoderFlags: [],
					defaultContainer: "m4a",
					defaultVideoContainer: "mp4"
				},
				"libmp3lame": {
					encoderOptions: {
						bitDepthFunction: (bitrate, numChannels, bitDepth) => {
							if ((bitrate / numChannels) < 45000)
								return 16;
							else if (!bitDepth)
								return null;
							else if ((bitrate / numChannels) < 90000)
								return 24;
							return null;
						},
						numChannelsFunction: (bitrate, numChannels) => {
							if (!numChannels)
								return 1;
							if (bitrate / numChannels < 70000) {
								if (Math.floor(bitrate / 45000) > 2)
									return 2;
								else
									return 1;
							}
							return numChannels;
						},
						bitRateMinClampFunction: (bitrate) => {
							return bitrate;
						},
						bitRateMinClampVideoFunction: (bitrate) => {
							if (bitrate < 20480)
								return 20480;
							return bitrate;
						},
						bitRateMaxClampFunction: (bitrate, numChannels) => {
							return bitrate;
						}
					},
					encoderFlags: [],
					defaultContainer: "mp3",
					defaultVideoContainer: "mkv"
				},
				"libopus": {
					encoderOptions: {
						bitDepthFunction: (bitrate, numChannels, bitDepth) => {
							if ((bitrate / numChannels) < 30000)
								return 16;
							else if (!bitDepth)
								return null;
							else if ((bitrate / numChannels) < 60000)
								return 24;
							return null;
						},
						numChannelsFunction: (bitrate, numChannels) => {
							if (!numChannels)
								return 1;
							if (bitrate / numChannels < 50000) {
								if (Math.floor(bitrate / 30000) > 2)
									return 2;
								else
									return 1;
							}
							return numChannels;
						},
						bitRateMinClampFunction: (bitrate) => {
							if (bitrate < 500)
								return 500;
							return bitrate;
						},
						bitRateMinClampVideoFunction: (bitrate) => {
							if (bitrate < 10240)
								return 10240;
							return bitrate;
						},
						bitRateMaxClampFunction: (bitrate, numChannels) => {
							if (bitrate * numChannels > 256000)
								return 256000;
							return bitrate;
						}
					},
					encoderFlags: [],
					defaultContainer: "opus",
					defaultVideoContainer: "mkv"
				}
			};
			// Color primaries that will be detected as HDR and will be tonemapped
			const hdrColorPrimaries = ["bt2020"];
			const regexPatternTime = /time=(\d+:\d+:\d+.\d+)/;
			const regexPatternCrop = /crop=(\d+:\d+:\d+:\d+)/;
			const regexPatternProgress = /Progress: (\d{1,3})%/;

			// Persistent toasts container
			let toasts = null;

			// Companion app manager
			let companion = null;
			const companionUuid = uuidv4();

			// Temp folder
			let tempDataPath = null;

			// Queue for files waiting to be compressed
			let processingQueue = [];
			// List of currently running jobs
			let runningJobs = [];
			// List of currently running processes
			let runningProcesses = [];

			// Toast icon SVGs
			const loadingSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M12,0v2C6.48,2,2,6.48,2,12c0,3.05,1.37,5.78,3.52,7.61l1.15-1.66C5.04,16.48,4,14.36,4,12c0-4.41,3.59-8,8-8v2l2.59-1.55l2.11-1.26L17,3L12,0z"/><path d="M18.48,4.39l-1.15,1.66C18.96,7.52,20,9.64,20,12c0,4.41-3.59,8-8,8v-2l-2.59,1.55L7.3,20.82L7,21l5,3v-2c5.52,0,10-4.48,10-10C22,8.95,20.63,6.22,18.48,4.39z"/></svg>`;
			const queueSvg = `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M21.84,1H2.16l7.15,11L2.16,23h19.68l-7.15-11L21.84,1z M11.69,12L5.84,3h12.31l-5.85,9H11.69z"/></svg>`;

			// Original Discord upload function before patch
			let originalUploadFunction = null;

			const Companion = class {
				constructor(settings) {
					this.settings = settings;
					this.closed = false;
					this.inUse = false;
					this.ready = false;
					this.messages = {};
					this.jobs = {};
				}

				openConnection() {
					return Promise.race([new Promise((resolve, reject) => {
								if (this.settings.compressor.companionApp && !isNaN(this.settings.compressor.companionPort) && !isNaN(parseInt(this.settings.compressor.companionPort)) && this.settings.compressor.companionPort > 0) {
									this.ws = new WebSocket('ws://localhost:' + this.settings.compressor.companionPort);

									this.ws.onopen = () => {
										Logger.info(config.info.name, "Connection to companion app opened.");
										this.ws.send(companionUuid);
									};

									this.ws.onmessage = (e) => {
										if (!this.ready) {
											if (companionUuid === e.data) {
												this.ready = true;
												Logger.info(config.info.name, "Connection to companion app ready.");
												resolve();
											}
										} else {
											const data = JSON.parse(e.data);
											if (data.id) {
												if (data.id in this.messages) {
													this.messages[data.id](data.data);
													delete this.messages[data.id];
												} else if (data.id in this.jobs) {
													this.jobs[data.id](data.data);
												}
											}
										}
									};

									this.ws.onclose = (e) => {
										if (this.inUse && !this.closed) {
											Logger.err(config.info.name, "Connection to companion app closed. Retrying connection in 1 second.", e);
											setTimeout(() => {
												this.openConnection();
											}, 1000);
										} else {
											Logger.err(config.info.name, "Connection to companion app closed.", e);
											reject(e);
										}
									};

									this.ws.onerror = (e) => {
										this.ws.close();
										if (this.inUse && !this.closed) {
											Logger.err(config.info.name, "Error while communicating with companion app. Retrying connection in 1 second.", e);
											setTimeout(() => {
												this.openConnection();
											}, 1000);
										} else {
											Logger.err(config.info.name, "Error while communicating with companion app.", e);
											reject(e);
										}
									};
								} else {
									reject("Companion app support disabled or invalid companion app port.");
								}
							}), new Promise((resolve, reject) => {
								setTimeout(() => {
									reject("Connection handshake timed out!");
								}, 5000);
							})]);
				}

				closeConnection() {
					this.closed = true;
					this.ws?.close();
				}

				async sendMessage(data, timeout) {
					return Promise.race([new Promise((resolve, reject) => {
								const msg = {
									id: uuidv4(),
									data: data
								};
								this.messages[msg.id] = resolve;
								this.ws.send(JSON.stringify(msg));
							}), new Promise((resolve, reject) => {
								setTimeout(() => {
									reject("Message timed out!");
								}, timeout);
							})]);
				}

				async sendJob(data, timeout) {
					this.inUse = true;
					return Promise.race([new Promise((resolve, reject) => {
								const msg = {
									id: uuidv4(),
									data: data
								};
								const eventTarget = new EventTarget();
								this.messages[msg.id] = (result) => {
									resolve({
										id: msg.id,
										eventTarget: eventTarget,
										data: result
									})
								};
								this.jobs[msg.id] = (packet) => {
									switch (packet.type) {
									case 'error':
										eventTarget.dispatchEvent(new CustomEvent('error', {
												detail: packet.error
											}));
										delete this.jobs[msg.id];
										if (Object.keys(this.jobs).length == 0)
											this.inUse = false;
										break;
									case 'exit':
										eventTarget.dispatchEvent(new CustomEvent('exit', {
												detail: {
													code: packet.code,
													signal: packet.signal
												}
											}));
										delete this.jobs[msg.id];
										if (Object.keys(this.jobs).length === 0)
											this.inUse = false;
										break;
									case 'data':
										eventTarget.dispatchEvent(new CustomEvent('data', {
												detail: packet.data
											}));
										break;
									}
								};
								this.ws.send(JSON.stringify(msg));
							}), new Promise((resolve, reject) => {
								setTimeout(() => {
									reject("Message timed out!");
								}, timeout);
							})]);
				}

				async getTempFolder() {
					const data = await this.sendMessage({
						type: 'tmpDir'
					}, 5000);
					if (data.type === 'tmpDir') {
						if ('tmpDir' in data) {
							return data.tmpDir;
						} else {
							return null;
						}
					}
				}

				async getMimeType(path) {
					const data = await this.sendMessage({
						type: 'mime'
					}, 5000);
					if (data.type === 'mime') {
						if ('mimetype' in data) {
							return data.mimetype;
						} else {
							return null;
						}
					}
				}

				async requestAppStatus(appName) {
					const data = await this.sendMessage({
						type: 'appStatus',
						appName: appName
					}, 5000);
					if (data.type === 'appStatus' && data.appName === appName) {
						return data.status;
					}
				}

				async runWithArgs(app, args, outputFilters = []) {
					const filterArr = [];
					const processArr = [];
					for (const key in outputFilters) {
						if (typeof(outputFilters[key].filter) == "function" && typeof(outputFilters[key].process) == "function") {
							filterArr.push(outputFilters[key].filter);
							processArr.push(outputFilters[key].process);
						}
					}
					if (await this.requestAppStatus(app)) {
						return new Promise((resolve, reject) => {
							const rollingOutputBuffer = [];
							Logger.info(config.info.name, 'Running ' + app + ' ' + args.join(' '));
							this.sendJob({
								type: 'runApp',
								appName: app,
								args: args
							}, 5000).then((msg) => {
								if (!(msg.data.type === 'runApp' && msg.data.appName === app) || msg.data.result !== true) {
									if (msg.data.error) {
										reject(msg.data.error);
									}
								} else if (msg.data.result === true) {
									msg.eventTarget.addEventListener('error', e => {
										const err = e.detail;
										Logger.err(config.info.name, err);
										reject(err);
										runningProcesses = runningProcesses.filter(p => p !== process);
									});
									msg.eventTarget.addEventListener('exit', e => {
										const code = e.detail.code;
										const signal = e.detail.signal;
										if (code == 0) {
											resolve(true);
										} else {
											Logger.err(config.info.name, rollingOutputBuffer.join("\r\n"));
											reject();
										}
										runningProcesses = runningProcesses.filter(p => p !== process);
									});
									msg.eventTarget.addEventListener('data', e => {
										const data = e.detail;
										const str = data;
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
									runningProcesses?.push(msg.id);
								} else {
									reject();
								}
							}).catch((e) => {
								reject(e);
							});
						});
					} else {
						throw new Error(app + " not found");
					}
				}

				async execWithArgs(app, args) {
					if (await this.requestAppStatus(app)) {
						return new Promise((resolve, reject) => {
							Logger.info(config.info.name, 'Running ' + app + ' ' + args.join(' '));
							this.sendMessage({
								type: 'execApp',
								appName: app,
								args: args
							}, 5000).then((msg) => {
								if (!(msg.type === 'execApp' && msg.appName === app) || msg.result !== true) {
									if (msg.error) {
										reject(msg.error);
									}
								} else if (msg.result === true) {
									if (msg.data.err) {
										Logger.err(config.info.name, msg.data.stderr);
										reject(msg.data.err);
									}
									resolve({
										data: msg.data.stdout,
										error: msg.data.err
									});
								} else {
									reject();
								}
							}).catch((e) => {
								reject(e);
							});
						});
					} else {
						throw new Error(app + " not found");
					}
				}

				checkCompanion() {
					return this.ws && this.ws.readyState == WebSocket.OPEN && this.ready;
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
					//fs.accessSync(this.cachePath, fs.constants.R_OK | fs.constants.W_OK); //TODO Access check
					this.clear();
				}

				async hash(file, percentageCallback) {
					const totalBytes = file.size;
					let bytesProcessed = 0;
					const sha256 = this.sha256();
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
									resolve(sha256.digest().hex());
									return;
								}
								sha256.update(value);
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

				/*
				Copyright 2022 Andrea Griffini

				Permission is hereby granted, free of charge, to any person obtaining
				a copy of this software and associated documentation files (the
				"Software"), to deal in the Software without restriction, including
				without limitation the rights to use, copy, modify, merge, publish,
				distribute, sublicense, and/or sell copies of the Software, and to
				permit persons to whom the Software is furnished to do so, subject to
				the following conditions:

				The above copyright notice and this permission notice shall be
				included in all copies or substantial portions of the Software.

				THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
				EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
				MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
				NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
				LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
				OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
				WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
				 */
				// sha256(data) returns the digest
				// sha256() returns an object you can call .add(data) zero or more time and .digest() at the end
				// digest is a 32-byte Uint8Array instance with an added .hex() function.
				// Input should be either a string (that will be encoded as UTF-8) or an array-like object with values 0..255.
				sha256(data) {
					let h0 = 0x6a09e667,
					h1 = 0xbb67ae85,
					h2 = 0x3c6ef372,
					h3 = 0xa54ff53a,
					h4 = 0x510e527f,
					h5 = 0x9b05688c,
					h6 = 0x1f83d9ab,
					h7 = 0x5be0cd19,
					tsz = 0,
					bp = 0;
					const k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
						0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
						0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
						0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
						0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
						0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
						0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
						0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
					rrot = (x, n) => (x >>> n) | (x << (32 - n)),
					w = new Uint32Array(64),
					buf = new Uint8Array(64),
					process = () => {
						for (let j = 0, r = 0; j < 16; j++, r += 4) {
							w[j] = (buf[r] << 24) | (buf[r + 1] << 16) | (buf[r + 2] << 8) | buf[r + 3];
						}
						for (let j = 16; j < 64; j++) {
							let s0 = rrot(w[j - 15], 7) ^ rrot(w[j - 15], 18) ^ (w[j - 15] >>> 3);
							let s1 = rrot(w[j - 2], 17) ^ rrot(w[j - 2], 19) ^ (w[j - 2] >>> 10);
							w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
						}
						let a = h0,
						b = h1,
						c = h2,
						d = h3,
						e = h4,
						f = h5,
						g = h6,
						h = h7;
						for (let j = 0; j < 64; j++) {
							let S1 = rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25),
							ch = (e & f) ^ ((~e) & g),
							t1 = (h + S1 + ch + k[j] + w[j]) | 0,
							S0 = rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22),
							maj = (a & b) ^ (a & c) ^ (b & c),
							t2 = (S0 + maj) | 0;
							h = g;
							g = f;
							f = e;
							e = (d + t1) | 0;
							d = c;
							c = b;
							b = a;
							a = (t1 + t2) | 0;
						}
						h0 = (h0 + a) | 0;
						h1 = (h1 + b) | 0;
						h2 = (h2 + c) | 0;
						h3 = (h3 + d) | 0;
						h4 = (h4 + e) | 0;
						h5 = (h5 + f) | 0;
						h6 = (h6 + g) | 0;
						h7 = (h7 + h) | 0;
						bp = 0;
					},
					update = data => {
						if (typeof data === "string") {
							data = typeof TextEncoder === "undefined" ? Buffer.from(data) : (new TextEncoder).encode(data);
						}
						for (let i = 0; i < data.length; i++) {
							buf[bp++] = data[i];
							if (bp === 64)
								process();
						}
						tsz += data.length;
					},
					digest = () => {
						buf[bp++] = 0x80;
						if (bp == 64)
							process();
						if (bp + 8 > 64) {
							while (bp < 64)
								buf[bp++] = 0x00;
							process();
						}
						while (bp < 58)
							buf[bp++] = 0x00;
						// Max number of bytes is 35,184,372,088,831
						let L = tsz * 8;
						buf[bp++] = (L / 1099511627776.) & 255;
						buf[bp++] = (L / 4294967296.) & 255;
						buf[bp++] = L >>> 24;
						buf[bp++] = (L >>> 16) & 255;
						buf[bp++] = (L >>> 8) & 255;
						buf[bp++] = L & 255;
						process();
						let reply = new Uint8Array(32);
						reply[0] = h0 >>> 24;
						reply[1] = (h0 >>> 16) & 255;
						reply[2] = (h0 >>> 8) & 255;
						reply[3] = h0 & 255;
						reply[4] = h1 >>> 24;
						reply[5] = (h1 >>> 16) & 255;
						reply[6] = (h1 >>> 8) & 255;
						reply[7] = h1 & 255;
						reply[8] = h2 >>> 24;
						reply[9] = (h2 >>> 16) & 255;
						reply[10] = (h2 >>> 8) & 255;
						reply[11] = h2 & 255;
						reply[12] = h3 >>> 24;
						reply[13] = (h3 >>> 16) & 255;
						reply[14] = (h3 >>> 8) & 255;
						reply[15] = h3 & 255;
						reply[16] = h4 >>> 24;
						reply[17] = (h4 >>> 16) & 255;
						reply[18] = (h4 >>> 8) & 255;
						reply[19] = h4 & 255;
						reply[20] = h5 >>> 24;
						reply[21] = (h5 >>> 16) & 255;
						reply[22] = (h5 >>> 8) & 255;
						reply[23] = h5 & 255;
						reply[24] = h6 >>> 24;
						reply[25] = (h6 >>> 16) & 255;
						reply[26] = (h6 >>> 8) & 255;
						reply[27] = h6 & 255;
						reply[28] = h7 >>> 24;
						reply[29] = (h7 >>> 16) & 255;
						reply[30] = (h7 >>> 8) & 255;
						reply[31] = h7 & 255;
						reply.hex = () => {
							let res = "";
							reply.forEach(x => res += ("0" + x.toString(16)).slice(-2));
							return res;
						};
						return reply;
					};
					if (data === undefined)
						return {
							update,
							digest
						};
					update(data);
					return digest();
				}

				getFileKey(file) {
					if (file) {
						if (file.path && file.size && file.lastModified) {
							return file.size + file.lastModified + file.path;
						}
					}
					return null;
				}

				async getFile(fileKey) {
					if (fileKey) {
						let entry = this.cacheLookup.get(fileKey);
						if (entry) {
							if (fs.existsSync(entry.path)) {
								return new File([fs.readFileSync(entry.path, null).buffer], entry.name, {
									type: await companion.getMimeType(entry.path)
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
					fs.readdir(this.cachePath, null, (err, files) => {
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

			const copyFileSync = (source, destination) => {
				const data = fs.readFileSync(source, new ArrayBuffer());
				fs.writeFileSync(destination, data);
			};

			return class FileCompressor extends Plugin {
				constructor() {
					super();
					this.onStart = this.onStart.bind(this);
					this.onStop = this.onStop.bind(this);
					this.updateToastCSS = this.updateToastCSS.bind(this);
					this.monkeyPatch = this.monkeyPatch.bind(this);
					this.updateCache = this.updateCache.bind(this);
					this.initCompanion = this.initCompanion.bind(this);
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
					WebpackModules.getByProps("locale", "initialize")?.addChangeListener(this.handleUserSettingsChange);
					// Setup cache
					this.updateCache();
					// Setup toasts
					toasts = new Toasts();
					i18n.updateLocale(DiscordModules.LocaleManager._chosenLocale ?? i18n.DEFAULT_LOCALE);
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
					let getMaxFileSizeKey = null;
					const setGetMaxFileSizeKey = (val) => {
						getMaxFileSizeKey = val;
					};
					const getMaxFileSizeModule = ZeresPluginLibrary.WebpackModules.getModule((m) => {
						for (const k in m) {
							if (typeof m[k] === 'function') {
								let s = m[k].toString();
								if (s.includes("getUserMaxFileSize") && s.includes("premiumTier")) {
									setGetMaxFileSizeKey(k);
									return true;
								}
							}
						}
					});
					this.getMaxFileSize = (...args) => {
						return getMaxFileSizeModule[getMaxFileSizeKey](...args);
					}
					this.getCurrentSidebarChannelId = (...args) => {
						const func = BdApi.findModuleByProps('getCurrentSidebarChannelId').getCurrentSidebarChannelId;
						if (func) {
							this.getCurrentSidebarChannelId = func;
						}
						return func(...args);
					}
					this.gotoThread = (...args) => {
						const func = BdApi.findModuleByProps('gotoThread').gotoThread;
						if (func) {
							this.gotoThread = func;
						}
						return func(...args);
					}
				}

				onStop() {
					// Remove patches
					Patcher.unpatchAll();
					// Remove event listeners
					WebpackModules.getByProps("locale", "initialize")?.removeChangeListener(this.handleUserSettingsChange);
					// Remove toasts module
					if (toasts)
						toasts.remove();
					toasts = null;
					// Remove file selector module
					FileSelector.remove();
					// Killing running processes
					//TODO Stop running processes when shutdown
					companion?.closeConnection();
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

				async monkeyPatch() {
					let promptToUploadKey = null;
					const setPromptToUploadKey = (val) => {
						promptToUploadKey = val;
					};
					const promptToUploadModule = await BdApi.Webpack.waitForModule((m) => {
						for (const k in m) {
							if (typeof m[k] === 'function') {
								let s = m[k].toString();
								if (s.includes("instantBatchUpload") && s.includes("showLargeMessageDialog")) {
									setPromptToUploadKey(k);
									return true;
								}
							}
						}
					});
					if (promptToUploadModule) {
						this.promptToUpload = promptToUploadModule[promptToUploadKey];
						if (this.promptToUpload && this.promptToUpload.length === 3) {
							Patcher.instead(promptToUploadModule, promptToUploadKey, (t, args, originalFunc) => {
								if (args[3].fileCompressorCompressedFile) {
									return originalFunc(...args);
								} else {
									return this.handleUploadEvent(...args);
								}
							});
							Logger.info(config.info.name, "Successfully hooked into Discord upload handler!");
						} else {
							BdApi.showToast(i18n.MESSAGES.ERROR_HOOKING_UPLOAD, {
								type: "error"
							});
							if (this.originalUploadFunction) {
								Logger.err(config.info.name, "Unable to hook into Discord upload handler! Method " + this.originalUploadFunction + (this.originalUploadFunction ? " has " + this.originalUploadFunction.length + " arguments!" : " doesn't exist!"));
							} else {
								Logger.err(config.info.name, "Unable to hook into Discord upload handler! Method doesn't exist in promptToUpload: " + promptToUploadModule);
							}
						}
					} else {
						BdApi.showToast(i18n.MESSAGES.ERROR_HOOKING_UPLOAD, {
							type: "error"
						});
						Logger.err(config.info.name, "Unable to hook into Discord upload handler! promptToUpload module doesn't exist!");
					}
					//TODO Fix file selector button
					/**
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
					 */
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
						Logger.err(config.info.name, "Error setting up cache!", err);
					}
				}

				initCompanion() {
					return new Promise((resolve, reject) => {
						let noCompanion = false;
						if (this.settings.compressor.companionApp && !isNaN(this.settings.compressor.companionPort) && !isNaN(parseInt(this.settings.compressor.companionPort)) && this.settings.compressor.companionPort > 0) {
							if (!companion || !companion.checkCompanion()) {
								try {
									companion = new Companion(this.settings);
									(async() => {
										try {
											await companion.openConnection();
											resolve(true);
										} catch (e) {
											reject(e);
										}
									})();
								} catch (err) {
									Logger.err(config.info.name, err);
									noCompanion = true;
									companion = null;
								}
							}
						}
						if (noCompanion) {
							Modals.showAlertModal(i18n.FORMAT('LIBRARY_VERSION_REQUIRED', "FileCompressorCompanion", "1.0.0"), i18n.FORMAT('LIBRARY_CUSTOM_PATH_INVALID', config.info.name, "FileCompressorCompanion"));
							reject();
						}
					});
				}

				getCurrentChannel() {
					return DiscordModules.ChannelStore.getChannel(DiscordModules.SelectedChannelStore.getChannelId());
				}

				async initTempFolder() {
					const path = await companion.getTempFolder();
					if (path) {
						this.tempDataPath = path;
						return true;
					} else {
						return false;
					}
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

				async processUploadFileList(files, guildId, channelId, threadId, sidebar) {
					// Check account status and update max file upload size
					const settingsMaxSize = this.settings.upload.maxFileSize != 0 ? this.settings.upload.maxFileSize : 0;
					let maxDiscordSize = 8388608;
					try {
						maxDiscordSize = this.getMaxFileSize(guildId);
					} catch (e) {
						Logger.err(config.info.name, e);
						BdApi.showToast(i18n.MESSAGES.ERROR_GETTING_ACCOUNT_INFO, {
							type: "error"
						});
						maxDiscordSize = 8388608;
					}
					const uploadSizeCap = (settingsMaxSize > 0 && settingsMaxSize < maxDiscordSize) ? settingsMaxSize : maxDiscordSize;
					// Synthetic DataTransfer to generate FileList
					const originalDt = new DataTransfer();
					const tempFiles = [];
					let queuedFiles = 0;
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						if (file.size > uploadSizeCap || this.settings.upload.compressAll) {
							// If file is returned, it was incompressible
							let type = file.type;
							if (!type && file.path) {
								if (!companion || !companion.checkCompanion()) {
									await this.initCompanion();
								}
								if (!companion || !companion.checkCompanion()) {
									return false;
								}
								type = await companion.getMimeType(file.path);
							}
							const tempFile = this.checkIsCompressible(file, type ? type.split('/')[0] : "", maxDiscordSize, guildId, channelId, threadId, sidebar);
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
					const sidebarThreadId = (this.getCurrentChannel() && !originalThreadId) ? this.getCurrentSidebarChannelId(originalChannelId) : null;
					if (threadId) {
						if (threadId !== sidebarThreadId && threadId !== originalThreadId) {
							if (sidebar) {
								DiscordModules.NavigationUtils.transitionToThread(!guildId ? "@me" : guildId, channelId);
								this.gotoThread(null, {
									id: threadId
								});
							} else {
								DiscordModules.NavigationUtils.transitionToThread(!guildId ? "@me" : guildId, threadId);
							}
						}
					} else {
						DiscordModules.NavigationUtils.transitionToGuild(!guildId ? "@me" : guildId, channelId);
					}
					if ((guildId ? this.getCurrentChannel().guild_id === guildId : !this.getCurrentChannel().guild_id) && (threadId ? ((this.getCurrentChannel().id === threadId && this.getCurrentChannel().parent_id === channelId) || this.getCurrentChannel().id === channelId && this.getCurrentSidebarChannelId(this.getCurrentChannel().id) === threadId) : this.getCurrentChannel().id === channelId)) {
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
						this.promptToUpload(files, channelObj, 0, {
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
				checkIsCompressible(file, type, maxSize, guildId, channelId, threadId, sidebar) {
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
							maxSize: maxSize,
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
							cacheFile = await cache.getFile(job.fileKey);
						} catch (err) {
							Logger.err(config.info.name, err);
						}
						toasts.setToast(job.jobId);
					}
					if (!await this.populateCompressionOptions(job, cacheFile)) {
						// If compression is cancelled, check if file is small enough to be sent anyways
						if (job.file.size <= job.maxSize) {
							this.sendUploadFileList(this.wrapFileInList(job.file), job.guildId, job.channelId, job.threadId, job.isSidebar);
						}
						return false;
					}
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
						track: {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_CATEGORIES_TRACK,
							shown: false
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
								for (const [key, category] of Object.entries(allCategories)) {
									if (key != "cache") {
										category.style.display = (value ? "none" : null);
									}
								}
							}
						};
					}
					job.options.track = {};
					job.options.basic = {};
					job.options.advanced = {};
					job.options.basic.sizeCap = {
						name: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_CAP,
						description: i18n.MESSAGES.COMPRESSION_OPTIONS_SIZE_CAP_DESC,
						type: "textbox",
						defaultValue: job.maxSize,
						validation: value => {
							return (!value || !isNaN(value) && !isNaN(parseInt(value)) && value > 0);
						}
					};
					let videoEncoderValuesArray = [];
					let videoEncoderPresetsValuesArray = [];
					let audioEncoderValuesArray = [];
					let videoFileFormatValuesArray = [];
					let audioFileFormatValuesArray = [];
					let ffprobeOut = null;
					switch (job.type) {
					case "image":
						job.options.basic.minPixels = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_MINIMUM_PIXELS,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_MINIMUM_PIXELS_DESC,
							type: "textbox",
							defaultValue: 10000000,
							validation: value => {
								return (!value || !isNaN(value) && !isNaN(parseInt(value)) && value > 0);
							}
						};
						job.options.basic.qualityStep = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_QUALITY_STEP,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_QUALITY_STEP_DESC,
							type: "textbox",
							defaultValue: 0.05,
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
						if (!companion || !companion.checkCompanion()) {
							await this.initCompanion();
						}
						if (!companion || !companion.checkCompanion()) {
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
						ffprobeOut = await companion.execWithArgs('ffprobe', ["-v", "error", "-show_format", "-show_streams", "-print_format", "json", job.originalFilePath.replace(/\\/g, '/')]);
						job.probeDataRaw = ffprobeOut.data;
						job.probeData = JSON.parse(ffprobeOut.data);
						for (const name of Object.getOwnPropertyNames(videoEncoderSettings)) {
							videoEncoderValuesArray.push({
								value: name,
								label: name
							});
						}
						job.videoTrackIds = [];
						job.audioTrackIds = [];
						job.subtitleTrackIds = [];
						job.otherTrackIds = [];
						for (let i = 0; i < job.probeData.streams.length; i++) {
							switch (job.probeData.streams[i].codec_type) {
							case "video":
								job.videoTrackIds.push(i);
								break;
							case "audio":
								job.audioTrackIds.push(i);
								break;
							case "subtitle":
								job.subtitleTrackIds.push(i);
								break;
							default:
								job.otherTrackIds.push(i);
								break;
							}
						}
						job.defaultVideoTrack = -1;
						job.defaultAudioTrack = -1;
						job.defaultSubtitleTrack = -1;
						if (job.videoTrackIds.length > 0) {
							let defaultTrack = job.videoTrackIds[0];
							let foundDefaultTrack = false;
							const trackDescriptions = [];
							job.videoTrackIds = job.videoTrackIds.filter(id => {
								if (job.probeData.streams[id]?.disposition?.attached_pic)
									return false;
								return true;
							});
							for (const i of job.videoTrackIds) {
								const stream = job.probeData.streams[i];
								const trackDescription = [];
								if (stream.tags && stream.tags.language && stream.tags.language != "und")
									trackDescription.push(stream.tags.language);
								if (stream.tags && stream.tags.title)
									trackDescription.push(stream.tags.title);
								trackDescriptions.push({
									value: i,
									name: i18n.FORMAT('COMPRESSION_OPTIONS_VIDEO_TRACK_INFO', i, stream.codec_name.toUpperCase(), stream.coded_width, stream.coded_height),
									...(trackDescription.length > 0 ? {
										desc: trackDescription.join(": ")
									}
										 : {})
								});
								if (!foundDefaultTrack && stream.disposition.default) {
									foundDefaultTrack = true;
									defaultTrack = i;
								}
							}
							job.defaultVideoTrack = defaultTrack;
							if (job.videoTrackIds.length > 1) {
								job.options.track.videoTrack = {
									name: i18n.MESSAGES.COMPRESSION_OPTIONS_VIDEO_TRACK,
									type: "radiogroup",
									defaultValue: defaultTrack,
									props: {
										values: trackDescriptions
									}
								};
							}
						}
						if (job.audioTrackIds.length > 0) {
							let defaultTrack = job.audioTrackIds[0];
							let foundDefaultTrack = false;
							const trackDescriptions = [];
							for (const i of job.audioTrackIds) {
								const stream = job.probeData.streams[i];
								const trackDescription = [];
								if (stream.tags && stream.tags.language && stream.tags.language != "und")
									trackDescription.push(stream.tags.language);
								if (stream.tags && stream.tags.title)
									trackDescription.push(stream.tags.title);
								trackDescriptions.push({
									value: i,
									name: i18n.FORMAT('COMPRESSION_OPTIONS_AUDIO_TRACK_INFO', i, stream.codec_name.toUpperCase(), stream.channel_layout ? stream.channel_layout : stream.channels),
									...(trackDescription.length > 0 ? {
										desc: trackDescription.join(": ")
									}
										 : {})
								});
								if (!foundDefaultTrack && stream.disposition.default) {
									foundDefaultTrack = true;
									defaultTrack = i;
								}
							}
							job.defaultAudioTrack = defaultTrack;
							if (job.audioTrackIds.length > 1) {
								job.options.track.audioTrack = {
									name: i18n.MESSAGES.COMPRESSION_OPTIONS_AUDIO_TRACK,
									type: "radiogroup",
									defaultValue: defaultTrack,
									props: {
										values: trackDescriptions
									},
									tags: ["audioValid"]
								};
							}
						}
						if (job.subtitleTrackIds.length > 0) {
							let defaultTrack = job.subtitleTrackIds[0];
							let foundDefaultTrack = false;
							const trackDescriptions = [];
							for (const i of job.subtitleTrackIds) {
								const stream = job.probeData.streams[i];
								const trackDescription = [];
								if (stream.tags && stream.tags.language && stream.tags.language != "und")
									trackDescription.push(stream.tags.language);
								if (stream.tags && stream.tags.title)
									trackDescription.push(stream.tags.title);
								trackDescriptions.push({
									value: i,
									name: i18n.FORMAT('COMPRESSION_OPTIONS_SUBTITLE_TRACK_INFO', i, stream.codec_name.toUpperCase()),
									...(trackDescription.length > 0 ? {
										desc: trackDescription.join(": ")
									}
										 : {})
								});
								if (!foundDefaultTrack && stream.disposition.default) {
									foundDefaultTrack = true;
									defaultTrack = i;
								}
							}
							job.defaultSubtitleTrack = defaultTrack;
							if (job.subtitleTrackIds.length > 1) {
								job.options.track.subtitleTrack = {
									name: i18n.MESSAGES.COMPRESSION_OPTIONS_SUBTITLE_TRACK,
									type: "radiogroup",
									defaultValue: defaultTrack,
									props: {
										values: trackDescriptions
									}
								};
							}
							job.options.track.burnSubtitles = {
								name: i18n.MESSAGES.COMPRESSION_OPTIONS_BURN_SUBTITLES,
								description: i18n.MESSAGES.COMPRESSION_OPTIONS_BURN_SUBTITLES_DESC,
								type: "switch",
								defaultValue: false
							};
						}
						job.options.basic.videoEncoder = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_VIDEO_ENCODER,
							type: "dropdown",
							defaultValue: "libx264",
							props: {
								values: videoEncoderValuesArray
							},
							onChange: (value, allCategories, allOptions) => {
								let originalShow = allOptions.advanced.audioEncoder.inputWrapper.style.display;
								job.options.advanced.audioEncoder.value = videoEncoderSettings[value].defaultAudioEncoder;
								allOptions.advanced.audioEncoder.props.value = videoEncoderSettings[value].defaultAudioEncoder;
								allOptions.advanced.audioEncoder.onRemoved();
								allOptions.advanced.audioEncoder.onAdded();
								allOptions.advanced.audioEncoder.inputWrapper.style.display = originalShow;

								originalShow = allOptions.basic.audioEncoder.inputWrapper.style.display;
								job.options.basic.audioEncoder.value = videoEncoderSettings[value].defaultAudioEncoder;
								allOptions.basic.audioEncoder.props.value = videoEncoderSettings[value].defaultAudioEncoder;
								allOptions.basic.audioEncoder.onRemoved();
								allOptions.basic.audioEncoder.onAdded();
								allOptions.basic.audioEncoder.inputWrapper.style.display = originalShow;

								originalShow = allOptions.advanced.videoFileFormat.inputWrapper.style.display;
								job.options.advanced.videoFileFormat.value = videoEncoderSettings[value].defaultContainer;
								allOptions.advanced.videoFileFormat.props.value = videoEncoderSettings[value].defaultContainer;
								allOptions.advanced.videoFileFormat.onRemoved();
								allOptions.advanced.videoFileFormat.onAdded();
								allOptions.advanced.videoFileFormat.inputWrapper.style.display = originalShow;

								originalShow = allOptions.advanced.audioFileFormat.inputWrapper.style.display;
								job.options.advanced.audioFileFormat.value = audioEncoderSettings[videoEncoderSettings[value].defaultAudioEncoder].defaultContainer;
								allOptions.advanced.audioFileFormat.props.value = audioEncoderSettings[videoEncoderSettings[value].defaultAudioEncoder].defaultContainer;
								allOptions.advanced.audioFileFormat.onRemoved();
								allOptions.advanced.audioFileFormat.onAdded();
								allOptions.advanced.audioFileFormat.inputWrapper.style.display = originalShow;
							}
						};
						for (const preset of Object.getOwnPropertyNames(videoEncoderPresets)) {
							videoEncoderPresetsValuesArray.push({
								value: preset,
								label: i18n.MESSAGES[videoEncoderPresets[preset]]
							});
						}
						for (const name of Object.getOwnPropertyNames(audioEncoderSettings)) {
							audioEncoderValuesArray.push({
								value: name,
								label: name
							});
						}
						job.options.basic.audioEncoder = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_AUDIO_ENCODER,
							type: "dropdown",
							defaultValue: "aac",
							props: {
								values: audioEncoderValuesArray
							},
							onChange: (value, allCategories, allOptions) => {
								let originalShow = allOptions.advanced.audioEncoder.inputWrapper.style.display;
								job.options.advanced.audioEncoder.value = value;
								allOptions.advanced.audioEncoder.props.value = value;
								allOptions.advanced.audioEncoder.onRemoved();
								allOptions.advanced.audioEncoder.onAdded();
								allOptions.advanced.audioEncoder.inputWrapper.style.display = originalShow;

								originalShow = allOptions.advanced.audioFileFormat.inputWrapper.style.display;
								job.options.advanced.audioFileFormat.value = audioEncoderSettings[value].defaultContainer;
								allOptions.advanced.audioFileFormat.props.value = audioEncoderSettings[value].defaultContainer;
								allOptions.advanced.audioFileFormat.onRemoved();
								allOptions.advanced.audioFileFormat.onAdded();
								allOptions.advanced.audioFileFormat.inputWrapper.style.display = originalShow;
							},
							tags: ["audioValid", "audioOnly"]
						};
						job.options.basic.videoEncoderPreset = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_VIDEO_ENCODER_PRESET,
							type: "dropdown",
							defaultValue: "balanced",
							props: {
								values: videoEncoderPresetsValuesArray
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
							defaultValue: false,
							onChange: (value, allCategories, allOptions) => {
								if (value) {
									let originalShow = allOptions.advanced.deinterlace.inputWrapper.style.display;
									job.options.advanced.deinterlace.value = !value;
									allOptions.advanced.deinterlace.props.value = !value;
									allOptions.advanced.deinterlace.onRemoved();
									allOptions.advanced.deinterlace.onAdded();
									allOptions.advanced.deinterlace.inputWrapper.style.display = originalShow;
								}
							}
						};
						job.options.advanced.deinterlace = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_DEINTERLACE_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_DEINTERLACE_VIDEO_DESC,
							type: "switch",
							defaultValue: false,
							onChange: (value, allCategories, allOptions) => {
								if (value) {
									let originalShow = allOptions.advanced.interlace.inputWrapper.style.display;
									job.options.advanced.interlace.value = !value;
									allOptions.advanced.interlace.props.value = !value;
									allOptions.advanced.interlace.onRemoved();
									allOptions.advanced.interlace.onAdded();
									allOptions.advanced.interlace.inputWrapper.style.display = originalShow;
								}
							}
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
								for (const [key, category] of Object.entries(allOptions)) {
									if (key != "cache") {
										for (const [categoryOption, element] of Object.entries(category)) {
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
								for (const [index, val] of value.split(':').entries())
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
								for (const [index, val] of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							},
							tags: ["audioValid"]
						};
						job.options.advanced.audioEncoder = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_AUDIO_ENCODER,
							type: "dropdown",
							defaultValue: "aac",
							props: {
								values: audioEncoderValuesArray
							},
							onChange: (value, allCategories, allOptions) => {
								let originalShow = allOptions.basic.audioEncoder.inputWrapper.style.display;
								job.options.basic.audioEncoder.value = value;
								allOptions.basic.audioEncoder.props.value = value;
								allOptions.basic.audioEncoder.onRemoved();
								allOptions.basic.audioEncoder.onAdded();
								allOptions.basic.audioEncoder.inputWrapper.style.display = originalShow;

								originalShow = allOptions.advanced.audioFileFormat.inputWrapper.style.display;
								job.options.advanced.audioFileFormat.value = audioEncoderSettings[value].defaultContainer;
								allOptions.advanced.audioFileFormat.props.value = audioEncoderSettings[value].defaultContainer;
								allOptions.advanced.audioFileFormat.onRemoved();
								allOptions.advanced.audioFileFormat.onAdded();
								allOptions.advanced.audioFileFormat.inputWrapper.style.display = originalShow;
							}
						};
						for (const name of Object.getOwnPropertyNames(videoContainerSettings)) {
							videoFileFormatValuesArray.push({
								value: name,
								label: name
							});
						}
						job.options.advanced.videoFileFormat = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_FILE_FORMAT,
							type: "dropdown",
							defaultValue: "mp4",
							props: {
								values: videoFileFormatValuesArray
							}
						};
						for (const name of Object.getOwnPropertyNames(audioContainerSettings)) {
							audioFileFormatValuesArray.push({
								value: name,
								label: name
							});
						}
						job.options.advanced.audioFileFormat = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_FILE_FORMAT,
							type: "dropdown",
							defaultValue: "m4a",
							props: {
								values: audioFileFormatValuesArray
							},
							tags: ["audioValid", "audioOnly"]
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
							tags: ["audioValid", "audioOnly"],
							onChange: (value, allCategories, allOptions) => {
								if (job.options.basic.stripVideo.value)
									allOptions.advanced.audioFileFormat.inputWrapper.style.display = (value ? "none" : null);
							}
						};
						job.options.advanced.normalizeAudio = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_NORMALIZE_AUDIO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_NORMALIZE_AUDIO_DESC,
							type: "switch",
							defaultValue: false,
							tags: ["audioValid", "audioOnly"]
						};
						if (await this.showSettings(i18n.FORMAT('COMPRESSION_OPTIONS_TITLE', job.file.name), job.options, job.optionsCategories, this.settings.compressor.promptOptionsVideo))
							return true;
						break;
					case "audio":
						if (!companion || !companion.checkCompanion()) {
							await this.initCompanion();
						}
						if (!companion || !companion.checkCompanion()) {
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
						ffprobeOut = await companion.execWithArgs('ffprobe', ["-v", "error", "-show_format", "-show_streams", "-print_format", "json", job.originalFilePath.replace(/\\/g, '/')]);
						job.probeDataRaw = ffprobeOut.data;
						job.probeData = JSON.parse(ffprobeOut.data);
						for (const name of Object.getOwnPropertyNames(audioEncoderSettings)) {
							audioEncoderValuesArray.push({
								value: name,
								label: name
							});
						}
						job.audioTrackIds = [];
						job.otherTrackIds = [];
						for (let i = 0; i < job.probeData.streams.length; i++) {
							switch (job.probeData.streams[i].codec_type) {
							case "audio":
								job.audioTrackIds.push(i);
								break;
							default:
								job.otherTrackIds.push(i);
								break;
							}
						}
						job.defaultAudioTrack = -1;
						if (job.audioTrackIds.length > 0) {
							let defaultTrack = job.audioTrackIds[0];
							let foundDefaultTrack = false;
							const trackDescriptions = [];
							for (const i of job.audioTrackIds) {
								const stream = job.probeData.streams[i];
								const trackDescription = [];
								if (stream.tags && stream.tags.language && stream.tags.language != "und")
									trackDescription.push(stream.tags.language);
								if (stream.tags && stream.tags.title)
									trackDescription.push(stream.tags.title);
								trackDescriptions.push({
									value: i,
									name: i18n.FORMAT('COMPRESSION_OPTIONS_AUDIO_TRACK_INFO', i, stream.codec_name.toUpperCase(), stream.channel_layout ? stream.channel_layout : stream.channels),
									...(trackDescription.length > 0 ? {
										desc: trackDescription.join(": ")
									}
										 : {})
								});
								if (!foundDefaultTrack && stream.disposition.default) {
									foundDefaultTrack = true;
									defaultTrack = i;
								}
							}
							job.defaultAudioTrack = defaultTrack;
							if (job.audioTrackIds.length > 1) {
								job.options.track.audioTrack = {
									name: i18n.MESSAGES.COMPRESSION_OPTIONS_AUDIO_TRACK,
									type: "radiogroup",
									defaultValue: defaultTrack,
									props: {
										values: trackDescriptions
									}
								};
							}
						}
						job.options.basic.audioEncoder = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_AUDIO_ENCODER,
							type: "dropdown",
							defaultValue: "libopus",
							props: {
								values: audioEncoderValuesArray
							},
							onChange: (value, allCategories, allOptions) => {
								let originalShow = allOptions.advanced.audioFileFormat.inputWrapper.style.display;
								job.options.advanced.audioFileFormat.value = audioEncoderSettings[value].defaultContainer;
								allOptions.advanced.audioFileFormat.props.value = audioEncoderSettings[value].defaultContainer;
								allOptions.advanced.audioFileFormat.onRemoved();
								allOptions.advanced.audioFileFormat.onAdded();
								allOptions.advanced.audioFileFormat.inputWrapper.style.display = originalShow;
							}
						};
						job.options.basic.startTimestamp = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_STARTING_TIMESTAMP,
							type: "textbox",
							defaultValue: "",
							validation: value => {
								for (const [index, val] of value.split(':').entries())
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
								for (const [index, val] of value.split(':').entries())
									if (index > 2 || parseFloat(val) == NaN)
										return false
										return true;
							}
						};
						for (const name of Object.getOwnPropertyNames(audioContainerSettings)) {
							audioFileFormatValuesArray.push({
								value: name,
								label: name
							});
						}
						job.options.advanced.audioFileFormat = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_FILE_FORMAT,
							type: "dropdown",
							defaultValue: "opus",
							props: {
								values: audioFileFormatValuesArray
							}
						};
						job.options.advanced.sendAsVideo = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_SEND_AS_VIDEO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_SEND_AS_VIDEO_DESC,
							type: "switch",
							defaultValue: false,
							onChange: (value, allCategories, allOptions) => {
								allOptions.advanced.audioFileFormat.inputWrapper.style.display = (value ? "none" : null);
							}
						};
						job.options.advanced.normalizeAudio = {
							name: i18n.MESSAGES.COMPRESSION_OPTIONS_NORMALIZE_AUDIO,
							description: i18n.MESSAGES.COMPRESSION_OPTIONS_NORMALIZE_AUDIO_DESC,
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
							for (const [key, value] of Object.entries(settingsElements)) {
								settingsGroups[key] = new Settings.SettingGroup(optionsCategories[key].name, {
									shown: optionsCategories[key].shown,
									collapsible: true
								}).append(...value);
							}
							// Convert elements to HTML SettingPanel objects
							for (const [key, value] of Object.entries(settingsGroups))
								settingsPanels[key] = Settings.SettingPanel.build(null, value);
							// Convert HTML to React elements
							for (const [key, value] of Object.entries(settingsPanels))
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
								const downloadUrl = window.URL.createObjectURL(new Blob([job.logs.join("\n"), ...(job.probeDataRaw ? ["\n", job.probeDataRaw] : []), ...(job.probeDataFinalRaw ? ["\n", job.probeDataFinalRaw] : [])]));
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
					if (!companion || !companion.checkCompanion()) {
						await this.initCompanion();
					}
					if (companion && companion.checkCompanion()) {
						if (await this.initTempFolder()) {
							const videoContainer = audioEncoderSettings[job.options.basic.audioEncoder.value].defaultVideoContainer;
							job.compressionData.compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							job.compressionData.videoPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".mp4");
							const finalFileContainer = (job.options.advanced.sendAsVideo.value ? videoContainerSettings[videoContainer] : audioContainerSettings[job.options.advanced.audioFileFormat.value]);
							if (cache) {
								job.compressionData.compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + "." + finalFileContainer.fileTypeDiscord);
							} else {
								job.compressionData.compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + finalFileContainer.fileTypeDiscord);
							}
							toasts.setToast(job.jobId, i18n.MESSAGES.CALCULATING);
							if (job.probeData) {
								try {
									const audioStreamIndex = job.options.track.audioTrack?.value ? job.options.track.audioTrack.value : job.defaultAudioTrack;
									let compressionPass = 1;
									const audioFiltersPass1 = [];
									const audioFiltersPass2 = [];
									let twoPassCompression = false;
									const originalDuration = job.probeData.format.duration ? parseFloat(job.probeData.format.duration) : 0;
									const bitDepth = job.probeData.streams[audioStreamIndex].bits_per_raw_sample ? parseInt(job.probeData.streams[audioStreamIndex].bits_per_raw_sample) : null;
									let useReplaygain = this.settings.compressor.useReplaygain;
									let replaygainTrackGain = null;
									let replaygainTrackPeak = null;
									let replaygainAlbumGain = null;
									let replaygainAlbumPeak = null;
									let audioAdjustmentValue = 0;
									if (job.options.advanced.normalizeAudio.value && useReplaygain) {
										if (job.probeData.format.tags) {
											try {
												replaygainTrackGain = Number(job.probeData.format.tags.replaygain_track_gain.replaceAll(/[^\d+-.]/g, ""));
											} catch (e) {
												this.jobLoggerError(job, "Error while reading ReplayGain track gain", e);
											}
											try {
												replaygainTrackPeak = Math.log10(Number(job.probeData.format.tags.replaygain_track_peak.replaceAll(/[^\d+-.]/g, ""))) * 20;
											} catch (e) {
												this.jobLoggerError(job, "Error while reading ReplayGain track peak", e);
											}
											try {
												replaygainAlbumGain = Number(job.probeData.format.tags.replaygain_album_gain.replaceAll(/[^\d+-.]/g, ""));
											} catch (e) {
												this.jobLoggerError(job, "Error while reading ReplayGain album gain", e);
											}
											try {
												replaygainAlbumPeak = Math.log10(Number(job.probeData.format.tags.replaygain_album_peak.replaceAll(/[^\d+-.]/g, ""))) * 20;
											} catch (e) {
												this.jobLoggerError(job, "Error while reading ReplayGain album peak", e);
											}
											if ((replaygainAlbumGain != null && replaygainAlbumPeak != null) || (replaygainTrackGain != null && replaygainTrackPeak != null)) {
												if (replaygainAlbumGain != null && replaygainAlbumPeak != null) {
													if (replaygainAlbumGain <= 0) {
														audioAdjustmentValue = replaygainAlbumGain;
													} else {
														audioAdjustmentValue = Math.min(-1 * replaygainAlbumPeak, replaygainAlbumGain);
													}
												} else {
													if (replaygainTrackGain <= 0) {
														audioAdjustmentValue = replaygainTrackGain;
													} else {
														audioAdjustmentValue = Math.min(-1 * replaygainTrackPeak, replaygainTrackGain);
													}
												}
											} else {
												useReplaygain = false;
											}
										} else {
											useReplaygain = false;
										}
									}
									if (job.options.advanced.normalizeAudio.value) {
										if (useReplaygain) {
											this.jobLoggerInfo(job, "Normalizing audio with ReplayGain by: " + audioAdjustmentValue + "dB");
											audioFiltersPass1.push("volume=" + audioAdjustmentValue + "dB");
											audioFiltersPass2.push("volume=" + audioAdjustmentValue + "dB");
										} else {
											twoPassCompression = true;
											audioFiltersPass1.push("loudnorm=I=-24:LRA=11:TP=-2:print_format=json");
										}
									}
									const numChannels = job.probeData.streams[audioStreamIndex].channels ? parseInt(job.probeData.streams[audioStreamIndex].channels) : null;
									if (originalDuration <= 0)
										throw new Error("Invalid file duration");
									let duration = originalDuration;
									const startSecondsSplit = job.options.basic.startTimestamp.value.split(':');
									let startSeconds = 0;
									for (const [index, val] of startSecondsSplit.entries())
										startSeconds += Math.pow(60, (startSecondsSplit.length - (index + 1))) * (index + 1 == startSecondsSplit.length ? parseFloat(val) : parseInt(val));
									if (startSeconds < 0 || isNaN(startSeconds) || startSeconds >= duration)
										startSeconds = 0;
									const endSecondsSplit = job.options.basic.endTimestamp.value.split(':');
									let endSeconds = 0;
									for (const [index, val] of endSecondsSplit.entries())
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
											toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, '0'));
											const ffmpegArgs = ["-y", "-t", duration, "-f", "lavfi", "-i", "color=c=black:s=256x144", "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-vsync", "vfr", "-r", "1", job.compressionData.videoPath.replace(/\\/g, '/')];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await companion.runWithArgs('ffmpeg', ffmpegArgs);
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
										} else {
											if (job.isOriginalTemporary && !this.settings.compressor.keepTemp) {
												try {
													fs.rmSync(job.originalFilePath);
												} catch (e) {}
											}
											throw new Error("Cannot find FFmpeg output");
										}
									}
									const cappedFileSize = Math.floor((job.options.basic.sizeCap.value ? parseInt(job.options.basic.sizeCap.value) : job.maxSize)) - 10000 - emptyVideoSize;
									let audioBitrate = Math.floor((cappedFileSize * 8) / duration);
									audioBitrate = audioEncoderSettings[job.options.basic.audioEncoder.value].encoderOptions.bitRateMinClampFunction(audioBitrate);
									let outputChannels = audioEncoderSettings[job.options.basic.audioEncoder.value].encoderOptions.numChannelsFunction(audioBitrate, numChannels);
									audioBitrate = audioEncoderSettings[job.options.basic.audioEncoder.value].encoderOptions.bitRateMaxClampFunction(audioBitrate, outputChannels);
									let outputBitDepth = audioEncoderSettings[job.options.basic.audioEncoder.value].encoderOptions.bitDepthFunction(audioBitrate, outputChannels, bitDepth);
									if (outputBitDepth && (outputBitDepth < bitDepth || !bitDepth)) {
										audioFiltersPass1.push("aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp");
										audioFiltersPass2.push("aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp");
									}
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
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, '0'));
										const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-vn", "-i", job.originalFilePath.replace(/\\/g, '/'), ...(job.options.advanced.sendAsVideo.value ? ["-i", job.compressionData.videoPath.replace(/\\/g, '/')] : []), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate / 2, "-sn", "-map_chapters", "-1", "-c:a", job.options.basic.audioEncoder.value, "-map", "0:" + audioStreamIndex, ...(audioFiltersPass1.length > 0 ? ["-af", ...audioFiltersPass1] : []), "-ac", outputChannels, ...(job.options.advanced.sendAsVideo.value ? ["-map", "1:v", "-shortest"] : []), ...(twoPassCompression ? ["-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")] : ["-f", finalFileContainer.containerFormat, job.compressionData.compressedPathPre.replace(/\\/g, '/')])];
										job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
										await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
												}, ...(job.options.advanced.normalizeAudio.value && !useReplaygain ? [{
															filter: str => {
																return str.includes("[Parsed_loudnorm_");
															},
															process: str => {
																try {
																	const dataStr = str.substring(str.indexOf('\n') + 1);
																	const dataJson = JSON.parse(dataStr);
																	this.jobLoggerInfo(job, "Loudnorm Output: " + JSON.stringify(dataJson));
																	audioFiltersPass2.push("loudnorm=I=-24:LRA=11:TP=-2:measured_I=" + dataJson.input_i + ":measured_LRA=" + dataJson.input_lra + ":measured_TP=" + dataJson.input_tp + ":measured_thresh=" + dataJson.input_thresh + ":offset=" + dataJson.target_offset + ":linear=" + (dataJson.normalization_type === "dynamic" ? "false" : "true"));
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
									if (twoPassCompression) {
										compressionPass++;
										try {
											toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, '0'));
											const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-vn", "-i", job.originalFilePath.replace(/\\/g, '/'), ...(job.options.advanced.sendAsVideo.value ? ["-i", job.compressionData.videoPath.replace(/\\/g, '/')] : []), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate / 2, "-sn", "-map_chapters", "-1", "-c:a", job.options.basic.audioEncoder.value, "-map", "0:" + audioStreamIndex, ...(audioFiltersPass2.length > 0 ? ["-af", ...audioFiltersPass2] : []), "-ac", outputChannels, ...(job.options.advanced.sendAsVideo.value ? ["-map", "1:v", "-shortest"] : []), "-f", finalFileContainer.containerFormat, job.compressionData.compressedPathPre.replace(/\\/g, '/')];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
									}
									if (fs.existsSync(job.compressionData.compressedPathPre)) {
										let audioStats = fs.statSync(job.compressionData.compressedPathPre);
										let audioSize = audioStats ? audioStats.size : 0;
										const originalAudioSize = audioSize;
										this.jobLoggerInfo(job, "Expected audio size: " + (duration * (audioBitrate / 8)) + " bytes");
										this.jobLoggerInfo(job, "Final audio size: " + audioSize + " bytes");
										const maxCompressionPasses = compressionPass + 3;
										for (; compressionPass <= maxCompressionPasses; compressionPass++) {
											if (audioSize > cappedFileSize) {
												const sizeDiff = (originalAudioSize - cappedFileSize) + (Math.pow(10, (compressionPass - 2)) * 5000);
												const audioBitrateDiff = (sizeDiff * 8) / duration;
												const audioBitrateAdjusted = Math.floor(audioBitrate - audioBitrateDiff);
												this.jobLoggerInfo(job, "Adjusted target bitrate: " + audioBitrateAdjusted + " bits/second");
												this.jobLoggerInfo(job, "Adjusted target audio bitrate per channel: " + (audioBitrateAdjusted / outputChannels) + " bits/second");
												try {
													toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, '0'));
													const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-vn", "-i", job.originalFilePath.replace(/\\/g, '/'), ...(job.options.advanced.sendAsVideo.value ? ["-i", job.compressionData.videoPath.replace(/\\/g, '/')] : []), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrateAdjusted, "-maxrate", audioBitrateAdjusted, "-bufsize", audioBitrateAdjusted / 2, "-sn", "-map_chapters", "-1", "-c:a", job.options.basic.audioEncoder.value, "-map", "0:" + audioStreamIndex, ...(twoPassCompression ? (audioFiltersPass2.length > 0 ? ["-af", ...audioFiltersPass2] : []) : (audioFiltersPass1.length > 0 ? ["-af", ...audioFiltersPass1] : [])), "-ac", outputChannels, ...(job.options.advanced.sendAsVideo.value ? ["-map", "1:v", "-shortest"] : []), "-f", finalFileContainer.containerFormat, job.compressionData.compressedPathPre.replace(/\\/g, '/')];
													job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
													await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
											} else {
												break;
											}
										}
										try {
											fs.renameSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
										} catch (err) {
											copyFileSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
											fs.rmSync(job.compressionData.compressedPathPre);
										}
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
										const finalFileStats = fs.statSync(job.compressionData.compressedPath);
										const finalFileSize = finalFileStats ? finalFileStats.size : 0;
										this.jobLoggerInfo(job, "Final file size: " + finalFileSize + " bytes");
										this.jobLoggerInfo(job, "Upload size cap: " + job.maxSize + " bytes");
										if (finalFileSize > job.maxSize) {
											const ffprobeOut = await companion.execWithArgs('ffprobe', ["-v", "error", "-show_format", "-show_streams", "-print_format", "json", job.compressionData.compressedPath.replace(/\\/g, '/')]);
											job.probeDataFinalRaw = ffprobeOut.data;
											job.probeDataFinal = JSON.parse(ffprobeOut.data);
											throw new Error("File bigger than allowed by Discord");
										}
										if (cache) {
											cache.addToCache(job.compressionData.compressedPath, job.compressionData.name + "." + finalFileContainer.fileTypeDiscord, job.fileKey);
										}
										const retFile = new File([fs.readFileSync(job.compressionData.compressedPath, null).buffer], job.compressionData.name + "." + finalFileContainer.fileTypeDiscord, {
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

				joinVideoFilters(videoFilters, complex, videoStreamIndex) {
					if (!complex) {
						return ["-vf", videoFilters.join(",")];
					} else {
						let filterString = "";
						for (let i = 0; i < videoFilters.length; i++) {
							const filt = videoFilters[i];
							if (typeof filt === "string" || filt instanceof String) {
								videoFilters[i] = (i == 0 ? "[0:" + videoStreamIndex + "]" : "[F" + (i - 1) + "]") + filt + (i == videoFilters.length - 1 ? "[out]" : "[F" + i + "]");
							} else {
								for (let j = 0; j < filt.inputs.length; j++) {
									if (filt.inputs[j].length == 0) {
										filt.inputs[j] = i == 0 ? "[0:" + videoStreamIndex + "]" : "[F" + (i - 1) + "]";
									}
								}
								for (let j = 0; j < filt.outputs.length; j++) {
									if (filt.outputs[j].length == 0) {
										filt.outputs[j] = i == videoFilters.length - 1 ? "[out]" : "[F" + i + "]";
									}
								}
								filt.compiled = filt.inputs.join("") + filt.filter + filt.outputs.join("");
							}
						}
						for (const filt of videoFilters) {
							if (typeof filt === "string" || filt instanceof String) {
								filterString += filt + ",";
							} else {
								filterString += filt.compiled + ",";
							}
						}
						return ["-filter_complex", filterString.slice(0, -1)];
					}
				}

				// Main function to compress a given video
				async compressVideo(job) {
					if (!companion || !companion.checkCompanion()) {
						await this.initCompanion();
					}
					if (companion && companion.checkCompanion()) {
						if (await this.initTempFolder()) {
							let stripAudio = job.options.basic.stripAudio.value && job.options.basic.stripVideo.value ? false : job.options.basic.stripAudio.value;
							const stripVideo = job.options.basic.stripAudio.value && job.options.basic.stripVideo.value ? false : job.options.basic.stripVideo.value;
							const videoContainer = videoEncoderSettings[job.options.basic.videoEncoder.value].defaultContainer;
							const audioContainer = audioEncoderSettings[job.options.advanced.audioEncoder.value].defaultContainer;
							job.compressionData.tempSubtitlePath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + ".ass");
							job.compressionData.tempAudioPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							job.compressionData.tempVideoPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							job.compressionData.tempVideoTwoPassPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							job.compressionData.compressedPathPre = path.join(this.tempDataPath, uuidv4().replace(/-/g, ""));
							if (cache) {
								job.compressionData.compressedPath = path.join(cache.getCachePath(), uuidv4().replace(/-/g, "") + "." + (!stripVideo ? videoContainerSettings[job.options.advanced.videoFileFormat.value].fileTypeDiscord : audioContainerSettings[job.options.advanced.audioFileFormat.value].fileTypeDiscord));
							} else {
								job.compressionData.compressedPath = path.join(this.tempDataPath, uuidv4().replace(/-/g, "") + "." + (!stripVideo ? videoContainerSettings[job.options.advanced.videoFileFormat.value].fileTypeDiscord : audioContainerSettings[job.options.advanced.audioFileFormat.value].fileTypeDiscord));
							}
							toasts.setToast(job.jobId, i18n.MESSAGES.CALCULATING);
							if (job.probeData) {
								try {
									const audioStreamIndex = job.options.track.audioTrack?.value ? job.options.track.audioTrack.value : job.defaultAudioTrack;
									const videoStreamIndex = job.options.track.videoTrack?.value ? job.options.track.videoTrack.value : job.defaultVideoTrack;
									const subtitleStreamIndex = job.options.track.subtitleTrack?.value ? job.options.track.subtitleTrack.value : job.defaultSubtitleTrack;
									if (audioStreamIndex < 0)
										stripAudio = true;
									if (stripVideo) {
										return this.compressAudio(job);
									}
									const videoFiltersPass1 = [];
									const videoFiltersPass2 = [];
									let videoFiltersComplex = false;
									const cappedFileSize = Math.floor((job.options.basic.sizeCap.value ? parseInt(job.options.basic.sizeCap.value) : job.maxSize)) - 150000;
									const frameRateMatchesSplit = job.probeData.streams[videoStreamIndex].r_frame_rate ? job.probeData.streams[videoStreamIndex].r_frame_rate.split('/') : null;
									const originalDuration = job.probeData.format.duration ? parseFloat(job.probeData.format.duration) : 0;
									const originalHeight = job.probeData.streams[videoStreamIndex].height ? parseInt(job.probeData.streams[videoStreamIndex].height) : null;
									const originalWidth = job.probeData.streams[videoStreamIndex].width ? parseInt(job.probeData.streams[videoStreamIndex].width) : null;
									const colorPrimaries = job.probeData.streams[videoStreamIndex].color_primaries ? job.probeData.streams[videoStreamIndex].color_primaries : null;
									const bitDepth = audioStreamIndex >= 0 && job.probeData.streams[audioStreamIndex].bits_per_raw_sample ? parseInt(job.probeData.streams[audioStreamIndex].bits_per_raw_sample) : null;
									const numChannels = audioStreamIndex >= 0 && job.probeData.streams[audioStreamIndex].channels ? parseInt(job.probeData.streams[audioStreamIndex].channels) : null;
									const frameRate = frameRateMatchesSplit?.length > 1 ? (parseFloat(frameRateMatchesSplit[0]) / parseFloat(frameRateMatchesSplit[1])) : null;
									if (originalDuration == 0) {
										throw new Error("Invalid file duration");
									}
									let duration = originalDuration;
									const startSecondsSplit = job.options.basic.startTimestamp.value.split(':');
									let startSeconds = 0;
									for (const [index, val] of startSecondsSplit.entries())
										startSeconds += Math.pow(60, (startSecondsSplit.length - (index + 1))) * (index + 1 == startSecondsSplit.length ? parseFloat(val) : parseInt(val));
									if (startSeconds < 0 || isNaN(startSeconds) || startSeconds >= duration)
										startSeconds = 0;
									const endSecondsSplit = job.options.basic.endTimestamp.value.split(':');
									let endSeconds = 0;
									for (const [index, val] of endSecondsSplit.entries())
										endSeconds += Math.pow(60, (endSecondsSplit.length - (index + 1))) * (index + 1 == endSecondsSplit.length ? parseFloat(val) : parseInt(val));
									endSeconds -= startSeconds;
									if (endSeconds <= 0 || isNaN(endSeconds) == NaN || endSeconds > duration)
										endSeconds = -1;
									duration = endSeconds > 0 ? endSeconds : originalDuration - startSeconds;
									if (duration <= 0)
										duration = originalDuration;
									if (job.options.advanced.deinterlace.value) {
										videoFiltersPass1.push("yadif=mode=1");
										videoFiltersPass2.push("yadif=mode=1");
									}
									const isHDR = hdrColorPrimaries.includes(colorPrimaries);
									if (isHDR) {
										videoFiltersPass1.push("zscale=transfer=linear,tonemap=hable,zscale=transfer=bt709");
										videoFiltersPass2.push("zscale=transfer=linear,tonemap=hable,zscale=transfer=bt709");
									}
									if (job.options.track.burnSubtitles?.value) {
										if (imageSubtitleFormats.includes(job.probeData.streams[subtitleStreamIndex].codec_name)) {
											videoFiltersPass1.push({
												inputs: ["", "[0:" + subtitleStreamIndex + "]"],
												filter: "overlay",
												outputs: [""]
											});
											videoFiltersPass2.push({
												inputs: ["", "[0:" + subtitleStreamIndex + "]"],
												filter: "overlay",
												outputs: [""]
											});
											videoFiltersComplex = true;
										} else {
											const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-i", job.originalFilePath.replace(/\\/g, '/'), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-map", "0:" + subtitleStreamIndex, "-f", "ass", job.compressionData.tempSubtitlePath];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await companion.runWithArgs('ffmpeg', ffmpegArgs, []);
											videoFiltersPass1.push("ass=\'" + job.compressionData.tempSubtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/%/g, '\\%') + "\'");
											videoFiltersPass2.push("ass=\'" + job.compressionData.tempSubtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/%/g, '\\%') + "\'");
										}
									}
									const autoCropSettings = [-1, -1, -1, -1];
									if (job.options.advanced.autoCrop.value) {
										videoFiltersPass1.push("cropdetect=round=2");
										videoFiltersPass2.push("CROPDETECTPLACEHOLDER");
									}
									if (job.options.advanced.interlace.value) {
										videoFiltersPass1.push("interlace=lowpass=2");
										videoFiltersPass2.push("interlace=lowpass=2");
									}
									const fileStats = fs.statSync(job.originalFilePath);
									this.jobLoggerInfo(job, "Original file size: " + (fileStats ? fileStats.size : 0) + " bytes");
									this.jobLoggerInfo(job, "Max file size: " + cappedFileSize + " bytes");
									this.jobLoggerInfo(job, "File length: " + originalDuration + " seconds");
									this.jobLoggerInfo(job, "Clipped length: " + duration + " seconds");
									this.jobLoggerInfo(job, "Video width: " + originalWidth + " pixels");
									this.jobLoggerInfo(job, "Video height: " + originalHeight + " pixels");
									this.jobLoggerInfo(job, "Frame rate: " + frameRate + " fps");
									this.jobLoggerInfo(job, "Color primaries: " + colorPrimaries + (isHDR ? " (HDR)" : " (SDR)"));
									let audioSize = 0;
									let videoSize = 0;
									let audioBitrate = 0;
									let outputChannels = 0;
									let outputBitDepth = 0;
									if (!stripAudio) {
										audioBitrate = ((cappedFileSize * 8) * (stripVideo ? 1 : videoEncoderSettings[job.options.basic.videoEncoder.value].encoderPresets[job.options.basic.videoEncoderPreset.value].audioFilePercent)) / duration;
										if (audioBitrate < 10240)
											audioBitrate = 10240;
										audioBitrate = audioEncoderSettings[job.options.advanced.audioEncoder.value].encoderOptions.bitRateMinClampVideoFunction(audioBitrate);
										outputChannels = audioEncoderSettings[job.options.advanced.audioEncoder.value].encoderOptions.numChannelsFunction(audioBitrate, numChannels);
										audioBitrate = audioEncoderSettings[job.options.advanced.audioEncoder.value].encoderOptions.bitRateMaxClampFunction(audioBitrate, outputChannels);
										outputBitDepth = audioEncoderSettings[job.options.advanced.audioEncoder.value].encoderOptions.bitDepthFunction(audioBitrate, outputChannels, bitDepth);
										this.jobLoggerInfo(job, "Target audio bitrate: " + audioBitrate + " bits/second");
										this.jobLoggerInfo(job, "Number of audio channels: " + numChannels + " channels");
										this.jobLoggerInfo(job, "Number of audio output channels: " + outputChannels + " channels");
										this.jobLoggerInfo(job, "Target audio bitrate per channel: " + (audioBitrate / outputChannels) + " bits/second");
										this.jobLoggerInfo(job, "Audio bit depth: " + bitDepth + " bits");
										this.jobLoggerInfo(job, "Output audio bit depth: " + (outputBitDepth ? outputBitDepth : bitDepth) + " bits");
										try {
											toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PERCENT', '0'));
											const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-i", job.originalFilePath.replace(/\\/g, '/'), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrate, "-maxrate", audioBitrate, "-bufsize", audioBitrate / 2, "-vn", "-sn", "-map_chapters", "-1", "-c:a", job.options.advanced.audioEncoder.value, "-map", "0:" + audioStreamIndex, ...(outputBitDepth && (outputBitDepth < bitDepth || !bitDepth) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, "-f", audioContainerSettings[audioContainer].containerFormat, job.compressionData.tempAudioPath.replace(/\\/g, '/')];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
										const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-canvas_size", originalWidth + "x" + originalHeight, "-i", job.originalFilePath.replace(/\\/g, '/'), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:v", videoBitrate, "-maxrate", videoBitrate, "-bufsize", videoBitrate / 2, ...(videoFiltersPass1.length > 0 ? this.joinVideoFilters(videoFiltersPass1, videoFiltersComplex, videoStreamIndex) : []), "-an", "-sn", "-map_chapters", "-1", ...(videoFiltersComplex ? ["-map", "[out]"] : ["-map", "0:" + videoStreamIndex]), "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.basic.videoEncoder.value, ...videoEncoderSettings[job.options.basic.videoEncoder.value].encoderFlags, "-pass", "1", "-passlogfile", job.compressionData.tempVideoTwoPassPath, "-f", "null", (process.platform === "win32" ? "NUL" : "/dev/null")];
										job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
										await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
										for (let i = 0; i < videoFiltersPass2.length; i++) {
											if (videoFiltersPass2[i] === "CROPDETECTPLACEHOLDER")
												videoFiltersPass2[i] = "crop=" + autoCropSettingsStr;
										}
									}
									try {
										toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_VIDEO_PASS_PERCENT', '2', '0'));
										const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-canvas_size", originalWidth + "x" + originalHeight, "-i", job.originalFilePath.replace(/\\/g, '/'), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:v", videoBitrate, "-maxrate", videoBitrate, "-bufsize", videoBitrate / 2, ...(videoFiltersPass2.length > 0 ? this.joinVideoFilters(videoFiltersPass2, videoFiltersComplex, videoStreamIndex) : []), "-an", "-sn", "-map_chapters", "-1", ...(videoFiltersComplex ? ["-map", "[out]"] : ["-map", "0:" + videoStreamIndex]), "-pix_fmt", "yuv420p", "-vsync", "vfr", "-c:v", job.options.basic.videoEncoder.value, ...videoEncoderSettings[job.options.basic.videoEncoder.value].encoderFlags, "-pass", "2", "-passlogfile", job.compressionData.tempVideoTwoPassPath.replace(/\\/g, '/'), "-f", videoContainerSettings[videoContainer].containerFormat, job.compressionData.tempVideoPath.replace(/\\/g, '/')];
										job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
										await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
										if (!(await companion.requestAppStatus('mkvmerge')) || job.options.advanced.videoFileFormat.value != "mkv") {
											toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
											const ffmpegArgs = ["-y", ...(!stripAudio ? ["-i", job.compressionData.tempAudioPath.replace(/\\/g, '/')] : []), "-i", job.compressionData.tempVideoPath.replace(/\\/g, '/'), "-c", "copy", "-f", videoContainerSettings[job.options.advanced.videoFileFormat.value].containerFormat, job.compressionData.compressedPathPre.replace(/\\/g, '/')];
											job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
											await companion.runWithArgs('ffmpeg', ffmpegArgs);
										} else {
											toasts.setToast(job.jobId, i18n.FORMAT('PACKAGING_PERCENT', '0'));
											const mkvmergeArgs = ["-o", job.compressionData.compressedPathPre.replace(/\\/g, '/'), job.compressionData.tempVideoPath.replace(/\\/g, '/'), ...(!stripAudio ? [job.compressionData.tempAudioPath.replace(/\\/g, '/')] : [])];
											job.logs.push("[" + job.file.name + "] Running MKVmerge with " + mkvmergeArgs.join(" "));
											await companion.runWithArgs('mkvmerge', mkvmergeArgs, str => {
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
										try {
											fs.renameSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
										} catch (err) {
											copyFileSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
											fs.rmSync(job.compressionData.compressedPathPre);
										}
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
										const originalFinalFileStats = fs.statSync(job.compressionData.compressedPath);
										const originalFinalFileSize = originalFinalFileStats ? originalFinalFileStats.size : 0;
										let finalFileSize = originalFinalFileStats ? originalFinalFileStats.size : 0;
										this.jobLoggerInfo(job, "Final file size: " + finalFileSize + " bytes");
										this.jobLoggerInfo(job, "Upload size cap: " + job.maxSize + " bytes");
										if (finalFileSize > job.maxSize) {
											// Final file too large, recompress audio to shrink size
											if (audioStreamIndex >= 0) {
												for (let compressionPass = 2; compressionPass <= 4; compressionPass++) {
													if (finalFileSize > job.maxSize) {
														const sizeDiff = (originalFinalFileSize - cappedFileSize) + (Math.pow(10, (compressionPass - 2)) * 5000);
														const audioBitrateDiff = (sizeDiff * 8) / duration;
														const audioBitrateAdjusted = Math.floor(audioBitrate - audioBitrateDiff);
														this.jobLoggerInfo(job, "Adjusted target audio bitrate: " + audioBitrateAdjusted + " bits/second");
														this.jobLoggerInfo(job, "Adjusted target audio bitrate per channel: " + (audioBitrateAdjusted / outputChannels) + " bits/second");
														try {
															toasts.setToast(job.jobId, i18n.FORMAT('COMPRESSING_AUDIO_PASS_PERCENT', compressionPass, '0'));
															const ffmpegArgs = ["-y", ...(startSeconds > 0 ? ["-ss", startSeconds] : []), "-i", job.originalFilePath.replace(/\\/g, '/'), ...(endSeconds > 0 ? ["-to", endSeconds] : []), "-b:a", audioBitrateAdjusted, "-maxrate", audioBitrateAdjusted, "-bufsize", audioBitrateAdjusted / 2, "-vn", "-sn", "-map_chapters", "-1", "-c:a", job.options.advanced.audioEncoder.value, "-map", "0:" + audioStreamIndex, ...(outputBitDepth && (outputBitDepth < bitDepth || !bitDepth) ? ["-af", "aresample=osf=s" + outputBitDepth + ":dither_method=triangular_hp"] : []), "-ac", outputChannels, "-f", audioContainerSettings[audioContainer].containerFormat, job.compressionData.tempAudioPath.replace(/\\/g, '/')];
															job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
															await companion.runWithArgs('ffmpeg', ffmpegArgs, [{
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
																try {
																	fs.rmSync(job.compressionData.videoPath);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.tempAudioPath);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.tempVideoPath);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.compressedPath);
																} catch (e) {}
															}
															throw e;
														}
														if (fs.existsSync(job.compressionData.tempAudioPath)) {
															const audioStats = fs.statSync(job.compressionData.tempAudioPath);
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
																	fs.rmSync(job.compressionData.compressedPathPre);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.videoPath);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.tempAudioPath);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.tempVideoPath);
																} catch (e) {}
																try {
																	fs.rmSync(job.compressionData.compressedPath);
																} catch (e) {}
															}
															throw new Error("Cannot find FFmpeg output");
														}
														try {
															if (!(await companion.requestAppStatus('mkvmerge')) || job.options.advanced.videoFileFormat.value != "mkv") {
																toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
																const ffmpegArgs = ["-y", ...(!stripAudio ? ["-i", job.compressionData.tempAudioPath.replace(/\\/g, '/')] : []), "-i", job.compressionData.tempVideoPath.replace(/\\/g, '/'), "-c", "copy", "-f", videoContainerSettings[job.options.advanced.videoFileFormat.value].containerFormat, job.compressionData.compressedPathPre.replace(/\\/g, '/')];
																job.logs.push("[" + job.file.name + "] Running FFmpeg with " + ffmpegArgs.join(" "));
																await companion.runWithArgs('ffmpeg', ffmpegArgs);
															} else {
																toasts.setToast(job.jobId, i18n.FORMAT('PACKAGING_PERCENT', '0'));
																const mkvmergeArgs = ["-o", job.compressionData.compressedPathPre.replace(/\\/g, '/'), job.compressionData.tempVideoPath.replace(/\\/g, '/'), ...(!stripAudio ? [job.compressionData.tempAudioPath.replace(/\\/g, '/')] : [])];
																job.logs.push("[" + job.file.name + "] Running MKVmerge with " + mkvmergeArgs.join(" "));
																await companion.runWithArgs('mkvmerge', mkvmergeArgs, str => {
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
															try {
																fs.renameSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
															} catch (err) {
																copyFileSync(job.compressionData.compressedPathPre, job.compressionData.compressedPath);
																fs.rmSync(job.compressionData.compressedPathPre);
															}
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
															const finalFileStats = fs.statSync(job.compressionData.compressedPath);
															finalFileSize = finalFileStats ? finalFileStats.size : 0;
															this.jobLoggerInfo(job, "Final file size: " + finalFileSize + " bytes");
															this.jobLoggerInfo(job, "Upload size cap: " + job.maxSize + " bytes");
														}
													} else {
														break;
													}
												}
											} else {
												const ffprobeOut = await companion.execWithArgs('ffprobe', ["-v", "error", "-show_format", "-show_streams", "-print_format", "json", job.compressionData.compressedPath.replace(/\\/g, '/')]);
												job.probeDataFinalRaw = ffprobeOut.data;
												job.probeDataFinal = JSON.parse(ffprobeOut.data);
												throw new Error("File bigger than allowed by Discord");
											}
										}
										if (cache) {
											cache.addToCache(job.compressionData.compressedPath, job.compressionData.name + "." + videoContainerSettings[job.options.advanced.videoFileFormat.value].fileTypeDiscord, job.fileKey);
										}
										const retFile = new File([fs.readFileSync(job.compressionData.compressedPath, null).buffer], job.compressionData.name + "." + videoContainerSettings[job.options.advanced.videoFileFormat.value].fileTypeDiscord, {
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
						iterations: (job.file.type === 'image/webp' ? 0 : -1) // Start at -1 so that when the value is incremented, the first compression pass will simply convert to webp.
					};
					if (await this.compressImageLoop(job, image)) {
						toasts.setToast(job.jobId, i18n.MESSAGES.PACKAGING);
						const retFile = new File([image.outputData], (image.file.name.endsWith('.webp') ? image.file.name : image.file.name + '.webp'), {
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
					this.jobLoggerInfo(job, "Original File Type: " + job.file.type);
					if (image.iterations >= 0 && image.width * image.height >= job.options.basic.minPixels.value) {
						const sizeMultiplier = Math.sqrt(job.options.basic.minPixels.value / (image.width * image.height));
						const targetWidth = Math.floor(image.width * sizeMultiplier);
						const targetHeight = Math.floor(image.height * sizeMultiplier);
						this.jobLoggerInfo(job, "Image has " + (image.width * image.height) + " pixels. Reducing to " + (targetWidth * targetHeight) + " (" + targetWidth + "x" + targetHeight + ")");
					}
					image.outputData = await this.compressImageCanvas(job, image);
					if (image.outputData.size >= job.maxSize) {
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
				async compressImageCanvas(job, image) {
					const canvas = document.createElement("canvas");
					const context = canvas.getContext("2d");
					if (image.iterations >= 0 && image.width * image.height >= job.options.basic.minPixels.value) {
						const sizeMultiplier = Math.sqrt(job.options.basic.minPixels.value / (image.width * image.height));
						canvas.width = Math.floor(image.width * sizeMultiplier);
						canvas.height = Math.floor(image.height * sizeMultiplier);
					} else {
						canvas.width = image.width;
						canvas.height = image.height;
					}
					const targetType = 'image/webp';
					const targetQuality = 1 - (image.iterations * job.options.basic.qualityStep.value);
					this.jobLoggerInfo(job, "Attempting to compress to " + targetType + " of quality: " + targetQuality);
					context.drawImage(image.data, 0, 0, canvas.width, canvas.height);
					return new Promise((resolve, reject) => {
						canvas.toBlob((blob) => {
							resolve(blob);
						}, targetType, targetQuality);
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
						case "companionApp":
						case "companionPort":
							this.initCompanion();
							break;
						}
						break;
					}
				}

				async handleUserSettingsChange() {
					i18n.updateLocale(DiscordModules.LocaleManager._chosenLocale ?? i18n.DEFAULT_LOCALE);
				}

			};

		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
