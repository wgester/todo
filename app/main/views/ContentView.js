var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var TaskView          = require('./TaskView');
var Tasks             = window._taskData || [];
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
  
  this.notAnimated = true;

  
  this.shown = {}; this.toShow = {};
  this.scrolled = false;

  _setBackground.call(this);
  _createTasks.call(this);
  _setListeners.call(this);
  _monitorOffsets.call(this);


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
  gradientDuration: 800,
  completionDuration: 500
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

function _setUpOffsets() {
  this.offsets = [];
  this.focusOffsets = {};
  this.todayOffsets = {};
  this.laterOffsets = {};
  this.neverOffsets = {};
  this.offsets.push(this.focusOffsets, this.todayOffsets, this.laterOffsets, this.neverOffsets);
}

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

  this.customscrollview = new CustomScrollView({page: this.title});
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
      newTask.pipe(this._eventInput);
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
  _unhideTaskListener.call(this);
  this._eventInput.on('swapPages', _createNewTask.bind(this));
  this._eventInput.on('offsets', function() {
        this.animateTasksIn(this.options.title);
        this.notAnimated = false;
        console.log('hit!')
      }.bind(this));
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
      this.customdragsort.push(newTask);
      for (var j = 0; j < newIndex - 1; j++) {
        node = node._next;
      }
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);

      this.customscrollview.pipe(node);
      _activateTasks.call(this, newTask);
}

function _activateTasks(newTask) {
      _openInputListener.call(this, newTask);
      _closeInputListener.call(this, newTask);
      _completionListener.call(this, newTask);
      newTask.animateIn(3);
}

function _createNewTask(data) {
  var pages = {
    'FOCUS': 0,
    'TODAY': 1,
    'LATER': 2,
    'NEVER': 3
  }
  if (this.options.title === 'FOCUS' && this.taskCount > 2) {
    return;
  }
  if (pages[this.title] === (pages[data.page] + data.direction)) {

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
    if (this.options.title === 'FOCUS' && this.taskCount > 2) {
      return;
    }
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
    window.completionMod.setOpacity(0.8, {duration: this.options.completionDuration}, function() {
      window.completionMod.setOpacity(0, {duration: 2000}, function () {});
    }.bind(this));
  }.bind(this));

  task.on('deleted', function() {
    this.taskCount--;
  }.bind(this));
};

function getTitleIndex(title) {
  var titles = {'FOCUS':0, 'TODAY':1, 'LATER':2, 'NEVER':3};
  return titles[title];
};


function _monitorOffsets() {
  var index = getTitleIndex(this.title); var scrollview;

  Engine.on('prerender', function(){
    if(this.title) {
      if(this.customscrollview.options.page === this.title) scrollview = this.customscrollview;
      if (this.notAnimated) {
        if(scrollview._offsets[0] !== undefined) {
          this._eventOutput.emit('offsets');
          console.log('emitted offsets!')
        };
      }
    }
  }.bind(this));

};

ContentView.prototype.animateTasksIn = function(title) {
  var counter = 1; var index = getTitleIndex(title); var scrollview;
  if(this.customscrollview.options.page === title) scrollview = this.customscrollview;
  if(scrollview._offsets) {
    for(var task in scrollview._offsets) {
      if(task !== "undefined") {
        var taskOffset = scrollview._offsets[task]; 

        if((taskOffset > -10) && (taskOffset < window.innerHeight) && (this.shown[task] !== title)) {
          this.toShow[task] = title;
          if(scrollview.node.array[task]) {
            counter++;
            scrollview.node.array[task].animateIn(counter);
            this.toShow[task] = undefined;
           }
        }
      }
    }
    this.shown = this.toShow; 
  }
};

ContentView.prototype.resetAnimations = function(title) {
  var scrollview;
  if(this.customscrollview.options.page === title) scrollview = this.customscrollview;
  console.log("in reset ", title)

  for(var task in this.shown) {
    if(this.toShow[task] !== title && scrollview.node.array[task]) {
      scrollview.node.array[task].resetAnimation(title);
    }
  }
};





module.exports = ContentView;
