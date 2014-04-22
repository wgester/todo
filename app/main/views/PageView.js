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
  this.touchCount = 0;
  _createLayout.call(this);
  _eventPiping.call(this);
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
  regSmallHeader: 90,
  regBigHeader: 160,
  focusHeader: window.innerHeight / 2,
  editInputAnimation: {
    method: 'spring',
    period: 500,
    dampingRatio: 0.6
  },
  shadowFadeDuration: 300
};

function _createEditLightbox() {
  //// Maybe subview this?
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

  //// On enter/return keystroke, collapse the keyboard
  this.editSurface.on('keyup', function(evt) {
    if (evt.keyIdentifier === "Enter") _removeInput.call(this);
  }.bind(this));

  this.editMod = new Modifier({
    origin: [0,0],
    transform: Transform.translate(0, 600, 0)
  });

  this.shadow.on('touchstart', _removeInput.bind(this));

  this.editLightBox._add(this.editMod).add(this.editSurface);
  this.editLightBox._add(this.shadowMod).add(this.shadow);
  this._add(this.editLBMod).add(this.editLightBox);
};

function _removeInput() {
    if(this.newTaskOpened) {
      this.taskIndex = this.contents.customdragsort.array.length;
      this.editTaskOffset = this.options.title === 'FOCUS' ?  window.innerHeight / 2 + this.taskIndex * 60 - 10: (this.taskIndex + 1) * 60 + 90;
    } 
    _editInputFlyOut.call(this);
    Timer.after(_lightboxFadeOut.bind(this), this.taskIndex);
}

function _createLayout() {

  this.layout = new HeaderFooter({
    headerSize: 70,
    footerSize: 60
  });


  this.footer = new FooterView({title: this.options.title});
  this.header = new HeaderView({title: this.options.title});
  this.contents = new ContentView({title: this.options.title})

  this.contents._eventOutput.pipe(this.contents._eventInput);
  this.layout.id["header"].add(this.header);
  this.layout.id["content"].add(this.contents).add(this.surf);
  this.layout.id["footer"] .add(Utility.transformInFront).add(this.footer);
  this._add(this.layout);
};

function _setHeaderSize() {
  this.layout.setOptions({headerSize: this.headerSizeTransitionable.get()[0]});
};

function _eventPiping() {
  this.footer.pipe(this._eventOutput);
  this.header.pipe(this._eventOutput);
  this.contents._eventOutput.pipe(this.contents._eventInput);
  this.contents._eventInput.pipe(this._eventOutput);
  this._eventInput.pipe(this.contents._eventInput);
};

function _headerEvents() {
  this.header.on('focusHideInput', function() {
    this.header._eventOutput.emit('hideInput');
    this.header.value.length && this.contents._eventOutput.emit('saveNewTask', this.header.value);
  }.bind(this));
  
  this.header.on('inputRotated', function() {
    this.newTaskOpened = true;
    _lightboxFadeIn.call(this);
    this.editTaskOffset = 90;
    _editInputFlyIn.call(this);
  }.bind(this));
  
  this.header.on('refreshAsana', function() {
    this.contents._eventOutput.emit('refreshAsanaTasks');
  }.bind(this));
};

