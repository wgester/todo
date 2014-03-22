var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Color             = require('./Color');
var Transitionable    = require('famous/transitions/transitionable');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');


function HeaderView() {
  View.apply(this, arguments);
  this.inputToggled = false;
  
  this.focusInputClosed = false;

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
  inputInDuration: 300,
  inputOutDuration: 200
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

function _createInput() {
  this.boxContainer = new BoxContainer();
  this.bodMod = new Modifier();

  if (_isAndroid()) {
    this.boxMod = new Modifier({
      transform: Transform.translate(0, 110, 0)
    });
  } else {
    this.boxMod = new Modifier({
      transform: Transform.translate(0, 100, 0)
    });
  }


  this._add(this.boxMod).add(this.boxContainer);
};

function _createTitle() {
  this.titleHeader = new Surface({
    content: '<h1>' + this.options.title + '</h1>',
    properties: {
      backgroundColor: 'transparent'
    }
  });

  this.titleMod = new Modifier({
    opacity: 0,
    transform: Transform.translate(0, 10, 0)
  });

  if (this.options.title === 'FOCUS') {
    this.titleMod.setOpacity(1, undefined, function() {});
    this.titleHeader.setProperties({
      textAlign: 'left',
      fontSize: '28px',
      fontWeight: '50',
      marginTop: '40px',
      opacity: '0.3'

    })
  };

  this._add(this.titleMod).add(this.titleHeader);
};

function _buttonListener() {
  if(this.options.title !== 'FOCUS') {
    this.titleHeader.on('touchend', function() {
      this._eventOutput.emit('togglePageViewDown');
    }.bind(this));
  }
};

function _setListeners() {

  this.on('opened', function() {
    this.titleMod.setOpacity(1, {duration: this.options.openDuration}, function() {
      this.titleMod.setTransform(Transform.translate(0, 10, 1), {duration: this.options.openDurationf}, function() {});
    }.bind(this));
  }.bind(this));

  this.on('closed', function() {
    this.titleMod.setOpacity(0, {duration: this.options.closedDuration}, function() {
      this.titleMod.setTransform(Transform.translate(0, 10, 0), {duration: this.options.closedDuration}, function() {});
    }.bind(this));
  }.bind(this));

  _setInputListener.call(this);
};

function _setInputListener() {
  this.inputXOffset = _isAndroid() ? 30 : 10;
  this.inputZOffset = _isAndroid() ? 150 : 70;

  
  if (this.options.title === 'FOCUS' && !this.focusInputClosed) {
    this.titleHeader.on('touchstart', function() {
      this.inputToggled = !this.inputToggled;
      (this.inputToggled) ? this._eventOutput.emit('showInput') : this._eventOutput.emit('focusHideInput');
    }.bind(this));
  }

  this.on('showInput', function(e) {

    this.boxContainer.frontSurf.setProperties({'visibility': 'visible'});

    this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [this.inputXOffset, 70, this.inputZOffset]), {duration: this.options.inputInDuration}, function() {
      this._eventOutput.emit('inputRotated');
      this.boxContainer.inputSurf.setProperties({'visibility': 'hidden'});
    }.bind(this));
  }.bind(this));

  this.on('hideInput', function() {
    this.value = this.boxContainer.inputSurf.getValue();
    this.boxContainer.inputSurf.setValue('');
    this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [this.inputXOffset, 0, this.inputZOffset]), {duration: this.options.inputOutDuration}, function() {
      this.boxContainer.inputSurf.setProperties({'visibility': 'visible'});
      this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
    }.bind(this));

  }.bind(this));
};

module.exports = HeaderView;
