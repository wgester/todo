
var FamousEngine = require('famous/engine');
var AppView = require('./views/AppView');
var Surface = require('famous/surface')

var mainCtx = FamousEngine.createContext();

var appView = new AppView();

mainCtx.add(appView);


