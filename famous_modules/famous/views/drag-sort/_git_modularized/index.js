var ViewSequence   = require('famous/view-sequence');
var Draggable      = require('famous/modifiers/draggable');
var Modifier       = require('famous/modifier');
var EventHandler   = require('famous/event-handler');
var Transform      = require('famous/transform');
var Utility        = require('famous/utilities/utility');
var OptionsManager = require('famous/options-manager');

function DragSort(options) {
    ViewSequence.apply(this, arguments);
    this.optionsManager = new OptionsManager();

    this.optionsManager.patch(Object.create(DragSort.DEFAULT_OPTIONS));
    this.optionsManager.patch(options);

    this.modifier    = new Modifier();
    this.draggable   = new Draggable(this.options.draggable);

    this.eventInput.pipe(this.eventOutput);
    this.eventOutput.pipe(this.draggable);
    this.draggable.pipe(this.eventInput);

    bindEvents.call(this);

    this.size                          = this.options.size;
    this.projection                    = (this.options.draggable.projection === 'y') ? 1 : 0;

    initializeDragMemory.call(this);

    this.deactivate();
}

DragSort.DEFAULT_OPTIONS = {
    draggable: {
        projection: 'y'
    },
    getForwardSwapThreshold: function() {
        return (this.getNext()) ? this.getNext().getSize()[this.projection] * 0.5 : 0;
    },
    getPreviousSwapThreshold: function() {
        return (this.getPrevious()) ? this.getPrevious().getSize()[this.projection] * 0.5 : 0;
    }
};

function initializeDragMemory() {
    this.lastScroll                    = 0;
    this.scrollOffset                  = 0;
    this.dragging                      = false;
    this.draggablePosition             = 0;
}

function bindEvents() {
    this.eventInput.on('editmodeOn', this.activate.bind(this));
    this.eventInput.on('editmodeOff', this.deactivate.bind(this));
    this.eventInput.on('dragstart', handleDragStart.bind(this));
    this.eventInput.on('dragmove', handleDragMove.bind(this));
    this.eventInput.on('dragend', handleDragEnd.bind(this));
}

function handleDragStart() {
    this.dragging          = true;
    this.projection        = (this.options.draggable.projection === 'y') ? 1 : 0;
    this.modifier.setTransform(Utility.transformInFrontMatrix);
}

function handleDragMove() {
    this.forwardsSwapBarrier = this.options.getForwardSwapThreshold.call(this);
    this.backwardsSwapBarrier = this.options.getPreviousSwapThreshold.call(this);
    this.draggablePosition = this.draggable.getPosition()[this.projection];
    if (this.draggablePosition > 0) {
        forwardsDrag.call(this);
    } else {
        backwardsDrag.call(this);
    }
}

function forwardsDrag() {
    if (!this.forwardsSwapBarrier) return;
    if (dragIsAForwardSwap.call(this)) {
        forwardSwap.call(this);
    }
}

function dragIsAForwardSwap() {
    return (this.draggablePosition > this.forwardsSwapBarrier) ? true : false;
}

function forwardSwap() {
    this.eventOutput.emit('swap', {
            swapper: {
                index: this.index
            },
            swappee: {
                index: this.index + 1
            }
        });

    var adjustedPosition = [0, 0];

    adjustedPosition[this.projection] = -this.options.getForwardSwapThreshold.call(this);

    this.draggable.setPosition(adjustedPosition);
}

function backwardsDrag() {
    if (!this.backwardsSwapBarrier) return;
    if (dragIsABackwardSwap.call(this)) {
        backwardSwap.call(this);
    }
}

function dragIsABackwardSwap() {
    return (this.draggablePosition < -this.backwardsSwapBarrier) ? true : false;
}

function backwardSwap() {
    this.eventOutput.emit('swap', {
        swapper: {
            index: this.index
        },
        swappee: {
            index: this.index - 1
        }
    });

    var adjustedPosition = [0, 0];

    adjustedPosition[this.projection] = this.options.getPreviousSwapThreshold.call(this);

    this.draggable.setPosition(adjustedPosition);
}

function handleDragEnd() {
    this.dragging = false;
    this.modifier.setTransform(Transform.Identity);
    initializeDragMemory.call(this);
}

DragSort.prototype = Object.create(ViewSequence.prototype);

DragSort.prototype.activate = function() {
    this.eventInput.unpipe(this.eventOutput);
    this.activated = true;
    this.draggable.activate();
    return this;
};

DragSort.prototype.deactivate = function() {
    this.eventInput.pipe(this.eventOutput);
    this.activated = false;
    this.draggable.deactivate();
    return this;
};

DragSort.prototype.isActive = function() {
    return this.activated;
};

DragSort.prototype.setPosition = function(position, transition, callback) {
    return this.draggable.setPosition(position, transition, callback);
};

DragSort.prototype.render = function() {
    var target = this.get();
    if(!target) return;
    var valueSpec = target.render.apply(target, arguments);

    var fullspec = {
        transform: this.modifier.getTransform(),
        target: this.draggable.modify(valueSpec)
    };

    return fullspec;
};

module.exports = DragSort;