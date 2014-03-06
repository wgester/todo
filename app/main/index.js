require('famous/polyfills');

var FamousEngine = require('famous/engine');
var Surface = require('famous/surface');
var Modifier = require('famous/modifier');

var mainCtx = FamousEngine.createContext();
var centerTransform = new Modifier({
    origin: [0.5, 0.5]
});
var simpleSurface = new Surface({
    size: [100, 100],
    content: "hello world",
    classes: ["layer"]
});
mainCtx.add(centerTransform).add(simpleSurface);
