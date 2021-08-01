/**
 * @name IMEFix
 * @authorLink https://github.com/PseudoResonance
 * @donate https://bit.ly/3hAnec5
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/IMEFix.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "IMEFix",
			authors:
			[
				{
					name: "PseudoResonance",
					discord_id: "152927763605618689",
					github_username: "PseudoResonance"
				}
			],
			version: "1.0.0",
			description: "Fix IME input on Discord",
			github: "https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/IMEFix.plugin.js",
			github_raw: "https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/IMEFix.plugin.js"
		},
		changelog: [
			{
				title: "Initial Release",
				type: "added",
				items: [
					"Fixed IME input on Discord text inputs"
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
			const { DiscordModules, Patcher } = Api;
			
			let composition = false;
			
			let domNode = null;
			let cancelPatch = null;

			return class IMEFix extends Plugin
			{
				
				constructor()
				{
					super();
					this.onStart = this.onStart.bind(this);
					this.onStop = this.onStop.bind(this);
					this.compositionStart = this.compositionStart.bind(this);
					this.compositionEnd = this.compositionEnd.bind(this);
					this.input = this.input.bind(this);
				}
	
				onStart()
				{
					this.cancelPatch = BdApi.monkeyPatch(BdApi.findModule(m => m.displayName === 'SlateChannelTextArea').prototype, 'componentDidMount',
					{
						after: _ =>
						{
							this.composition = false;
							this.domNode = DiscordModules.ReactDOM.findDOMNode(_.thisObject);
							this.domNode.addEventListener("compositionstart", this.compositionStart, true);
							this.domNode.addEventListener("compositionend", this.compositionEnd, true);
							this.domNode.addEventListener("input", this.input, true);
						}
					});
				}
	
				onStop()
				{
					this.cancelPatch();
					if (this.domNode != null)
					{
						this.domNode.removeEventListener("compositionstart", this.compositionStart, true);
						this.domNode.removeEventListener("compositionend", this.compositionEnd, true);
						this.domNode.removeEventListener("input", this.input, true);
					}
				}
				
				compositionStart(event)
				{
					this.composition = true;
				}
				
				compositionEnd(event)
				{
					this.composition = false;
				}
				
				input(event)
				{
					if (this.composition)
					{
						event.stopPropagation();
					}
				}

			}
			
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
