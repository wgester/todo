var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var TaskView          = require('./TaskView');
var Tasks             = window._taskData || [];
// var Tasks             = require('./data');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');
var Timer             = require('famous/utilities/timer');
var InputSurface      = require('famous/surfaces/input-surface');
var DragSort          = require('famous/views/drag-sort');
var CustomScrollView  = require('./customScrollView');
var TaskItem          = require('./TaskItem');
var Color             = require('./Color');

function ContentView(options) {
  View.apply(this, arguments);
  this.lightness = 75;
  this.inputToggled = false;
  this.title = this.options.title;
  this.swappedTask = false;  
  this.shown = {}; 
  this.toShow = {};
  this.notAnimated = true;
  this.gradientsRunning = true;
  
  this.shown = {}; this.toShow = {};
  this.scrolled = false;

  _setBackground.call(this);
  _createTasks.call(this);
  _setListeners.call(this);

  _monitorOffsets.call(this);
  _hideLastTask.call(this);
};

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  title: 'FOCUS',
  classes: ['contents'],
  inputDuration: 300,
  views: {
    'FOCUS': [0],
    'TODAY': [1],
    'LATER': [2],
    'NEVER': [3]
  },
  gradientDuration: 500,
  completionDuration: 500
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

function _setBackground() {
  var index = this.options.views[this.options.title][0];
  this.backgroundSurfOne = window.faderSurfaces[index][0];
  this.backgroundModOne = window.faderMods[index][0];
  
  this.backgroundSurfTwo = window.faderSurfaces[index][1];
  this.backgroundModTwo = window.faderMods[index][1];

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
  this.tasks = window.memory.read(this.options.title);
  // this.tasks = this.options.title === 'LATER' ? window.asanaTasks : Tasks;
  this.taskCount = 0;

  this.customscrollview = new CustomScrollView({page: this.title});
  this.customdragsort = new DragSort({
    draggable: {
      xRange: [0,0]
    }
  });
  var node = this.customdragsort;
  for(var i = 0; i < this.tasks.length; i++) {
    var newTask = new TaskView({text: this.tasks[i].text, index: this.taskCount, page: this.options.title});
    if (this.tasks[i].page === undefined) {
      this.tasks[i].page = 'LATER';
    }
    
    if (this.tasks[i].page === this.options.title && this.tasks[i].text.length) {
      var newTask = new TaskView({text: this.tasks[i].name, index: this.taskCount, page: this.options.title});
      this.customdragsort.push(newTask);
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);
      newTask.pipe(this._eventInput);
      this.customscrollview.pipe(node);
      this.taskCount++;
  }
  if(this.taskCount > 4) {
    var extraSpace = new Surface({
      size: [undefined, 200],
      properties: {
        backgroundColor: 'blue'
      }
    });
  };
  // this.customdragsort.push(extraSpace)

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
  _unhideTaskListener.call(this);
  this._eventInput.on('swapPages', _createNewTask.bind(this));
};

ContentView.prototype._newScrollView = function(data, newIndex) {
  this.customscrollview = new CustomScrollView({page: this.title});
  this.customdragsort = new DragSort({
    draggable: {
      xRange: [0,0]
    }
  });
  var node = this.customdragsort;
  var newTask = new TaskView({text: data.text, index: newIndex, page: this.title});
  window.memory.save({
    text: newTask.text,
    page: newTask.page
  });
  this.customdragsort.push(newTask);
  if(node.getNext()) node = node._next;
  newTask.pipe(node);
  node.pipe(this.customscrollview);
  newTask.pipe(this.customscrollview);
  newTask.pipe(this._eventInput);
  this.customscrollview.pipe(node);
  this.scrollMod = new Modifier({
    transform: Transform.translate(0, 0, 1)
  });

  this.customscrollview.sequenceFrom(this.customdragsort);
  this.customscrollview.pipe(this._eventInput);
  this._add(this.scrollMod).add(this.customscrollview);
  _activateTasks.call(this, newTask);
}

