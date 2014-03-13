window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var WallTransition = require("famous/transitions/wall-transition");
var SpringTransition = require("famous/transitions/spring-transition");
var Timer             = require('famous/utilities/timer');
var CanvasSurface     = require('famous/surfaces/canvas-surface');

var devMode = true;

Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('spring', SpringTransition);

var mainCtx = window.Engine.createContext();

mainCtx.setPerspective(1000);

var shadowTransitionable = new Transitionable([50, 206, 168]);

/*--------------GREEN BACKGROUND---------------------------------------------------------*/

var greenBackgroundSurf = new Surface({
  size: [undefined, undefined],
  properties: {
    backgroundColor: '#32CEA8',
    paddingLeft: 0
  }
});

var greenBackgroundMod = new Modifier({
  transform: Transform.translate(0, 0, 0)
});

/*--------------BLUR TITLE---------------------------------------------------------------*/

var titleSurf = new Surface({
  size: [undefined, undefined],
  classes: ['title'],
  content: '<h1>FOCUS</h1>'
});

var titleMod = new Modifier({
  transform: Transform.translate(0, 0, 2)
});

/*--------------WHITE GREEN GRADIENT---------------------------------------------------------------*/


// var whiteGreenGradientSurf = new CanvasSurface({
//   size: [undefined, undefined],
//   canvasSize: [window.innerWidth*2, window.innerHeight*2],
//   classes: ['famous-surface']
// });

// var whiteGreenGradientMod = new Modifier({
//   transform: Transform.translate(0, 0, 0)
// });


// var colorCanvas = whiteGreenGradientSurf.getContext('2d');

// if (_isAndroid) {
//     console.log('HERE')

//   var radial = colorCanvas.createLinearGradient( 
//             300 * 0.5 * 2,    // x0
//             0,                              // y0
//             300 * 0.5 * 2,    // x1
//             500 * 2.5         // y1
//             );
//   radial.addColorStop(0, "rgba(255, 255, 255, 0)");
//   radial.addColorStop(1, "rgba(50, 206, 168, 1)");
          
//   colorCanvas.fillStyle = radial;
//   colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );

//   mainCtx.add(whiteGreenGradientMod).add(whiteGreenGradientSurf); 
// } else {
//   console.log('HERE')
//    radial = colorCanvas.createRadialGradient( 
//                   300 * 0.5 * 2,    // x0
//                   500 * 2,         // y0
//                   0,   // r0

//                   300 * 0.5 * 2,    // x1
//                   500 * 2.5,       // y1
//                   300 * 2.5        // r1
//                   );
//   radial.addColorStop(0, "rgba(50, 206, 168, 1)");
//   radial.addColorStop(1, "rgba(255, 255, 255, 0)");

//   colorCanvas.fillStyle = radial;
//   colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );


//   mainCtx.add(whiteGreenGradientMod).add(whiteGreenGradientSurf); 
// }



var titleMod = new Modifier({
  opacity: 1
});

function _shadowMod() {
  titleSurf.setProperties({
    textShadow: '0px 0px ' + this.get()[0] + 'px rgba(0, 49, 86, 1)' 
  });
};

function _playShadow() {
  if (devMode ) {
    titleMod.setOpacity(0, function(){});
    var appView = new AppView();
    mainCtx.add(appView);        
    titleMod.setTransform(Transform.translate(0, 2000, -50));
  } else {
    this.set([1.5, 100, 50], {duration: 1500}, function() {
      this.set([2, 100, 50], {duration: 500}, function(){
        this.set([0, 100, 50], {duration: 800}, function() {
          Timer.after(function() {
            // whiteGreenGradientMod.setTransform(Transform.translate(0, 0, 2), {duration: 500}, function() {
 // this.gradient.set([50, 206, 168, 255, 255, 255], {duration: 2000, curve: 'easeInOut'}, function() {})
              Timer.after(function(){
                var appView = new AppView();
                mainCtx.add(appView);
                titleMod.setTransform(Transform.translate(0, 2000, -50), {duration: 0}, function() {
                  titleMod.setOpacity(0, function() {});
                });                          
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
mainCtx.add(greenBackgroundMod).add(greenBackgroundSurf);
window.Engine.on("prerender", _shadowMod.bind(shadowTransitionable));  
_playShadow.call(shadowTransitionable);
