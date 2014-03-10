var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');

function FooterView() {
  View.apply(this, arguments);
  _createButton.call(this);
  _buttonListener.call(this);
}

FooterView.prototype = Object.create(View.prototype);
FooterView.prototype.constructor = FooterView;

FooterView.DEFAULT_OPTIONS = {
  classes: ['footer']
};

function _createButton() {
  this.buttonSurf = new Surface({
    content: "<img width='40' height='40' src='./img/hamburgerOnClear.png'/>",
    properties: {
      backgroundColor: 'pink',
      textAlign: 'center'
    }
  });
  
  this.buttonModifier = new Modifier({
    origin: [0.5, 1]
  });

  this._add(this.buttonModifier).add(this.buttonSurf);
};

function _buttonListener() {
  this.buttonSurf.on('touchstart', function() {
    this._eventOutput.emit('hamburger');
  }.bind(this));

}

module.exports = FooterView;