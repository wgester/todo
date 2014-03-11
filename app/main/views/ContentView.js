var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var View              = require('famous/view');
var Scrollview        = require('famous/views/scrollview');
var Transitionable    = require('famous/transitions/transitionable');
var TaskView          = require('./TaskView');
var Tasks             = require('./data');
var Box               = require('./BoxView');
var BoxContainer      = require('./BoxContainer');
var Timer             = require('famous/utilities/timer');

//Drag Sort Testing
var CustomDragSort    = require('./customDragSort');
var CustomScrollView  = require('./customScrollView');
var SampleItem        = require('./sampleItem');


function ContentView() {
  View.apply(this, arguments);
  this.lightness = 75;

  this.color = new Transitionable([360, 100, 100]);
  _createBackground.call(this);
  _createTasks.call(this);
  // _createInput.call(this);
  // _taskListeners.call(this);
};

ContentView.prototype = Object.create(View.prototype);
ContentView.prototype.constructor = ContentView;

ContentView.DEFAULT_OPTIONS = {
  title: 'later',
  classes: ['contents']
};

function _createBackground() {
  this.backgroundSurf = new Surface({
    size: [undefined, undefined]
  });

  this.backgroundModifier = new Modifier();
  this._add(this.backgroundModifier).add(this.backgroundSurf);
};


function _completeColorMod() {
  this.backgroundSurf.setProperties({
    backgroundColor: 'hsl(145, 63%,' + this.color.get()[2] + '%)'
  });
};

function _createInput() {
  this.boxContainer = new BoxContainer();
  // this.taskViews.push(this.boxContainer);
};

function _createTasks() {
  this.tasks = Tasks;

  // this.taskViews = [];

  // this.scrollview = new Scrollview();
  // this.scrollview.sequenceFrom(this.taskViews);

  // for(var i = 0; i < this.tasks.length; i++) {
  //   if(this.options.title === this.tasks[i].page){
  //     var newTask = new TaskView({text: this.tasks[i].text});
  //     newTask.pipe(this.scrollview);    
  //     this.taskViews.push(newTask);
  //   }
  // }

  // this._add(this.scrollview);

  var customscrollview = new CustomScrollView();
  var customdragsort = new CustomDragSort();

  for (var i = 0; i < this.tasks.length; i++) {
    console.log(this.tasks[i])

    if(this.options.title === this.tasks[i].page){
      var sampleItem = new SampleItem({
        index: i,
        text: this.tasks[i].text
      });
      customdragsort.push(sampleItem);

      var associatedDragSort = customdragsort.find(i);

      sampleItem.pipe(customscrollview);

      sampleItem.pipe(associatedDragSort);

      associatedDragSort.pipe(customscrollview);

      customscrollview.pipe(associatedDragSort);
      
    }
    

  }
   for (var i = 0; i < this.tasks.length; i++) {
    console.log(this.tasks[i])

    if(this.options.title === this.tasks[i].page){
      var sampleItem = new SampleItem({
        index: i,
        text: this.tasks[i].text
      });
      customdragsort.push(sampleItem);

      var associatedDragSort = customdragsort.find(i);

      sampleItem.pipe(customscrollview);

      sampleItem.pipe(associatedDragSort);

      associatedDragSort.pipe(customscrollview);

      customscrollview.pipe(associatedDragSort);
      
    }
    

  }

  customscrollview.sequenceFrom(customdragsort);

  this._add(customscrollview);


};

function _taskListeners() {
  window.Engine.on('prerender', _completeColorMod.bind(this));
  _setInputListener.call(this);

  for(var i = 0; i < this.taskViews.length; i++) {
    _setOneCompleteListener.call(this, this.taskViews[i]);     
  }
};

function _setInputListener() {
  this.backgroundSurf.on('touchstart', function(e) {
    this.inputToggled = !this.inputToggled;
    var value = this.boxContainer.inputSurf.getValue();
    this.boxContainer.inputSurf.setValue('');
    
    if (this.inputToggled) {
      this.boxContainer.frontSurf.setProperties({'visibility': 'visible'})
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [0, 200, 150]), {duration: 300});      
    } else if (!this.inputToggled && value.length) {
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [0, 150, 150]), {duration: 300}, function() {
        var newTask = new TaskView({text: value});
        newTask.pipe(this.scrollview);    
        this.taskViews.push(newTask);        
        this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
      }.bind(this));
    } else {
      this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [0, 150, 150]), {duration: 300}, function() {
        this.boxContainer.frontSurf.setProperties({'visibility': 'hidden'});
      }.bind(this));
    }
  }.bind(this));  
  
};

function _setOneCompleteListener(surface) {
  surface.on('completed', function() {
    this.color.set([145, 63, this.lightness], {
      duration: 250
    }, function() {
      Timer.after(function() {
        this.color.set([145, 63, 100], {
          duration: 250
        }, function() {});      
      }.bind(this), 7);            
    }.bind(this));
  }.bind(this));  
};


module.exports = ContentView;