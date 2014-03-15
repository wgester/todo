var Engine           = require('famous/engine');
var View             = require('famous/view');
var Surface          = require('famous/surface');
var Modifier         = require('famous/modifier');
var Matrix           = require('famous/transform');
var Transitionable   = require('famous/transitions/transitionable');
var HeaderFooter     = require('famous/views/header-footer-layout');
var Utility          = require('famous/utilities/utility');
var SequentialLayout = require('famous/views/sequential-layout');
var ViewSequence     = require('famous/view-sequence');
var Draggable        = require('famous/modifiers/draggable');


function TaskItem(options) {
    View.apply(this, arguments);

    this._optionsManager.patch(TaskItem.DEFAULT_OPTIONS);

    this._optionsManager.patch(options);     

    //Instance properties
    this.dragThreshold = 600;
    this.timeTouched   = 0;

    //Private Method calls for opject instantiation
    // _createSurface.call(this, options);
    _createLayout.call(this);
    _bindEvents.call(this);
    _setDate.call(this);
}

TaskItem.prototype = Object.create(View.prototype);
TaskItem.prototype.constructor = TaskItem;

TaskItem.DEFAULT_OPTIONS = {
    index: 0,
    surface: {
        classes: ['task'],
        size: [undefined, 60],
        properties: {
            webkitUserSelect: 'none'
        }
    }
};

function _createLayout() {
    this.checkBox = new Surface({
        size: [60, 60],
        properties: {
            backgroundColor: '#3cf'
        }
    });

    this.deleteBox = new Surface({
        size: [60, 60],
        properties: {
            backgroundColor: 'red'
        }
    });

    this.contents = new Surface({
        size:    [window.innerWidth, 60],
        classes: ['task'],
        content: '<p>' + this.options.text + '</p>',
        properties: {
            webkitUserSelect: 'none'    
        }
    });

    var surfaces = [
        this.checkBox,
        this.contents,
        this.deleteBox
    ];

    this.taskItemViewSequence = new ViewSequence({
        array: surfaces,
        index: 1
    });
    this.taskItemLayout = new SequentialLayout();
    this.taskItemLayout.sequenceFrom(this.taskItemViewSequence);

    this.contents.pipe(this._eventInput);
    this._eventInput.pipe(this._eventOutput);
    
    this.taskItemModifier = new Modifier({
        transform: Matrix.identity,
        size: this.options.surface.size
    });

    this.draggable = new Draggable({
        projection: 'x',
        xRange: [-60, 60],
        snapX: -60,
        transition: {
            duration: 300,
            curve: 'easeOut'
        }
    });

    this._eventInput.pipe(this.draggable);
    

    this._add(this.taskItemModifier).add(this.draggable).add(this.taskItemLayout);
}

function _bindEvents() {
    this._eventInput.on('touchstart', handleStart.bind(this));
    this._eventInput.on('touchmove', handleMove.bind(this));
    this._eventInput.on('touchend', handleEnd.bind(this));
    this._eventInput.on('click', handleClick.bind(this));
    Engine.on('prerender', findTimeDeltas.bind(this));
    Engine.on('prerender', checkForDragging.bind(this));
}

function handleClick() {
    if (this.timeTouched < this.clickThreshold) {

    }
}

function handleStart(data) {
    this.touched = true;
    this.touchStart = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
}

function handleMove(data) {
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    var distance = Math.sqrt(Math.pow((this.touchStart[0] - this.touchCurrent[0]), 2) + Math.pow((this.touchStart[1] - this.touchCurrent[1]), 2));
    if (distance > 35) {
        var xDistance = Math.abs(this.touchStart[0] - this.touchCurrent[0]);
        var yDistance = Math.abs(this.touchStart[1] - this.touchCurrent[1]);
        if (xDistance > yDistance) {
            this._eventOutput.emit('xScroll');
        }
        if (yDistance > xDistance) {
            this._eventOutput.emit('yScroll');
        }
    }
}

function handleEnd() {
    this.touched = false;
    regularmode.call(this);
    this.timeTouched = 0;
}

function deleteTask() {
    this._eventOutput.emit('deleteTask');
}

function findTimeDeltas() {
    this.lastFrameTime = this.now;
    this.now = Date.now();

    this.timeDelta = this.now - this.lastFrameTime;
}

function _setDate() {
    this.now = Date.now();
    this.lastFrameTime = Date.now();
}

function checkForDragging(data) {
    if (this.touched) {
        this.timeTouched += this.timeDelta;
        if (this.timeTouched > this.dragThreshold) {
            var distance = Math.sqrt(Math.pow((this.touchStart[0] - this.touchCurrent[0]), 2) + Math.pow((this.touchStart[1] - this.touchCurrent[1]), 2));
            if (distance < 25) {
                this._eventInput.unpipe(this.draggable);
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
    this.taskItemModifier.setTransform(Matrix.translate(0, 0, 40), {
        curve: 'easeOutBounce',
        duration: 300
    });

    this.contents.setProperties({
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 20)'
    });
}

function regularmode() {
    this.taskItemModifier.setTransform(Matrix.identity, {
        curve: 'easeOut',
        duration: 200
    }, function() {
        this._eventOutput.emit('editmodeOff');
        this._eventOutput.emit('finishedDragging');
    }.bind(this));

    this.contents.setProperties({
        boxShadow: 'none'
    });
}

module.exports = TaskItem;
