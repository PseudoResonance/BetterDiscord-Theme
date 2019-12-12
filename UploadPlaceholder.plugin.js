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
			$('.da-uploadModal .da-inner .da-comment .da-label').children('span').each(function(){
				text += $(this).text() + " ";
			});
			text = text.substring(0, text.length - 1).replace(/\n/g, " ");
			if (text.length > 0) {
				var input = $('.da-uploadModal .da-inner .da-comment .da-channelTextArea .da-scrollableContainer .da-inner .da-textArea .da-slateTextArea');
				if (input.text().trim() != "") text = ""
				input.attr('placeholder', text);
				if ($('#pseudo-customUploadModalPlaceholder').length === 0) {
					input.before($("<div class='placeholder-P6ptfj da-placeholder' id='pseudo-customUploadModalPlaceholder'>" + text + "</div>"));
				} else {
					if ($('#pseudo-customUploadModalPlaceholder').html() != text)
						$('#pseudo-customUploadModalPlaceholder').html(text);
				}
			}
        }, 1);
    }

    initialize() {}

    stop() {
        window.clearInterval(interval);
    }

}
