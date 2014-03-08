var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var View = require('famous/view');
var PageView = require('./PageView');

function AppView() {
  View.apply(this, arguments);
  
  _createFocusView.call(this);
  _createTodayView.call(this);
};

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.prototype.render = function() {
    this.spec = [];

    this.spec.push({
        transform: Transform.translate(0, this.focusView.yPosition.get(), 2),
        target: this.focusView.render()
    });

    this.spec.push({
        transform: Transform.translate(0, this.todayView.yPosition.get(), 1),
        target: this.todayView.render()
    });

    return this.spec;
};

AppView.DEFAULT_OPTIONS = {
  transition: {
      duration: 300,
      curve: 'easeOut'            
  }
};

function _createTodayView() {
  this.todayView = new PageView({
    title: 'Today',
    aboveView: this.focusView,
    transition: this.options.transition
  });
  this.TodayMod = new Modifier({
    transform: Transform.translate(0, 0, -1)
  });
  
  this._add(this.TodayMod).add(this.TodayView);
};

function _createFocusView() {
  this.focusView = new PageView({
    title: 'Focus',
    transition: this.options.transition
  });
  this.focusMod = new Modifier();
  this._add(this.focusMod).add(this.focusView);
};

module.exports = AppView;
