var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');
var Color     = require('./Color');

function HeaderView() {
  View.apply(this, arguments);
  _createTitle.call(this);
  _buttonListener.call(this);
}

HeaderView.prototype = Object.create(View.prototype);
HeaderView.prototype.constructor = HeaderView;

HeaderView.DEFAULT_OPTIONS = {
  text: null,
  classes: ['title'],
  title: 'LATER'
};

function _createTitle() {
  this.titleHeader = new Surface({
    content: '<h1>' + this.options.title + '</h1>',
    properties: {
      color: 'black',
      fontSize: '1em',
      backgroundColor: new Color('#3399FF').setLightness(60).getHex()
}
  });
  this._add(this.titleHeader);  
};

function _buttonListener() {
  this.titleHeader.on('touchend', function() {
    this._eventOutput.emit('togglePageViewDown');
  }.bind(this));
}

module.exports = HeaderView;
