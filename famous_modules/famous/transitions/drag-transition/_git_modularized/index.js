var PE = require('famous/physics/engine');
var Drag = require('famous/physics/forces/drag');

/** @constructor */
function DragTransition(state){
    this.drag = new Drag({strength : DragTransition.DEFAULT_OPTIONS.strength});

    this._restTolerance = 1e-8;
    this._active        = false;

    this.PE = new PE();
    this.particle = this.PE.createParticle();
    this.PE.attach(this.drag, this.particle);
    this.dimensions = undefined;

    _setTarget.call(this, state || 0);
}

DragTransition.SUPPORTS_MULTIPLE = 3;
DragTransition.DEFAULT_OPTIONS = {
    strength : 0.01,
    velocity : 0
}

function _update(){
    if (!this._active){
        if (this._callback) {
            var cb = this._callback;
            this._callback = undefined;
            cb();
        }
        return;
    }
    this.PE.step();
    var energy = _getEnergy.call(this);
    if (energy < this._restTolerance) {
        _sleep.call(this);
        _setParticleVelocity.call(this, [0,0,0]);
    };
}

function _getEnergy(){
    return this.particle.getEnergy();
}

function _setupDefinition(def){
    var defaults = DragTransition.DEFAULT_OPTIONS;
    if (def.strength === undefined) def.strength = defaults.strength;

    this.drag.setOpts({strength : def.strength});

    //setup particle
    _setParticleVelocity.call(this, def.velocity);
}

function _wake(){
    this.PE.play();
    this._active = true;
}

function _sleep(){
    this.PE.pause();
    this._active = false;
}

function _setTarget(state){
    _setParticlePosition.call(this, state);
}

function _setParticlePosition(p){
    this.particle.p.set(p);
}

function _setParticleVelocity(v){
    this.particle.v.set(v);
}

function _getParticlePosition(){
    return (this.dimensions === 1)
        ? this.particle.p.x
        : this.particle.p.get();
}

function _getParticleVelocity(){
    return (this.dimensions === 1)
        ? this.particle.v.x
        : this.particle.v.get();
}

function _setCallback(callback){
    this.callback = callback;
}

DragTransition.prototype.reset = function(state, velocity){
    if (state instanceof Array) this.dimensions = state.length;
    else this.dimensions = 1;

    if (velocity !== undefined) _setParticleVelocity.call(this, velocity);
    _setTarget.call(this, state);
    _setCallback.call(this, undefined);
}

DragTransition.prototype.getVelocity = function(){
    return _getParticleVelocity.call(this);
}

DragTransition.prototype.halt = function(){
    this.set(this.get());
}

DragTransition.prototype.get = function(){
    _update.call(this);
    return _getParticlePosition.call(this);
}

DragTransition.prototype.set = function(state, definition, callback){
    if (!definition){
        this.reset(state)
        if (callback) callback();
        return;
    };

    if (state instanceof Array) this.dimensions = state.length;
    else this.dimensions = 1;

    _wake.call(this);
    _setupDefinition.call(this, definition);
    _setTarget.call(this, state);
    _setCallback.call(this, callback);
}

module.exports = DragTransition;
