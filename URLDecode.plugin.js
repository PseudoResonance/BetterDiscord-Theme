/**
 * @name URLDecode
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/URLDecode.plugin.js
 */

module.exports = (() => {
	const config = {
		info: {
			name: "URLDecode",
			authors:
			[{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "1.0.6",
			description: "URL/embed decoder for non-ASCII text.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/URLDecode.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/URLDecode.plugin.js"
		},
		changelog: [{
				title: "Fixed",
				type: "fixed",
				items: [
					"Fixed unrecognizable URLs turning into empty strings"
				]
			}
		],
		defaultConfig: [{
				type: 'category',
				id: 'general',
				name: 'General Settings',
				collapsible: true,
				shown: true,
				settings: [{
						name: 'Decode chat URLs',
						id: 'decodeChat',
						type: 'switch',
						value: 'true'
					}, {
						name: 'Decode embed titles',
						id: 'decodeEmbed',
						type: 'switch',
						value: 'true'
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
				PluginUtilities,
				WebpackModules,
				Patcher
			} = Api;

			class StripInvalidTrailingEncoding {
				/**
				 * https://github.com/jridgewell/strip-invalid-trailing-encoding
				 *
				 * MIT License
				 *
				 * Copyright (c) 2017 Justin Ridgewell
				 *
				 * Permission is hereby granted, free of charge, to any person obtaining a copy
				 * of this software and associated documentation files (the "Software"), to deal
				 * in the Software without restriction, including without limitation the rights
				 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
				 * copies of the Software, and to permit persons to whom the Software is
				 * furnished to do so, subject to the following conditions:
				 *
				 * The above copyright notice and this permission notice shall be included in all
				 * copies or substantial portions of the Software.
				 *
				 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
				 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
				 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
				 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
				 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
				 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
				 * SOFTWARE.
				 */

				/**
				 * Parses a (possibly) hex char into its int value.
				 * If the char is not valid hex char, returns 16.
				 *
				 * @param {string} char
				 * @return {number}
				 */
				static toHex(char) {
					const i = char.charCodeAt(0);
					// 0 - 9
					if (i >= 48 && i <= 57) {
						return i - 48;
					}

					const a = (i | 0x20);
					// Normalize A-F into a-f.
					if (a >= 97 && a <= 102) {
						return a - 87;
					}

					// Invalid Hex
					return 16;
				}

				/**
				 * Determines if a '%' character occurs in the last 3 characters of a string.
				 * If none, returns 3.
				 *
				 * @param {string} string
				 * @param {number} length
				 * @return {boolean}
				 */
				static hasPercent(string, length) {
					if (length > 0 && string[length - 1] === '%') {
						return 1;
					}
					if (length > 1 && string[length - 2] === '%') {
						return 2;
					}
					if (length > 2 && string[length - 3] === '%') {
						return 0;
					}

					return 3;
				}

				/**
				 * Strips invalid Percent Encodings that occur at the end of a string.
				 * This is highly optimized to trim only _broken_ sequences at the end.
				 *
				 * Note that this **IS NOT** a string sanitizer. It will not prevent native
				 * decodeURIComponent from throwing errors. This is only to prevent "good"
				 * strings that were invalidly truncated in the middle of a percent encoding
				 * from throwing. Attackers can craft strings will not be "fixed" by stripping.
				 *
				 * @param {string} string
				 * @param {number} length The length of the string.
				 * @param {number} shift Position of the rightmost %.
				 * @return {string, stripped} Stripped string and stripped portion
				 */
				static _strip(string, length, shift) {
					let end = length - shift;
					let num = -shift;
					let high = '8';
					let low = '0';
					let continuation = false;

					for (let pos = length - 1; pos >= 0; pos--) {
						const char = string[pos];
						num++;

						if (char !== '%') {
							// If we have backtracked 3 characters and we don't find a "%", we know the
							// string did not end in an encoding.
							if (num % 3 === 0) {
								if (continuation) {
									// Someone put extra continuations.
									return {
										string: "",
										stripped: string
									};
								}

								break;
							}

							// Else, we need to keep backtracking.
							low = high;
							high = char;
							continue;
						}

						const h = this.toHex(high);
						const l = this.toHex(low);
						if (h === 16 || l === 16) {
							// Someone put non hex values.
							return {
								string: "",
								stripped: string
							};
						}

						// &    %26
						// %26  00100110
						// α    %CE%B1
						// %CE  11001110
						// %B1  10110001
						// ⚡   %E2%9A%A1
						// %E2  11100010
						// %9A  10011010
						// %A1  10100001
						// 𝝰    %F0%9D%9D%B0
						// %F0  11110000
						// %9D  10011101
						// %9D  10011101
						// %B0  10110000
						// Single encodings are guaranteed to have a leading "0" bit in the byte.
						// The first of a multi sequence always starts with "11" bits, while the
						// "continuation"s always start with "10" bits.
						// Spec: http://www.ecma-international.org/ecma-262/6.0/#table-43
						const isSingle = (h & 8) === 0;
						const isContinuationStart = (~h & 12) === 0;

						if (isSingle || isContinuationStart) {
							continuation = false;

							// If a single is full (has 3 chars), we don't need to truncate it.
							// If a continuation is full (chars depends on the offset of the leftmost
							// "0" bit), we don't need to truncate it.
							let escapes = 3;
							if (isContinuationStart) {
								if ((h & 2) === 0) {
									escapes = 6;
								} else if ((h & 1) === 0) {
									escapes = 9;
								} else if ((l & 8) === 0) {
									escapes = 12;
								} else if (num > 0 && num % 3 === 0) {
									// Someone put random hex values together.
									return {
										string: "",
										stripped: string
									};
								}
							}

							if (num > escapes) {
								// Someone put extra continuations.
								return {
									string: "",
									stripped: string
								};
							}

							if (num < escapes) {
								// We're at a broken sequence, truncate to here.
								end = pos;
							}

							break;
						} else {
							// A trailing % does not count as a continuation.
							if (pos < length - 1) {
								continuation = true;
							}
						}

						// Detect possible DOS attacks. Credible strings can never be worse than
						// the longest (4) escape sequence (3 chars) minus one (the trim).
						if (num > 4 * 3 - 1) {
							return {
								string: "",
								stripped: string
							};
						}

						// Intentionally set a bad hex value
						high = low = 'e';
					}

					if (end === length) {
						return {
							string,
							stripped: ""
						};
					}

					return {
						string: string.substr(0, end),
						stripped: string.substr(end, length)
					};
				}

				static strip(string) {
					const length = string.length;
					const shift = this.hasPercent(string, length);

					// If no % in the last 3 chars, then the string wasn't trimmed.
					if (shift === 3) {
						return {
							string,
							stripped: ""
						};
					}

					return this._strip(string, length, shift);
				}
			}

			return class URLDecode extends Plugin {
				constructor() {
					super();
					this.onStart = this.onStart.bind(this);
					this.getSettingsPanel = this.getSettingsPanel.bind(this);
					this.saveSettings = this.saveSettings.bind(this);
				}

				onStart() {
					const msgModule = WebpackModules.find(e => e?.default ?.toString().indexOf("childrenMessageContent") > -1);
							Patcher.before(msgModule, "default", (_, args) => {
								for (const item of args) {
									if (item.childrenMessageContent) {
										const msg = item.childrenMessageContent;
										if (this.settings.general.decodeChat) {
											if (msg.props && msg.props.content && Symbol.iterator in msg.props.content) {
												for (const elem of msg.props.content) {
													if (!(elem instanceof String || typeof elem === "string")) {
														if (elem.props && elem.props.href) {
															const newUrl = this.decodeText(elem.props.href);
															elem.props.title = newUrl;
															elem.props.children.forEach((element, index, arr) => {
																if (element instanceof String || typeof element === "string") {
																	arr[index] = arr[index].replace(elem.props.href, newUrl);
																}
															});
														}
													}
												}
											}
										}
										if (this.settings.general.decodeEmbed) {
											if (msg.props && msg.props.message && msg.props.message.embeds && Symbol.iterator in msg.props.message.embeds) {
												for (const embed of msg.props.message.embeds) {
													if (embed.url) {
														embed.rawTitle = this.decodeText(embed.rawTitle);
														embed.rawDescription = this.decodeText(embed.rawDescription);
													}
												}
											}
										}
									}
								}
							});
				}

				onStop() {
					Patcher.unpatchAll();
				}

				decodeText(text) {
					if (text) {
						text = text.replace(/\+/g, " ");
						try {
							return decodeURIComponent(text);
						} catch {
							try {
								let suffix = "";
								if (text.endsWith("...")) {
									text = text.slice(0, -3);
									suffix = "...";
								}
								const strippedData = StripInvalidTrailingEncoding.strip(text);
								if (strippedData.string) {
									return decodeURIComponent(strippedData.string) + suffix;
								}
							} catch {}
						}
					}
					return text;
				}

				getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}

				saveSettings(category, setting, value) {
					this.settings[category][setting] = value;
					PluginUtilities.saveSettings(config.info.name, this.settings);
				}

			}

		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
