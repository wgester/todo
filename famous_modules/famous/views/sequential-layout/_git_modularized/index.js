var OptionsManager = require('famous/options-manager');
var Transform      = require('famous/transform');
var Transitionable = require('famous/transitions/transitionable');
var ViewSequence   = require('famous/view-sequence');
var Utility        = require('famous/utilities/utility');

/**
 * @class Lays out specified renderables sequentially.
 * @description
 * @name SequentialLayout
 * @constructor
 * @example 
 *           var Engine = require('famous/Engine');
 *           var SequentialLayout = require('famous-views/SequentialLayout');
 *           var Surface = require('famous/Surface');
 *
 *           var Context = Engine.createContext();
 *           var sequentiallayout = new SequentialLayout({
 *               itemSpacing: 2
 *           });
 *
 *           var surfaces = [];
 *           for (var index = 0; index < 10; index++) {
 *               surfaces.push(
 *                   new Surface({
 *                       content: 'test ' + String(index + 1),
 *                       size: [window.innerWidth * 0.1 - 1, undefined],
 *                       properties: {
 *                           backgroundColor: '#3cf',
 *                       }
 *                   })
 *               );
 *           }
 *
 *           sequentiallayout.sequenceFrom(surfaces);
 *           Context.link(sequentiallayout);
 */
function SequentialLayout(options) {
    this._items = null;
    this._size = null;
    this._outputFunction = SequentialLayout.DEFAULT_OUTPUT_FUNCTION;

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this.optionsManager = new OptionsManager(this.options);
    if(options) this.setOptions(options);
};

SequentialLayout.DEFAULT_OPTIONS = {
    direction: Utility.Direction.X,
    defaultItemSize: [50, 50],
    itemSpacing: 0
};

SequentialLayout.DEFAULT_OUTPUT_FUNCTION = function(input, offset, index) {
    var transform = (this.options.direction === Utility.Direction.X) ? Transform.translate(offset, 0) : Transform.translate(0, offset);
    return {
        transform: transform,
        target: input.render()
    };
};

SequentialLayout.prototype.getSize = function() {
    if(!this._size) this.render(); // hack size in
    return this._size;
};

SequentialLayout.prototype.sequenceFrom = function(items) {
    if(items instanceof Array) items = new ViewSequence(items);
    this._items = items;
    return this;
};

SequentialLayout.prototype.setOptions = function(options) {
    this.optionsManager.setOptions.apply(this.optionsManager, arguments);
    return this;
};

SequentialLayout.prototype.setOutputFunction = function(outputFunction) {
    this._outputFunction = outputFunction;
    return this;
};

SequentialLayout.prototype.render = function() {
    var length = 0;
    var girth = 0;

    var lengthDim = (this.options.direction === Utility.Direction.X) ? 0 : 1;
    var girthDim = (this.options.direction === Utility.Direction.X) ? 1 : 0;

    var currentNode = this._items;
    var result = [];
    while(currentNode) {
        var item = currentNode.get();

        if(length) length += this.options.itemSpacing; // start flush

        var itemSize;
        if(item && item.getSize) itemSize = item.getSize();
        if(!itemSize) itemSize = this.options.defaultItemSize;
        if(itemSize[girthDim] !== true) girth = Math.max(girth, itemSize[girthDim]);

        var output = this._outputFunction.call(this, item, length, result.length);
        result.push(output);
        
        if(itemSize[lengthDim] && (itemSize[lengthDim] !== true)) length += itemSize[lengthDim];
        currentNode = currentNode.getNext();
    }

    if(!girth) girth = undefined;

    if(!this._size) this._size = [0, 0];
    this._size[lengthDim] = length;
    this._size[girthDim] = girth;

    return {
        size: this.getSize(),
        target: result
    };
};

module.exports = SequentialLayout;