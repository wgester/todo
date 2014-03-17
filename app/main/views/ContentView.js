var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var TaskView          = require('./TaskView');
var Tasks             = require('./data');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');
var Timer             = require('famous/utilities/timer');
var InputSurface      = require('famous/surfaces/input-surface');
var DragSort          = require('famous/views/drag-sort');
var CustomScrollView  = require('./customScrollView');
var TaskItem          = require('./TaskItem');


function ContentView() {
  View.apply(this, arguments);
  this.lightness = 75;
  this.inputToggled = false;

  _setBackground.call(this);
  _createTasks.call(this);
  _setListeners.call(this);
};

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  title: 'later',
  classes: ['contents'],
  inputDuration: 300,
  gradientDuration: 800,
  completionDuration: 500
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};

function _setBackground() {
  var index;
  if (this.options.title === 'FOCUS') {
    index = 0;
  } else if (this.options.title === 'TODAY') {
    index = 1;
  } else if (this.options.title === 'LATER') {    
    index = 2;
  } else {
    index = 0;
  }
  this.backgroundSurf = window.faderSurfaces[index];
  this.backgroundMod = window.faderMods[index];
  
  this.touchSurf = new Surface({
    size: [undefined, undefined],
    properties: {
      backgroundColor: 'transparent'
    }
  });
  
  this.touchMod = new Modifier({
    transform: Transform.translate(0, 0, 0)
  });
  
  this._add(this.touchMod).add(this.touchSurf);
};


function _createTasks() {
  this.tasks = Tasks;
  this.taskViews = [];
  this.taskCount = 0;

  this.customscrollview = new CustomScrollView();
  this.customdragsort = new DragSort({
    draggable: {
      xRange: [0,0]
    }
  });
  var node = this.customdragsort;
 
  for(var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].page === this.options.title) {
      var newTask = new TaskView({text: this.tasks[i].text, index: i});
      this.customdragsort.push(newTask);
      this.taskViews.push(newTask);
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);    
      this.customscrollview.pipe(node);
    }
  }
  this.scrollMod = new Modifier({
    transform: Transform.translate(0, 0, 1)
  });

  this.taskCount = this.taskViews.length;
  this.customscrollview.sequenceFrom(this.customdragsort);
  this._add(this.scrollMod).add(this.customscrollview);    

};

function _setListeners() {    
  _gradientListener.call(this);  
  _newTaskListener.call(this);
  _inputListener.call(this);
};

function _newTaskListener() {
  var node = this.customdragsort;
  
  this.on('saveNewTask', function(val) {
    if (this.options.title === 'FOCUS' && this.taskCount > 2) {
      return;
    }
    
    var newTask = new TaskView({text: val});
    this.customdragsort.push(newTask);
    if(node.getNext()) node = node._next;
    newTask.pipe(node);
    node.pipe(this.customscrollview);
    newTask.pipe(this.customscrollview);    
    this.customscrollview.pipe(node);
    _completionListener.call(this, newTask);
    this.taskCount++;
  }.bind(this));
};

function _inputListener() {
  for(var i =0; i < this.taskViews.length; i++) {
    this.taskViews[i].on('openInput', function() {
      this._eventOutput.emit('showInput');
    }.bind(this));

    this.taskViews[i].on('closeInput', function() {
      this._eventOutput.emit('hideInput');
    }.bind(this));
    
    _completionListener.call(this, this.taskViews[i]);
  }
  
  this.touchSurf.on('touchstart', function() {
    this.inputToggled = !this.inputToggled;
    this.inputToggled ? this._eventOutput.emit('showInput') : this._eventOutput.emit('hideInput');
  }.bind(this));
};

function _gradientListener() {
  this.on('opened', function() {
    this.backgroundMod.setOpacity(1, {duration: this.options.gradientDuration}, function() {});
  }.bind(this));
  
  this.on('closed', function() {
    this.backgroundMod.setOpacity(0, {duration: this.options.gradientDuration}, function() {});
  }.bind(this));
};

function _completionListener(task) {
  task.on('completed', function() {
    this.taskCount--;
    // window.completionMod.setOpacity(1, {duration: this.options.completionDuration}, function() {
    //   window.completionMod.setOpacity(0, {duration: this.options.completionDuration}, function () {});
    // }.bind(this));    
  }.bind(this));
  
  task.on('deleted', function() {
    this.taskCount--;
  }.bind(this));
};

module.exports = ContentView;
