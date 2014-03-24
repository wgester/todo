/**
 * @constructor
 * Designated for deprecation – to be moved into external helper library
 */
if(!window.CustomEvent) return;
var clickThreshold = 300;
var potentialClicks = {};
document.addEventListener('touchstart', function(event) {
    var timestamp = Date.now();
    for(var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        potentialClicks[touch.identifier] = timestamp;
    }
});
window.addEventListener('touchmove', function(event) {
    for(var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        delete potentialClicks[touch.identifier];
    }
});
document.addEventListener('touchend', function(event) {
    var currTime = Date.now();
    for(var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var startTime = potentialClicks[touch.identifier];
        if(startTime && currTime - startTime < clickThreshold) {
            event.preventDefault();
            var clickEvt = new CustomEvent('click', {
                'bubbles': true,
                'details': touch
            });
            event.target.dispatchEvent(clickEvt);
            if (event.target.focus) {
                event.target.focus();
            }
        }
        delete potentialClicks[touch.identifier];
    }
});
