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
  menuDropTransition: {
    duration: 200,
    curve: 'easeIn'
  },
  wall: {
    method: 'wall',
    period: 300,
    dampingRatio: 0.3
  },
  noTransition: {
    duration: 0
  }
};

function _createLightBox() {
  this.lightBox = new Lightbox({
    inTransition: this.options.noTransition,
    inTransform: Transform.translate(0, 0, 0),
    inOpacity: 1,
    outOpacity: 1,
    overlap: true
  });

  this.lightBox.optionsForSwipeUp = false;

  this._add(this.lightBox);
}

function _addPageView(title, previousPage, nextPage) {

  var pageViewOptions = {
    title: title,
    transition: this.options.transition,
    wall: this.options.wall
  };
 
  var newView = this[title + 'View'] = new PageView(pageViewOptions);
}

function _addPageRelations(page, previousPage, nextPage) {
  this[page + 'View'].previousPage = previousPage && this[previousPage + 'View'];
  this[page + 'View'].nextPage =     nextPage     && this[nextPage + 'View'];

  _addEventListeners.call(this, this[page + 'View'], this[page + 'Modifier']);
}

//toggle up
//outTransition: easeOut
//outTransform:  Transform.translate(0, -600, 1)
//inTransition: false
//inTransform: Transform.translate(0, 0, -1)

//toggle down
//outTransition: false
//outTransform:  Transform.translate(0, 0, -1)
//inTransition: wall
//inTransform: Transform.translate(0, -600, 1)

function _addEventListeners(newView, newModifier){
  newView.on('togglePageViewUp', function() {
    if (newView.nextPage) {
      if (!this.lightBox.optionsForSwipeUp){
        this.lightBox.setOptions({
          outTransition: this.options.transition,
          outTransform: Transform.translate(0, -1200, 10),
          inTransition: this.options.noTransition,
          inTransform: Transform.translate(0, 0, -5)
        });
        this.lightBox.optionsForSwipeUp = true;
      }
      this.lightBox.show(newView.nextPage);
    }
  }.bind(this));

  newView.on('togglePageViewDown', function() {
    if (newView.previousPage) {
      if (this.lightBox.optionsForSwipeUp)  {
        this.lightBox.setOptions({
          outTransition: this.options.noTransition,
          outTransform: Transform.translate(0, 0, -5),
          inTransition: this.options.wall,
          inTransform: Transform.translate(0, -1200, 1)
        });
        this.lightBox.optionsForSwipeUp = false;
      }
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
