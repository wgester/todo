var Surface        = require('famous/surface');
var Modifier       = require('famous/modifier');
var Transform      = require('famous/transform');
var View           = require('famous/view');
var PageView       = require('./PageView');
var Lightbox       = require('famous/views/light-box');
var CanvasSurface  = require('famous/surfaces/canvas-surface');
var InputSurface   = require("famous/surfaces/input-surface");
var Transitionable    = require('famous/transitions/transitionable');

function AppView() {
  View.apply(this, arguments);
  this.headerSizeTransitionable = new Transitionable([70]);
  
  _createGradientSurfaces.call(this);
  _createLightBox.call(this);
  _createAppViews.call(this);
  // _createInputView.call(this);
  _renderFocusPage.call(this);
};

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.DEFAULT_OPTIONS = {
  transition: {
    duration: 300,
    curve: 'easeOut'
  },
  menuDropTransition: {
    duration: 200,
    curve: 'easeIn'
  },
  wall: {
    method: 'wall',
    period: 300,
    dampingRatio: 0.3
  },
  noTransition: {
    duration: 0
  },
  colors: [
    ['#ffffff', '#32CEA8'],
    ['#ffffff', '#FFFFCD', '#87CEFA'],
    ['#3690FF', '#8977C6'],
    ['#ffffff', '#32CEA8']
  ] 
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};


function _createLightBox() {
  this.lightBox = new Lightbox({
    inTransition: this.options.noTransition,
    inTransform: Transform.translate(0, 0, 0),
    inOpacity: 1,
    outOpacity: 1,
    overlap: true
  });

  this.lightBox.optionsForSwipeUp = false;

  this._add(this.lightBox);
}

// function _createInputView() {
//   this.inputSurf = new InputSurface({
//     size: [undefined, 60],
//     properties: {background: 'white', margin: 0, opacity: '1'},
//     classes: ['task']
//   });
//   this.inputSurf.setPlaceholder('here');
//   this.inputMod = new Modifier({
//     transform: Transform.translate(0, 70, -1)
//   }); 
//   this._add(this.inputMod).add(this.inputSurf);
// }

function _addPageView(title, previousPage, nextPage) {

  var pageViewOptions = {
    title: title,
    transition: this.options.transition,
    wall: this.options.wall
  };
 
  var newView = this[title + 'View'] = new PageView(pageViewOptions);
}

function _addPageRelations(page, previousPage, nextPage) {
  this[page + 'View'].previousPage = previousPage && this[previousPage + 'View'];
  this[page + 'View'].nextPage =     nextPage     && this[nextPage + 'View'];

  _addEventListeners.call(this, this[page + 'View'], this[page + 'Modifier']);
};


//toggle up
//outTransition: easeOut
//outTransform:  Transform.translate(0, -600, 1)
//inTransition: false
//inTransform: Transform.translate(0, 0, -1)

//toggle down
//outTransition: false
//outTransform:  Transform.translate(0, 0, -1)
//inTransition: wall
//inTransform: Transform.translate(0, -600, 1)

function _addEventListeners(newView, newModifier){
  // window.Engine.on('prerender', )
  
  newView.on('togglePageViewUp', function() {
    if (newView.nextPage) {
      if (!this.lightBox.optionsForSwipeUp){
        this.lightBox.setOptions({
          outTransition: this.options.transition,
          outTransform: Transform.translate(0, -1200, 1),
          inTransition: this.options.noTransition,
          inTransform: Transform.translate(0, 0, -5)
        });
        this.lightBox.optionsForSwipeUp = true;
      }
      this.lightBox.show(newView.nextPage);
      newView.nextPage.contents._eventOutput.emit('opened');
      newView.nextPage.header._eventOutput.emit('opened');
      newView.contents._eventOutput.emit('closed');
      newView.header._eventOutput.emit('closed');
    }
  }.bind(this));

  newView.on('togglePageViewDown', function() {
    if (newView.previousPage) {
      if (this.lightBox.optionsForSwipeUp)  {
        this.lightBox.setOptions({
          outTransition: this.options.noTransition,
          outTransform: Transform.translate(0, 0, -5),
          inTransition: this.options.wall,
          inTransform: Transform.translate(0, -1200, 1)
        });
        this.lightBox.optionsForSwipeUp = false;
      }
      this.lightBox.show(newView.previousPage);
      
      newView.previousPage.contents._eventOutput.emit('opened');
      newView.previousPage.header._eventOutput.emit('opened');
      newView.contents._eventOutput.emit('closed');
      newView.header._eventOutput.emit('closed');
    }
  }.bind(this));
};

function _createAppViews() {
  _addPageView.call(this, 'FOCUS');
  _addPageView.call(this, 'TODAY');
  _addPageView.call(this, 'LATER');
  _addPageView.call(this, 'NEVER');

  _addPageRelations.call(this, 'FOCUS',    null, 'TODAY');
  _addPageRelations.call(this, 'TODAY', 'FOCUS', 'LATER');
  _addPageRelations.call(this, 'LATER', 'TODAY', 'NEVER');
  _addPageRelations.call(this, 'NEVER', 'LATER',    null);
};

function _renderFocusPage() {
  this.lightBox.show(this.FOCUSView);
};

function _createGradientSurfaces(pages) {
  window.faderSurfaces = [];
  window.faderMods = [];
  
  for(var i=0; i < this.options.colors.length; i++){
    var backgroundSurf = new CanvasSurface({
      size: [window.innerWidth, window.innerHeight],
      canvasSize: [window.innerWidth*2, window.innerHeight*2],
      classes: ['famous-surface', 'gradient']
    });
    var startOpacity = i === 0 ? 1 : 0;
    
    var backgroundMod = new Modifier({
      opacity: startOpacity,
      transform: Transform.translate(0, 0, 0)
    });      
    
    window.faderSurfaces.push(backgroundSurf);
    window.faderMods.push(backgroundMod);
    this._add(backgroundMod).add(backgroundSurf);
  }
  
  _colorSurfaces.call(this);  
};

function _colorSurfaces() {
  for(var i = 0; i < window.faderSurfaces.length; i++){
    var colorCanvas = window.faderSurfaces[i].getContext('2d');
    if (_isAndroid()) {
      var radial = colorCanvas.createLinearGradient( 
                300,    // x0
                0,                              // y0
                300,    // x1
                1500         // y1
                );
      
      if (this.options.colors[i][2]) {
        radial.addColorStop(0, this.options.colors[i][2]);
        radial.addColorStop(0.90, this.options.colors[i][1]);
        radial.addColorStop(1, this.options.colors[i][1]);
      } else {
        radial.addColorStop(1, this.options.colors[i][0]);        
        radial.addColorStop(0, this.options.colors[i][1]);
      }                
    } else {
      var radial = colorCanvas.createRadialGradient( 
                      300,    // x0
                      1200,         // y0
                      0,   // r0

                      300,    // x1
                      1400,       // y1
                      1200        // r1
                      );
       
      if (this.options.colors[i][2]) {
        radial.addColorStop(0, this.options.colors[i][0]);
        radial.addColorStop(0.2, this.options.colors[i][1]);
        radial.addColorStop(1, this.options.colors[i][2]);
      } else {
        radial.addColorStop(0, this.options.colors[i][0]);
        radial.addColorStop(1, this.options.colors[i][1]);        
      }                
    }
    colorCanvas.fillStyle = radial;
    colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );
  }
};

function _createCompletionSurface() {
    
};

module.exports = AppView;
