var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');
var Color     = require('./Color');
var Transitionable    = require('famous/transitions/transitionable');

function HeaderView() {
  View.apply(this, arguments);
  this.shadowTransitionable = new Transitionable([60, 100, 50]);

  _createTitle.call(this);
  _buttonListener.call(this);
  _setListeners.call(this);
  this.options.title === 'FOCUS' && _playShadow.call(this);    
  
}

HeaderView.prototype = Object.create(View.prototype);
HeaderView.prototype.constructor = HeaderView;

HeaderView.DEFAULT_OPTIONS = {
  text: null,
  classes: ['title'],
  title: 'LATER'
};

function _shadowMod() {
  this.titleHeader.setProperties({
    textShadow: '0px 0px ' + this.shadowTransitionable.get()[0] + 'px rgba(0, 49, 86, 1)' 
  });
};

function _playShadow() {
  this.shadowTransitionable.set([1.5, 100, 50], {duration: 1500}, function() {
    this.shadowTransitionable.set([2, 100, 50], {duration: 800}, function(){
      this.shadowTransitionable.set([0, 100, 50], {duration: 500}, function() {});
    }.bind(this));
  }.bind(this));
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
        backgroundColor:  new Color('#3399FF').setLightness(60).getHex() 
      }
    });
  } else if (this.options.title === "FOCUS") {
    this.titleHeader = new Surface({
      content: '<h1>' + this.options.title + '</h1>',
      properties: {
        color: 'transparent',
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
    this._add(this.titleHeader);      
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

function _setListeners() {
  if (this.options.title === 'FOCUS') {
    window.Engine.on("prerender", _shadowMod.bind(this));  
  }
};

module.exports = HeaderView;
