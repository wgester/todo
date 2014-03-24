var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var TaskView          = require('./TaskView');
// var Tasks             = window._taskData || [];
var Tasks             = require('./data');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');
var Timer             = require('famous/utilities/timer');
var InputSurface      = require('famous/surfaces/input-surface');
var DragSort          = require('famous/views/drag-sort');
var CustomScrollView  = require('./customScrollView');
var TaskItem          = require('./TaskItem');
var Color             = require('./Color');
var ImageSurface      = require('famous/surfaces/image-surface');


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
  window.asanaIDs = window.localStorage._asanaIDs ? JSON.parse(window.localStorage._asanaIDs) : [];
  
  _createViewIndexOptions.call(this);
  _createSpinner.call(this);
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
  gradientDuration: 500,
  completionDuration: 500
};

function _createViewIndexOptions() {
  if (window.asana) {
    this.views =  {
      'FOCUS': [0],
      'TODAY': [1],
      'LATER': [2],
      'ASANA': [3],
      'NEVER': [4]
    };    
  } else {
    this.views =  {
      'FOCUS': [0],
      'TODAY': [1],
      'LATER': [2],
      'NEVER': [3]
    };    
  }
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

function _setBackground() {
  var index = this.views[this.options.title][0];
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
      var id = this.tasks[i].id ? this.tasks[i].id : null;
      var newTask = new TaskView({
        text: this.tasks[i].text,
        index: this.taskCount,
        page: this.options.title,
        id: id
      });        
      this.customdragsort.push(newTask);
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);
      this._eventOutput.pipe(newTask._eventInput);
      newTask.pipe(this._eventInput);
      this.customscrollview.pipe(node);
      this.taskCount++;
    }
  }
  
  if(this.taskCount > 4) {
    var extraSpace = new Surface({
      size: [undefined, 200],
      properties: {
        backgroundColor: 'blue'
      }
    });
  };

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
  _asanaListener.call(this);
  this._eventInput.on('swapPages', _createNewTask.bind(this));
  // _listenForTaskSwapPageToDeleteFromMemory.call(this);
};

// function _listenForTaskSwapPageToDeleteFromMemory() {
//   this.customdragsort._eventOutput.on('swapPage', function(evt) {
//     console.log(evt);
//   });
// }

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
  this._eventOutput.pipe(newTask._eventInput);
  this.scrollMod = new Modifier({
    transform: Transform.translate(0, 0, 1)
  });

  this.customscrollview.sequenceFrom(this.customdragsort);
  this.customscrollview.pipe(this._eventInput);
  this._add(this.scrollMod).add(this.customscrollview);
  _activateTasks.call(this, newTask);
}

