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
var Color             = require('./Color');

var Tasks             = require('./data');
var TaskView          = require('./TaskView');
var HeaderView        = require('./HeaderView');
var FooterView        = require('./FooterView');
var ContentView       = require('./ContentView');

function PageView() {
  View.apply(this, arguments);

  this.toggleUpOrDown = 'down';
  
  if (this.options.title === 'FOCUS') {
    this.headerSizeTransitionable = new Transitionable([this.options.focusHeader]);
  } else {
    this.headerSizeTransitionable = new Transitionable([this.options.regSmallHeader]);
  }

  this.offPage = false;
  _createLayout.call(this);
  _pipeSubviewEventsToAppView.call(this);
  _createEditLightbox.call(this);
  _setListeners.call(this);
}

PageView.prototype = Object.create(View.prototype);
PageView.prototype.constructor = PageView;

PageView.DEFAULT_OPTIONS = {
  title: 'LATER',
  yPositionToggleThreshold: 250,
  velocityToggleThreshold: 0.75,
  headerSizeDuration: 300,
  regSmallHeader: 70,
  regBigHeader: 140,
  focusHeader: window.innerHeight / 2,
  editInputAnimation: {
    method: 'spring',
    period: 500,
    dampingRatio: 0.6
  },
  shadowFadeDuration: 300
};

function _createEditLightbox() {
  this.editLightBox = new View();
  this.editLBMod = new Modifier({
    transform: Transform.translate(0, 0, -10),
    opacity: 0.01
  });

  this.shadow = new Surface({
    size: [undefined, 650],
    classes: ['shadowed']
  });
  
  this.shadowMod = new Modifier();
      
  this.editSurface = new InputSurface({
    size: [undefined, 60],
    classes: ['edit'],
    properties: {
      backgroundColor: 'white'
    }
  });

  this.editMod = new Modifier({
    origin: [0,0],
    transform: Transform.translate(0, 600, 0)
  });

  this.shadow.on('touchstart', function() {
    var editedText = this.editSurface.getValue();
    var editedTask = this.contents.customdragsort.array[this.taskIndex].taskItem;
    editedTask._eventOutput.emit('saveTask', editedText);
    _editInputFlyOut.call(this);
    Timer.after(_lightboxFadeOut.bind(this), 10);
  }.bind(this));

  this.editLightBox._add(this.editMod).add(this.editSurface);
  this.editLightBox._add(this.shadowMod).add(this.shadow);
  this._add(this.editLBMod).add(this.editLightBox);
};

function _createLayout() {

  this.layout = new HeaderFooter({
    headerSize: 70,
    footerSize: 40
  });
  this.footer = new FooterView({title: this.options.title});
  this.header = new HeaderView({title: this.options.title});
  this.contents = new ContentView({title: this.options.title})
  this.layout.id["header"].add(this.header);
  this.layout.id["content"].add(this.contents);
  this.layout.id["footer"] .add(Utility.transformInFront).add(this.footer);
  this._add(this.layout);
};

function _setHeaderSize() {
  this.layout.setOptions({headerSize: this.headerSizeTransitionable.get()[0]});
};

function _pipeSubviewEventsToAppView() {
  this.footer.pipe(this._eventOutput);
  this.header.pipe(this._eventOutput);
};

function _setListeners() {
  this.contents._eventInput.pipe(this._eventOutput);
  this._eventInput.pipe(this.contents._eventInput);


  window.Engine.on('prerender', _setHeaderSize.bind(this));

  this.contents.on('showInput', function() {
    this.header._eventOutput.emit('showInput');
    if (this.options.title !== 'FOCUS') {
      this.headerSizeTransitionable.set([this.options.regBigHeader], {duration: this.options.headerSizeDuration}, function() {});
    }
  }.bind(this));

  this.contents.on('hideInput', function() {
    this.header._eventOutput.emit('hideInput');
    if (this.options.title !== 'FOCUS') {
      this.headerSizeTransitionable.set([this.options.regSmallHeader], {duration: this.options.headerSizeDuration}, function() {
        this.header.value.length && this.contents._eventOutput.emit('saveNewTask', this.header.value);
      }.bind(this));
    } else if (this.header.value.length) {
      this.contents._eventOutput.emit('saveNewTask', this.header.value);
    }
  }.bind(this));

  this.header.on('focusHideInput', function() {
    this.header._eventOutput.emit('hideInput');
    this.header.value.length && this.contents._eventOutput.emit('saveNewTask', this.header.value);
  }.bind(this));

  this.contents.on('openEdit', function(options) {
    this.taskIndex = options.index;
    this.editSurface.setValue(options.text);
    _lightboxFadeIn.call(this);
    _editInputFlyIn.call(this);
  }.bind(this));
};

function _lightboxFadeOut() {
  this.editLBMod.setOpacity(0.01, {duration: 200}, function() {
    this.editLBMod.setTransform(Transform.translate(0, 0, -10));
  }.bind(this));
};

function _lightboxFadeIn() {
  this.editLBMod.setTransform(Transform.translate(0,0,2),  {duration: 0}, function() {
    this.editLBMod.setOpacity(1, {duration: this.shadowFadeDuration}, function() {});
  }.bind(this));
};

function _editInputFlyIn() {
  this.editTaskOffset = this.options.title === 'FOCUS' ?  window.innerHeight / 2 + this.taskIndex * 60 - 8: (this.taskIndex + 1) * 60 - 8;
  this.editMod.setTransform(Transform.translate(0, this.editTaskOffset, 0));
  this.editMod.setTransform(Transform.translate(0,20,0), this.options.editInputAnimation, function() {});  
};

function _editInputFlyOut() {
  this.editMod.setTransform(Transform.translate(0, this.editTaskOffset, 0), {duration: 300}, function() {
    this.contents._eventOutput.emit('unhideEditedTask');
  }.bind(this));
};

module.exports = PageView;
