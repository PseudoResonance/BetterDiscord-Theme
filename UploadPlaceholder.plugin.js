/**
 * @name UploadPlaceholder
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
			name: "UploadPlaceholder",
			authors:
			[
				{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "2.0.0",
			description: "Adds placeholder text to the upload file message box.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/UploadPlaceholder.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/UploadPlaceholder.plugin.js"
		},
		changelog: [
			{
				title: "Auto Updating",
				type: "added",
				items: [
					"Update to use Plugin Library"
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
			
			var interval = 0;

			return class UploadPlaceholder extends Plugin
			{
				constructor()
				{
					super();
				}
	
				onStart()
				{
					PluginUtilities.addStyle(
						'UploadPlaceholder-CSS',
						`
						#pseudo-uploadModalPlaceholder {
							padding-left:16px;
						}
						`
					);
					interval = window.setInterval(function(){
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
        			}, 1);
				}
	
				onStop()
				{
					window.clearInterval(interval);
					PluginUtilities.removeStyle('UploadPlaceholder-CSS');
				}
				
			}
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
