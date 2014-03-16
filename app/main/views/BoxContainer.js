var Surface = require('famous/surface');
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var View           = require('famous/view');
var InputSurface      = require("famous/surfaces/input-surface");
var Box = require('./BoxView');

function BoxContainer(options) {
  View.apply(this, arguments);
  _createInput.call(this);
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};

function _createInput() {
  this.box = new Box();
  this.boxMod = new Modifier();
  (_isAndroid()) ? this.boxMod.setTransform(Transform.move(Transform.rotate(0,0,0), [30, 0, 150])) : this.boxMod.setTransform(Transform.move(Transform.rotate(0,0,0), [10, 0, 70]));
  this.inputSurf = this.box.topSurf;
  this.frontSurf = this.box.frontSurf;
  this._add(this.boxMod).add(this.box);            
};


BoxContainer.prototype = Object.create(View.prototype);
BoxContainer.prototype.constructor = BoxContainer;

module.exports = BoxContainer;