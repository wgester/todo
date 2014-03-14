var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var Transitionable    = require('famous/transitions/transitionable');
var TaskView          = require('./TaskView');
var Tasks             = require('./data');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');
var Timer             = require('famous/utilities/timer');
var InputSurface      = require('famous/surfaces/input-surface');

//Drag Sort Testing
var DragSort          = require('famous/views/drag-sort');
var CustomDragSort    = require('./customDragSort');
var CustomScrollView  = require('./customScrollView');
var SampleItem        = require('./sampleItem');


function ContentView() {
  View.apply(this, arguments);
  this.lightness = 75;
  this.inputToggled = false;

  _setBackground.call(this);
  _createTasks.call(this);
  _createInput.call(this);
  _taskListeners.call(this);
};

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  title: 'later',
  classes: ['contents'],
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

function _createInput() {
  this.boxContainer = new BoxContainer();
  this._add(this.boxContainer);
};

function _createTasks() {
  this.tasks = Tasks;

  this.taskViews = [];

  this.customscrollview = new CustomScrollView();
  this.customdragsort = new DragSort();
  var node = this.customdragsort;


  for(var i = 0; i < this.tasks.length; i++) {
      var newTask = new SampleItem({text: this.tasks[i].text});
      this.customdragsort.push(newTask);
      if(node.getNext()) node = node._next;
      newTask.pipe(node);
      node.pipe(this.customscrollview);
      newTask.pipe(this.customscrollview);    
      this.customscrollview.pipe(node);
    }

  this.customscrollview.sequenceFrom(this.customdragsort);

  this._add(this.customscrollview);
};


function _taskListeners() {
  _setInputListener.call(this);
  
  this.on('opened', function() {
    this.backgroundMod.setTransform(Transform.translate(0, 0, 0), {duration: 0}, function() {
      this.backgroundMod.setOpacity(1, {duration: 1000}, function() {});
    }.bind(this));
  }.bind(this));
  
  this.on('closed', function() {
    this.backgroundMod.setTransform(Transform.translate(0, 0, 0), {duration: 0}, function() {
      this.backgroundMod.setOpacity(0, {duration: 1000}, function() {});
    }.bind(this));    
  }.bind(this));
};

function _setInputListener() {
  this.backgroundSurf.on('touchstart', function(e) {
    this.inputToggled = !this.inputToggled;
    var value = this.boxContainer.inputSurf.getValue();
    this.boxContainer.inputSurf.setValue('');
    
    if (this.inputToggled) {
      this.boxContainer.frontSurf.setProperties({'visibility': 'visible'})
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [10, 200, 50]), {duration: 300});      
    } else if (!this.inputToggled && value.length) {
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [10, 150, 50]), {duration: 300}, function() {
        var newTask = new TaskView({text: value});
        newTask.pipe(this.scrollview);    
        this.taskViews.push(newTask);        
        this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
      }.bind(this));
    } else {
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [10, 150, 50]), {duration: 300}, function() {
        this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
      }.bind(this));
    }
  }.bind(this));    
};

function _colorTransitionOnLoad(dir) {

};

module.exports = ContentView;
