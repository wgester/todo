var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var View              = require('famous/view');
var Transform         = require('famous/transform');
var Transitionable    = require('famous/transitions/transitionable');
var GenericSync       = require('famous/input/generic-sync');
var InputSurface      = require('famous/surfaces/input-surface');
var Timer             = require('famous/utilities/timer');
var Scrollview        = require('famous/views/scrollview');
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
  this.lightness = 75;
  
  
  this.toggleUpOrDown = 'down';
  this.offPage = false;
  _createLayout.call(this);
  // _populateTasks.call(this);
  _createInput.call(this);
  // _createManyTasks.call(this);
  _setListeners.call(this);
  _handlePageToggleTouches.call(this);

}
// PAGE VIEW TO HAVE HEADER, FOOTER, CONTENT VIEW
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
  this.yPosition.set(-1 * (window.innerHeight - 30), this.options.transition, function() {
    this.toggleUpOrDown = 'up';
  }.bind(this));
  this.options.aboveView && this.options.aboveView.slideUpOffPage();
};

PageView.prototype.slideDown = function() {
  this.yPosition.set(0, this.options.transition, function() {
    this.toggleUpOrDown = 'down';
  }.bind(this));
  this.options.aboveView && this.options.aboveView.slideUp();
};

PageView.prototype.slideUpOffPage = function() {
  this.yPosition.set(-1 * window.innerHeight, this.options.transition, function() {
    this.offPage = !this.offPage;
  }.bind(this));
};

function _populateTasks(){
  this.tasks = Tasks;
}

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

  this.contents = new ContentView()

  this.layout.id["header"].add(Utility.transformInFront).add(this.header);

  this.layout.id["content"].add(this.contents);

  this.layout.id["footer"].add(Utility.transformInFront).add(this.footer);

  this._add(this.layout);
}

function _createInput() {
  this.inputSurf = new InputSurface({
    size: [undefined,50],
    placeholder: 'Enter task here...'
  });
  
  this.inputMod = new Modifier({
    transform: Transform.translate(0, 300, -1)
  });

  this._add(this.inputMod).add(this.inputSurf);
};

var tapped = false; 
function _setListeners() {  


/* ------------------------------------BUTTON LISTENER--------------------------------------------*/
  
  this.footer.on('hamburger', function(){
    this.togglePosition();
  }.bind(this));

/* ------------------------------------NEW TASK LISTENER--------------------------------------------*/

  // this.backgroundSurf.on('touchstart', function(){
    
  //   if(tapped && this.inputSurf.getValue() === ''){
  //     tapped = false;
  //     this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});
  //   } else if (tapped && this.inputSurf.getValue().length){
  //     var newTask = {text: this.inputSurf.getValue(), page: this.options.title};
  //     this.tasks.push(newTask);
      
  //     var taskSurf = new TaskView(newTask).createTask(newTask.text, newTask.page);

  //     this.taskSurfaces.add(taskSurf)

  //     _setOneCompleteListener.call(this, taskSurf);
  //     this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});

  //     this.inputSurf.setValue('');
    
  //   } else {
  //     tapped = true;
  //     this.inputMod.setTransform(Transform.translate(0, 400, 1), {duration: 500});
  //   }
  // }.bind(this));  


 
    
};





module.exports = PageView;
