var PE = require('famous/physics/engine');
var Spring = require('famous/physics/forces/spring');
// var Spring = require('famous/physics/constraints/stiff-spring');
var Wall = require('famous/physics/constraints/wall');
var Vector = require('famous/math/vector');

/*
* Define a physical transition by attaching a spring and or wall to a target location
* The definition for the transition allows one to specify the parameters of the
* spring and wall and starting velocity
*/

 /** @constructor */
function WallTransition(state){
    state = state || 0;

    this.endState  = new Vector(state);
    this.initState = new Vector();
    this._active   = false;

    this.spring = new Spring({anchor : this.endState});
    this.wall   = new Wall();

    this._restTolerance = 1e-8;
    this._absRestTolerance = this._restTolerance;
    this._callback = undefined;

    this.PE = new PE();
    this.particle = this.PE.createParticle({p : this.endState});
    this.PE.attach([this.wall, this.spring], this.particle);
}

WallTransition.SUPPORTS_MULTIPLE = 3;
WallTransition.DEFAULT_OPTIONS = {
    period : 300,
    dampingRatio : 0,
    restitution : 0.5,
    velocity : 0
};

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
    if (energy < this._absRestTolerance) {
        _sleep.call(this);
        _setParticlePosition.call(this, this.endState);
        _setParticleVelocity.call(this, [0,0,0]);
    };
}

function _getEnergy(){
    return this.particle.getEnergy() + this.spring.getEnergy(this.particle);
}

function _setAbsoluteRestTolerance(){
    var distance = this.endState.sub(this.initState).normSquared();
    this._absRestTolerance = (distance === 0)
        ? this._restTolerance
        : this._restTolerance * distance;
}

function _setupDefinition(def){
    var defaults = WallTransition.DEFAULT_OPTIONS;
    if (def.period === undefined) def.period = defaults.period;
    if (def.dampingRatio === undefined) def.dampingRatio = defaults.dampingRatio;
    if (def.velocity === undefined) def.velocity = defaults.velocity;
    if (def.restitution === undefined) def.restitution = defaults.restitution;

    //setup spring
    this.spring.setOpts({
        period : def.period,
        dampingRatio : def.dampingRatio
    });

    //setup wall
    this.wall.setOpts({
        restitution : def.restitution
    });

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

function _setTarget(target){
    this.endState.set(target);

    var dist = this.endState.sub(this.initState).norm();

    this.wall.setOpts({
        d : this.endState.norm(),
        n : (dist == 0)
            ? this.particle.v.normalize(-1)
            : this.endState.sub(this.initState).normalize(-1)
    });

    _setAbsoluteRestTolerance.call(this);
}

function _setParticlePosition(p){
    this.particle.p.set(p);
}

function _setParticleVelocity(v){
    this.particle.v.set(v);
}

function _getParticlePosition(){
    return (this.dimensions === 0)
        ? this.particle.p.x
        : this.particle.p.get();
}

function _getParticleVelocity(){
    return (this.dimensions === 0)
        ? this.particle.v.x
        : this.particle.v.get();
}

function _setCallback(callback){
    this._callback = callback;
}

WallTransition.prototype.reset = function(pos, vel){
    this.dimensions = (pos instanceof Array)
        ? pos.length
        : 0;

    this.initState.set(pos);
    _setParticlePosition.call(this, pos);
    if (vel) _setParticleVelocity.call(this, vel);
    _setTarget.call(this, pos);
    _setCallback.call(this, undefined);
}

WallTransition.prototype.getVelocity = function(){
    return _getParticleVelocity.call(this);
}

WallTransition.prototype.setVelocity = function(v){
    this.call(this, _setParticleVelocity(v));
}

WallTransition.prototype.halt = function(){
    this.set(this.get());
}

WallTransition.prototype.get = function(){
    _update.call(this);
    return _getParticlePosition.call(this);
}

WallTransition.prototype.set = function(endState, definition, callback){
    if (!definition){
        this.reset(endState)
        if (callback) callback();
        return;
    };

    this.dimensions = (endState instanceof Array)
        ? endState.length
        : 0;

    _wake.call(this);
    _setupDefinition.call(this, definition);
    _setTarget.call(this, endState);
    _setCallback.call(this, callback);
}

module.exports = WallTransition;
