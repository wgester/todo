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
  taskOffset: 70,
  classes: ['task']
};

function _createTask() {
  this.taskSurf = new Surface({
    size: [undefined, 70],
    classes: this.options.classes,
    content: '<p>' + this.options.text + '</p>'
  });
  
  this.taskMod = new Modifier();
  this._add(this.taskMod).add(this.taskSurf);
};

function _setListeners() {
        
  this.taskSurf.on('touchstart', function(e) {
    this.startTouch = e.changedTouches[0].clientX;
  }.bind(this));
    
  this.taskSurf.on('touchend', function(e) {
    var endTouch = e.changedTouches[0].clientX;
    
    if (endTouch > this.startTouch + 5) {
      this._eventOutput.emit('completed');
      this.taskMod.setTransform(Transform.translate(500, 0, 0), {duration: 500, curve: "easeOut"});
    } else if (endTouch < this.startTouch - 5) {
      this.taskSurf.setProperties({backgroundColor: "pink"});
      this.taskMod.setTransform(Transform.translate(-500, 0, 0), {duration: 300, curve: "easeOut"});            
    }
    
  }.bind(this));
};

module.exports = TaskView;