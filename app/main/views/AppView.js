var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var View = require('famous/view');
var PageView = require('./PageView');

function AppView() {
  View.apply(this, arguments);
  
  this.pages = [];
  this.pageViewsToRender = [];
  this._numberOfPages = 0;
  this.lastPage = null;
  _createAppViews.call(this);
  _renderFocusPage.call(this);
};

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.prototype.render = function() {
  this.spec = [];
  this.spec = this.spec.concat(this.pageViewsToRender);
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

function _addPageView(title, previousPage, nextPage) {

  var pageViewOptions = {
    title: title,
    transition: this.options.transition,
    wall: this.options.wall
  };
 
  var newView = this[title + 'View'] = new PageView(pageViewOptions)
  this[title + 'Modifier'] = new Modifier();

  newView.spec = {
    transform: Transform.translate(0, newView.yPosition.get(), 0),
    target: newView.render()
  };

}

function _addPageRelations(page, previousPage, nextPage) {
  if (previousPage) {
    this[page + 'View'].previousPage = this[previousPage + 'View'];
  }
  if (nextPage) {
    this[page + 'View'].nextPage = this[nextPage + 'View'];
  }

  _addEventListeners.call(this, this[page + 'View']);
}

function _addEventListeners(newView){
  newView.on('togglePageViewUp', function() {
    //push on the next page
    if (newView.nextPage) {
      this.pageViewsToRender.push(newView.nextPage.spec);
      newView.slideUp();
    }
  }.bind(this));

  newView.on('togglePageViewDown', function() {
    console.log('togglePageViewDown');
    if (newView.previousPage) {
      //the .slideDown() method call triggers the reattach method to reattach the pageView to the render tree
      newView.previousPage.slideDown();
      this.pageViewsToRender.pop();
    }
  }.bind(this));

  newView.on('detach', function() {
    this.pageViewsToRender.shift();
  }.bind(this));

  newView.on('reattach', function() {
    this.pageViewsToRender.unshift(newView.spec);
  }.bind(this));
}

function _createAppViews() {
  _addPageView.call(this, 'FOCUS',    null, 'TODAY');
  _addPageView.call(this, 'TODAY', 'FOCUS', 'LATER');
  _addPageView.call(this, 'LATER', 'TODAY', 'NEVER');
  _addPageView.call(this, 'NEVER', 'LATER',    null);

  _addPageRelations .call(this, 'FOCUS',    null, 'TODAY');
  _addPageRelations .call(this, 'TODAY', 'FOCUS', 'LATER');
  _addPageRelations .call(this, 'LATER', 'TODAY', 'NEVER');
  _addPageRelations .call(this, 'NEVER', 'LATER',    null);
}

function _renderFocusPage() {
  this.pageViewsToRender.push(this.FOCUSView.spec);
}

module.exports = AppView;
