var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var View = require('famous/view');
var ListView = require('./ListView');
var FocusView = require('./FocusView');

function AppView() {
  View.apply(this, arguments);
  
  _createFocusView.call(this);
  _createListView.call(this);
  _setListeners.call(this);
};

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

function _createListView() {
  this.listView = new ListView();
  this.listMod = new Modifier({
    transform: Transform.translate(0, 0, -1)
  });
  
  this._add(this.listMod).add(this.listView);
};

function _createFocusView() {
  this.focusView = new FocusView();
  this.focusMod = new Modifier();
  this._add(this.focusMod).add(this.focusView);
};

function _setListeners() {
  this.toggled = false;
    
  this.focusView.on('toggleList', function() {
    if (this.toggled) {
      this.focusMod.setTransform(Transform.translate(0, 0, 0), {duration: 300});          
    } else {
      this.focusMod.setTransform(Transform.translate(0, -1 * (window.innerHeight - 44), 0), {duration: 300});    
    }
    this.toggled = !this.toggled;
  }.bind(this));
  
  this.listView.on('toggleList', function() {
    if (this.toggled) {
      this.focusMod.setTransform(Transform.translate(0, 0, 0), {duration: 300});    
    } else {
      this.focusMod.setTransform(Transform.translate(0, -500, 0), {duration: 300});    
    }
    this.toggled = !this.toggled;
  }.bind(this));
  
};

module.exports = AppView;
