var EventHandler = require('famous/event-handler');

/**
 * @class Helper to TouchSync – tracks piped in touch events, organizes touch 
 *        events by ID, and emits track events back to TouchSync.
 * @description
 * @name TouchTracker
 * @constructor
 */
function TouchTracker(selective) {
    this.selective = selective;
    this.touchHistory = {};
    this.eventInput = new EventHandler();
    this.eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.eventInput.on('touchstart', _handleStart.bind(this));
    this.eventInput.on('touchmove', _handleMove.bind(this));
    this.eventInput.on('touchend', _handleEnd.bind(this));
    this.eventInput.on('touchcancel', _handleEnd.bind(this));
    this.eventInput.on('unpipe', _handleUnpipe.bind(this));
}

function _timestampTouch(touch, origin, history, count) {
    var touchClone = {};
    for(var i in touch) touchClone[i] = touch[i];
    return {
        touch: touchClone,
        origin: origin,
        timestamp: Date.now(),
        count: count,
        history: history
    };
}

function _handleStart(event) {
    for(var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var data = _timestampTouch(touch, event.origin, undefined, event.touches.length);
        this.eventOutput.emit('trackstart', data);
        if(!this.selective && !this.touchHistory[touch.identifier]) this.track(data);
    }
}

function _handleMove(event) {
    for(var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var history = this.touchHistory[touch.identifier];
        if(history) {
            var data = _timestampTouch(touch, event.origin, history, event.touches.length);
            this.touchHistory[touch.identifier].push(data);
            this.eventOutput.emit('trackmove', data);
        }
    }
}

function _handleEnd(event) {
    for(var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        var history = this.touchHistory[touch.identifier];
        if(history) {
            var data = _timestampTouch(touch, event.origin, history, event.touches.length);
            this.eventOutput.emit('trackend', data);
            delete this.touchHistory[touch.identifier];
        }
    }
}

function _handleUnpipe(event) {
    for(var i in this.touchHistory) {
        var history = this.touchHistory[i];
        this.eventOutput.emit('trackend', {
            touch: history[history.length - 1].touch,
            timestamp: Date.now(),
            count: 0,
            history: history
        });
        delete this.touchHistory[i];
    }
}

TouchTracker.prototype.track = function(data) {
    this.touchHistory[data.touch.identifier] = [data];
};

module.exports = TouchTracker;
