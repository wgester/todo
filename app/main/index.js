window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var WallTransition = require("famous/transitions/wall-transition");
var devMode = true;

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

var titleMod = new Modifier()
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
      this.set([2, 100, 50], {duration: 800}, function(){
        this.set([0, 100, 50], {duration: 500}, function() {
          var appView = new AppView();
          mainCtx.add(appView);        
          titleMod.setTransform(Transform.translate(0, 0, -50000));
        }.bind(this));
      }.bind(this));
    }.bind(this));    
  }
};

mainCtx.add(titleMod).add(titleSurf);
window.Engine.on("prerender", _shadowMod.bind(shadowTransitionable));  
_playShadow.call(shadowTransitionable);
