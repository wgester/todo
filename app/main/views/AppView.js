var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var View = require('famous/view');
var PageView = require('./PageView');

function AppView() {
  View.apply(this, arguments);
  
  this.pages = [];
  this.pageViewsRendered = {};
  this._numberOfPages = 0;
  this.lastPage = null;

  _createAppViews.call(this);
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
  },
  wall: {
    method: 'wall',
    period: 300,
    dampingRatio: 0.3
  }
};

function _createPageView(title, z_index, aboveView) {

  var pageViewOptions = {
    title: title,
    aboveView: aboveView,
    transition: this.options.transition,
    wall: this.options.wall
  };

  var pageViewModifierOptions = {
    transform: Transform.translate(0, 0, z_index)
  };

  // this.lastPage && _stopListeningToOldLastPageSlideUpEvent.call(this);

  this.lastPage = this[title + 'View'] = new PageView(pageViewOptions);
  this[title + 'Modifier'] = new Modifier(pageViewModifierOptions);

  this._add(this[title + 'Modifier']).add(this[title + 'View']);
  // _listenForLastPageViewSlideUpToCreateNewLastPageView.call(this);

  // this[title + 'View'].on('slideDown', function(){
  //   this[title + 'Modifier'].setTransform(Transform.translate(0, 0, 0), this.options.wallTransition)
  // }.bind(this));
}

function _addPageView(title) {
  this._numberOfPages++;
  this.pages.push({
    title: title,
    z_index: 3 - 2 * this._numberOfPages,
    aboveView: this.lastPage
  });
  _createPageView.call(
    this, 
    this.pages[this.pages.length -1].title, 
    this.pages[this.pages.length -1].z_index, 
    this.lastPage
  );
}

function _createAppViews() {
  _addPageView.call(this, 'FOCUS');
  _addPageView.call(this, 'TODAY');
  _addPageView.call(this, 'LATER');
  _addPageView.call(this, 'NEVER');
}

// function _listenForLastPageViewSlideUpToCreateNewLastPageView() {
//   this.lastPage.on('slideUp', _slideUpCallback.bind(this));
// }

// function _stopListeningToOldLastPageSlideUpEvent() {
//   this.lastPage.unbind('slideUp', _slideUpCallback.bind(this));
// }

// function _slideUpCallback() {
//   console.log(this.lastPage.options.title);
//   var title = 'Later';
//   if (/Later/.test(this.lastPage.options.title)) {
//     title = 'Later' + this._numberOfPages;
//   }
//   _addPageView.call(this, title);
// }

module.exports = AppView;
