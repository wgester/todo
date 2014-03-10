var Surface     = require('famous/surface');
var Context     = require('famous/context');
var Modifier    = require('famous/modifier');
var Transform   = require('famous/transform');
var TouchSync   = require("famous/input/touch-sync");

function TaskSurface(options) {
    Surface.call(this, options);
    _setListeners.call(this);
};

TaskSurface.prototype = Object.create(Surface.prototype);
TaskSurface.prototype.constructor = TaskSurface;

TaskSurface.prototype.createTask = function(text, page){
  this.size = [undefined, 40];
  this.page = page;
  this.content = '<p>' + text + '</p>';
  return this;
};

function _setListeners() {
  var position = {x: 0, y: 0};  
  var touchSync = new TouchSync(function() {
    return [0, 0];
  });

  this.pipe(touchSync);
  
  touchSync.on('start', function(e) {
    position = {x: 0, y: 0};
  }.bind(this));

  touchSync.on('update', function(data) {
    console.log(data)
    position.x += data.p[0];
    position.y += data.p[1]; 
  }.bind(this));

  touchSync.on('end', function(data) {
    if (position.x > 5) {
      this.setProperties({backgroundColor: 'green'});

    } else if (position.x < -5) {
      this.setProperties({backgroundColor: 'pink'});
    }
  }.bind(this));
};


module.exports = TaskSurface;