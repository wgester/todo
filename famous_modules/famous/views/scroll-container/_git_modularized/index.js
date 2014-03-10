var ContainerSurface = require('famous/surfaces/container-surface');
var EventHandler     = require('famous/event-handler');
var Scrollview       = require('famous/views/scrollview');
var Utility          = require('famous/utilities/utility');

/**
 * @class A scrollview linked within a container surface.
 * @description
 * @name ScrollContainer
 * @constructor
 * @example 
 *   var myContainer = new ScrollContainer({
 *       look: {
 *           size: [undefined, 500],
 *           properties: {
 *               backgroundColor: '#3cf'
 *           }
 *       },
 *       feel: {
 *           direction: Utility.Direction.Y,
 *           itemSpacing: 20
 *       }
 *   });
 *
 *   var mySurface = [];
 *   for(var i = 0; i < 10; i++) {
 *       mySurfaces[i] = new Surface({content: 'Item ' + i});
 *   }
 *   myContainer.sequenceFrom(mySurfaces); // attach the content
 *   myContext.link(myContainer); // myContainer functions like a Surface
 */
function ScrollContainer(options) {
    console.log("HERE")
    this.options = Object.create(ScrollContainer.DEFAULT_OPTIONS);

    this.surface = new ContainerSurface(this.options.look);
    this.scrollview = new Scrollview(this.options.feel);

    if(options) this.setOptions(options);

    // this.surface.link(this.scrollview);

    EventHandler.setInputHandler(this, this.surface);
    EventHandler.setOutputHandler(this, this.surface);

    this.pipe(this.scrollview);
};

ScrollContainer.DEFAULT_OPTIONS = {
    look: undefined,
    feel: {direction: Utility.Direction.X}
};

ScrollContainer.prototype.setOptions = function(options) {
    if(options.look !== undefined) {
        this.options.look = options.look;
        this.surface.setOptions(this.options.look);
    }
    if(options.feel !== undefined) {
        this.options.feel = options.feel;
        this.scrollview.setOptions(this.options.feel);
    }
};

ScrollContainer.prototype.sequenceFrom = function() {
    return this.scrollview.sequenceFrom.apply(this.scrollview, arguments);
};

ScrollContainer.prototype.render = function() { 
    return this.surface.render.apply(this.surface, arguments);
};

module.exports = ScrollContainer;