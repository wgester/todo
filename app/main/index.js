
window.Engine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')

var mainCtx = window.Engine.createContext();

var appView = new AppView();

mainCtx.add(appView);


