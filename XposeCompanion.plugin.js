/**
 * @name XposeCompanion
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/XposeCompanion.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "XposeCompanion",
			authors:
			[
				{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "2.1.1",
			description: "Companion plugin for Xpose theme.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/XposeCompanion.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/XposeCompanion.plugin.js"
		},
		changelog: [
			{
				title: "Xpose Theme Options",
				type: "added",
				items: [
					"Option to change folder color to to match when expanded"
				]
			}
		],
		defaultConfig: [
			{
				type: 'category',
				id: 'appearance',
				name: 'Appearance Settings',
				collapsible: true,
				shown: true,
				settings: [
					{
						name: 'Expanded server folder has color',
						id: 'guild-folder-color',
						type: 'switch',
						value: 'true'
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
			const { DiscordAPI, PluginUpdater, PluginUtilities } = Api;
			
			const uploadPlaceholderObserver = new MutationObserver(function(mutationsList, observer) {
				if ($('.uploadModal-2ifh8j').length) {
					var text = "";
					$('.uploadModal-2ifh8j .inner-3nWsbo .comment-4IWttf .label-3aiqT2').children('span').each(function(){
						text += $(this).text() + " ";
					});
					text = text.substring(0, text.length - 1).replace(/\n/g, " ");
					if (text.length > 0) {
						var input = $('.uploadModal-2ifh8j .textArea-12jD-V .slateTextArea-1Mkdgw');
						var samplePlaceholder = $('.channelTextArea-2VhZ6z .textArea-12jD-V .placeholder-37qJjk');
						if (input.text().trim() != "") text = ""
						var classes = "placeholder-37qJjk";
						if (samplePlaceholder.length !== 0) {
							if (samplePlaceholder.attr('class').length > 0) {
								classes = samplePlaceholder.attr('class');
							}
						}
						if ($('#pseudo-uploadModalPlaceholder').length === 0) {
							input.before($("<div class='" + classes + "' id='pseudo-uploadModalPlaceholder'>" + text + "</div>"));
							uploadPlaceholderTextObserver.observe(input.get(0), {subtree: true, childList: true, characterData: true});
						} else if ($('#pseudo-uploadModalPlaceholder').html() != text) {
							$('#pseudo-uploadModalPlaceholder').html(text);
						}
					}
				}
			});
			const uploadPlaceholderTextObserver = new MutationObserver(function(mutationsList, observer) {
				var input = $('.uploadModal-2ifh8j .textArea-12jD-V .slateTextArea-1Mkdgw');
				if (input.text().trim() === "")
					$('#pseudo-uploadModalPlaceholder').show();
				else
					$('#pseudo-uploadModalPlaceholder').hide();
			});
			
			const guildListObserver = new MutationObserver(function(mutationsList, observer) {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						for (const node of mutation.addedNodes) {
							if (node.classList.contains("wrapper-21YSNc")) {
								const entry = $(node).find('.expandedFolderBackground-2sPsd-');
								var icon = entry.next().find('.folderIconWrapper-226oVY');
								var backgroundColor = icon.css('background-color');
								if (backgroundColor == "rgba(0, 0, 0, 0)") {
									backgroundColor = $(icon.find('.expandedFolderIconWrapper-1xLaU- > svg')).css('color');
									backgroundColor = backgroundColor.substring(0, backgroundColor.length - 1) + ", 0.4";
								}
								entry.css('background-color', backgroundColor);
							}
						}
					} else if (mutation.type === 'attributes') {
						if (mutation.target.classList.contains("folderIconWrapper-226oVY")) {
							const target = $(mutation.target);
							const backgroundColor = target.css('background-color');
							if (backgroundColor != "rgba(0, 0, 0, 0)")
								target.closest('.listItem-2P_4kh').prev().css('background-color', backgroundColor);
						} else if (mutation.target.nodeName == 'svg' && mutation.target.parentElement.classList.contains("expandedFolderIconWrapper-1xLaU-")) {
							const target = $(mutation.target);
							var backgroundColor = target.css('color');
							backgroundColor = "rgba" + backgroundColor.substring(3, backgroundColor.length - 1) + ", 0.4)";
							target.closest('.listItem-2P_4kh').prev().css('background-color', backgroundColor);
						}
					}
				}
			});
			
			const DefaultLibrarySettings = {};
			for (let s = 0; s < config.defaultConfig.length; s++) {
				const current = config.defaultConfig[s];
				if (current.type != 'category') {
					DefaultLibrarySettings[current.id] = current.value;
				} else {
					DefaultLibrarySettings[current.id] = {};
					for (let s = 0; s < current.settings.length; s++) {
						const subCurrent = current.settings[s];
						DefaultLibrarySettings[current.id][subCurrent.id] = subCurrent.value;
					}
				}
			}
			const LibrarySettings = XenoLib.loadData(config.info.name, 'settings', DefaultLibrarySettings);

			return class XposeCompanion extends Plugin
			{
				constructor()
				{
					super();
				}
	
				onStart()
				{
					PluginUtilities.addStyle(
						'XposeCompanion-CSS',
						`
						#pseudo-uploadModalPlaceholder {
							padding-left:16px;
						}
						`
					);
					uploadPlaceholderObserver.observe($(".popouts-2bnG9Z + div").get(0), {subtree: true, childList: true});
					this.updateFolderBackgrounds();
				}
	
				onStop()
				{
					PluginUtilities.removeStyle('XposeCompanion-CSS');
					uploadPlaceholderObserver.disconnect();
					uploadPlaceholderTextObserver.disconnect();
					guildListObserver.disconnect();
				}
				
				updateFolderBackgrounds() {
					if (LibrarySettings['appearance']['guild-folder-color']) {
						guildListObserver.observe($('ul[data-list-id="guildsnav"]').get(0), {subtree: true, childList: true, attributeFilter: ["style"]});
						$('.expandedFolderBackground-2sPsd-').each(function(index) {
							var icon = this.next().find('.folderIconWrapper-226oVY');
							var backgroundColor = icon.css('background-color');
							if (backgroundColor == "rgba(0, 0, 0, 0)") {
								backgroundColor = $(icon.find('.expandedFolderIconWrapper-1xLaU- > svg')).css('color');
								backgroundColor = "rgba" + backgroundColor.substring(3, backgroundColor.length - 1) + ", 0.4)";
							}
							this.css('background-color', backgroundColor);
						});
					} else {
						guildListObserver.disconnect();
						$('.expandedFolderBackground-2sPsd-').each(function(index) {
							this.css('background-color', "");
						});
					}
				}
				
				buildSetting(data) {
					return XenoLib.buildSetting(data);
				}
				
				getSettingsPanel() {
					return this.buildSettingsPanel().append(new XenoLib.Settings.PluginFooter(() => this.showChangelog())).getElement();
				}
				
				saveSettings(category, setting, value) {
					this.settings[category][setting] = value;
					LibrarySettings[category][setting] = value;
					PluginUtilities.saveSettings(config.info.name, LibrarySettings);
					if (category === 'appearance') {
						if (setting === 'guild-folder-color') {
							this.updateFolderBackgrounds();
						}
					}
				}

			}
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
