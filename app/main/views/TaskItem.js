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
var Timer            = require('famous/utilities/timer');

function TaskItem(options) {
    View.apply(this, arguments);
    this.timeTouched = 0;
    this.page = this.options.page;
    this.text = this.options.text;
    this.index = this.options.index;
    this.touchEnabled = true;
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
        content: '<img class="checkIcon" src="./img/check_icon_2.png">',
        properties: {
            webkitUserSelect: 'none',
        }
    });

    this.deleteBox = new Surface({
        size: [this.options.deleteCheckWidth, 60],
        classes: ['task'],
        content: '<img class="deleteIcon" src="./img/x_icon_2.png">',
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

    this.contents.pipe(this);
    this._eventInput.pipe(this._eventOutput);

    this.taskItemModifier = new Modifier({
        transform: Matrix.identity,
        size: this.options.surface.size,
        opacity: 1
    });

    this.draggable = new Draggable({
        projection: 'x',
        xRange: [-1 * this.options.deleteCheckWidth, this.options.deleteCheckWidth]
    });

    // this.pipe(this.draggable);

    this._add(this.taskItemModifier).add(this.draggable).add(this.taskItemLayout);
}

function _bindEvents() {
    this._eventInput.on('touchstart', handleStart.bind(this));
    this._eventInput.on('touchmove', handleMove.bind(this));
    this._eventInput.on('touchend', handleEnd.bind(this));
    this.on('saveTask', saveTask.bind(this));
    this.on('transformTask', transformTask.bind(this));
    this.on('unhide', unhideTask.bind(this));
    Engine.on('prerender', findTimeDeltas.bind(this));
    Engine.on('prerender', checkForDragging.bind(this));
}

function handleStart(data) {
  this._eventOutput.emit('newTouch');
  this.touchStart = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
  this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
  if (this.touchEnabled) {
      // this._eventOutput.emit('editmodeOn');
      this._eventInput.pipe(this.draggable);
      this.touched = true;
      this.distanceThreshold = false;
  } else {
    this._eventInput.unpipe(this.draggable);
    this._eventOutput.emit('xScroll');
  }
}

function handleMove(data) {
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    var distance = Math.sqrt(Math.pow((this.touchStart[0] - this.touchCurrent[0]), 2) + Math.pow((this.touchStart[1] - this.touchCurrent[1]), 2));
    if (this.touchEnabled) {
        if ((distance > 35) && !this.distanceThreshold) {
            this.distanceThreshold = true;
            var xDistance = Math.abs(this.touchStart[0] - this.touchCurrent[0]);
            var yDistance = Math.abs(this.touchStart[1] - this.touchCurrent[1]);
            if (xDistance > yDistance) {
                this._eventOutput.emit('xScroll');
            }
            if (yDistance >= xDistance) {
                this._eventInput.unpipe(this.draggable);
            }
        }
    } else {
        if (distance > 35) {
            if ((this.touchStart[1] - this.touchCurrent[1]) > 0) {
                this._eventOutput.emit('swiping', 'up');
            } else {
                this._eventOutput.emit('swiping', 'down');
            }
            this._eventOutput.emit('touchend');
        }
    }
}

function handleEnd() {
    this._eventOutput.emit('endTouch');
    this.touched = false;
    replaceTask.call(this);
    var xDistance = Math.abs(this.touchStart[0] - this.touchCurrent[0]);
    var yDistance = Math.abs(this.touchStart[1] - this.touchCurrent[1]);
    if (this.touchEnabled) {
        if (this.touchStart[1] < 90){
          this._eventOutput.emit('openInput');
        }  else if (xDistance < 10 && yDistance < 10 && this.timeTouched > 0 && this.timeTouched < 200) {      
          this._eventOutput.emit('closeInputOrEdit', {text: this.options.text, index: this.options.index});      
        }
    }

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
  if (!this.touchEnabled) {
    this._eventOutput.emit('xScroll');
    this._eventInput.unpipe(this.draggable);
  }
  if (this.touched && this.touchEnabled) {
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
};

function dragmode() {
  this.contents.addClass('dragging');
  this.taskItemModifier.setTransform(Matrix.move(Matrix.scale(1.15, 1.15, 1), [-10, 0, 60]), {duration: 100}, function() {
    this.taskItemModifier.setTransform(Matrix.move(Matrix.scale(1.05, 1.05, 1), [-5, 0, 40]), {duration: 150});
  }.bind(this));
};

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
};

function _checkOffTask() {
    this.contents.setProperties({
        backgroundColor: '#fff',
        opacity: '0.8'
    })
    this.deleteBox.addClass('invisible');
    this.draggable.setPosition([-1 * this.options.deleteCheckWidth - window.innerWidth, 0], this.options.taskItemExitTransition, function() {
        console.log('check me off');
        // vibrate();
        this._eventOutput.emit('completed');
        this._eventOutput.emit('deleteTask');
    }.bind(this));
};

function _deleteTask() {
    this.checkBox.addClass('invisible');
    this.draggable.setPosition([this.options.deleteCheckWidth + window.innerWidth, 0], this.options.taskItemExitTransition, function() {
        // vibrate();
        this._eventOutput.emit('deleted');
        this._eventOutput.emit('deleteTask');
    }.bind(this));
};

function _springTaskBack() {
    this.draggable.setPosition([0, 0], this.options.taskItemSpringTransition);
};

function saveTask(text) {
  this.text = text;
  this.contents.setContent('<p>' + text + '</p>');
};

function unhideTask() {
  this.contents.setProperties({'display': 'block'});
  this.taskItemModifier.setTransform(Matrix.translate(0, 0, 40), {curve: 'easeOut', duration: 300}, function() { 
    Timer.after(function() {
      this.contents.setProperties({'backgroundColor': 'rgba(255, 255, 255, 0.07)'});
      this.taskItemModifier.setTransform(Matrix.translate(0, 0, 0), {curve: 'easeOut', duration: 500}, function() {});      
    }.bind(this), 10);
  }.bind(this));  
};

function transformTask() {
  this.contents.setProperties({'backgroundColor': 'white'});
  this.taskItemModifier.setTransform(Matrix.move(Matrix.scale(1.1, 1.1, 1), [-10, 0, 60]), {duration: 100}, function() {
    this.taskItemModifier.setTransform(Matrix.move(Matrix.scale(1.05, 1.05, 1), [-5, 0, 40]), {duration: 150}, function() {
      this._eventOutput.emit('openLightbox', {text: this.text, index: this.index});        
      Timer.after(function() {
        this.contents.setProperties({'display': 'none'});
        var offset = this.page === 'FOCUS' ? this.index * -60 - 250: (this.index+1) * -60;
        this.taskItemModifier.setTransform(Matrix.translate(0,offset,0));
      }.bind(this), 5);      
    }.bind(this));
  }.bind(this));

  // this.contents.setProperties({'backgroundColor': 'white'});  
    // this.taskItemModifier.setTransform(Matrix.translate(0, 0, 40), {curve: 'easeOut', duration: 300}, function() {
    //   this._eventOutput.emit('openLightbox', {text: this.text, index: this.index});        
    //   Timer.after(function() {
    //     this.contents.setProperties({'display': 'none'});
    //     var offset = this.page === 'FOCUS' ? this.index * -60 - 250: (this.index+1) * -60;
    //     this.taskItemModifier.setTransform(Matrix.translate(0,offset,0));
    //   }.bind(this), 5);
    // }.bind(this));  
};

function vibrate() {
    navigator.notification.vibrate();
    navigator.notification.vibrate(300);
}

module.exports = TaskItem;
