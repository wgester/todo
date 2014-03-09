var Transform      = require('famous/transform');
var MouseSync      = require('famous/input/mouse-sync');
var TouchSync      = require('famous/input/touch-sync');
var GenericSync    = require('famous/input/generic-sync');
var Transitionable = require('famous/transitions/transitionable');
var EventHandler   = require('famous/event-handler');

/**
 * @class Draggable
 * @description
 * Makes the linked renderables responsive to dragging.
 * @name Draggable
 * @constructor
 * @example 
 *  define(function(require, exports, module) {
 *      var Engine = require('famous/Engine');
 *      var Draggable = require('famous-modifiers/Draggable');
 *      var Surface = require('famous/Surface');
 *
 *      var Context = Engine.createContext();
 *      var draggable = new Draggable();
 *      var surface = new Surface({
 *          content: 'test',
 *          properties: {
 *              backgroundColor:'#3cf'
 *          },
 *          size: [300, 300]
 *      });
 *
 *      surface.pipe(draggable);
 *
 *      Context.link(draggable).link(surface);
 *  });
 */
function Draggable(options) {
    this.options = Object.create(Draggable.DEFAULT_OPTIONS);
    if (options) this.setOptions(options);

    this._positionState = new Transitionable([0,0]);
    this._differential  = [0,0];
    this._active = true;

    this.sync = new GenericSync(
        function() { return this._differential; }.bind(this),
        {
            scale : this.options.scale,
            syncClasses : [MouseSync, TouchSync]
        }
    );

    this.eventOutput = new EventHandler();
    EventHandler.setInputHandler(this,  this.sync);
    EventHandler.setOutputHandler(this, this.eventOutput);

    _bindEvents.call(this);
}

//binary representation of directions for bitwise operations
var _direction = {
    x : 0x001,         //001
    y : 0x002          //010
}

Draggable.DEFAULT_OPTIONS = {
    projection  : _direction.x | _direction.y,
    scale       : 1,
    xRange      : [-Infinity, Infinity],
    yRange      : [-Infinity, Infinity],
    snapX       : 0,
    snapY       : 0,
    transition  : {duration : 0}
}

function _clamp(x,range){
    return Math.min(Math.max(x, range[0]), range[1]);
}

function _handleStart(){
    if (!this._active) return;
    if (this._positionState.isActive()) this._positionState.halt();
    this.eventOutput.emit('dragstart', {p : this.getPosition()});
}

function _handleMove(event){
    if (!this._active) return;

    this._differential = event.p;

    var newDifferential = _mapDifferential.call(this, this._differential);

    //buffer the differential if snapping is set
    this._differential[0] -= newDifferential[0];
    this._differential[1] -= newDifferential[1];

    var pos = this.getPosition();

    //modify position by reference
    pos[0] += newDifferential[0];
    pos[1] += newDifferential[1];

    //handle bounding box
    if (this.options.xRange){
        var xRange = this.options.xRange;
        pos[0] = _clamp(pos[0], xRange);
    };

    if (this.options.yRange){
        var yRange = this.options.yRange;
        pos[1] = _clamp(pos[1], yRange);
    };

    this.eventOutput.emit('dragmove', {p : pos});
}

function _handleEnd(event){
    if (!this._active) return;
    this.eventOutput.emit('dragend', {p : this.getPosition(), v : event.v, a : event.a});
}

function _bindEvents() {
    this.sync.on('start',  _handleStart.bind(this));
    this.sync.on('update', _handleMove.bind(this));
    this.sync.on('end',    _handleEnd.bind(this));
}

function _mapDifferential(differential){
    var opts        = this.options;
    var projection  = opts.projection;
    var snapX       = opts.snapX;
    var snapY       = opts.snapY;

    //axes
    var tx = (projection & _direction.x) ? differential[0] : 0;
    var ty = (projection & _direction.y) ? differential[1] : 0;

    //snapping
    if (snapX > 0) tx -= tx % snapX;
    if (snapY > 0) ty -= ty % snapY;

    return [tx,ty];
}

Draggable.prototype.setOptions = function(options){
    var opts = this.options;
    if (options.projection !== undefined){
        var proj = options.projection;
        this.options.projection = 0;
        ['x', 'y'].forEach(function(val){
            if (proj.indexOf(val) != -1) opts.projection |= _direction[val];
        });
    };
    if (options.scale  !== undefined) opts.scale  = options.scale;
    if (options.xRange !== undefined) opts.xRange = options.xRange;
    if (options.yRange !== undefined) opts.yRange = options.yRange;
    if (options.snapX  !== undefined) opts.snapX  = options.snapX;
    if (options.snapY  !== undefined) opts.snapY  = options.snapY;
}

Draggable.prototype.getPosition = function() {
    return this._positionState.get();
};

Draggable.prototype.setRelativePosition = function(p, transition, callback) {
    var pos = this.getPosition();
    var relativePosition = [pos[0] + p[0], pos[1] + p[1]];
    this.setPosition(relativePosition, transition, callback);
};

Draggable.prototype.setPosition = function(p, transition, callback) {
    if (this._positionState.isActive()) this._positionState.halt();
    this._positionState.set(p, transition, callback);
};

Draggable.prototype.activate = function(){
    this._active = true;
}

Draggable.prototype.deactivate = function(){
    this._active = false;
}

Draggable.prototype.toggle = function(){
    this._active = !this._active;
}

Draggable.prototype.modify = function(target) {
    var pos = this.getPosition();
    return {
        transform: Transform.translate(pos[0], pos[1]),
        target: target
    };
}

module.exports = Draggable;