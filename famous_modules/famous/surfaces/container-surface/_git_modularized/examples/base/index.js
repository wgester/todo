require("famous/polyfills");

var Engine           = require("famous/engine");
var Surface          = require("famous/surface");
var ContainerSurface = require("famous/surfaces/container-surface");

var mainCtx = Engine.createContext();

var container = new ContainerSurface({
	size: [400, 400]
});

container.add(new Surface({
	size: [undefined, undefined],
	content: "Inner Surface",
	properties: {
		backgroundColor: "#3cf"
	}
}));

mainCtx.add(container);