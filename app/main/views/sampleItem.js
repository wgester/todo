var Engine         = require('famous/engine');
var View           = require('famous/view');
var Surface        = require('famous/surface');
var Modifier       = require('famous/modifier');
var Matrix         = require('famous/transform');
var Transitionable = require('famous/transitions/transitionable');

function ClearItem(options) {
    View.apply(this, arguments);

    this._optionsManager.patch(ClearItem.DEFAULT_OPTIONS);
    this._optionsManager.patch(options);

    this.surface = new Surface(this.options.surface);

    this.surface.pipe(this._eventInput);
    this._eventInput.pipe(this._eventOutput);

    this.name = 'be awesome';

    this.surface.setContent('<p>' + options.text + '</p>');

    bindEvents.call(this);

    this.dragThreshold = 600;
    this.timeTouched   = 0;

    this.CRAZYmodifier = new Modifier({
        transform: Matrix.identity,
        size: this.options.surface.size
    });

    this._add(this.CRAZYmodifier).add(this.surface);

    this.now = Date.now();
    this.lastFrameTime = Date.now();
}

ClearItem.DEFAULT_OPTIONS = {
    index: 0,
    surface: {
        classes: ['task'],
        size: [undefined, 60],
        properties: {
            webkitUserSelect: 'none'
        }
    }
};

function bindEvents() {
    this._eventInput.on('touchstart', handleStart.bind(this));
    this._eventInput.on('touchmove', handleMove.bind(this));
    this._eventInput.on('touchend', handleEnd.bind(this));
}

function handleStart(data) {
    Engine.on('prerender', findTimeDeltas.bind(this));
    Engine.on('prerender', checkForDragging.bind(this));
    this.touched = true;
    this.touchStart = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
}

function handleMove(data) {
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];  
}

function handleEnd() {
    this.touched = false;
    regularmode.call(this);
    this.timeTouched = 0;
}

function findTimeDeltas() {
    this.lastFrameTime = this.now;
    this.now = Date.now();

    this.timeDelta = this.now - this.lastFrameTime;
}

function checkForDragging(data) {
    if (this.touched) {
        this.timeTouched += this.timeDelta;
        if (this.timeTouched > this.dragThreshold) {
            var distance = Math.sqrt(Math.pow((this.touchStart[0] - this.touchCurrent[0]), 2) + Math.pow((this.touchStart[1] - this.touchCurrent[1]), 2));
            if (distance < 25) {
                this.timeTouched = 0;
                this._eventOutput.emit('editmodeOn');
                this.touched = false;
                dragmode.call(this);
            } else {
                this.touched = false;
            }
        }
    }
}


function dragmode() {
    this.CRAZYmodifier.setTransform(Matrix.translate(0, 0, 40), {
        curve: 'easeOutBounce',
        duration: 300
    });

    this.surface.setProperties({
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 20)'
    });
}

function regularmode() {
    this.CRAZYmodifier.setTransform(Matrix.identity, {
        curve: 'easeOut',
        duration: 200
    }, function() {
        this._eventOutput.emit('editmodeOff');
        this._eventOutput.emit('finishedDragging');
    }.bind(this));

    this.surface.setProperties({
        boxShadow: 'none'
    });

}

ClearItem.prototype = Object.create(View.prototype);

module.exports = ClearItem;