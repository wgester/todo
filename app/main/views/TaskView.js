var Draggable        = require('famous/modifiers/draggable');
var Transform        = require('famous/transform');
var View             = require('famous/view');
var Modifier         = require('famous/modifier');
var TaskItem         = require('./TaskItem');
var Timer            = require('famous/utilities/timer');
var Easing           = require('famous/animation/easing');   

//// This subview used for animation of tasks in to the PageView instance
//// See the animateIn method

function TaskView(options) {
    View.apply(this, arguments);
    _addTaskItem.call(this);
    this.options.transition = {
        duration: 1300,
        curve: 'easeInOut' 
    };
    this.animateIn = animateIn;
    this.resetAnimation = resetAnimation;
    this.page = this.options.page;
    this.text = this.options.text;
    _addEventListeners.call(this);

}

TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.DEFAULT_OPTIONS = {
  deleteCheckWidth: 100,
  xThreshold: 95,
  dipTransition: {
    curve: function(t) {
      return Easing.outBack(t, 0.5, 0.5, 1);
    },
    duration: 1000
  },
  noTransition: {
    duration: 0
  }
};


function _addTaskItem() {
  this.taskItem = new TaskItem(this.options);

  this.taskItemModifier = new Modifier({
    transform: Transform.translate(-1 * this.options.deleteCheckWidth, 1000, 0),
    size: [undefined, 60],
    opacity: 0.01
  });

  this.taskItem.pipe(this._eventOutput);

  this._add(this.taskItemModifier).add(this.taskItem);

};

function _addEventListeners() {
    this._eventInput.on('twoFingerMode', _disableTouch.bind(this));
    this._eventInput.on('twoFingerModeDisabled', _enableTouch.bind(this));
}

function _disableTouch() {
    this.taskItem.touchEnabled = false;
}

function _enableTouch() {
    this.taskItem.touchEnabled = true;
    console.log('enablingtouch')
}

/*-----------------------ANIMATION-------------------------------*/

TaskView.prototype.appearIn = function() {
  this.taskItemModifier.setTransform(Transform.translate(-1 * this.options.deleteCheckWidth, 0, 0));
  this.taskItemModifier.setOpacity(1);
};

function animateIn(counter, source) {
  var deleteCheck = -1 * this.options.deleteCheckWidth;
  var animationDelay = 20 + 6 * counter; //in frames?
  
  //// If animating the tasks from the top, change their position to above the screen before animation
  if (source === 'up') {
    this.taskItemModifier.setTransform(Transform.translate(deleteCheck, -1000, 0), this.options.noTransition, function(){});
  }

  //default the tasks are animated in from off creen from the bottom

  Timer.after(function() {
    this.taskItemModifier.setTransform(Transform.translate(deleteCheck, 0, 0), this.options.dipTransition, function() {
      this.taskItemModifier.setOpacity(1, this.options.transition, function() {});
    }.bind(this));
  }.bind(this), animationDelay);
};

TaskView.prototype.appearIn = function() {
    this.taskItemModifier.setTransform(Transform.translate(-1 * this.options.deleteCheckWidth, 0, 0));
    this.taskItemModifier.setOpacity(1);
};

function resetAnimation(title) {
  this.taskItemModifier.setTransform(Transform.translate(-1 * this.options.deleteCheckWidth, 1000, 0));
  this.taskItemModifier.setOpacity(0.01);
};


module.exports = TaskView;
