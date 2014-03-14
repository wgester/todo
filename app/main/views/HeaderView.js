var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');
var Color     = require('./Color');
var Transitionable    = require('famous/transitions/transitionable');

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

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};


function _createTitle() {
  if (this.options.title === "TODAY") {
    this.titleHeader = new Surface({
      content: '<h1>' + this.options.title + '</h1>',
      properties: {
        backgroundColor:  new Color('#87CEFA').getHex()
      }
    });
  } else if (this.options.title === "FOCUS") {
    this.titleHeader = new Surface({
      content: '<h1>' + this.options.title + '</h1>',
      properties: {
        backgroundColor: new Color('#32CEA8').setLightness(50).getHex()
      }
    });        
  } else if (this.options.title === "LATER") {
    this.titleHeader = new Surface({
      content: '<h1>' + this.options.title + '</h1>',
      properties: {
        backgroundColor: new Color('#9C7CCB').setLightness(65).getHex()
      }
    });

  } else {
    this.titleHeader = new Surface({
      content: '<h1>' + this.options.title + '</h1>',
      properties: {
        backgroundColor: new Color('#32CEA8').setLightness(50).getHex()
      }
    });

  }
  this._add(this.titleHeader);      
};

function _buttonListener() {
  this.titleHeader.on('touchend', function() {
    this._eventOutput.emit('togglePageViewDown');
  }.bind(this));
};

module.exports = HeaderView;
