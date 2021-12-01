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
			version: "1.0.0",
			description: "Automatic URL decoder.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/URLDecode.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/URLDecode.plugin.js"
		},
		changelog: [{
				title: "Initial Release",
				type: "added",
				items: [
					"Automatically decodes URLs in chat and embeds."
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

			return class URLDecode extends Plugin {
				constructor() {
					super();
					this.onStart = this.onStart.bind(this);
					this.getSettingsPanel = this.getSettingsPanel.bind(this);
					this.saveSettings = this.saveSettings.bind(this);
				}

				onStart() {
					Patcher.before(WebpackModules.find(e => e?.default ?.toString().indexOf("childrenMessageContent") > -1), "default", (_, args) => {
								for (const item of args) {
									if (item.childrenMessageContent) {
										const msg = item.childrenMessageContent;
										if (this.settings.general.decodeChat && !msg.chatDecoded) {
											if (Symbol.iterator in msg.props.content) {
												for (const elem of msg.props.content) {
													if (!(elem instanceof String || typeof elem === "string")) {
														if (elem.props && elem.props.href) {
															const newUrl = this.decodeText(elem.props.href);
															elem.props.title = newUrl;
															elem.props.children.forEach((element, index, arr) => {
																arr[index] = arr[index].replace(elem.props.href, newUrl);
															});
															elem.props.href = newUrl;
														}
													}
												}
											}
										}
										if (this.settings.general.decodeEmbed && !msg.embedDecoded) {
											if (msg.props.message.embeds && Symbol.iterator in msg.props.message.embeds) {
												for (const embed of msg.props.message.embeds) {
													if (embed.url) {
														embed.url = this.decodeText(embed.url);
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
							if (text)
								return decodeURIComponent(text.replace(/\+/g, " "));
							return null;
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
