var Draggable = require('famous/modifiers/draggable');

function CustomDraggable(options) {
  Draggable.apply(this, arguments);
  // _listenForSnapEvents.call(this);
}

CustomDraggable.prototype = Object.create(Draggable.prototype);
CustomDraggable.prototype.constructor = CustomDraggable;

CustomDraggable.prototype.setOptions = function(options){
  if (options.projection !== undefined) this.options.projection = options.projection;
  if (options.scale !== undefined)      this.options.scale      = options.scale;
  if (options.xRange !== undefined)     this.options.xRange     = options.xRange;
  if (options.yRange !== undefined)     this.options.yRange     = options.yRange;
  if (options.snapX !== undefined)      this.options.snapX      = options.snapX;
  if (options.snapY !== undefined)      this.options.snapY      = options.snapY;
  if (options.transition !== undefined) this.options.transition = options.transition;
}

function _listenForSnapEvents() {
  this.sync.on('update', function(event) {
    console.log(event);
  }.bind(this));
}

module.exports = CustomDraggable;
