require("famous/polyfills");

var Engine        = require("famous/engine");
var CanvasSurface = require("famous/surfaces/canvas-surface");

var mainCtx = Engine.createContext();

var canvas= new CanvasSurface({
	size: [200, 200]
});

mainCtx.add(canvas);
