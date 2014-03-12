var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var View = require('famous/view');
var PageView = require('./PageView');
var Lightbox = require('famous/views/light-box');

function AppView() {
  View.apply(this, arguments);
  
  _createLightBox.call(this);
  _createAppViews.call(this);
  _renderFocusPage.call(this);
};

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;



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

function _createLightBox() {
  this.lightBox = new Lightbox({
    // inTransform: Transform.translate(0, 0, 0),
    // inTransition: this.options.wall,
    // inOpacity: 1,
    // outTransform: Transform.translate(0, -500, 0),
    // outTransition: true,
    // outOpacity: 1,
    // overlap: true
    inOrigin: [0, 0],
    outOrigin: [0, 0]
  });

  this._add(this.lightBox);
}

function _addPageView(title, previousPage, nextPage) {

  var pageViewOptions = {
    title: title,
    transition: this.options.transition,
    wall: this.options.wall
  };
 
  var newView = this[title + 'View'] = new PageView(pageViewOptions)
  this[title + 'Modifier'] = new Modifier();
}

function _addPageRelations(page, previousPage, nextPage) {
  this[page + 'View'].previousPage = previousPage && this[previousPage + 'View'];
  this[page + 'View'].nextPage =     nextPage     && this[nextPage + 'View'];

  _addEventListeners.call(this, this[page + 'View'], this[page + 'Modifier']);
}

function _addEventListeners(newView, newModifier){
  newView.on('togglePageViewUp', function() {
    console.log('togglePageViewUp');
    if (newView.nextPage) {
      this.lightBox.show(newView.nextPage);
    }
  }.bind(this));

  newView.on('togglePageViewDown', function() {
    console.log('togglePageViewDown');
    if (newView.previousPage) {
      this.lightBox.show(newView.previousPage);
    }
  }.bind(this));
}

function _createAppViews() {
  _addPageView.call(this, 'FOCUS');
  _addPageView.call(this, 'TODAY');
  _addPageView.call(this, 'LATER');
  _addPageView.call(this, 'NEVER');

  _addPageRelations.call(this, 'FOCUS',    null, 'TODAY');
  _addPageRelations.call(this, 'TODAY', 'FOCUS', 'LATER');
  _addPageRelations.call(this, 'LATER', 'TODAY', 'NEVER');
  _addPageRelations.call(this, 'NEVER', 'LATER',    null);
}

function _renderFocusPage() {
  this.lightBox.show(this.FOCUSView);
}

module.exports = AppView;
