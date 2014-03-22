var Surface        = require('famous/surface');
var Modifier       = require('famous/modifier');
var Transform      = require('famous/transform');
var View           = require('famous/view');
var PageView       = require('./PageView');
var Lightbox       = require('famous/views/light-box');
var CanvasSurface  = require('famous/surfaces/canvas-surface');
var InputSurface   = require("famous/surfaces/input-surface");
var Transitionable = require('famous/transitions/transitionable');
var Color             = require('./Color');


function AppView() {
  View.apply(this, arguments);
  this.headerSizeTransitionable = new Transitionable([70]);
  _createGradientSurfaces.call(this);
  _createCompletionSurface.call(this);
  _createLightBox.call(this);
  _createAppViews.call(this);
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
    ['#ffffff', '#32CEA8', null, '#ffffff','#23a5f6', '#32CEA8'],
    ['#ffffff', '#FFFFCD', '#87CEFA','#ffffff', '#ffffb3', '#23a5f6'],
    ['#3690FF', '#8977C6', null, '#8977C6', '#1a80ff', '#735dbb'],
    ['#F5A9BC', '#FA5858', null, '#ED559C', '#F5A9BC', null]
    // ['#81F781', '#E0F8E6', '#E0F8E6', '#E0F8E6']
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
};


function _addPageView(title, previousPage, nextPage) {

  var pageViewOptions = {
    title: title,
    transition: this.options.transition,
    wall: this.options.wall
  };

  var newView = this[title + 'View'] = new PageView(pageViewOptions);

};

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
  this._eventOutput.pipe(newView._eventInput);
  newView._eventOutput.on('moveTaskToNewPage', function(text) {
    if (text.direction === 1) {
      newView.nextPage.contents._eventOutput.emit('swapPages', text)
    } else {
      newView.previousPage.contents._eventOutput.emit('swapPages', text);
    }
  }.bind(this));

  newView.on('togglePageViewUp', function() {
    
    newView.nextPage.contents.resetAnimations(newView.nextPage.options.title);
    newView.nextPage.contents.animateTasksIn(newView.nextPage.options.title);

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
    newView.previousPage.contents.resetAnimations(newView.previousPage.options.title);
    newView.previousPage.contents.animateTasksIn(newView.previousPage.options.title);

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
  this.FOCUSView.contents.swapGradients();
  this.FOCUSView.contents.animateTasksIn('FOCUS');

};

function _createGradientSurfaces(pages) {
  window.faderSurfaces = [];
  window.faderMods = [];

  for(var i=0; i < this.options.colors.length; i++){
    var backgroundSurfOne = new CanvasSurface({
      size: [window.innerWidth, window.innerHeight],
      canvasSize: [window.innerWidth*2, window.innerHeight*2],
      classes: ['famous-surface', 'gradient', this.options.colors[i]]
    });
    var backgroundSurfTwo = new CanvasSurface({
      size: [window.innerWidth, window.innerHeight],
      canvasSize: [window.innerWidth*2, window.innerHeight*2],
      classes: ['famous-surface', 'gradient', this.options.colors[i]]
    });

    var startOpacity = i === 0 ? 1 : 0;

    var backgroundModOne = new Modifier({
      opacity: 0,
      transform: Transform.translate(0, 0, 0)
    });
    
    var backgroundModTwo = new Modifier({
      opacity: 0,
      transform: Transform.translate(0, 0, 0)
    });

    window.faderSurfaces.push([backgroundSurfOne, backgroundSurfTwo]);
    window.faderMods.push([backgroundModOne, backgroundModTwo]);
    this._add(backgroundModOne).add(backgroundSurfOne);
    this._add(backgroundModTwo).add(backgroundSurfTwo);
  }

  _colorSurfaces.call(this);
};

function _colorSurfaces() {
  for(var i = 0; i < window.faderSurfaces.length; i++){
    var colorCanvasOne = window.faderSurfaces[i][0].getContext('2d');
    var colorCanvasTwo = window.faderSurfaces[i][1].getContext('2d');
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
      //first background
      var radialOne = colorCanvasOne.createRadialGradient(
                      300,    // x0
                      1200,         // y0
                      0,   // r0

                      300,    // x1
                      1400,       // y1
                      1200        // r1
                      );

      if (this.options.colors[i][5]) {
        radialOne.addColorStop(0, this.options.colors[i][3]);
        radialOne.addColorStop(0.2, this.options.colors[i][4]);
        radialOne.addColorStop(1, this.options.colors[i][5]);
      } else {
        radialOne.addColorStop(0, this.options.colors[i][3]);
        radialOne.addColorStop(1, this.options.colors[i][4]);
      }

      //second background
      var radialTwo = colorCanvasTwo.createRadialGradient(
                      300,    // x0
                      1200,         // y0
                      0,   // r0

                      300,    // x1
                      1400,       // y1
                      1200        // r1
                      );

      if (this.options.colors[i][2]) {
        radialTwo.addColorStop(0, this.options.colors[i][0]);
        radialTwo.addColorStop(0.2, this.options.colors[i][1]);
        radialTwo.addColorStop(1, this.options.colors[i][2]);
      } else {
        radialTwo.addColorStop(0, this.options.colors[i][0]);
        radialTwo.addColorStop(1, this.options.colors[i][1]);
      }

    }
    colorCanvasOne.fillStyle = radialOne;
    colorCanvasOne.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );
    
    colorCanvasTwo.fillStyle = radialTwo;
    colorCanvasTwo.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );
  }
  
};


function _createCompletionSurface() {

  window.completionSurf = window.faderSurfaces[4];
  window.completionMod = new Modifier({
    opacity: 0,
    transform: Transform.translate(0, 0, 0)
  });

  this._add(window.completionMod).add(window.completionSurf);
};

module.exports = AppView;
