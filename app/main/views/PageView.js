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
var Box = require('./BoxView');
var BoxContainer = require('./BoxContainer');

function PageView() {
  View.apply(this, arguments);
  
  this.toggleUpOrDown = 'down';
  this.offPage = false;
  _createLayout.call(this);
  _createInput.call(this);
  _createButton.call(this);
  _setListeners.call(this);
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
  this._eventOutput.emit('slideUp');
  this.yPosition.set(-1 * (window.innerHeight - 30), this.options.transition, function() {
    this.toggleUpOrDown = 'up';
  }.bind(this));
  this.options.aboveView && this.options.aboveView.slideUpOffPage();
};

PageView.prototype.slideDown = function() {
  this._eventOutput.emit('slideDown');
  this.yPosition.set(0, this.options.transition, function() {
                  this.toggleUpOrDown = 'down';
                }.bind(this));
  this.options.aboveView && this.options.aboveView.slideUp();
};

PageView.prototype.slideUpOffPage = function() {
  this._eventOutput.emit('slideUpOffPage');
  this.yPosition.set(-1 * window.innerHeight, this.options.transition, function() {
    this.offPage = !this.offPage;
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
  aboveView: null,
  yPositionToggleThreshold: 250,
  velocityToggleThreshold: 0.75
};


function _createLayout() {
  this.layout = new HeaderFooter({
    headerSize: 200,
    footerSize: 50
  });

  this.footer = new FooterView();
  
  this.header = new HeaderView({title: this.options.title});

  this.contents = new ContentView({title: this.options.title})

  this.layout.id["header"].add(Utility.transformInFront).add(this.header);

  this.layout.id["content"].add(this.contents);

  this.layout.id["footer"].add(Utility.transformInFront).add(this.footer);

  this._add(this.layout);
}

function _setListeners() {  
  window.Engine.on("prerender", _completeColorMod.bind(this));

  _setInputListener.call(this);
  
  for(var i = 0; i < this.taskViews.length; i++) {
    _setOneCompleteListener.call(this, this.taskViews[i]);     
  }  
};
/* ------------------------------------BUTTON LISTENER--------------------------------------------*/
  
  this.footer.on('hamburger', function(){
    this.togglePosition();
  }.bind(this));

};

function _createInput() {
  this.boxContainer = new BoxContainer();
  this._add(this.boxContainer);
  // this.box = new Box();
  // this.boxMod = new Modifier();
  // this.boxMod.setTransform(Transform.move(Transform.rotate(0,0,0), [10, 250, 150]));
  // this.inputSurf = this.box.topSurf;
  // this.frontSurf = this.box.frontSurf;
  // this._add(this.boxMod).add(this.box);            
};


function _setInputListener() {
  this.backgroundSurf.on('touchstart', function(e) {
    this.inputToggled = !this.inputToggled;
    var value = this.boxContainer.inputSurf.getValue();
    this.boxContainer.inputSurf.setValue('');
    
    if (this.inputToggled) {
      this.boxContainer.frontSurf.setProperties({'visibility': 'visible'})
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [10, 300, 150]), {duration: 300});      

      // this.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [10, 300, 150]), {duration: 300});      
    } else if (!this.inputToggled && value.length) {
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [10, 250, 150]), {duration: 300}, function() {
        var newTask = new TaskView({text: value});
        newTask.pipe(this.scrollview);    
        this.taskViews.push(newTask);        
        this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
      }.bind(this));
    } else {
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [10, 250, 150]), {duration: 300}, function() {
        this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
      }.bind(this));
    }
  }.bind(this));  
  
};


module.exports = PageView;