ContentView.prototype._addToList = function(data, newIndex, node) {
      var newTask = new TaskView({text: data.text, index: newIndex, page: this.title});
      window.memory.save({
        text: newTask.text,
        page: newTask.page
      });
      this.customdragsort.push(newTask);
      for (var j = 0; j < newIndex - 1; j++) {
        node = node._next;
      }
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);

      newTask.pipe(this._eventInput);

      this.customscrollview.pipe(node);
      _activateTasks.call(this, newTask);
}

function _activateTasks(newTask) {
  _openInputListener.call(this, newTask);
  _closeInputListener.call(this, newTask);
  _completionListener.call(this, newTask);
  if (this.swappedTask === false) {
    newTask.appearIn();
  } else {
    this.swappedTask = false;
    newTask.appearIn();
    newTask.resetAnimation();
  }
}

function _createNewTask(data) {
  var pages = {
    'FOCUS': 0,
    'TODAY': 1,
    'LATER': 2,
    'NEVER': 3 
  }
  
  if (this.options.title === 'FOCUS'  && this.taskCount > 2) return;

  if (pages[this.title] === (pages[data.page] + data.direction)) {
    this.swappedTask = true;
    var node = this.customscrollview.node;
    var newIndex = this.customdragsort.array.length;
    if (!newIndex) {
      this._newScrollView(data, newIndex);
    } else {
      this._addToList(data, newIndex, node);
    }
  }

};

function _newTaskListener() {

  this.on('saveNewTask', function(val) {
    if (this.options.title === 'FOCUS' && this.taskCount > 2) return;

    this.taskCount++;
    
    var node = this.customscrollview.node;
    var newIndex = this.customdragsort.array.length;
    if (!newIndex) {
      this._newScrollView({text: val}, newIndex);

    } else {
      this._addToList({text: val}, newIndex, node);
    }
  }.bind(this));

};

function _inputListeners() {
  for(var i=0; i < this.customdragsort.array.length; i++) {
    if(this.customdragsort.array[i] !== this.extraSpace){
      _openInputListener.call(this, this.customdragsort.array[i]);
      _closeInputListener.call(this, this.customdragsort.array[i]);
      _completionListener.call(this, this.customdragsort.array[i]);      
    }
  }

  // this.extraSpace.on('touchstart', function() {
  //   this.inputToggled = !this.inputToggled;
  //   this.inputToggled ? this._eventOutput.emit('showInput') : this._eventOutput.emit('hideInput');
  // }.bind(this));

  this.touchSurf.on('touchstart', function() {
    this.timeTouched = 0;
    this.backgroundTouched = true;
  }.bind(this));
  
  this.touchSurf.on('touchend', function() {
    this.backgroundTouched = false;
    if (this.timeTouched > 60) {
      this.backgroundModOne.halt();
      this.backgroundModTwo.halt();
      this.gradientsRunning = false;
      this.backgroundModOne.setOpacity(1, {duration: this.options.gradientDuration, curve: 'easeOut'}, function() {});
      this.backgroundModTwo.setOpacity(0, {duration: this.options.gradientDuration, curve: 'easeOut'}, function() {});      
      this.swapGradients.call(this);
      this.timeTouched = 0;     
    } else {    
      this.inputToggled = !this.inputToggled;
      this.inputToggled ? this._eventOutput.emit('showInput') : this._eventOutput.emit('hideInput');
    }
  }.bind(this));
  
  window.Engine.on('prerender', function() {
    this.backgroundTouched && this.timeTouched++;
  }.bind(this));
  
};

function _openInputListener(task) {
  task.on('openInput', function() {
    if(this.taskCount <3 || this.options.title !== 'FOCUS'){
      this.inputToggled = true;
      this._eventOutput.emit('showInput');
    }
  }.bind(this));
};

function _closeInputListener(task) {
  task.on('closeInputOrEdit', function() {
    if (this.inputToggled) {
      this._eventOutput.emit('hideInput');
      this.inputToggled = false;
    } else {
      task.taskItem._eventOutput.emit('transformTask');
    }
  }.bind(this));

  task.on('openLightbox', function(options) {
    this._eventOutput.emit('openEdit', options);
    this.editedTask = task.taskItem;
  }.bind(this));
};

function _unhideTaskListener() {
  this.on('unhideEditedTask', function() {
    if (this.editTask) {
      this.editedTask._eventOutput.emit('unhide');
      this.editTask = false;
    }
  }.bind(this));
};


