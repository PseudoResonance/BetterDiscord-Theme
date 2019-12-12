//META{"name":"UploadPlaceholder"}*//

var interval = 0;

class UploadPlaceholder {
    getName() { return "Upload Placeholder"; }
    getDescription() { return "Adds a placeholder to the upload box"; }
    getVersion() { return "1.1"; }
    getAuthor() { return "PseudoResonance"; }

    load() {}

    start() {
		interval = window.setInterval(function(){
			var text = "";
			$('.da-uploadArea .da-uploadDropModal .da-inner .da-instructions').children('pre').each(function(){
				text += $(this).text() + " ";
			});
			text = text.substring(0, text.length - 1).replace(/\n/g, " ");
			var input = $('.da-uploadModal .da-inner .da-comment .da-channelTextArea .da-scrollableContainer .da-inner .da-textArea .da-slateTextArea');
			input.attr('data-content', (input.text().trim() == "" ? text : ""));
        }, 1);
    }

    initialize() {}

    stop() {
        window.clearInterval(interval);
    }

}
