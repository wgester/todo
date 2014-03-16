var Draggable        = require('famous/modifiers/draggable');
var Transform        = require('famous/transform');
var View             = require('famous/view');
var TaskItem         = require('./TaskItem');
var Modifier         = require('famous/modifier');

function TaskView(options) {
    View.apply(this, arguments);
    _addTaskItem.call(this, options);
}

TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.DEFAULT_OPTIONS = {
};


function _addTaskItem(options) {
    this.taskItem = new TaskItem(options);
    
    this.taskItemModifier = new Modifier({
      transform: Transform.translate(-60, 0, 0),
      size: [undefined, 60]
    });

    this.taskItem.pipe(this._eventOutput);

    this._add(this.taskItemModifier).add(this.taskItem);
}

module.exports = TaskView;
