var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
// var View      = require('famous/view');
var TouchSync = require("famous/input/touch-sync");

function TaskSurface (options) {
  Surface.apply(this, arguments);

  // _setListeners.call(this);
}

TaskSurface.prototype = Object.create(Surface.prototype);
TaskSurface.prototype.elementClass = 'task';

TaskSurface.DEFAULT_OPTIONS = {
  text: null,
  classes: ['task']
};

TaskSurface.prototype.createTask = function(text, page){
  this.size = [undefined, 40];
  this.page = page;
  this.content = '<p>' + text + '</p>'
  return this;
}

TaskSurface.prototype.setListeners = function() {
  var position = {x: 0, y: 0};  
  var touchSync = new TouchSync(function() {
      return [0, 0];
  });

  this.pipe(touchSync);
  
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
      this.setProperties({backgroundColor: 'pink'});
      // this.taskMod.setTransform(Transform.translate(-500, 0, 0), {duration: 500, curve: "easeOut"});            
    }
  }.bind(this));
};

module.exports = TaskSurface;