function _contentEvents() {
/*============ listen to task count ============= */
  this.contents._eventInput.on('inputClosed', function(){
    this.header.focusInputClosed = true;
  }.bind(this));

  this.contents._eventInput.on('inputOpen', function(){
    this.header.focusInputClosed = false;
  }.bind(this));
/*============ listen to task count ============= */

  this.contents.on('showInput', function() {
    if(this.options.title === 'FOCUS' && this.contents.taskCount <3) {
      console.log(this.contents.taskCount, this.options.title)
      this.header._eventOutput.emit('showInput')
    }
    if (this.options.title !== 'FOCUS') {
      this.headerSizeTransitionable.set([this.options.regBigHeader], {duration: this.options.headerSizeDuration}, function() {});
      this.header._eventOutput.emit('showInput')
    }
  }.bind(this));

  this.contents.on('hideInput', _rotateInputBack.bind(this));
  
  this.contents.on('openEdit', function(options) {
    this.taskIndex = options.index;
    this.editSurface.setValue(options.text);
    _lightboxFadeIn.call(this);
    this.editTaskOffset = this.options.title === 'FOCUS' ?  window.innerHeight / 2 + this.taskIndex * 60 - 10: (this.taskIndex + 1) * 60 +20;
    _editInputFlyIn.call(this);
  }.bind(this));
  

  //// Use famous/events?/EventArbiter for multi-touch support 
  this.contents._eventInput.on('newTouch', function() {
    this.touchCount += 1;
    if (this.touchCount >= 2) {
      this.contents._eventOutput.emit('twoFingerMode');
      this.contents.twoFingerMode = true;
      console.log('twofingers!')
      this.twoFingerMode = true;
    }

  }.bind(this));

  this.contents._eventInput.on('endTouch', function() {
    this.touchCount = 0;
    if (this.touchCount < 2) {
      this.contents.twoFingerMode = false;
      console.log('disablingTwoTOuch')
      this.contents._eventOutput.emit('twoFingerModeDisabled');
      this.twoFingerMode = false;
    }
  }.bind(this));

  this.contents._eventInput.on('swiping', function(data) {
    if (this.twoFingerMode) {
      if (data === 'up') {
        this._eventOutput.emit('togglePageViewUp');
      } else {
        this._eventOutput.emit('togglePageViewDown');
      }
      this.touchCount = 0;
      this.twoFingerMode = false;
      this.contents.twoFingerMode = false;
      this.contents._eventOutput.emit('twoFingerModeDisabled');
      this.contents._eventOutput.emit('hideInput');
      this.inputToggled = false;
    }
  }.bind(this));
};

function _setListeners() {
  this.contents._eventInput.pipe(this._eventOutput);
  this._eventInput.pipe(this.contents._eventInput);

  //// Careful with too many callbacks to the prerender event
  window.Engine.on('prerender', _setHeaderSize.bind(this));
  
  _headerEvents.call(this);
  _contentEvents.call(this);
};

function _rotateInputBack() {
  this.header._eventOutput.emit('hideInput');
  if (this.options.title !== 'FOCUS') {
    this.headerSizeTransitionable.set([this.options.regSmallHeader], {duration: this.options.headerSizeDuration}, function() {
    }.bind(this));
  }
};

function _lightboxFadeOut() {
  this.editLBMod.setOpacity(0.01, {duration: 500}, function() {
    this.editLBMod.setTransform(Transform.translate(0, 0, -10));
  }.bind(this));
};

function _lightboxFadeIn() {
  this.editLBMod.setTransform(Transform.translate(0,0,2),  {duration: 0}, function() {
    this.editLBMod.setOpacity(1, {duration: this.shadowFadeDuration}, function() {});
  }.bind(this));
};

function _editInputFlyIn() {
  this.editSurface.setProperties({'visibility': 'visible'});
  this.editMod.setTransform(Transform.translate(0, this.editTaskOffset, 0));
  this.editMod.setTransform(Transform.translate(0, 20, 2), this.options.editInputAnimation, function() {
    this.editSurface.focus();
    window.AndroidKeyboard.show();
  }.bind(this));  
};

function _editInputFlyOut() {
  window.AndroidKeyboard.hide();
  this.editSurface.blur();
  this.contents.editTask = this.newTaskOpened ? false : true;
  this.contents._eventOutput.emit('unhideEditedTask');
  if (this.newTaskOpened) {
    this.editMod.setTransform(Transform.translate(0, this.editTaskOffset, 0), {duration: 300}, function() {
      var newText = this.editSurface.getValue();
      this.editSurface.setValue('');
      newText.length && this.contents._eventOutput.emit('saveNewTask', newText);
      Timer.after(_rotateInputBack.bind(this), 8);
      this.newTaskOpened = false;              
    }.bind(this));
  } else {
    this.editSurface.setProperties({'visibility': 'hidden'});
    this.editMod.setTransform(Transform.translate(0, 600, 0));
    var editedText = this.editSurface.getValue();
    var editedTask = this.contents.customdragsort.array[this.taskIndex].taskItem;
    this.editSurface.setValue('');
    editedTask._eventOutput.emit('saveTask', editedText);    
  }
    
};

module.exports = PageView;
