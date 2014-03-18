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
      opacity: 0.1
    });
    this.animateIn(3);
    this.taskItem.pipe(this._eventOutput);

    this._add(this.taskItemModifier).add(this.taskItem);
}

/*-----------------------ANIMATION-------------------------------*/

TaskView.prototype.animateIn = function(counter) {
  this.taskItemModifier.setTransform(
      Transform.translate(-1 * this.options.deleteCheckWidth, 0, 0), {duration: 180 * counter, curve: 'easeInOut'}
  );
  console.log(counter)
  this.taskItemModifier.setOpacity(1, this.options.transition);
}


TaskView.prototype.resetAnimation = function() {
  this.taskItemModifier.setTransform(
      Transform.translate(-1 * this.options.deleteCheckWidth, 1000, 0),
      this.options.transition
  );
  this.taskItemModifier.setOpacity(0.1, this.options.transition);
}
module.exports = TaskView;
