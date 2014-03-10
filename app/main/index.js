
window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');


var mainCtx = window.Engine.createContext();

var appView = new AppView();

mainCtx.add(appView);
mainCtx.setPerspective(1000);
