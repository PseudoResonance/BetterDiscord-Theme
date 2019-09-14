//META{"name":"UploadPlaceholder"}*//

var interval = 0;

class UploadPlaceholder {
    getName() { return "Upload Placeholder"; }
    getDescription() { return "Adds a placeholder to the upload box"; }
    getVersion() { return "1.0"; }
    getAuthor() { return "PseudoResonance"; }

    load() {}

    start() {
		interval = window.setInterval(function(){
			var text = "";
			$('.da-uploadModal .da-inner .da-comment .da-label').children('span').each(function(){
				text += $(this).text() + " ";
			});
			text = text.substring(0, text.length - 1);
            $('.da-uploadModal .da-inner .da-comment .da-flex .da-channelTextAreaUpload .da-flex textarea').attr('placeholder', text);
        }, 1);
    }

    initialize() {}

    stop() {
        window.clearInterval(interval);
    }

}
