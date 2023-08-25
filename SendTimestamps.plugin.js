/**
 * @name SendTimestamps
 * @version 2.2.2
 * @description Send timestamps in your messages easily by right clicking the text input.
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/SendTimestamps.plugin.js
 * @updateUrl https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/SendTimestamps.plugin.js
 */
/*@cc_on
@if (@_jscript)

// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
// Show the user where to put plugins in the future
shell.Exec("explorer " + pathPlugins);
shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@*/

/*
Licensed under GPL version 2 by Taimoor
https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js

GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) 1989, 1991 Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Preamble

The licenses for most software are designed to take away your
freedom to share and change it.  By contrast, the GNU General Public
License is intended to guarantee your freedom to share and change free
software--to make sure the software is free for all its users.  This
General Public License applies to most of the Free Software
Foundation's software and to any other program whose authors commit to
using it.  (Some other Free Software Foundation software is covered by
the GNU Lesser General Public License instead.)  You can apply it to
your programs, too.

When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
this service if you wish), that you receive source code or can get it
if you want it, that you can change the software or use pieces of it
in new free programs; and that you know you can do these things.

To protect your rights, we need to make restrictions that forbid
anyone to deny you these rights or to ask you to surrender the rights.
These restrictions translate to certain responsibilities for you if you
distribute copies of the software, or if you modify it.

For example, if you distribute copies of such a program, whether
gratis or for a fee, you must give the recipients all the rights that
you have.  You must make sure that they, too, receive or can get the
source code.  And you must show them these terms so they know their
rights.

We protect your rights with two steps: (1) copyright the software, and
(2) offer you this license which gives you legal permission to copy,
distribute and/or modify the software.

Also, for each author's protection and ours, we want to make certain
that everyone understands that there is no warranty for this free
software.  If the software is modified by someone else and passed on, we
want its recipients to know that what they have is not the original, so
that any problems introduced by others will not reflect on the original
authors' reputations.

Finally, any free program is threatened constantly by software
patents.  We wish to avoid the danger that redistributors of a free
program will individually obtain patent licenses, in effect making the
program proprietary.  To prevent this, we have made it clear that any
patent must be licensed for everyone's free use or not licensed at all.

The precise terms and conditions for copying, distribution and
modification follow.

GNU GENERAL PUBLIC LICENSE
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

0. This License applies to any program or other work which contains
a notice placed by the copyright holder saying it may be distributed
under the terms of this General Public License.  The "Program", below,
refers to any such program or work, and a "work based on the Program"
means either the Program or any derivative work under copyright law:
that is to say, a work containing the Program or a portion of it,
either verbatim or with modifications and/or translated into another
language.  (Hereinafter, translation is included without limitation in
the term "modification".)  Each licensee is addressed as "you".

Activities other than copying, distribution and modification are not
covered by this License; they are outside its scope.  The act of
running the Program is not restricted, and the output from the Program
is covered only if its contents constitute a work based on the
Program (independent of having been made by running the Program).
Whether that is true depends on what the Program does.

1. You may copy and distribute verbatim copies of the Program's
source code as you receive it, in any medium, provided that you
conspicuously and appropriately publish on each copy an appropriate
copyright notice and disclaimer of warranty; keep intact all the
notices that refer to this License and to the absence of any warranty;
and give any other recipients of the Program a copy of this License
along with the Program.

You may charge a fee for the physical act of transferring a copy, and
you may at your option offer warranty protection in exchange for a fee.

2. You may modify your copy or copies of the Program or any portion
of it, thus forming a work based on the Program, and copy and
distribute such modifications or work under the terms of Section 1
above, provided that you also meet all of these conditions:

a) You must cause the modified files to carry prominent notices
stating that you changed the files and the date of any change.

b) You must cause any work that you distribute or publish, that in
whole or in part contains or is derived from the Program or any
part thereof, to be licensed as a whole at no charge to all third
parties under the terms of this License.

c) If the modified program normally reads commands interactively
when run, you must cause it, when started running for such
interactive use in the most ordinary way, to print or display an
announcement including an appropriate copyright notice and a
notice that there is no warranty (or else, saying that you provide
a warranty) and that users may redistribute the program under
these conditions, and telling the user how to view a copy of this
License.  (Exception: if the Program itself is interactive but
does not normally print such an announcement, your work based on
the Program is not required to print an announcement.)

These requirements apply to the modified work as a whole.  If
identifiable sections of that work are not derived from the Program,
and can be reasonably considered independent and separate works in
themselves, then this License, and its terms, do not apply to those
sections when you distribute them as separate works.  But when you
distribute the same sections as part of a whole which is a work based
on the Program, the distribution of the whole must be on the terms of
this License, whose permissions for other licensees extend to the
entire whole, and thus to each and every part regardless of who wrote it.

Thus, it is not the intent of this section to claim rights or contest
your rights to work written entirely by you; rather, the intent is to
exercise the right to control the distribution of derivative or
collective works based on the Program.

In addition, mere aggregation of another work not based on the Program
with the Program (or with a work based on the Program) on a volume of
a storage or distribution medium does not bring the other work under
the scope of this License.

3. You may copy and distribute the Program (or a work based on it,
under Section 2) in object code or executable form under the terms of
Sections 1 and 2 above provided that you also do one of the following:

a) Accompany it with the complete corresponding machine-readable
source code, which must be distributed under the terms of Sections
1 and 2 above on a medium customarily used for software interchange; or,

b) Accompany it with a written offer, valid for at least three
years, to give any third party, for a charge no more than your
cost of physically performing source distribution, a complete
machine-readable copy of the corresponding source code, to be
distributed under the terms of Sections 1 and 2 above on a medium
customarily used for software interchange; or,

c) Accompany it with the information you received as to the offer
to distribute corresponding source code.  (This alternative is
allowed only for noncommercial distribution and only if you
received the program in object code or executable form with such
an offer, in accord with Subsection b above.)

The source code for a work means the preferred form of the work for
making modifications to it.  For an executable work, complete source
code means all the source code for all modules it contains, plus any
associated interface definition files, plus the scripts used to
control compilation and installation of the executable.  However, as a
special exception, the source code distributed need not include
anything that is normally distributed (in either source or binary
form) with the major components (compiler, kernel, and so on) of the
operating system on which the executable runs, unless that component
itself accompanies the executable.

If distribution of executable or object code is made by offering
access to copy from a designated place, then offering equivalent
access to copy the source code from the same place counts as
distribution of the source code, even though third parties are not
compelled to copy the source along with the object code.

4. You may not copy, modify, sublicense, or distribute the Program
except as expressly provided under this License.  Any attempt
otherwise to copy, modify, sublicense or distribute the Program is
void, and will automatically terminate your rights under this License.
However, parties who have received copies, or rights, from you under
this License will not have their licenses terminated so long as such
parties remain in full compliance.

5. You are not required to accept this License, since you have not
signed it.  However, nothing else grants you permission to modify or
distribute the Program or its derivative works.  These actions are
prohibited by law if you do not accept this License.  Therefore, by
modifying or distributing the Program (or any work based on the
Program), you indicate your acceptance of this License to do so, and
all its terms and conditions for copying, distributing or modifying
the Program or works based on it.

6. Each time you redistribute the Program (or any work based on the
Program), the recipient automatically receives a license from the
original licensor to copy, distribute or modify the Program subject to
these terms and conditions.  You may not impose any further
restrictions on the recipients' exercise of the rights granted herein.
You are not responsible for enforcing compliance by third parties to
this License.

7. If, as a consequence of a court judgment or allegation of patent
infringement or for any other reason (not limited to patent issues),
conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot
distribute so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you
may not distribute the Program at all.  For example, if a patent
license would not permit royalty-free redistribution of the Program by
all those who receive copies directly or indirectly through you, then
the only way you could satisfy both it and this License would be to
refrain entirely from distribution of the Program.

If any portion of this section is held invalid or unenforceable under
any particular circumstance, the balance of the section is intended to
apply and the section as a whole is intended to apply in other
circumstances.

It is not the purpose of this section to induce you to infringe any
patents or other property right claims or to contest validity of any
such claims; this section has the sole purpose of protecting the
integrity of the free software distribution system, which is
implemented by public license practices.  Many people have made
generous contributions to the wide range of software distributed
through that system in reliance on consistent application of that
system; it is up to the author/donor to decide if he or she is willing
to distribute software through any other system and a licensee cannot
impose that choice.

This section is intended to make thoroughly clear what is believed to
be a consequence of the rest of this License.

8. If the distribution and/or use of the Program is restricted in
certain countries either by patents or by copyrighted interfaces, the
original copyright holder who places the Program under this License
may add an explicit geographical distribution limitation excluding
those countries, so that distribution is permitted only in or among
countries not thus excluded.  In such case, this License incorporates
the limitation as if written in the body of this License.

9. The Free Software Foundation may publish revised and/or new versions
of the General Public License from time to time.  Such new versions will
be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

Each version is given a distinguishing version number.  If the Program
specifies a version number of this License which applies to it and "any
later version", you have the option of following the terms and conditions
either of that version or of any later version published by the Free
Software Foundation.  If the Program does not specify a version number of
this License, you may choose any version ever published by the Free Software
Foundation.

10. If you wish to incorporate parts of the Program into other free
programs whose distribution conditions are different, write to the author
to ask for permission.  For software which is copyrighted by the Free
Software Foundation, write to the Free Software Foundation; we sometimes
make exceptions for this.  Our decision will be guided by the two goals
of preserving the free status of all derivatives of our free software and
of promoting the sharing and reuse of software generally.

NO WARRANTY

11. BECAUSE THE PROGRAM IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY
FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW.  EXCEPT WHEN
OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES
PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED
OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.  THE ENTIRE RISK AS
TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.  SHOULD THE
PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING,
REPAIR OR CORRECTION.

12. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR
REDISTRIBUTE THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES,
INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING
OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED
TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY
YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER
PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE
POSSIBILITY OF SUCH DAMAGES.

END OF TERMS AND CONDITIONS

How to Apply These Terms to Your New Programs

If you develop a new program, and you want it to be of the greatest
possible use to the public, the best way to achieve this is to make it
free software which everyone can redistribute and change under these terms.

To do so, attach the following notices to the program.  It is safest
to attach them to the start of each source file to most effectively
convey the exclusion of warranty; and each file should have at least
the "copyright" line and a pointer to where the full notice is found.

<one line to give the program's name and a brief idea of what it does.>
Copyright (C) <year>  <name of author>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

Also add information on how to contact you by electronic and paper mail.

If the program is interactive, make it output a short notice like this
when it starts in an interactive mode:

Gnomovision version 69, Copyright (C) year name of author
Gnomovision comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
This is free software, and you are welcome to redistribute it
under certain conditions; type `show c' for details.

The hypothetical commands `show w' and `show c' should show the appropriate
parts of the General Public License.  Of course, the commands you use may
be called something other than `show w' and `show c'; they could even be
mouse-clicks or menu items--whatever suits your program.

You should also get your employer (if you work as a programmer) or your
school, if any, to sign a "copyright disclaimer" for the program, if
necessary.  Here is a sample; alter the names:

Yoyodyne, Inc., hereby disclaims all copyright interest in the program
`Gnomovision' (which makes passes at compilers) written by James Hacker.

<signature of Ty Coon>, 1 April 1989
Ty Coon, President of Vice

This General Public License does not permit incorporating your program into
proprietary programs.  If your program is a subroutine library, you may
consider it more useful to permit linking proprietary applications with the
library.  If this is what you want to do, use the GNU Lesser General
Public License instead of this License.
 */

