var Surface = require('famous/surface');
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var View           = require('famous/view');
var InputSurface      = require("famous/surfaces/input-surface");


function Box(options) {
  View.apply(this, arguments);
  this._optionsManager.patch(Box.DEFAULT_OPTIONS);

  var faceSize = this.options.face.size[0];

  var left = new Modifier({
      transform: Transform.rotate(0, 1.57, 0)
  });

  var right = new Modifier({
      transform: Transform.move(Transform.rotate(0, 1.57, 0), [300, 0])
  });

  var top = new Modifier({
      transform: Transform.move(Transform.rotate(1.57, 0, 0), [0, 0, -50])
  });

  var bottom = new Modifier({
      transform: Transform.move(Transform.rotate(-1.57, 0, 0), [0, 50, 0])
  });

  var back = new Modifier({
      transform: Transform.move(Transform.rotate(6.28, 0, 0), [0, 0, -50])
  });

  this.frontSurf = new Surface(this.options.face);

  var leftSurf = new Surface({
    size: [50, 50],
    properties: this.options.face.properties
  });

  var rightSurf = new Surface({
    size: [50, 50],
    properties: this.options.face.properties
  });

  this.topSurf = new InputSurface({
    size: this.options.face.size,
    properties: {background: 'white', margin: 0, opacity: '0.2'}
  });

  var bottomSurf = new Surface(this.options.face);

  var backSurf = new Surface(this.options.face);

  this._add(this.frontSurf);
  this._add(left).add(leftSurf);
  this._add(right).add(rightSurf);
  this._add(top).add(this.topSurf);
  this._add(bottom).add(bottomSurf);
  this._add(back).add(backSurf);
};

Box.DEFAULT_OPTIONS = {
    face: {
        size: [300, 50],
        properties:  {
            margin: 0,
            opacity: 0.5,
            visibility: 'hidden'
        }
    }
};

Box.prototype = Object.create(View.prototype);
module.exports = Box;