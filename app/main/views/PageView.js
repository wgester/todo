var Surface           = require("famous/surface");
var Modifier          = require("famous/modifier");
var View              = require("famous/view");
var Transform         = require("famous/transform");
var Transitionable    = require("famous/transitions/transitionable");
var TaskSurface       = require("./TaskSurface");
var Tasks             = require("./data");
var GenericSync       = require("famous/input/generic-sync");
var Transitionable    = require("famous/transitions/transitionable");
var InputSurface      = require("famous/surfaces/input-surface");
var Timer             = require("famous/utilities/timer");
var Scrollview        = require("famous/views/scrollview");
var ContainerSurface  = require("famous/surfaces/container-surface");
var Draggable         = require('famous/modifiers/draggable');
var TaskView = require('./TaskView');

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
  _createHeader.call(this);
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
    throw new Error('toggleUpOrDown is illegally defined');
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
    size: [undefined, 200],
    content: '<h1>' + this.options.title + '</h1>',
    properties: {
      color: 'black',
      fontSize: '2.5em'
    }
  });
  
  
  this._add(this.titleLabelSurface);
};


function _createManyTasks() {

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

var tapped = false; 
function _setListeners() {  
  window.Engine.on("prerender", _completeColorMod.bind(this));

  this.backgroundSurf.on('touchstart', function(){
    
    if(tapped && this.inputSurf.getValue() === ''){
      tapped = false;
      this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});
    } else if (tapped && this.inputSurf.getValue().length){
      var newTask = {text: this.inputSurf.getValue(), page: this.options.title};
      this.tasks.push(newTask);
      
      var taskSurf = new TaskSurface(newTask).createTask(newTask.text, newTask.page);

      this.taskSurfaces.add(taskSurf)

      _setOneCompleteListener.call(this, taskSurf);
      this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});

      this.inputSurf.setValue('');
    
    } else {
      tapped = true;
      this.inputMod.setTransform(Transform.translate(0, 400, 1), {duration: 500});
    }
  }.bind(this));  


  this.buttonView.on('touchend', function() {
    this.togglePosition();
  }.bind(this));
  
  for(var i = 0; i < this.taskViews.length; i++) {
    _setOneCompleteListener.call(this, this.taskViews[i]);     
  }
    
};

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

function _createHeader() {
  // this.headerView = new HeaderView({
  //   size: [undefined, 30]
  // });
  // this.headerModifier = new Modifier({
  //   origin: [0.5, 1]
  // });
  // this._add(this.headerModifier).add(this.headerView);

  this.buttonView = new Surface({
      size: [30, 30],
      content: '<img width="40" src="./img/hamburgerOnClear.png"/>'
  });
  this.buttonModifier = new Modifier({
    origin: [0.5, 1]
  });
  this._add(this.buttonModifier).add(this.buttonView);
};

module.exports = PageView;
