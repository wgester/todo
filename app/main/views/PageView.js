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
  focusHeader: window.innerHeight / 2
};

function _createEditLightbox() {
  this.editLightBox = new View();
  this.editLBMod = new Modifier({
    transform: Transform.translate(0, 1800, 2)
  });
  
  var shadow = new Surface({
    size: [undefined, undefined],
    classes: ['shadowed']
  });
  
  this.editSurface = new InputSurface({
    size: [undefined, 60],
    classes: ['edit']
  });
  
  var editMod = new Modifier({
    origin: [0,0],
    transform: Transform.translate(0, 0, 1)
  });
  
  shadow.on('touchend', function() {
    var editedText = this.editSurface.getValue();
    //save value     
    var editedTask = this.contents.customdragsort.array[this.taskIndex].taskItem;
    editedTask._eventOutput.emit('saveTask', editedText);
    //hide lightbox
    this.editLBMod.setTransform(Transform.translate(0, 1800, 2), {duration: 300}, function() {});
  }.bind(this));
  
  this.editLightBox._add(editMod).add(this.editSurface);
  this.editLightBox._add(shadow);
  this._add(this.editLBMod).add(this.editLightBox);
};

function _createLayout() {
  
  this.layout = new HeaderFooter({
    headerSize: 70,
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

function _setHeaderSize() {
  this.layout.setOptions({headerSize: this.headerSizeTransitionable.get()[0]});
};

function _pipeSubviewEventsToAppView() {
  this.footer.pipe(this._eventOutput);
  this.header.pipe(this._eventOutput);
};

function _setListeners() {
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
    this.editLBMod.setTransform(Transform.translate(0, 0, 2), {duration: 300}, function() {});
  }.bind(this));
};


module.exports = PageView;
