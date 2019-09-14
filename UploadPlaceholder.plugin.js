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
            $('.da-uploadModal .da-inner .da-comment .da-flex .da-channelTextAreaUpload .da-flex textarea').attr('placeholder', 'Comment (Optional)');
        }, 1);
    }

    initialize() {}

    stop() {
        window.clearInterval(interval);
    }

}
