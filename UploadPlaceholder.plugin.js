/**
 * @name XposeCompanion
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/UploadPlaceholder.plugin.js
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
			version: "2.1.0",
			description: "Companion plugin for Xpose theme.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/UploadPlaceholder.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/UploadPlaceholder.plugin.js"
		},
		changelog: [
			{
				title: "Xpose Theme Options",
				type: "added",
				items: [
					"Various options to configure on the companion Xpose theme"
				]
			},
			{
				title: "Performance",
				type: "fixed",
				items: [
					"Performance fixes"
				]
			}
		],
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
			
			const callback = function(mutationsList, observer) {
				if ($('.uploadModal-2ifh8j').length) {
					var text = "";
					$('.uploadModal-2ifh8j .inner-3nWsbo .comment-4IWttf .label-3aiqT2').children('span').each(function(){
						text += $(this).text() + " ";
					});
					text = text.substring(0, text.length - 1).replace(/\n/g, " ");
					if (text.length > 0) {
						var input = $('.uploadModal-2ifh8j .inner-3nWsbo .comment-4IWttf .channelTextArea-2VhZ6z .scrollableContainer-2NUZem .inner-MADQqc .textArea-12jD-V .slateTextArea-1Mkdgw');
						var samplePlaceholder = $('.form-2fGMdU .channelTextArea-2VhZ6z .scrollableContainer-2NUZem .inner-MADQqc .textArea-12jD-V .placeholder-37qJjk');
						if (input.text().trim() != "") text = ""
						input.attr('placeholder', text);
						var classes = "placeholder-37qJjk";
						if (samplePlaceholder.length !== 0)
							if (samplePlaceholder.attr('class').length > 0)
								classes = samplePlaceholder.attr('class');
						if ($('#pseudo-uploadModalPlaceholder').length === 0) {
							input.before($("<div class='" + classes + "' id='pseudo-uploadModalPlaceholder'>" + text + "</div>"));
						} else {
							if ($('#pseudo-uploadModalPlaceholder').html() != text)
								$('#pseudo-uploadModalPlaceholder').html(text);
						}
					}
				}
			}
			const observer = new MutationObserver(callback);

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
					observer.observe(document.getElementById('app-mount'), {childList: true});
				}
	
				onStop()
				{
					PluginUtilities.removeStyle('XposeCompanion-CSS');
					observer.disconnect();
				}
				
			}
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
