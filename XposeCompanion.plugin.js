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
			version: "2.2.1",
			description: "Companion plugin for Xpose theme.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/XposeCompanion.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/XposeCompanion.plugin.js"
		},
		changelog: [
			{
				title: "Removed XenoLib",
				type: "fixed",
				items: [
					"You can delete the XenoLib plugin if not in use"
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
						id: 'guildFolderColor',
						type: 'switch',
						value: 'true'
					}
				]
			}
		]
	};
	
	var _XposeCompanion = null;

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
			const { DOMTools, PluginUtilities } = Api;
			
			const uploadPlaceholderObserver = new MutationObserver(function(mutationsList, observer) {
				if (document.getElementsByClassName("uploadModal-2ifh8j").length) {
					var labels = document.querySelectorAll(".uploadModal-2ifh8j .inner-3nWsbo .comment-4IWttf .label-3aiqT2");
					var labelsText = [];
					for (var i = 0; i < labels.length; i++) {
						labelsText[i] = "";
						for (var j = 0; j < labels[i].children.length; j++) {
							labelsText[i] += labels[i].children[j].textContent + " ";
						}
						labelsText[i] = labelsText[i].substring(0, labelsText[i].length - 1).replace(/\n/g, " ");
					}
					if (labelsText.length > 0) {
						var input = document.querySelector(".uploadModal-2ifh8j .textArea-12jD-V .slateTextArea-1Mkdgw");
						var inputName = document.querySelector(".uploadModal-2ifh8j .inputWrapper-31_8H8 .input-cIJ7To");
						var fileDescription = document.querySelector(".uploadModal-2ifh8j .description-2ug5H_ .filename-ovv3c5");
						var samplePlaceholder = document.querySelector(".channelTextArea-2VhZ6z .textArea-12jD-V .placeholder-37qJjk");
						if (input.textContent.trim() != "") labelsText[labelsText.length - 1] = ""
						var classes = ["placeholder-37qJjk"];
						if (samplePlaceholder != null) {
							if (samplePlaceholder.classList.length > 0) {
								classes = samplePlaceholder.classList;
							}
						} else {
							for (var i = 0; i < input.classList.length; i++) {
								if (input.classList[i].startsWith("fontSize")) {
									classes.push(input.classList[i]);
									break;
								}
							}
						}
						var uploadModalPlaceholder = document.getElementById("pseudo-uploadModalPlaceholder");
						if (uploadModalPlaceholder == null) {
							var placeholderNode = document.createElement("div");
							placeholderNode.id = "pseudo-uploadModalPlaceholder";
							placeholderNode.textContent = labelsText[labelsText.length - 1];
							for (var i = 0; i < classes.length; i++) {
								placeholderNode.classList.add(classes[i]);
							}
							input.parentElement.insertBefore(placeholderNode, input);
							uploadPlaceholderTextObserver.observe(input, {subtree: true, childList: true, characterData: true});
						} else if (uploadModalPlaceholder.textContent != labelsText[labelsText.length - 1]) {
							uploadModalPlaceholder.textContent = labelsText[labelsText.length - 1];
						}
						if (labelsText.length > 1) {
							fileDescription.textContent = "";
							inputName.placeholder = labelsText[0];
						}
					}
				}
			});
			
			const uploadPlaceholderTextObserver = new MutationObserver(function(mutationsList, observer) {
				var input = document.querySelector(".uploadModal-2ifh8j .textArea-12jD-V .slateTextArea-1Mkdgw");
				if (input.textContent.trim() === "")
					document.getElementById("pseudo-uploadModalPlaceholder").style.display = "block";
				else
					document.getElementById("pseudo-uploadModalPlaceholder").style.display = "none";
			});
			
			const guildListObserver = new MutationObserver(function(mutationsList, observer) {
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

			return class XposeCompanion extends Plugin
			{
				constructor()
				{
					super();
					_XposeCompanion = this;
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
					uploadPlaceholderObserver.observe(document.querySelector(".popouts-2bnG9Z + div"), {subtree: true, childList: true});
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
					if (this.settings.appearance.guildFolderColor) {
						guildListObserver.observe(document.querySelector('[data-list-id="guildsnav"]'), {subtree: true, childList: true, attributeFilter: ["style"]});
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
