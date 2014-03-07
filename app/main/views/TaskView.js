var Surface       = require('famous/surface');
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var View          = require('famous/view');

function TaskView() {
  View.apply(this, arguments);

  _createTask.call(this);
  _setListeners.call(this);
}

TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.DEFAULT_OPTIONS = {
  text: null,
  taskOffset: 39,
  classes: ['task']
};

function _createTask() {

  this.taskSurf = new Surface({
    size: [undefined, 40],
    classes: this.options.classes,
    content: '<p>' + this.options.text + '</p>',
    properties: {
      backgroundColor: 'white',
      border: '1px solid black'
    }
  });
  
  this.taskMod = new Modifier();
  this._add(this.taskMod).add(this.taskSurf);
};

function _setListeners() {
  this.taskSurf.on('touchstart', function() {
    this.taskSurf.setProperties({backgroundColor: '#C7F1D9'});
  }.bind(this));
  
  this.taskSurf.on('touchend', function() {
    this.taskMod.setTransform(Transform.translate(500, 0, 0), {duration: 300})
  }.bind(this));
};

module.exports = TaskView;