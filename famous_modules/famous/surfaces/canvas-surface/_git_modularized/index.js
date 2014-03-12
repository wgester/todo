var Surface = require('famous/surface');

/**
 * @class A surface containing an HTML5 Canvas element
 *
 * @description 
 *   
 * @name CanvasSurface
 * @extends Surface
 * @constructor
 */
function CanvasSurface(options) {
    if(options && options.canvasSize) this.canvasSize = options.canvasSize;
    Surface.apply(this, arguments);
    if(!this.canvasSize) this.canvasSize = this.getSize();
    this.backBuffer = document.createElement('canvas');
    if(this.canvasSize) {
        this.backBuffer.width = this.canvasSize[0];
        this.backBuffer.height = this.canvasSize[1];
    }
    this._contextId = undefined;
};

CanvasSurface.prototype = Object.create(Surface.prototype);
CanvasSurface.prototype.constructor = CanvasSurface;
CanvasSurface.prototype.elementType = 'canvas';
CanvasSurface.prototype.elementClass = 'surface';

CanvasSurface.prototype.setContent = function() {};

CanvasSurface.prototype.deploy = function(target) {
    if(this.canvasSize) {
        target.width = this.canvasSize[0];
        target.height = this.canvasSize[1];
    }

    if(this._contextId === '2d') {
        target.getContext(this._contextId).drawImage(this.backBuffer, 0, 0);
        this.backBuffer.width = 0;
        this.backBuffer.height = 0;
    }

};

CanvasSurface.prototype.recall = function(target) {
    var size = this.getSize();

    this.backBuffer.width = target.width;
    this.backBuffer.height = target.height;

    if(this._contextId === '2d') {
        this.backBuffer.getContext(this._contextId).drawImage(target, 0, 0);
        target.width = 0;
        target.height = 0;
    }
};

/**
 * Returns the canvas element's context
 *
 * @name CanvasSurface#getContext
 * @function
 * @param {string} contextId context identifier
 */
CanvasSurface.prototype.getContext = function(contextId) {
    this._contextId = contextId;
    return this._currTarget ? this._currTarget.getContext(contextId) : this.backBuffer.getContext(contextId);
};

CanvasSurface.prototype.setSize = function(size, canvasSize) {
    Surface.prototype.setSize.apply(this, arguments);
    if(canvasSize) this.canvasSize = canvasSize.slice(0);
    if(this._currTarget) {
        this._currTarget.width = this.canvasSize[0];
        this._currTarget.height = this.canvasSize[1];
    }
};

module.exports = CanvasSurface;
