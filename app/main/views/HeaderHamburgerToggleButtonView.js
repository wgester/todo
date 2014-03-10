var Surface        = require('famous/surface');
var Modifier       = require('famous/modifier');
var View           = require('famous/view');
var Transform      = require('famous/transform');

function HeaderHamburgerToggleButtonView() {
  View.apply(this, arguments);
  _createHeaderHamburger.call(this);
}

HeaderHamburgerToggleButtonView.prototype = Object.create(View.prototype);
HeaderHamburgerToggleButtonView.prototype.constructor = HeaderHamburgerToggleButtonView;

function _createHeaderHamburger() {
  this.topButtonBarSurface = new Surface({
    size: [20, 2],
    properties: {
      backgroundColor: this.options.hamburgerToggleButtonColor
    }
  });

  this.middleButtonBarSurface = new Surface({
    size: [20, 2],
    properties: {
      backgroundColor: this.options.hamburgerToggleButtonColor
    }
  });

  this.bottomButtonBarSurface = new Surface({
    size: [20, 2],
    properties: {
      backgroundColor: this.options.hamburgerToggleButtonColor
    }
  });

  this.topButtonModifier = new Modifier({
    origin: [0.5, 0.25]
  });

  this.middleButtonModifier = new Modifier({
    origin: [0.5, 0.5]
  });

  this.bottomButtonModifier = new Modifier({
    origin: [0.5, 0.75]
  });


  this._add(this.topButtonModifier).add(this.topButtonBarSurface);
  this._add(this.middleButtonModifier).add(this.middleButtonBarSurface);
  this._add(this.bottomButtonModifier).add(this.bottomButtonBarSurface);
  
  this.buttonView = new Surface({
      size: [30, 30],
      content: '<img width="30" src="./img/hamburgerOnClear.png"/>'
  });
  this._add(this.bottomButtonModifier).add(this.buttonView);
};

module.exports = HeaderHamburgerToggleButtonView;
