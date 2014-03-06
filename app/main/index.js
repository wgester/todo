require('famous/polyfills');

var FamousEngine = require('famous/engine');
var AppView = require('views/AppView');

var mainCtx = FamousEngine.createContext();

var appView = new AppView();

mainCtx.add(appView);