var Surface = require('famous/surface');

/**
 *  HTML Input Surface
 *
 *  @class A famo.us surface in the form of an HTML
 *  input element.
 */
function InputSurface ( options ) {

    this._placeholder = options.placeholder || '';
    this._value       = options.value || '';
    this._type        = options.type || 'text';

    Surface.apply(this, arguments);
}

InputSurface.prototype = Object.create(Surface.prototype);

InputSurface.prototype.elementType = 'input';
InputSurface.prototype.elementClass = 'famous-surface';

/**
 * @name InputSurface#setPlaceholder
 * @param {string} Value to set the html placeholder to.
 * Triggers a repaint next tick.
 * @returns this, allowing method chaining.
 */
InputSurface.prototype.setPlaceholder = function ( str ) {
    this._placeholder = str;
    this._contentDirty = true;
    return this;
}

/**
 * @name InputSurface#setValue
 * @param {string} Value to set the main input value to.
 * Triggers a repaint next tick.
 * @returns this, allowing method chaining.
 */
InputSurface.prototype.setValue = function ( str ) {
    this._value = str;
    this._contentDirty = true;
    return this;
}

/** 
 * @name InputSurface#setType
 * @param {string} Set the type of the input surface.
 * Triggers a repaint next tick.
 * @returns this, allowing method chaining.
 */
InputSurface.prototype.setType = function ( str ) {
    this._type = str;
    this._contentDirty = true;
    return this;
}

/**
 * @name InputSurface#getValue
 * @returns {string} value of current input.
 */
InputSurface.prototype.getValue = function () {
    if( this._currTarget ) { 
        return this._currTarget.value;
    } else { 
        return this._value;
    }
}

/**
 * @name InputSurface#deploy
 * sets the placeholder, value and type of the input.
 */
InputSurface.prototype.deploy = function (target) {
    if( this._placeholder !== "" ) target.placeholder = this._placeholder;
    target.value = this._value;
    target.type = this._type;
}

module.exports = InputSurface;
