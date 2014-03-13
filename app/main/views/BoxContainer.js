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

function _createInput() {
  this.box = new Box();
  this.boxMod = new Modifier();
  this.boxMod.setTransform(Transform.move(Transform.rotate(0,0,0), [10, 150, 50]));
  this.inputSurf = this.box.topSurf;
  this.frontSurf = this.box.frontSurf;
  this._add(this.boxMod).add(this.box);            
};


BoxContainer.prototype = Object.create(View.prototype);
BoxContainer.prototype.constructor = BoxContainer;

module.exports = BoxContainer;