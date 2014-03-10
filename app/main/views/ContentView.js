var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');

var TaskView          = require('./TaskView');
var Tasks             = require('./data');


function ContentView() {
  View.apply(this, arguments);
  _createTasks.call(this);
  _taskListeners.call(this);
}

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  classes: ['content']
};


function _createTasks() {
  this.tasks = Tasks;

  this.taskViews = [];

  this.scrollview = new Scrollview();
  // console.log('inner width ', window.innerWidth)
  this.scrollview.getSize = function(){
    return [undefined, 100];
  }

  this.scrollview.setPosition(0.8);
  this.scrollview.sequenceFrom(this.taskViews);

  for(var i = 0; i < this.tasks.length; i++) {
    if (this.options.title === this.tasks[i].page) {
      var newTask = new TaskView({text: this.tasks[i].text});
      newTask.pipe(this.scrollview);    
      this.taskViews.push(newTask);
    }
  }

  this._add(this.scrollview);
};

function _taskListeners() {

  for(var i = 0; i < this.taskViews.length; i++) {
    _setOneCompleteListener.call(this, this.taskViews[i]);     
  }

function _setOneCompleteListener(surface) {
  surface.on('completed', function() {
    this.color.set([145, 63, this.lightness], {
      duration: 250
    }, function() {
      Timer.after(function() {
        this.color.set([145, 63, 100], {
          duration: 250
        });      
      }.bind(this), 7);            
    }.bind(this));
  }.bind(this));  
};

}

module.exports = ContentView;