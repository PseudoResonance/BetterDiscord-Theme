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
			version: "2.1.1",
			description: "Companion plugin for Xpose theme.",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/UploadPlaceholder.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/UploadPlaceholder.plugin.js"
		},
		changelog: [
			{
				title: "Plugin renamed to XposeCompanion",
				type: "fixed",
				items: [
					"UploadPlaceholder renamed to XposeCompanion",
					"Please delete the UploadPlaceholder plugin if XposeCompanion is working!"
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

			return class UploadPlaceholder extends Plugin
			{
				constructor()
				{
					super();
				}
	
				onStart()
				{
					require("request").get("https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/XposeCompanion.plugin.js", async (err, res, body) =>
					{
						if (err) return require("electron").shell.openExternal("https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/XposeCompanion.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "XposeCompanion.plugin.js"), body, { flag: 'wx' }, r));
					});
				}

			}
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
