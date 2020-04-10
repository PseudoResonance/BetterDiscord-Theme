//META{"name":"UploadPlaceholder"}*//

var interval = 0;

class UploadPlaceholder {
    getName() { return "Upload Placeholder"; }
    getDescription() { return "Adds a placeholder to the upload box"; }
    getVersion() { return "1.3"; }
    getAuthor() { return "PseudoResonance"; }

    load() {}

    start() {
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