module.exports = (() => {
	const config = {
		info: {
			name: 'SendTimestamps',
			version: '2.2.2',
			description: 'Send timestamps in your messages easily by right clicking the text input.',
			author: 'Taimoor',
			authorId: '220161488516546561',
			authorLink: 'https://github.com/Taimoor-Tariq',
			github: 'https://github.com/PseudoResonance/BetterDiscord-Theme/blob/master/SendTimestamps.plugin.js',
			github_raw: 'https://raw.githubusercontent.com/PseudoResonance/BetterDiscord-Theme/master/SendTimestamps.plugin.js',
			authors: [{
					name: 'Taimoor',
					discord_id: '220161488516546561'
				}, {
					name: 'PseudoResonance'
				}
			]
		},
		changelog: [{
				title: 'v2.2.2 - Update',
				type: 'fixed',
				items: ['Updated to BetterDiscord 1.9.3']
			}
		],
		main: 'index.js',
	};

	return !global.ZeresPluginLibrary
	 ? class {
		constructor() {
			this._config = config;
		}
		getName() {
			return config.info.name;
		}
		getAuthor() {
			return config.info.authors.map((a) => a.name).join(', ');
		}
		getDescription() {
			return config.info.description;
		}
		getVersion() {
			return config.info.version;
		}
		load() {
			BdApi.UI.showConfirmationModal('Library Missing', `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: 'Download Now',
				cancelText: 'Cancel',
				onConfirm: () => {
					require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async(error, response, body) => {
						if (error)
							return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
						await new Promise((r) => require('fs').writeFile(require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
					});
				},
			});
		}
		start() {}
		stop() {}
	}
	 : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const {
				PluginUtilities,
				Patcher,
				Modals,
				DOMTools,
				WebpackModules,
				DiscordModules: {
					React,
					MessageActions,
					Slider,
					Dropdown,
					SwitchRow,
					LocaleManager,
					DiscordPermissions
				},
			} = Api;
			let ComponentDispatch = null;
			let ComponentActions = null;
			const css = `.timestamp-button {
    margin-top: 4px;
    max-height: 40px;
    justify-content: center;
    background-color: transparent;
}

.timestamp-button button {
    min-height: 32px;
    min-width: 32px;
    background-color: transparent;
}
.timestamp-button svg {
    width: 20px;
    height: 20px;
    color: var(--interactive-normal);
}
.timestamp-button svg:hover {
    color: var(--interactive-hover);
}

.channel-attach-button {
    display: flex;
    margin-right: 8px;
}

.channel-attach-button .attachButton-_ACFSu {
    padding: 10px 4px;
}

.timestamp-input-label {
    font-size: 16px;
    color: var(--text-normal);
    margin-left: 4px;
}

.timestamp-input {
    font-size: 16px;
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    color: var(--text-normal);
    background-color: var(--deprecated-text-input-bg);
    border: 1px solid var(--deprecated-text-input-border);
    transition: border-color 0.2s ease-in-out;
    padding: 10px;
    margin: 8px 0 12px 0px;
}

.timestamp-input-dropdown {
    font-size: 16px;
    border-radius: 3px;
    color: var(--text-normal);
    background-color: var(--deprecated-text-input-bg);
    border: 1px solid var(--deprecated-text-input-border);
    transition: border-color 0.2s ease-in-out;
    margin: 8px 0 12px 0px;
}

input::-webkit-calendar-picker-indicator {
    width: 16px;
    height: 16px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(80%);
    cursor: pointer;
}

input[type='time']::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,%3Csvg role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z'%3E%3C/path%3E%3C/svg%3E");
}
input[type='date']::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z'/%3E%3C/svg%3E");
}

.timestamp-formats-wrapper {
    position: absolute;
    top: 0;
    width: 90%;
}

.timestamp-formats-selector {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: var(--background-tertiary);
    box-shadow: var(--elevation-high);
    color: var(--text-normal);
    border-radius: 5px;
    padding: 8px 12px;
}

.timestamp-formats-selects {
    display: flex;
    flex-direction: row;
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: wrap;
}

.timestamp-formats-selects select {
    padding: 8px 12px;
    border-radius: 5px;
    border: 1px solid var(--background-secondary);
    background-color: var(--channeltextarea-background);
    color: var(--text-normal);
    font-size: 1rem;
    flex-grow: 1;
}
`;

			const Button = WebpackModules.getByProps('Button').Button;

			const canSendMessages = (channelId) => {
				return BdApi.findModule(BdApi.Webpack.Filters.byProps('getChannelPermissions')).canWithPartialContext(DiscordPermissions.SEND_MESSAGES, {
					channelId
				});
			};

			let unpatchButton = null;

			return class SendTimestamp extends Plugin {
				constructor() {
					super();

					this.defaultSettings = {
						timestampFormat: 'f',
					};

					this.forceOnRight = false;
					this.locale = LocaleManager.getLocale() ?? 'en';

					this.sendFormatOptions = {
						0: 'F',
					};

					this.replaceTextAreaText = (text) => {
						if (!ComponentDispatch) {
							this.getDiscordInternals()
						}
						ComponentDispatch.dispatchToLastSubscribed(ComponentActions.CLEAR_TEXT);
						setImmediate(() => {
							ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, {
								content: text,
								plainText: text
							});
						});
					};
				}

				onStart() {
					this.getDiscordInternals();
					PluginUtilities.addStyle(this.getName(), css);
					this.patchButton();
				}

				onStop() {
					this.domObserver?.unsubscribeAll();
					PluginUtilities.removeStyle(this.getName());
					Patcher.unpatchAll();
					if (unpatchButton)
						unpatchButton();
				}

				load() {
					const myAdditions = (e) => {
						const pluginCard = e.target.querySelector(`#${this.getName()}-card`);
						if (pluginCard) {
							const controls = pluginCard.querySelector('.bd-controls');
							const changeLogButton = DOMTools.createElement(
`<button class="bd-button bd-addon-button bd-changelog-button" style"position: relative;"> <style> .bd-changelog-button-tooltip { visibility: hidden; position: absolute; background-color: var(--background-floating); box-shadow: var(--elevation-high); color: var(--text-normal); border-radius: 5px; font-size: 14px; line-height: 16px; white-space: nowrap; font-weight: 500; padding: 8px 12px; z-index: 999999; transform: translate(0, -125%); } .bd-changelog-button-tooltip:after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -3px; border-width: 3x; border-style: solid; border-color: var(--background-floating) transparent transparent transparent; } .bd-changelog-button:hover .bd-changelog-button-tooltip { visibility: visible; } </style> <span class="bd-changelog-button-tooltip">Changelog</span> <svg viewBox="0 0 24 24" fill="#FFFFFF" style="width: 20px; height: 20px;"> <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /> </svg> </button>`);
							changeLogButton.addEventListener('click', () => {
								Api.Modals.showChangelogModal(this.getName(), this.getVersion(), this._config.changelog);
							});

							if (!controls.querySelector('.bd-changelog-button') && this._config.changelog?.length > 0)
								controls.prepend(changeLogButton);
						}
					};

					this.domObserver = new Api.DOMTools.DOMObserver();
					this.domObserver.subscribeToQuerySelector(myAdditions, `#${this.getName()}-card`);

					let userSettings = this.loadSettings();
					if (!userSettings.usingVersion || userSettings.usingVersion < this.getVersion()) {
						this.saveSettings({
							...this.loadSettings(),
							usingVersion: this.getVersion()
						});
						Api.Modals.showChangelogModal(this.getName(), this.getVersion(), this._config.changelog);
					}
				}

				getDiscordInternals() {
					ComponentDispatch = BdApi.Webpack.getModule(m => m.dispatchToLastSubscribed && m.emitter?._events?.INSERT_TEXT, {
						searchExports: true
					});
					let getComponentActionsKey = null;
					const setComponentActionsKey = (val) => {
						getComponentActionsKey = val;
					};
					const getComponentActionsModule = ZeresPluginLibrary.WebpackModules.getModule((m) => {
						for (const k in m) {
							for (const j in m[k]) {
								if (m[k][j]?.toString().includes("CLEAR_TEXT")) {
									setComponentActionsKey(k);
									return true;
								}
							}
						}
					});
					ComponentActions = getComponentActionsModule[getComponentActionsKey];
				}

				showTimestampModal() {
					const inputFormat = this.settings.timestampFormat;

					const getRelativeTime = (timestamp) => {
						const timeElapsed = timestamp - new Date(new Date().getTime() - new Date().getTimezoneOffset() * 180000);
						const units = {
							year: 24 * 60 * 60 * 1000 * 365,
							month: (24 * 60 * 60 * 1000 * 365) / 12,
							day: 24 * 60 * 60 * 1000,
							hour: 60 * 60 * 1000,
							minute: 60 * 1000,
							second: 1000,
						};

						for (let u in units)
							if (Math.abs(timeElapsed) > units[u] || u == 'second')
								return new Intl.RelativeTimeFormat('en', {
									numeric: 'auto'
								}).format(Math.round(timeElapsed / units[u]), u);
					};

					const updateTimeFormat = (format) => {
						this.settings.timestampFormat = format;
						this.saveSettings();
					};

					const isValidDate = (d) => {
						return d instanceof Date && !isNaN(d);
					};

					let inputTimestamp = new Date();

					class TimestampModalBody extends React.Component {
						constructor(props) {
							super(props);
							this.state = {
								timestamp: new Date(new Date(inputTimestamp).getTime() - new Date().getTimezoneOffset() * 60000),
								returnTimestamp: inputTimestamp,
								timestampFormat: inputFormat,

								formatOptions: [{
										value: 't',
										label: 'Short Time'
									}, {
										value: 'T',
										label: 'Long Time'
									}, {
										value: 'd',
										label: 'Short Date'
									}, {
										value: 'D',
										label: 'Long Date'
									}, {
										value: 'f',
										label: 'Short Date/Time'
									}, {
										value: 'F',
										label: 'Long Date/Time'
									}, {
										value: 'R',
										label: 'Relative Time'
									},
								],
							};
						}

						componentDidMount() {
							this.updateFormatOptions();
						}

						componentDidUpdate(prevProps, prevState) {
							if (prevState.timestamp != this.state.timestamp) {
								inputTimestamp = this.state.returnTimestamp;
								this.updateFormatOptions();
							}
						}

						updateFormatOptions() {
							const time = new Date(new Date(this.state.timestamp).getTime() - new Date().getTimezoneOffset() * 2 * 60000);
							this.setState({
								formatOptions: [{
										value: 't',
										label: time.toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit'
										}).replace(' at', '')
									}, {
										value: 'T',
										label: time.toLocaleString(undefined, {
											timeStyle: 'medium'
										}).replace(' at', '')
									}, {
										value: 'd',
										label: time.toLocaleString(undefined, {
											dateStyle: 'short'
										}).replace(' at', '')
									}, {
										value: 'D',
										label: time.toLocaleString(undefined, {
											dateStyle: 'long'
										}).replace(' at', '')
									}, {
										value: 'f',
										label: time.toLocaleString(undefined, {
											dateStyle: 'long',
											timeStyle: 'short'
										}).replace(' at', '')
									}, {
										value: 'F',
										label: time.toLocaleString(undefined, {
											dateStyle: 'full',
											timeStyle: 'short'
										}).replace(' at', '')
									}, {
										value: 'R',
										label: getRelativeTime(time)
									},
								],
							});
						}

						render() {
							const FormatDropdown = React.createElement('div', {
								className: 'timestamp-input-group',
								children: [
									React.createElement('label', {
										className: 'timestamp-input-label',
										children: 'Format',
									}),
									React.createElement('div', {
										className: 'timestamp-input-dropdown',
										children: [
											React.createElement(Dropdown, {
												onChange: (format) => {
													this.setState({
														timestampFormat: format,
													});
													updateTimeFormat(format);
												},
												value: this.state.timestampFormat,
												options: this.state.formatOptions,
											}),
										],
									}),
								],
							});

							const DatePicker = React.createElement('div', {
								className: 'timestamp-input-group',
								children: [
									React.createElement('label', {
										className: 'timestamp-input-label',
										children: 'Date',
									}),
									React.createElement('input', {
										className: 'timestamp-input',
										type: 'date',
										value: this.state.timestamp.toISOString().split('T')[0],
										onChange: (e) => {
											const date = new Date(`${e.target.value}T${this.state.timestamp.toISOString().split('T')[1]}`);
											if (isValidDate(date))
												this.setState({
													timestamp: date,
													returnTimestamp: new Date(new Date(date).getTime() + new Date().getTimezoneOffset() * 60000),
												});
										},
									}),
								],
							});

							const TimePicker = React.createElement('div', {
								className: 'timestamp-input-group',
								children: [
									React.createElement('label', {
										className: 'timestamp-input-label',
										children: 'Time',
									}),
									React.createElement('input', {
										className: 'timestamp-input',
										type: 'time',
										value: this.state.timestamp.toISOString().split('T')[1].split('.')[0].split(':').slice(0, 2).join(':'),
										onChange: (e) => {
											let date = new Date(`${this.state.timestamp.toISOString().split('T')[0]}T${e.target.value}:00.000Z`);
											if (isValidDate(date))
												this.setState({
													timestamp: date,
													returnTimestamp: new Date(new Date(date).getTime() + new Date().getTimezoneOffset() * 60000),
												});
										},
									}),
								],
							});

							return React.createElement('div', {
								children: [DatePicker, TimePicker, FormatDropdown],
							});
						}
					}

					Modals.showModal('Select Date and Time', [React.createElement(TimestampModalBody)], {
						confirmText: 'Enter',
						onConfirm: () => {
							let ts_msg = `<t:${Math.floor(inputTimestamp.getTime() / 1000)}:${this.settings.timestampFormat}>`;
							if (!ComponentDispatch) {
								this.getDiscordInternals()
							}
							ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, {
								content: ts_msg,
								plainText: ts_msg
							});
						},
					});
				}

				patchButton() {
					unpatchButton = BdApi.ContextMenu.patch('textarea-context', (menu, props) => {
						menu.props.children.splice(menu.props.children.length - 1, 0, ZeresPluginLibrary.DiscordModules.React.createElement(BdApi.ContextMenu.Group, null, ZeresPluginLibrary.DiscordModules.React.createElement(BdApi.ContextMenu.Item, {
									id: 'timestamp',
									label: 'Add Timestamp',
									action: () => {
										this.showTimestampModal();
									},
									disabled: false
								})));
					})
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
