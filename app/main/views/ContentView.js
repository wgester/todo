var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var Transitionable    = require('famous/transitions/transitionable');
var TaskView          = require('./TaskView');
var Tasks             = require('./data');

var Timer             = require('famous/utilities/timer');

function ContentView() {
  View.apply(this, arguments);
  this.lightness = 75;

  this.color = new Transitionable([360, 100, 100]);
  _createBackground.call(this);

  _createTasks.call(this);
  _taskListeners.call(this);
}

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  classes: ['contents']
};

function _createBackground() {
  this.backgroundSurf = new Surface({
    size: [undefined, undefined]
  });

  this.backgroundModifier = new Modifier();
  this._add(this.backgroundModifier).add(this.backgroundSurf);
};


function _completeColorMod() {
  this.backgroundSurf.setProperties({
    backgroundColor: 'hsl(145, 63%,' + this.color.get()[2] + '%)'
  });
};



function _createTasks() {
  this.tasks = Tasks;

  this.taskViews = [];

  this.scrollview = new Scrollview();
  this.scrollview.sequenceFrom(this.taskViews);

  for(var i = 0; i < this.tasks.length; i++) {
    var newTask = new TaskView({text: this.tasks[i].text});
    newTask.pipe(this.scrollview);    
    this.taskViews.push(newTask);
  }

  console.log(this.scrollview)

  this._add(this.scrollview);
};

function _taskListeners() {
  window.Engine.on('prerender', _completeColorMod.bind(this));

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