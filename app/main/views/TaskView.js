var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');

function TaskView() {
  View.apply(this, arguments);
  
  _createTask.call(this);
  _setListeners.call(this);
}

TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.DEFAULT_OPTIONS = {
  text: null,
  taskOffset: 50,
  classes: ['task']
};
function _createTask() {
  this.taskSurf = new Surface({
    size: [undefined, 40],
    classes: this.options.classes,
    content: '<p>' + this.options.text + '</p>'
  });
  
  this.taskMod = new Modifier();
  this._add(this.taskMod).add(this.taskSurf);
};

function _setListeners() {
  this.touches = [];
  
  this.taskSurf.on('touchmove', function(e) {
    this.touches.push(e.changedTouches[0]);
  }.bind(this));
    
  this.taskSurf.on('touchend', function() {
    var first = this.touches[0];    
    var last = this.touches[this.touches.length-1];
    if (this.touches.length && last.clientX > (first.clientX + 5)) {
      this._eventOutput.emit('completed');
      this.taskMod.setTransform(Transform.translate(500, 0, 0), {duration: 500, curve: "easeOut"});
    }
    this.touches = [];
  }.bind(this));
};

module.exports = TaskView;