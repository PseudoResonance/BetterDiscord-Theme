/**
 * @name XposeCompanion
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/XposeCompanion.plugin.js
 */

module.exports = (() => {
	const config = {
		info: {
			name: "XposeCompanion",
			authors:
			[{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "2.2.4",
			description: "Companion plugin for Xpose theme.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/XposeCompanion.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/XposeCompanion.plugin.js"
		},
		changelog: [{
				title: "Fixed Error",
				type: "fixed",
				items: [
					"Fixed folder colors disappearing"
				]
			}
		],
		defaultConfig: [{
				type: 'category',
				id: 'appearance',
				name: 'Appearance Settings',
				collapsible: true,
				shown: true,
				settings: [{
						name: 'Expanded server folder has color',
						id: 'guildFolderColor',
						type: 'switch',
						value: 'true'
					}
				]
			}
		]
	};

	var _XposeCompanion = null;

	return !global.ZeresPluginLibrary ? class{
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
				DiscordModules,
				DOMTools,
				PluginUtilities,
				Patcher
			} = Api;

			const guildListObserver = new MutationObserver(function (mutationsList, observer) {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						for (const node of mutation.addedNodes) {
							if (_XposeCompanion.listStartsWith(node.classList, "wrapper-")) {
								const entry = DOMTools.query('[class^="expandedFolderBackground-"]', node);
								if (entry != null) {
									var icon = DOMTools.query('[class^="folderIconWrapper-"]', entry.nextSibling);
									var backgroundColor = icon.style.backgroundColor;
									if (backgroundColor == "") {
										backgroundColor = DOMTools.query('[class^="expandedFolderIconWrapper-"] > svg', icon).style.color;
										backgroundColor = backgroundColor.substring(0, backgroundColor.length - 1) + ", 0.4";
									}
									entry.style.backgroundColor = backgroundColor;
								}
							} else if (_XposeCompanion.listStartsWith(node.classList, "expandedFolderBackground-")) {
								var icon = DOMTools.query('[class^="folderIconWrapper-"]', node.nextSibling);
								var backgroundColor = icon.style.backgroundColor;
								if (backgroundColor == "") {
									backgroundColor = DOMTools.query('[class^="expandedFolderIconWrapper-"] > svg', icon).style.color;
									backgroundColor = "rgba" + backgroundColor.substring(3, backgroundColor.length - 1) + ", 0.4)";
								}
								node.style.backgroundColor = backgroundColor;
							}
						}
					} else if (mutation.type === 'attributes') {
						if (_XposeCompanion.listStartsWith(mutation.target.classList, "folderIconWrapper-")) {
							const backgroundColor = mutation.target.style.backgroundColor;
							if (backgroundColor != "")
								DOMTools.parents(mutation.target, '[class^="listItem-"]')[0].previousSibling.style.backgroundColor = backgroundColor;
						} else if (mutation.target.nodeName == 'svg' && _XposeCompanion.listStartsWith(mutation.target.parentElement.classList, "expandedFolderIconWrapper-")) {
							var backgroundColor = mutation.target.style.color;
							backgroundColor = "rgba" + backgroundColor.substring(3, backgroundColor.length - 1) + ", 0.4)";
							DOMTools.parents(mutation.target, '[class^="listItem-"]')[0].previousSibling.style.backgroundColor = backgroundColor;
						}
					}
				}
			});

			return class XposeCompanion extends Plugin{
				constructor() {
					super();
					_XposeCompanion = this;
					this.updateFolderBackgrounds = this.updateFolderBackgrounds.bind(this);
					this.handleUserSettingsChange = this.handleUserSettingsChange.bind(this);
				}

				onStart() {
					this.updateFolderBackgrounds();
					DiscordModules.UserSettingsStore.addChangeListener(this.handleUserSettingsChange);
				}

				onStop() {
					Patcher.unpatchAll();
					guildListObserver.disconnect();
					DiscordModules.UserSettingsStore.removeChangeListener(this.handleUserSettingsChange);
				}

				updateFolderBackgrounds() {
					if (this.settings.appearance.guildFolderColor) {
						guildListObserver.observe(document.querySelector('[data-list-id="guildsnav"]'), {
							subtree: true,
							childList: true,
							attributeFilter: ["style"]
						});
						var folderBackgrounds = document.querySelectorAll('[class^="expandedFolderBackground-"]');
						for (var i = 0; i < folderBackgrounds.length; i++) {
							var icon = DOMTools.query('[class^="folderIconWrapper-"]', folderBackgrounds[i].nextSibling);
							var backgroundColor = icon.style.backgroundColor;
							if (backgroundColor == "") {
								backgroundColor = DOMTools.query('[class^="expandedFolderIconWrapper-"] > svg', icon).style.color;
								backgroundColor = "rgba" + backgroundColor.substring(3, backgroundColor.length - 1) + ", 0.4)";
							}
							folderBackgrounds[i].style.backgroundColor = backgroundColor;
						}
					} else {
						guildListObserver.disconnect();
						var folderBackgrounds = document.querySelectorAll('[class^="expandedFolderBackground-"]');
						for (var i = 0; i < folderBackgrounds.length; i++) {
							folderBackgrounds[i].style.backgroundColor = null;
						}
					}
				}

				getSettingsPanel() {
					const panel = this.buildSettingsPanel();
					return panel.getElement();
				}

				saveSettings(category, setting, value) {
					this.settings[category][setting] = value;
					PluginUtilities.saveSettings(config.info.name, this.settings);
					if (category === 'appearance') {
						if (setting === 'guildFolderColor') {
							this.updateFolderBackgrounds();
						}
					}
				}

				async handleUserSettingsChange() {
					this.updateFolderBackgrounds();
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
