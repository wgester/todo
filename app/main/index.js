window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var WallTransition = require("famous/transitions/wall-transition");
var Timer             = require('famous/utilities/timer');
var CanvasSurface     = require('famous/surfaces/canvas-surface');

var devMode = false;

Transitionable.registerMethod('wall', WallTransition);

var mainCtx = window.Engine.createContext();

mainCtx.setPerspective(1000);

var shadowTransitionable = new Transitionable([50, 206, 168, 255, 255, 255]);

var titleSurf = new Surface({
  size: [undefined, undefined],
  classes: ['title'],
  content: '<h1>FOCUS</h1>',
  properties: {
    backgroundColor: '#32CEA8'
  }
});

var whiteGradientSurf = new CanvasSurface({
  size: [undefined, undefined],
  canvasSize: [window.innerWidth*2, window.innerHeight*2],
  classes: ['famous-surface']
});

var whiteGradientMod = new Modifier({
  transform: Transform.translate(0, 600, 0)
});


var colorCanvas = whiteGradientSurf.getContext('2d');

if (_isAndroid) {
  var radial = colorCanvas.createLinearGradient( 
            300 * 0.5 * 2,    // x0
            0,                              // y0
            300 * 0.5 * 2,    // x1
            500 * 2.5         // y1
            );
  
  radial.addColorStop(0, "rgba(255, 255, 255, 0)");
  radial.addColorStop(1, "rgba(255, 255, 255, 1)");
          
  colorCanvas.fillStyle = radial;
  colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );
  mainCtx.add(whiteGradientMod).add(whiteGradientSurf);
} else {
   radial = colorCanvas.createRadialGradient( 
                  300 * 0.5 * 2,    // x0
                  500 * 2,         // y0
                  0,   // r0

                  300 * 0.5 * 2,    // x1
                  500 * 2.5,       // y1
                  300 * 2.5        // r1
                  );
  radial.addColorStop(0, "rgba(255, 255, 255, 1)");
  radial.addColorStop(1, "rgba(255, 255, 255, 0)");

  colorCanvas.fillStyle = radial;
  colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );


  mainCtx.add(whiteGradientMod).add(whiteGradientSurf); 
}



var titleMod = new Modifier();

function _shadowMod() {
  titleSurf.setProperties({
    textShadow: '0px 0px ' + this.get()[0] + 'px rgba(0, 49, 86, 1)' 
  });
};

function _playShadow() {
  if (devMode) {
    var appView = new AppView();
    mainCtx.add(appView);        
    titleMod.setTransform(Transform.translate(0, 0, -50000));
  } else {
    this.set([1.5, 100, 50], {duration: 1500}, function() {
      this.set([2, 100, 50], {duration: 500}, function(){
        this.set([0, 100, 50], {duration: 800}, function() {
          Timer.after(function() {
            whiteGradientMod.setTransform(Transform.translate(0, 100, 0), {duration: 500}, function() {
              Timer.after(function(){
                var appView = new AppView();
                mainCtx.add(appView);  
                titleMod.setTransform(Transform.translate(0, 0, -50000), {duration: 0}, function() { });                          
              }, 20);
            });
          }, 7);
        }.bind(this));
      }.bind(this));
    }.bind(this));    
  }
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};


mainCtx.add(titleMod).add(titleSurf);
window.Engine.on("prerender", _shadowMod.bind(shadowTransitionable));  
_playShadow.call(shadowTransitionable);
