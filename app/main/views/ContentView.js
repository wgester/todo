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
  _taskListeners.call(this);
};

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  title: 'later',
  classes: ['contents'],
  inputDuration: 300,
  gradientDuration: 800
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
};

function _createTasks() {
  this.tasks = Tasks;

  this.taskViews = [];

  this.customscrollview = new CustomScrollView();
  this.customdragsort = new DragSort({
    draggable: {
      xRange: [0,0]
    }
  });
  var node = this.customdragsort;
 

  for(var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].page === this.options.title) {
      var newTask = new TaskView({text: this.tasks[i].text});
      this.customdragsort.push(newTask);
      this.taskViews.push(newTask);
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);    
      this.customscrollview.pipe(node);
    }
  }

  this.customscrollview.sequenceFrom(this.customdragsort);

  this._add(this.customscrollview);
};


function _taskListeners() {  
  this.on('opened', function() {
    this.backgroundMod.setTransform(Transform.translate(0, 0, 0), {duration: 0}, function() {
      this.backgroundMod.setOpacity(1, {duration: this.options.gradientDuration}, function() {});
    }.bind(this));
  }.bind(this));
  
  this.on('closed', function() {
    this.backgroundMod.setTransform(Transform.translate(0, 0, 0), {duration: 0}, function() {
      this.backgroundMod.setOpacity(0, {duration: this.options.gradientDuration}, function() {});
    }.bind(this));    
  }.bind(this));
  
  for(var i =0; i < this.taskViews.length; i++) {
    this.taskViews[i].on('openInput', function() {
      this._eventOutput.emit('showInput');
    }.bind(this));

    this.taskViews[i].on('closeInput', function() {
      this._eventOutput.emit('hideInput');
    }.bind(this));
  }
  
  _newTaskListener.call(this);
  
};

function _newTaskListener() {
  this.on('saveNewTask', function(val) {
    var newTask = new TaskItem({text: val});
    var node = this.customdragsort;

    this.customdragsort.push(newTask);
    this.taskViews.push(newTask);
    if(node.getNext()) node = node._next;
    newTask.pipe(node);
    node.pipe(this.customscrollview);
    newTask.pipe(this.customscrollview);    
    this.customscrollview.pipe(node);
  }.bind(this));
};

module.exports = ContentView;
