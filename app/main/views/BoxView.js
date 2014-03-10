var Surface = require('famous/surface');
var Modifier      = require('famous/modifier');
var Transform     = require('famous/transform');
var View           = require('famous/view');
var ContainerSurface  = require("famous/surfaces/container-surface");
var InputSurface      = require("famous/surfaces/input-surface");


function Box(options) {
  View.apply(this, arguments);
  this._optionsManager.patch(Box.DEFAULT_OPTIONS);

  var faceSize = this.options.face.size[0];

  var left = new Modifier({
      transform: Transform.rotate(0, 1.57, 0)
  });

  var right = new Modifier({
      transform: Transform.move(Transform.rotate(0, 1.57, 0), [faceSize, 0])
  });

  var top = new Modifier({
      transform: Transform.move(Transform.rotate(1.57, 0, 0), [0, 0, -faceSize])
  });

  var bottom = new Modifier({
      transform: Transform.move(Transform.rotate(-1.57, 0, 0), [0, faceSize, 0])
  });

  var back = new Modifier({
      transform: Transform.move(Transform.rotate(6.28, 0, 0), [0, 0, -faceSize])
  });

  var frontSurf = new Surface(this.options.face);

  var leftSurf = new Surface(this.options.face);

  var rightSurf = new Surface(this.options.face);

  this.topSurf = new InputSurface({
    size: this.options.face.size,
    properties: {background: 'white', margin: 0, border: '1px solid black'}
  });

  var bottomSurf = new Surface(this.options.face);

  var backSurf = new Surface(this.options.face);

  this._add(frontSurf);
  this._add(left).add(leftSurf);
  this._add(right).add(rightSurf);
  this._add(top).add(this.topSurf);
  this._add(bottom).add(bottomSurf);
  this._add(back).add(backSurf);
};

Box.DEFAULT_OPTIONS = {
    face: {
        size: [100, 100],
        properties:  {
            border: '1px solid black',
            background: 'gray',
            margin: 0,
            opacity: 0.5
        }
    }
};

Box.prototype = Object.create(View.prototype);

Box.prototype.getInput = function() {
  return this.topSurf;
};


module.exports = Box;