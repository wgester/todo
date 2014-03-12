window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var WallTransition = require("famous/transitions/wall-transition");


Transitionable.registerMethod('wall', WallTransition);


var mainCtx = window.Engine.createContext();

var appView = new AppView();

mainCtx.add(appView);
mainCtx.setPerspective(500);
