require("famous/polyfills");

var Engine  = require("famous/engine");
var Timer   = require("famous/utilities/timer");
var Surface = require("famous/surface");

var mainCtx = Engine.createContext();

var hit200 = false;
var hit500 = false;
var counter = 0;

var contentTemplate = function() {
	return "<div>100 frame counter: " + counter + "</div>" +
	"<div>Have we hit 200 frames? " + hit200 + "</div>" +
	"<div>Have we hit 500 frames?" + hit500 + "</div>";
}

var surface = new Surface({
	size: [undefined, undefined],
	content: contentTemplate()
});

Timer.every(function() {
	counter++;
	surface.setContent(contentTemplate());
}, 100);

Timer.after(function() {
	hit200 = true;
	surface.setContent(contentTemplate());
}, 200);

Timer.after(function() {
	hit500 = true;
	surface.setContent(contentTemplate());
}, 500);

mainCtx.add(surface);