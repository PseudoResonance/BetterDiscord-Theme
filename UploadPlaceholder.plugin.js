//META{"name":"UploadPlaceholder"}*//

var interval = 0;

class UploadPlaceholder {
    getName() { return "Upload Placeholder"; }
    getDescription() { return "Adds a placeholder to the upload box"; }
    getVersion() { return "1.2"; }
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
				var input = $('.da-uploadModal .da-inner .da-comment .da-channelTextArea .scrollableContainer-2NUZem .da-inner .da-textArea .da-slateTextArea');
				var samplePlaceholder = $('.da-form .da-channelTextArea .scrollableContainer-2NUZem .da-inner .da-textArea .da-placeholder');
				if (input.text().trim() != "") text = ""
				input.attr('placeholder', text);
				var classes = "placeholder-37qJjk da-placeholder";
				if (samplePlaceholder.length !== 0)
					if (samplePlaceholder.attr('class').length > 0)
						classes = samplePlaceholder.attr('class');
				if ($('#pseudo-customUploadModalPlaceholder').length === 0) {
					input.before($("<div class='" + classes + "' id='pseudo-customUploadModalPlaceholder'>" + text + "</div>"));
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