function _gradientListener() {
  if (this.options.title === 'FOCUS') {
    this.opened = true;
    this.opacityOne = 0;
    this.opacityTwo = 1;
    this.backgroundModOne.setOpacity(0);
    this.backgroundModTwo.setOpacity(1);
  }
  
  window.setInterval(this.swapGradients.bind(this), 8000);
  
  this.on('opened', function() {
    this.opacityOne = 0;
    this.opacityTwo = 1;
    this.opened = true;
    this.backgroundModOne.setOpacity(0, {duration: this.options.gradientDuration, curve: 'easeOut'}, function() {});
    this.backgroundModTwo.setOpacity(1, {duration: this.options.gradientDuration, curve: 'easeOut'}, function() {});      
    this.swapGradients();
  }.bind(this));

  this.on('closed', function() {
    this.opened = false;
    this.backgroundModOne.halt();
    this.backgroundModTwo.halt();
    this.backgroundModOne.setOpacity(0, {duration: this.options.gradientDuration, curve: 'easeOut'}, function() {});    
    this.backgroundModTwo.setOpacity(0, {duration: this.options.gradientDuration, curve: 'easeOut'}, function() {});      
  }.bind(this));
};

ContentView.prototype.swapGradients = function() {
  if (this.opened && this.gradientsRunning) {
    this.opacityOne = this.opacityOne ? 0 : 1;
    this.opacityTwo = this.opacityTwo ? 0 : 1;
    
    this.backgroundModOne.setOpacity(this.opacityOne, {duration: 5000}, function() {});        
    this.backgroundModTwo.setOpacity(this.opacityTwo, {duration: 5000}, function() {});        
  }
};

function _completionListener(task) {
  task.on('completed', function() {
    this.taskCount--;
    window.completionMod.setOpacity(0.8, {duration: this.options.completionDuration}, function() {
      window.completionMod.setOpacity(0, {duration: 2000}, function () {});
    }.bind(this));
  }.bind(this));

  task.on('deleted', function() {
    this.taskCount--;
    window.memory.remove({
      page: task.page,
      text: task.text
    });
  }.bind(this));
  
  if(this.options.title === 'FOCUS' && this.taskCount < 3) this._eventOutput.emit('inputOpen');

};


function getTitleIndex(title) {
  var titles = {'FOCUS':0, 'TODAY':1, 'LATER':2, 'NEVER':3};
  return titles[title];
};


ContentView.prototype.animateTasksIn = function(title) {
  var counter = 1; var scrollview;
  if(this.customscrollview.options.page === title) scrollview = this.customscrollview;
    
  for(var i = 0; i < scrollview.node.array.length; i++) {
    if (this.shown[i] !== title) {
      this.toShow[i] = title;
      scrollview.node.array[i].animateIn(i);                            
      this.toShow[i] = undefined;
    }
    this.shown = this.toShow; 
  }
};

ContentView.prototype.resetAnimations = function(title) {
  var scrollview;
  if(this.customscrollview.options.page === title) scrollview = this.customscrollview;
  for(var task in this.shown) {
    if(this.toShow[task] !== title && scrollview.node.array[task]) {
      scrollview.node.array[task].resetAnimation(title);
    }
  }
};

function _monitorOffsets() {
  var scrollview;
  Engine.on('prerender', function(){
    if(this.customscrollview.options.page === this.title) var scrollview = this.customscrollview;
    if(this.notAnimated){
      if(scrollview._offsets[0] !== undefined) {
        this._eventOutput.emit('offsets');
        this.notAnimated = false;
      };
    }
  }.bind(this));
};

function _hideLastTask(title) {
  Engine.on('prerender', function(){
    if(!this.notAnimated){
      for(var i=0; i < this.customscrollview.node.array.length; i++){
        if(this.customscrollview._offsets[i] > 360 || this.customscrollview._offsets[i]<0) {
          this.customscrollview.node.array[i].taskItemModifier.setOpacity(0)
        } else {
          this.customscrollview.node.array[i].taskItemModifier.setOpacity(1); 
        }
      }
    }
  }.bind(this));
};



module.exports = ContentView;
