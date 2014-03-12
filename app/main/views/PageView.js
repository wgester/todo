var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var View              = require('famous/view');
var Transform         = require('famous/transform');
var Transitionable    = require('famous/transitions/transitionable');
var GenericSync       = require('famous/input/generic-sync');
var InputSurface      = require('famous/surfaces/input-surface');
var Timer             = require('famous/utilities/timer');
var Draggable         = require('famous/modifiers/draggable');
var HeaderFooter      = require('famous/views/header-footer-layout');
var Utility           = require('famous/utilities/utility');

var Tasks             = require('./data');
var TaskView          = require('./TaskView');
var HeaderView        = require('./HeaderView');
var FooterView        = require('./FooterView');
var ContentView       = require('./ContentView');

function PageView() {
  View.apply(this, arguments);
  
  this.toggleUpOrDown = 'down';
  this.offPage = false;
  _createLayout.call(this);
  _pipeSubviewEventsToAppView.call(this);
  _handlePageToggleTouches.call(this);
}

PageView.prototype = Object.create(View.prototype);
PageView.prototype.constructor = PageView;

PageView.prototype.togglePosition = function() {
  if (this.toggleUpOrDown === 'down') {
    this.slideUp();
  } else if (this.toggleUpOrDown === 'up') {
    this.slideDown();
  } else {
    throw new Error('toggleUpOrDown is illegally defined');
  }
};

PageView.prototype.slideUp = function() {
  this.yPosition.set(-1 * (window.innerHeight - 40), this.options.transition, function() {
    this._eventOutput.emit('detach');
    this.toggleUpOrDown = 'up';
  }.bind(this));
};

PageView.prototype.slideDown = function() {
  this._eventOutput.emit('reattach');
  this.yPosition.set(0, this.options.wall, function() {
                  this.toggleUpOrDown = 'down';
                }.bind(this));
};

function _handlePageToggleTouches() {
  this.yPosition = new Transitionable(0);
  this.sync = new GenericSync(function() {
    return this.yPosition.get(0);
  }.bind(this), {direction: GenericSync.DIRECTION_Y});

  this.pipe(this.sync);

  this.sync.on('update', _viewSyncUpdate.bind(this));
  this.sync.on('end',       _viewSyncEnd.bind(this));

  function _viewSyncUpdate(data) {
    this.yPosition.set(Math.min(0, data.p));
  }

  function _viewSyncEnd(data) {
    var velocity = data.v;
    var position = this.yPosition.get();

    if (this.yPosition.get() > this.options.yPositionToggleThreshold) {
      if (velocity < -1 * this.options.velocityToggleThreshold) {
        this.slideUp();
      } else {
        this.slideDown();
      }
    } else {
      if (velocity > this.options.velocityToggleThreshold) {
        this.slideDown();
      } else {
        this.slideUp();
      }
    }
  };
};

PageView.DEFAULT_OPTIONS = {
  title: 'LATER',
  yPositionToggleThreshold: 250,
  velocityToggleThreshold: 0.75
};

function _createLayout() {
  this.layout = new HeaderFooter({
    headerSize: 200,
    footerSize: 40
  });
  this.footer = new FooterView();
  this.header = new HeaderView({title: this.options.title});
  this.contents = new ContentView({title: this.options.title})
  this.layout.id["header"] .add(Utility.transformInFront).add(this.header);
  this.layout.id["content"].add(this.contents);
  this.layout.id["footer"] .add(Utility.transformInFront).add(this.footer);
  this._add(this.layout);
};

function _pipeSubviewEventsToAppView() {
  this.footer.pipe(this._eventOutput);
  this.header.pipe(this._eventOutput);
};

module.exports = PageView;
