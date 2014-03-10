var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var View = require('famous/view');
var PageView = require('./PageView');

function AppView() {
  View.apply(this, arguments);
  
  this.pages = [];
  this._numberOfPages = 0;

  _createFocusAndTodayViews.call(this);
  _addPageView.call(this, 'Later', 0, 'Today');
};

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.prototype.render = function() {
  this.spec = [];

    var pageView = {};

    // for (var i = this.pages.length -1; i >= 0; i--) {
    for (var i = 0; i < this.pages.length; i++) {

      pageView = this[this.pages[i].title + 'View'];

      this.spec.push({
        transform: Transform.translate(0, pageView.yPosition.get(), this.pages[i].z_index),
        target:  pageView.render()
      });
    }

  return this.spec;
};

AppView.DEFAULT_OPTIONS = {
  transition: {
      duration: 300,
      curve: 'easeOut'            
  }
};

function _createPageView(title, z_index, aboveView) {

  var pageViewOptions = {
    title: title,
    aboveView: aboveView,
    transition: this.options.transition
  };

  var pageViewModifierOptions = {
    transform: Transform.translate(0, 0, z_index)
  };

  this._numberOfPages++;

  this[title + 'View'] = new PageView(pageViewOptions);
  this[title + 'Modifier'] = new Modifier(pageViewModifierOptions);

  this._add(this[title + 'Modifier']).add(this[title + 'View']);
}

function _addPageView(title, z_index, aboveView) {
  this.pages.push({
    title: title,
    z_index: z_index,
    aboveView: aboveView
  });

  _createPageViews.call(this);
}

function _createFocusAndTodayViews() {
  this.pages.push(
    {
      title: 'Focus',
      z_index: 2,
      aboveView: null
    },
    {
      title: 'Today',
      z_index: 1,
      aboveView: 'Focus'
    }
  ); 

  _createPageViews.call(this);
}

function _createPageViews() {
  for (var i = 0; i < this.pages.length; i++) {
    _createPageView.call(
      this, 
      this.pages[i].title,
      this.pages[i].z_index,
      this[this.pages[i].aboveView && (this.pages[i].aboveView + 'View')]
    );
  }
}

module.exports = AppView;
