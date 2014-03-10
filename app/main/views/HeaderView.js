var Surface        = require('famous/surface');
var Modifier       = require('famous/modifier');
var Transform      = require('famous/transform')
var View           = require('famous/view');
var HeaderHamburgerToggleButtonView = require('./HeaderHamburgerToggleButtonView');

function HeaderView() {
  View.apply(this, arguments);
  _createHeaderViewSurface.call(this);
  _createHeaderHamburgerToggleButtonView.call(this);
}

HeaderView.prototype = Object.create(View.prototype);
HeaderView.prototype.constructor = HeaderView;

HeaderView.DEFAULT_OPTIONS = {
  size: [undefined, 30],
  headerViewBackgroundColor: 'white',
  hamburgerToggleButtonColor: '#9b59b6'
};

function _createHeaderViewSurface() {
  this.backgroundSurface = new Surface({
    size: this.options.size,
    properties: {
      backgroundColor: this.options.headerViewBackgroundColor
    }
  });

  this.headerModifier = new Modifier({
    origin: [0.5, 1]
  });
  // this.backgroundSurface.pipe(this.eventOutput);
  this._add(this.backgroundModifier).add(this.backgroundSurface);
}

function _createHeaderHamburgerToggleButtonView() {
  this.hamburgerToggleButtonView = new HeaderHamburgerToggleButtonView (this.options);
  // this.hamburgerToggleButtonView.pipe(this.eventOutput);

  this.hamburgerToggleButtonModifier = new Modifier({
    transform: Transform.translate(0, 0, 3),
    origin: [0.5, 1]
  });

  this._add(this.hamburgerToggleButtonModifier).add(this.hamburgerToggleButtonView);
  // this._add(this.hamburgerToggleButtonView.bottomButtonModifier).add(this.hamburgerToggleButtonView.buttonView);
}  

module.exports = HeaderView;
