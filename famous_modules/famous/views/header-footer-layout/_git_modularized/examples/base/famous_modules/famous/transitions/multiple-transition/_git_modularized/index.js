var Utility = require('famous/utilities/utility');

/**
 * @class Multiple value transition method
 * @description Transition meta-method to support transitioning multiple 
 *   values with scalar-only methods
 *
 * @name MultipleTransition
 * @constructor
 *
 * @param {Object} method Transionable class to multiplex
 */
function MultipleTransition(method) {
    this.method = method;
    this._instances = [];
    this.state = [];
};

MultipleTransition.SUPPORTS_MULTIPLE = true;

MultipleTransition.prototype.get = function() {
    for(var i = 0; i < this._instances.length; i++) {
        this.state[i] = this._instances[i].get();
    }
    return this.state;
};

MultipleTransition.prototype.set = function(endState, transition, callback) {
    var _allCallback = Utility.after(endState.length, callback)
    for(var i = 0; i < endState.length; i++) {
        if(!this._instances[i]) this._instances[i] = new (this.method)();
        this._instances[i].set(endState[i], transition, _allCallback);
    }
};

MultipleTransition.prototype.reset = function(startState) {
    for(var i = 0; i < startState.length; i++) {
        if(!this._instances[i]) this._instances[i] = new (this.method)();
        this._instances[i].reset(startState[i]);
    }
};

module.exports = MultipleTransition;
