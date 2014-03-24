require("famous/polyfills");

var Engine       = require("famous/engine");
var ImageSurface = require("famous/image-surface");

var mainCtx = Engine.createContext();

var image = new ImageSurface({
	size: [200, 200]
});

image.setContent("images/famous_logo_inverted_logo.svg")

mainCtx.add(image);