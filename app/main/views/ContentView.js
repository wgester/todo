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
var Color             = require('./Color');

function ContentView() {
  View.apply(this, arguments);
  this.lightness = 75;
  this.inputToggled = false;
  this.shown = {};


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
  views: {
    'FOCUS': [0],
    'TODAY': [1],
    'LATER': [2],
    'NEVER': [3]
  },
  gradientDuration: 800,
  completionDuration: 500
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

function _setBackground() {
  var index = this.options.views[this.options.title][0];

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
  this.taskCount = 0;

  this.customscrollview = new CustomScrollView({page: this.options.title});
  this.customdragsort = new DragSort({
    draggable: {
      xRange: [0,0]
    }
  });
  var node = this.customdragsort;
  for(var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].page === this.options.title) {
      var newTask = new TaskView({text: this.tasks[i].text, index: this.taskCount, page: this.options.title});
      this.customdragsort.push(newTask);
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);
      this.customscrollview.pipe(node);
      this.taskCount++;
    }
  }
  this.scrollMod = new Modifier({
    transform: Transform.translate(0, 0, 1)
  });

  this.customscrollview.sequenceFrom(this.customdragsort);
  this.customscrollview.pipe(this._eventInput);
  this._add(this.scrollMod).add(this.customscrollview);

};

function _setListeners() {
  _gradientListener.call(this);
  _newTaskListener.call(this);
  _inputListeners.call(this);
};

function _newTaskListener() {

  this.on('saveNewTask', function(val) {
    var node = this.customdragsort.find(0);
    if (this.options.title === 'FOCUS' && this.taskCount > 2) {
      return;
    }

    var newTask = new TaskView({text: val, index: this.taskCount, page: this.options.title});
    this.customdragsort.push(newTask);
    for (var j = 0; j < this.taskCount - 1; j++) {
      node = node._next;
    }
    if(node.getNext()) node = node._next;
    newTask.pipe(node);
    node.pipe(this.customscrollview);
    newTask.pipe(this.customscrollview);
    // newTask.pipe(this.customdragsort);
    this.customscrollview.pipe(node);

    _openInputListener.call(this, newTask);
    _closeInputListener.call(this, newTask);
    _completionListener.call(this, newTask);
    this.taskCount++;
    newTask.animateIn(3);
  }.bind(this));
};

function _inputListeners() {
  for(var i =0; i < this.customdragsort.array.length; i++) {
    _openInputListener.call(this, this.customdragsort.array[i]);
    _closeInputListener.call(this, this.customdragsort.array[i]);
    _completionListener.call(this, this.customdragsort.array[i]);
  }

  this.touchSurf.on('touchstart', function() {
    this.inputToggled = !this.inputToggled;
    this.inputToggled ? this._eventOutput.emit('showInput') : this._eventOutput.emit('hideInput');
  }.bind(this));
};

function _openInputListener(task) {
  task.on('openInput', function() {
    this.inputToggled = true;
    this._eventOutput.emit('showInput');
  }.bind(this));
};

function _closeInputListener(task) {
  task.on('closeInputOrEdit', function(options) {
    if (this.inputToggled) {
      this._eventOutput.emit('hideInput');
      this.inputToggled = false;
    } else {
      this._eventOutput.emit('openEdit', options);
    }
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


/* PROBLEMS:
1. get splice to work
2. increase timeout for each one, decrease duration so that it comes in later and faster
*/
ContentView.prototype.animateTasksIn = function(title) {
  this.shown = {};
  var counter = 1;
  Engine.on('prerender', function(){
    var toShow = {}; var scrollview;
    if(this.customscrollview.options.page === title) scrollview = this.customscrollview;

    if(scrollview._offsets[0] === undefined) return;

    for(var task in scrollview._offsets) {

        if(task !== "undefined") {

        var taskObject = scrollview.node.array[task];
        var taskOffset = scrollview._offsets[task];

        if(taskOffset > -10 && taskOffset < window.innerHeight) {
          toShow[taskObject] = true;

          if(!this.shown[taskObject] && taskObject) {
            counter++;
            taskObject.animateIn(counter);
            // this.shown[taskObject] = true;
          }
        }
      }

  }

    // RESET ANIMATION
    for(var taskObj in this.shown) {
      if(taskObj !== "undefined") {
        if(!(taskObj in toShow)) {
          taskObj.resetAnimation();
        }

      }
    }
    this.shown = toShow;

  }.bind(this));
}

module.exports = ContentView;
