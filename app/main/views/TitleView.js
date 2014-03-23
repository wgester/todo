var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var AppView           = require('./views/AppView');
var Transitionable    = require("famous/transitions/transitionable");

function TitleView(options) {
  View.apply(this, arguments);
  this.shadowTransitionable = new Transitionable([50, 206, 168, 255, 255, 255]);

  _createTitleSurface.call(this);
  _setListeners.call(this);
  _playShadow.call(this);
};

TitleView.prototype = Object.create(View.prototype);
TitleView.prototype.constructor = TitleView;

TitleView.DEFAULT_OPTIONS = {
  context: null,
  devMode: true,
  asana: true
};

function _createTitleSurface() {
  this.titleSurf = new Surface({
    size: [undefined, undefined],
    classes: ['title'],
    content: '<h1>FOCUS</h1>',
    properties: {
      backgroundColor: '#32CEA8',
      paddingLeft: 0
    }
  });  

  this.titleMod = new Modifier({
    opacity: 1
  });

  this._add(this.titleMod).add(this.titleSurf);
};

function _shadowMod() {
  this.titleSurf.setProperties({
    textShadow: '0px 0px ' + this.shadowTransitionable.get()[0] + 'px rgba(0, 49, 86, 1)'
  });
};

function _setListeners() {
  window.Engine.on("prerender", _shadowMod.bind(this));
};

function _createAppView() {
  console.log('called');
  var appView = new AppView();
  this.options.context.add(appView);
  this.titleMod.setTransform(Transform.translate(0, 2000, -50), function() {});
};


function _playShadow() {
  if (this.options.devMode) {
    this.titleMod.setOpacity(0, function(){});
    if (this.options.asana && window.localStorage._authKey === undefined) {
      console.log('WOO')
      _createAppView.call(this);
      // _populateAsana.call(this);       
    } else {
      _createAppView.call(this);
    }
  } else {
    this.shadowTransitionable.set([1.5, 100, 50], {duration: 1500}, function() {
      this.shadowTransitionable.set([2, 100, 50], {duration: 500}, function(){
        this.shadowTransitionable.set([0, 100, 50], {duration: 800}, function() {
          Timer.after(function() {
            this.titleMod.setOpacity(0.5, {duration: 500}, function() {
              Timer.after(function(){
                _createAppView.call(this);
              }, 20);
            }.bind(this));
          }, 7);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};

module.exports = TitleView;
