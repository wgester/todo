var Draggable        = require('famous/modifiers/draggable');
var Transform        = require('famous/transform');
var View             = require('famous/view');
var Modifier         = require('famous/modifier');
var TaskItem         = require('./TaskItem');

function TaskView(options) {
    View.apply(this, arguments);
    _addTaskItem.call(this);
    this.options.transition = {
    duration: 1300,
    curve: 'easeInOut' };
    this.animateIn = animateIn;
    this.resetAnimation = resetAnimation;
}

TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.DEFAULT_OPTIONS = {
    deleteCheckWidth: 100,
    xThreshold: 95
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

/*-----------------------ANIMATION-------------------------------*/


function animateIn(counter) {
  counter = counter/2
  var deleteCheck = -1 * this.options.deleteCheckWidth;
  this.taskItemModifier.setTransform(
      Transform.translate(deleteCheck, 0, 0), {duration: 300 * counter, curve: 'easeInOut'}, function() {
        this.taskItemModifier.setTransform(
          Transform.translate(deleteCheck, -5, 0), {duration: 200, curve: 'easeInOut'}, function() {
            this.taskItemModifier.setTransform(
          Transform.translate(deleteCheck, 0, 0), {duration: 180, curve: 'easeInOut'}, function() {}.bind(this))
        }.bind(this))
      }.bind(this));
  this.taskItemModifier.setOpacity(1, this.options.transition, function() {});
};

function resetAnimation(title) {
  this.taskItemModifier.setOpacity(0, {duration:0}, function() {});
  this.taskItemModifier.setTransform(
      Transform.translate(-1 * this.options.deleteCheckWidth, 1000, 0),
      this.options.transition, function() {});
  this.taskItemModifier.setOpacity(0.1, this.options.transition, function() {});
};


module.exports = TaskView;