ContentView.prototype._addToList = function(data, newIndex, node) {
  var id = data.id ? data.id : null;
  var newTask = new TaskView({
    text: data.text,
    index: newIndex,
    page: this.title,
    id: id
  });        
  window.memory.save({
    text: newTask.text,
    page: newTask.page,
    id: newTask.id
  });
  
  this.customdragsort.push(newTask);
  for (var j = 0; j < newIndex - 1; j++) {
    node = node._next;
    console.log('node in loop', j, node);
  }
  if(node.getNext()) node = node._next;
  newTask.pipe(node);
  node.pipe(this.customscrollview);
  newTask.pipe(this.customscrollview);
  this._eventOutput.pipe(newTask._eventInput);

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
  var pages;
  
  if (window.asana) {
    pages = {
      'FOCUS': 0,
      'TODAY': 1,
      'LATER': 2,
      'ASANA': 3,
      'NEVER': 4
    };
  } else {
    pages = {
      'FOCUS': 0,
      'TODAY': 1,
      'LATER': 2,
      'NEVER': 3
    };  
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


  this.touchSurf.on('touchstart', function() {
    this.timeTouched = 0;
    this.backgroundTouched = true;
    this._eventOutput.emit('newTouch');
    this.touchStart = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    console.log(data)
  }.bind(this));

  this.touchSurf.on('touchmove', function(data) {
    this.touchCurrent = [data.targetTouches[0]['pageX'], data.targetTouches[0]['pageY']];
    var distance = Math.sqrt(Math.pow((this.touchStart[0] - this.touchCurrent[0]), 2) + Math.pow((this.touchStart[1] - this.touchCurrent[1]), 2));
    if (this.twoFingerMode) {
      if (distance > 50) {
        if ((this.touchStart[1] - this.touchCurrent[1]) > 0) {
          this._eventOutput.emit('swiping', 'up');
        } else {
          this._eventOutput.emit('swiping', 'down');
          console.log('down')
        }
      }
    }
  }.bind(this));
  
  this.touchSurf.on('touchend', function(data) {
    this.backgroundTouched = false;
    this._eventOutput.emit('endTouch');
  }.bind(this));
  
  this.touchSurf.on('click', function() {
    this.inputToggled = true;
    this._eventOutput.emit('showInput');   
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
    if (this.editTask && this.editedTask) {
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

function _asanaListener() {
  this.on('refreshAsanaTasks', function() {
    if (window.workspaces === undefined) {
      window.workspaces = JSON.parse(window.localStorage._workspaces);
    }
    _getAsanaTasks.call(null, 0, this, window.workspaces);
  }.bind(this));
};

function _getAsanaTasks(counter, context, spaces) {
  if (spaces.length) {
    var url = 'https://app.asana.com/api/1.0/workspaces/' + spaces[counter]['id'] + '/tasks?assignee=me&completed_since=now';
    $.ajax({
      method: 'GET',
      url: url,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + window.localStorage._authKey);
        loadSpinner.call(context);
      },
      success: function(resp) {
        var syncedTasks = resp.data;
        var savedTasks = window.asanaIDs;
        
        for (var i = 0; i < syncedTasks.length; i++) {
          var savedAlready = savedTasks.indexOf(syncedTasks[i].id);
          if (savedAlready === -1 && syncedTasks[i].name.length) {
            var taskData = {
              text: syncedTasks[i].name,
              page: 'ASANA',
              id: syncedTasks[i].id
            };
            var node = context.customscrollview.node.find(0);
            var newIndex = context.customdragsort.array.length;
            !newIndex ? context._newScrollView(taskData, newIndex) : context._addToList(taskData, newIndex, node);
            window.asanaIDs.push(syncedTasks[i].id);
          }
        }
        
        window.localStorage._asanaIDs = JSON.stringify(window.asanaIDs);
        if (counter === spaces.length - 1) {
          closeSpinner.call(context);
        } else {
          _getAsanaTasks.call(context, counter + 1, context, spaces);
        }
      },
      error: function(err) {
        closeSpinner.call(context);
        console.log("ERR:", err);
      }
    });       
  } else {
    console.log('No workspaces');
  }
};

function _syncCompletionWithAsana(task) {
  if (task.options.id) {
    var url = 'https://app.asana.com/api/1.0/tasks/' + task.options.id;
    $.ajax({
      method: 'PUT',
      url: url,
      data: "completed=true",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + window.localStorage._authKey);
      },
      success: function(resp) {
       console.log(resp);
      },
      error: function(err) {
        console.log("ERR:", err);
      }
    }); 
  }
};

function _completionListener(task) {
  task.on('completed', function() {
    this.taskCount--;
    window.completionMod.setOpacity(0.7, {duration: this.options.completionDuration}, function() {
      window.completionMod.setOpacity(0, {duration: 1000}, function () {});
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

ContentView.prototype.swapGradients = function() {
  if (this.opened) {
    this.opacityOne = this.opacityOne ? 0 : 1;
    this.opacityTwo = this.opacityTwo ? 0 : 1;

    this.backgroundModOne.setOpacity(this.opacityOne, {duration: 5000}, function() {});        
    this.backgroundModTwo.setOpacity(this.opacityTwo, {duration: 5000}, function() {});        
  }
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
        if(this.customscrollview._offsets[i] > 360 || this.customscrollview._offsets[i]< -5) {
          this.customscrollview.node.array[i].taskItemModifier.setOpacity(0, {duration: 250}, function(){})
        } else {
          this.customscrollview.node.array[i].taskItemModifier.setOpacity(1); 
        }
      }
    }
  }.bind(this));
};

function _createSpinner() {
  this.spinner = new ImageSurface({
    size: [36, 36],
    properties: {
      display: 'none'
    }
  });
  
  this.spinner.setContent('./img/spinner.gif');
  
  this.spinnerMod = new Modifier({
    origin: [0.5, 0.5]
  });
  
  this._add(this.spinnerMod).add(this.spinner);
};

function loadSpinner() {
  this.spinner.setProperties({'display': 'block'});
};

function closeSpinner() {
  this.spinner.setProperties({'display': 'none'});
};

module.exports = ContentView;
