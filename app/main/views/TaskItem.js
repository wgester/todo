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
var Transform        = require('famous/transform');
var Easing           = require('famous/animation/easing');

function TaskItem(options) {
    View.apply(this, arguments);
    this.timeTouched = 0;
    _createLayout.call(this);
    _bindEvents.call(this);
    _setDate.call(this);
}

TaskItem.prototype = Object.create(View.prototype);
TaskItem.prototype.constructor = TaskItem;

TaskItem.DEFAULT_OPTIONS = {
    index: null,
    surface: {
        classes: ['task'],
        size: [undefined, 60],
        properties: {
            webkitUserSelect: 'none'
        }
    },
    taskItemSpringTransition: {
        method: 'spring',
        duration: 200
    },
    taskItemExitTransition: {
        curve: 'easeIn',
        duration: 200
    },
    dragThreshold: 600
};

function _createLayout() {
    this.checkBox = new Surface({
        size: [this.options.deleteCheckWidth, 60],
        classes: ['task'],
        content: '<img class="checkIcon" src="./img/check_icon.png">',
        properties: {
            webkitUserSelect: 'none'
        }
    });

    this.deleteBox = new Surface({
        size: [this.options.deleteCheckWidth, 60],
        classes: ['task'],
        content: '<img class="deleteIcon" src="./img/x_icon.png">',
        properties: {
            webkitUserSelect: 'none'
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
        index: 0
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
        xRange: [-1 * this.options.deleteCheckWidth, this.options.deleteCheckWidth]
    });

    this.contents.pipe(this.draggable);
    
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
    
  (this.touchStart[1] < 90) ? this._eventOutput.emit('openInput') : this._eventOutput.emit('closeInput');
   
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
            this._eventInput.unpipe(this.draggable);
        }
    }
}

function handleEnd() {
    this.touched = false;
    replaceTask.call(this);
    this.timeTouched = 0;
    this._eventInput.pipe(this.draggable);
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
        if (this.timeTouched > this.options.dragThreshold) {
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
    this.contents.addClass('dragging');
    this.taskItemModifier.setTransform(Matrix.translate(0, 0, 40), {
        curve: 'easeOut',
        duration: 300
    });
}

function replaceTask() {
    this.taskItemModifier.setTransform(Matrix.identity, {
        curve: 'easeOut',
        duration: 100
    }, function() {
        this._eventOutput.emit('editmodeOff');
        this._eventOutput.emit('finishedDragging');
        this.contents.removeClass('dragging');
        var xPosition = this.draggable.getPosition()[0];
        if (xPosition > this.options.xThreshold) {
            _checkOffTask.call(this);
        } else if (xPosition < -1 * this.options.xThreshold) {
            _deleteTask.call(this);
        } else {
            _springTaskBack.call(this);
        }
    }.bind(this));
}

function _checkOffTask() {
    this.deleteBox.addClass('invisible');
    this.draggable.setPosition([-1 * this.options.deleteCheckWidth - window.innerWidth, 0], this.options.taskItemExitTransition, function() {
        console.log('check me off');
        // this._eventOutput.emit('deleteTask');
    }.bind(this));
}

function _deleteTask() {
    this.checkBox.addClass('invisible');
    this.draggable.setPosition([this.options.deleteCheckWidth + window.innerWidth, 0], this.options.taskItemExitTransition, function() {
        console.log('delete me');
        // this._eventOutput.emit('deleteTask');
    }.bind(this));
}

function _springTaskBack() {
    this.draggable.setPosition([0, 0], this.options.taskItemSpringTransition);
}

module.exports = TaskItem;
