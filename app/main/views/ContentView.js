var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var TaskView          = require('./TaskView');
var Tasks             = require('./data');


function ContentView() {
  View.apply(this, arguments);
  _populateTasks.call(this);
  _createTasks.call(this);
}

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
};

function _populateTasks() {
  this.tasks = Tasks;
};

function _createTasks() {

  this.taskViews = [];

  this.scrollview = new Scrollview();
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

module.exports = ContentView;