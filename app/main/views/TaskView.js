var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var View      = require('famous/view');

function TaskView() {
  View.apply(this, arguments);
  this.color = new Transitionable([200, 100, 100]);
  this.lightness = 50;
  this.hue = 128;
  
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

function _colorMod() {
  this.taskSurf.setProperties({
    backgroundColor: "hsl(" + this.color.get()[0] + ", 100%," + this.color.get()[2] + "%)"
  });
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
  this.taskSurf.on('touchstart', function() {
    this.color.set([this.hue, 100, this.lightness], {
      curve: "easeOut",
      duration: 2000
    });
  }.bind(this));
  
  window.Engine.on("prerender", _colorMod.bind(this));
  
  // this.taskSurf.on('touchend', function() {
  //   this.taskMod.setTransform(Transform.translate(500, 0, 0), {duration: 300})
  // }.bind(this));
};

module.exports = TaskView;