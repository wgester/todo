var Draggable        = require('famous/modifiers/draggable');
var Transform        = require('famous/transform');
var View             = require('famous/view');
var TaskItem         = require('./TaskItem');
var Modifier         = require('famous/modifier');

function TaskView(options) {
    View.apply(this, arguments);
    _addTaskItem.call(this);
    this.options.transition = {
    duration: 1300,
    curve: 'easeInOut' }
    this.animateIn = animateIn;
    this.reset = resetAnimation;
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

    this.taskItem.pipe(this._eventOutput);

    this._add(this.taskItemModifier).add(this.taskItem);
}

/*-----------------------ANIMATION-------------------------------*/

function animateIn(counter) {
  this.taskItemModifier.setTransform(
      Transform.translate(-1 * this.options.deleteCheckWidth, 0, 0), {duration: 250 * counter, curve: 'easeInOut'}
  );
  this.taskItemModifier.setOpacity(1, this.options.transition);
}

module.exports = TaskView;


function resetAnimation() {
  this.taskItemModifier.setTransform(
      Transform.translate(-1 * this.options.deleteCheckWidth, 200, 0),
      this.options.transition
  );
  this.taskItemModifier.setOpacity(0.1, this.options.transition);
}
