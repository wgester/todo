var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');

//// This is the toggle down button

function FooterView() {
  View.apply(this, arguments);
  this.options.title !== 'NEVER' && _createButton.call(this);
  this.options.title !== 'NEVER' &&  _buttonListener.call(this);
}

FooterView.prototype = Object.create(View.prototype);
FooterView.prototype.constructor = FooterView;

FooterView.DEFAULT_OPTIONS = {
  classes: ['footer']
};

function _createButton() {
  this.buttonSurf = new Surface({
    content: "<img width='40' height='40' src='./img/down.png'/>",
    properties: {
      textAlign: 'right',
      paddingRight: '20px',
      paddingTop: '10px'
    }
  });

  this.buttonModifier = new Modifier({
    transform: Transform.translate(2, 0, 1)
  });

  this._add(this.buttonModifier).add(this.buttonSurf);
};

function _buttonListener() {
  this.buttonSurf.on('touchend', function() {
    this._eventOutput.emit('togglePageViewUp');
  }.bind(this));
};

module.exports = FooterView;
