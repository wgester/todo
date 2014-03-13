window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var WallTransition = require("famous/transitions/wall-transition");

Transitionable.registerMethod('wall', WallTransition);

var mainCtx = window.Engine.createContext();

mainCtx.setPerspective(1000);

var shadowTransitionable = new Transitionable([50, 206, 168, 255, 255, 255]);

// _playShadow();

var titleSurf = new Surface({
  size: [undefined, undefined],
  content: '<h1>FOCUS</h1>',
  properties: {
    backgroundColor: '#32CEA8',
    color: 'transparent'
  }
});

function _shadowMod() {
  titleSurf.setProperties({
    textShadow: '0px 0px ' + this.get()[0] + 'px rgba(0, 49, 86, 1)' 
  });
};

function _playShadow() {
  this.set([1.5, 100, 50], {duration: 1500}, function() {
    this.set([2, 100, 50], {duration: 800}, function(){
      this.set([0, 100, 50], {duration: 500}, function() {
        var appView = new AppView();
        mainCtx.add(appView);
      });
    });
  });
};

mainCtx.add(titleSurf);
window.Engine.on("prerender", _shadowMod.bind(shadowTransitionable));  
_playShadow.call(shadowTransitionable);
