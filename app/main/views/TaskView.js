var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');
var TouchSync = require("famous/input/touch-sync");
var Draggable = require('famous/modifiers/draggable')

function TaskView() {
  View.apply(this, arguments);

  _createTask.call(this);
  _setListeners.call(this);
}

TaskView.prototype = Object.create(View.prototype);
TaskView.prototype.constructor = TaskView;

TaskView.DEFAULT_OPTIONS = {
  text: null,
  // taskOffset: 70,
  classes: ['task']
};

function _createTask() {
  this.taskSurf = new Surface({
    size: [undefined, 70],
    classes: this.options.classes,
    content: '<p>' + this.options.text + '</p>'
  });
  // this.taskMod = new Modifier();
  this.taskSurf.pipe(this._eventOutput);
  this._add(this.taskSurf);
};

function _setListeners() {
  var position = {x: 0, y: 0};  
  var touchSync = new TouchSync(function() {
      return [0, 0];
  });

  this.taskSurf.pipe(touchSync);
  
  touchSync.on('start', function(e) {
    position = {x: 0, y: 0};
  }.bind(this));

  touchSync.on("update", function(data) {
    position.x += data.p[0];
    position.y += data.p[1]; 
  }.bind(this));

  touchSync.on('end', function(data) {
    if (position.x > 5) {
      this._eventOutput.emit('completed');
      // this.taskMod.setTransform(Transform.translate(500, 0, 0), {duration: 500, curve: "easeOut"});
    } else if (position.x < -5) {
      this.taskSurf.setProperties({backgroundColor: 'pink'});
      // this.taskMod.setTransform(Transform.translate(-500, 0, 0), {duration: 500, curve: "easeOut"});            
    }
  }.bind(this));
};

module.exports = TaskView;
