$.fn.postMessage = function(message) {

        var toUrl = this.attr('src');
        var iframe = document.getElementById(this.attr('id')).contentWindow;
        if (window.postMessage) {
            // standard HTML5 support
            iframe.postMessage(JSON.stringify(message), toUrl);
        }

    };

$.fn.onMessageRecived = function(triggeredFunction) {
        if (window.postMessage) {
            // standard HTML5 support
            if (typeof window.addEventListener != 'undefined') {
                window.addEventListener('message', triggeredFunction, false);
            } else if (typeof window.attachEvent != 'undefined') {
                window.attachEvent('onmessage', triggeredFunction);
            }
        }
};
