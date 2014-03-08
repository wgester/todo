var Surface        = require('famous/surface');
var Modifier       = require('famous/modifier');
var View           = require('famous/view');
var Transform      = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var TaskView       = require('./TaskView');
var Tasks          = require('./data');
var GenericSync     = require('famous/input/generic-sync');
var Transitionable  = require('famous/transitions/transitionable');
var InputSurface = require('famous/surfaces/input-surface');
var Timer = require('famous/utilities/timer');
var Scrollview = require('famous/views/scrollview')

function PageView() {
  View.apply(this, arguments);
  this.color = new Transitionable([360, 100, 100]);
  this.lightness = 75;
  this.toggleUpOrDown = 'down';
  this.offPage = false;
  _createBackground.call(this);
  _createTitleLabel.call(this);
  _populateTasks.call(this);
  _createInput.call(this);
  _createButton.call(this);
  _createManyTasks.call(this);
  _setListeners.call(this);
  _handlePageToggleTouches.call(this);
}

PageView.prototype = Object.create(View.prototype);
PageView.prototype.constructor = PageView;

PageView.prototype.togglePosition = function() {
  if (this.toggleUpOrDown === 'down') {
    this.slideUp();
  } else if (this.toggleUpOrDown === 'up') {
    this.slideDown();
  } else {
    throw new Error('togleUpOrDown is illegally defined');
  }
};

PageView.prototype.slideUp = function() {
  this.yPosition.set(-1 * (window.innerHeight - 30), this.options.transition, function() {
    this.toggleUpOrDown = 'up';
  }.bind(this));
  this.options.aboveView && this.options.aboveView.slideUpOffPage();
};

PageView.prototype.slideDown = function() {
  this.yPosition.set(0, this.options.transition, function() {
    this.toggleUpOrDown = 'down';
  }.bind(this));
  this.options.aboveView && this.options.aboveView.slideUp();
};

PageView.prototype.slideUpOffPage = function() {
  this.yPosition.set(-1 * window.innerHeight, this.options.transition, function() {
    this.offPage = !this.offPage;
  }.bind(this));
};

function _handlePageToggleTouches() {
  this.yPosition = new Transitionable(0);
  this.sync = new GenericSync(function() {
    return this.yPosition.get(0);
  }.bind(this), {direction: GenericSync.DIRECTION_Y});

  this.pipe(this.sync);

  this.sync.on('update', _viewSyncUpdate.bind(this));
  this.sync.on('end',       _viewSyncEnd.bind(this));

  function _viewSyncUpdate(data) {
    this.yPosition.set(Math.min(0, data.p));
  }

  function _viewSyncEnd(data) {
    var velocity = data.v;
    var position = this.yPosition.get();

    if (this.yPosition.get() > this.options.yPositionToggleThreshold) {
      if (velocity < -1 * this.options.velocityToggleThreshold) {
        this.slideUp();
      } else {
        this.slideDown();
      }
    } else {
      if (velocity > this.options.velocityToggleThreshold) {
        this.slideDown();
      } else {
        this.slideUp();
      }
    }
  };
};

PageView.DEFAULT_OPTIONS = {
  title: 'Tasks',
  aboveView: null,
  yPositionToggleThreshold: 250,
  velocityToggleThreshold: 0.75
};

function _completeColorMod() {
  this.backgroundSurf.setProperties({
    backgroundColor: "hsl(145, 63%," + this.color.get()[2] + "%)"
  });
};

function _populateTasks() {
  this.tasks = Tasks;
};

function _createBackground() {
  this.backgroundSurf = new Surface({
    size: [undefined, undefined]
  });
  this.backgroundModifier = new Modifier();
  this._add(this.backgroundModifier).add(this.backgroundSurf);
};

function _createTitleLabel() {
  this.titleLabelSurface = new Surface({
    size: [undefined, true],
    content: '<h1>' + this.options.title + '</h1>',
    properties: {
      color: 'black',
      fontSize: '2.5em'
    }
  });
  
  this.titleModifier = new Modifier();
  
  this._add(this.titleModifier).add(this.titleLabelSurface);
};

function _createLinkedListTaskView() {
  var newTaskView = new TaskView({

  })
}

function _createManyTasks() {

  this.taskViews = [];
  // this.taskMods = [];
  this.scrollview = new Scrollview();

  this.scrollview.sequenceFrom(this.taskViews);
  for(var i = 0; i < this.tasks.length; i++){
    var taskView = new TaskView({
      text: this.tasks[i].text
    });
    taskView.taskMod.setTransform(Transform.translate(0, taskView.options.taskOffset * (i+2), 0))
    console.log(taskView.options.taskOffset * (i+2), taskView.taskMod.getTransform())
    // var offset = taskView.options.taskOffset * (i+2);
    // console.log(taskView.taskMo)
    // taskView.taskMod.transform =  Transform.translate(0, offset, 0);
    // var taskModifier = new Modifier({
    //   origin: [0.2, 0.2],
    // });
    // this.taskMods.push(taskModifier);
    taskView.pipe(this.scrollview);
    this.taskViews.push(taskView);
  }
  
  this._add(this.scrollview);
};

function _createInput() {
  this.inputSurf = new InputSurface({
    size: [undefined,50],
    placeholder: 'Enter task here...'
  });
  
  this.inputMod = new Modifier({
    transform: Transform.translate(0, 300, -1)
  });

  this._add(this.inputMod).add(this.inputSurf);
};

function calculateOffset(tasksLength) {
  var taskViewOffset = new TaskView().options.taskOffset;
  return taskViewOffset * (tasksLength+0.5);
};

var tapped = false; 
function _setListeners() {  
  window.Engine.on("prerender", _completeColorMod.bind(this));

  this.backgroundSurf.on('touchstart', function(){
    
    if(tapped && this.inputSurf.getValue() === ''){
      tapped = false;
      this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});
    } else if (tapped && this.inputSurf.getValue().length){
      var newTask = {text: this.inputSurf.getValue(), focus: true};
      this.tasks.push(newTask);
            
      var taskView = new TaskView(newTask);
      this.taskViews.push(taskView)
      // var offset = calculateOffset(this.tasks.length);
      
      // var taskMod = new Modifier({  
      //   origin: [0, 0.425],
      //   transform: Transform.translate(0, offset, 0)
      // });

      console.log(this.scrollview)

      _setOneCompleteListener.call(this, taskView);
      this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});

      // this._add(taskMod).add(taskView);
      this.inputSurf.setValue('');
    
    } else {
      tapped = true;
      this.inputMod.setTransform(Transform.translate(0, 400, 1), {duration: 500});
  }
    //   var offset = calculateOffset(this.tasks.length) + 274;
    //   this.inputMod.setTransform(Transform.translate(0, offset, 0));
  }.bind(this));  


  this.buttonView.on('touchend', function() {
    this.togglePosition();
  }.bind(this));
  
  for(var i = 0; i < this.taskViews.length; i++) {
    _setOneCompleteListener.call(this, this.taskViews[i]);     
  }
    
};

function _setOneCompleteListener(view) {
  view.on('completed', function() {
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

function _createButton() {
  this.buttonView = new Surface({
      size: [30, 30],
      content: '<img width="30" src="./img/hamburgerOnClear.png"/>'
  });
  this.buttonModifier = new Modifier({
    origin: [0.5, 1]
  });
  this._add(this.buttonModifier).add(this.buttonView);
};

module.exports = PageView;
