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
var CanvasSurface     = require('famous/surfaces/canvas-surface');

//Drag Sort Testing
var CustomDragSort    = require('./customDragSort');
var CustomScrollView  = require('./customScrollView');
var SampleItem        = require('./sampleItem');


function ContentView() {
  View.apply(this, arguments);
  this.lightness = 75;
  this.inputToggled = false;

  this.gradient = new Transitionable([50, 206, 168, 255, 255, 255]);

  _createBackground.call(this);
  _createTasks.call(this);
  _createInput.call(this);
  _taskListeners.call(this);
  // _colorTransitionOnLoad.call(this);
};

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  title: 'later',
  classes: ['contents']
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};

function _createBackground() {
  // this.backgroundSurf = new CanvasSurface({
  //   size: [window.innerWidth, window.innerHeight],
  //   canvasSize: [window.innerWidth*2, window.innerHeight*2],
  //   classes: ['famous-surface']
  // });
  this.backgroundSurf = new Surface({
    size: [undefined, undefined]
  });
};

function _createCanvas() {
  var colorCanvas = this.backgroundSurf.getContext('2d');

  if (_isAndroid()) {
    this.radial = colorCanvas.createLinearGradient( 
              300 * 0.5 * 2,    // x0
              0,                              // y0
              300 * 0.5 * 2,    // x1
              500 * 2         // y1
              );
    
    this.radial.addColorStop(
      0, 
      "rgb(" +
      Math.floor(this.gradient.get()[0]) + "," + 
      Math.floor(this.gradient.get()[1]) + "," + 
      Math.floor(this.gradient.get()[2]) + ")"
    );
    
    this.radial.addColorStop(
      1,
      "rgb(" + 
      Math.floor(this.gradient.get()[3]) + "," + 
      Math.floor(this.gradient.get()[4]) + "," + 
      Math.floor(this.gradient.get()[5]) + ")"
    );
            
    colorCanvas.fillStyle = this.radial;
    colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );
    this._add(this.backgroundSurf);
  } else {
     this.radial = colorCanvas.createRadialGradient( 
                    300 * 0.5 * 2,    // x0
                    500 * 2,         // y0
                    0,   // r0

                    300 * 0.5 * 2,    // x1
                    500 * 2.5,       // y1
                    300 * 2.5        // r1
                    );
    this.radial.addColorStop(
      0,
      "rgb(" + 
      Math.floor(this.gradient.get()[3]) + "," + 
      Math.floor(this.gradient.get()[4]) + "," + 
      Math.floor(this.gradient.get()[5]) + ")"
    );
    
    this.radial.addColorStop(
      1,
      "rgb(" +
      Math.floor(this.gradient.get()[0]) + "," + 
      Math.floor(this.gradient.get()[1]) + "," + 
      Math.floor(this.gradient.get()[2]) + ")"
    );
    
    colorCanvas.fillStyle = this.radial;
    colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );

    this._add(this.backgroundSurf); 
  }    
};

function _createInput() {
  this.boxContainer = new BoxContainer();
  this._add(this.boxContainer);
};

function _createTasks() {
  this.tasks = Tasks;

  this.taskViews = [];

  this.customscrollview = new CustomScrollView();
  this.customdragsort = new CustomDragSort();
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
  // window.Engine.on('prerender', _createCanvas.bind(this));

  _setInputListener.call(this);
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

function _colorTransitionOnLoad() {
  
    // if (this.options.title === 'TODAY') {
  //   _createCanvas.call(this, '#3399FF', 'white',  4);
  // } else if (this.options.title === "FOCUS") {
  //   _createCanvas.call(this, '#32CEA8', 'white', 2.5);
  // } else if (this.options.title === "LATER") {
  //   _createCanvas.call(this, '#9C7CCB', '#3690FF', 2.5);    
  // } else {
  //   this.backgroundSurf = new Surface({
  //     size: [undefined, undefined]
  //   });

  //   this.backgroundModifier = new Modifier();
  //   this._add(this.backgroundModifier).add(this.backgroundSurf);
  // }
  if (this.options.title === 'TODAY') {
    this.gradient.set([51, 153, 255, 255, 255, 255], {duration: 2000, curve: 'easeInOut'}, function() {});
  } else if (this.options.title === 'FOCUS') {
    this.gradient.set([50, 206, 168, 255, 255, 255], {duration: 2000, curve: 'easeInOut'}, function() {});
  } else if (this.options.title === 'LATER') {
    this.gradient.set([156, 124, 203, 54, 144, 255], {duration: 2000, curve: 'easeInOut'}, function() {});    
  } else {
    this.gradient.set([50, 206, 168, 255, 255, 255], {duration: 2000}, function() {});    
  }
};

module.exports = ContentView;


// this.color = new Transitionable([360, 100, 100]);

// window.Engine.on('prerender', _completeColorMod.bind(this));

// for(var i = 0; i < this.taskViews.length; i++) {
//   _setOneCompleteListener.call(this, this.taskViews[i]);     
// }

// function _completeColorMod() {
//   this.backgroundSurf.setProperties({
//     backgroundColor: 'hsl(145, 63%,' + this.color.get()[2] + '%)'
//   });
// };

// function _setOneCompleteListener(surface) {
  // surface.on('completed', function() {
  //   this.color.set([145, 63, this.lightness], {
  //     duration: 250
  //   }, function() {
  //     Timer.after(function() {
  //       this.color.set([145, 63, 100], {
  //         duration: 250
  //       }, function() {});      
  //     }.bind(this), 7);            
  //   }.bind(this));
  // }.bind(this));  
// };

