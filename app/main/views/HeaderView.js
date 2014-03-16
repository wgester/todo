var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');
var Color     = require('./Color');
var Transitionable    = require('famous/transitions/transitionable');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');


function HeaderView() {
  View.apply(this, arguments);
  
  _createTitle.call(this);
  _createInput.call(this);
  _buttonListener.call(this);
  _setListeners.call(this);
}

HeaderView.prototype = Object.create(View.prototype);
HeaderView.prototype.constructor = HeaderView;

HeaderView.DEFAULT_OPTIONS = {
  text: null,
  classes: ['title'],
  title: 'LATER',
  openDuration: 800,
  closedDuration: 100,
  inputDuration: 300
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();  
  return userAgent.indexOf("android") > -1;
};

function _createInput() {
  this.boxContainer = new BoxContainer();
  this.boxMod = new Modifier({
    transform: Transform.translate(0, 70, 0)
  });
  
  this._add(this.boxMod).add(this.boxContainer);  
};

function _createTitle() {
  this.titleHeader = new Surface({
    content: '<h1>' + this.options.title + '</h1>',
    properties: {
      backgroundColor:  'transparent'
    }
  });
  
  this.titleMod = new Modifier({
    opacity: 0
  });
  
  this.options.title === 'FOCUS' && this.titleMod.setOpacity(1, undefined, function() {});
  
  this._add(this.titleMod).add(this.titleHeader);      
};

function _buttonListener() {
  this.titleHeader.on('touchend', function() {
    this._eventOutput.emit('togglePageViewDown');
  }.bind(this));
};

function _setListeners() {
  this.on('opened', function() {
    this.titleMod.setOpacity(1, {duration: this.options.openDuration}, function() { 
      this.titleMod.setTransform(Transform.translate(0, 0, 1), {duration: this.options.openDurationf}, function() {});
    }.bind(this));
  }.bind(this));

  this.on('closed', function() {
    this.titleMod.setOpacity(0, {duration: this.options.closedDuration}, function() { 
      this.titleMod.setTransform(Transform.translate(0, 0, 0), {duration: this.options.closedDuration}, function() {});
    }.bind(this));
  }.bind(this));

  _setInputListener.call(this);
};

function _setInputListener() {
  this.on('showInput', function(e) {
    this.boxContainer.frontSurf.setProperties({'visibility': 'visible'})
    this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [10, 70, 70]), {duration: this.options.inputDuration});      
  }.bind(this));    

  this.on('hideInput', function() {
    this.value = this.boxContainer.inputSurf.getValue();
    this.boxContainer.inputSurf.setValue('');
    
    this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [10, 0, 70]), {duration: this.options.inputDuration}, function() {
      this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
    }.bind(this));      
  }.bind(this));
};

module.exports = HeaderView;
