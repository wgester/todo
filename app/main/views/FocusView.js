var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var View = require('famous/view');
var TaskView = require('./TaskView')
var Tasks = require('./data');
var Transform = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var InputSurface = require('famous/surfaces/input-surface');
var Timer = require('famous/utilities/timer');
var Scrollview = require('famous/views/scrollview')

function FocusView() {
  View.apply(this, arguments);
  this.color = new Transitionable([360, 100, 100]);
  this.lightness = 75;

  _createBackground.call(this);
  _createHeader.call(this);
  _populateTasks.call(this);
  _createManyTasks.call(this);
  _createButton.call(this);
  _setListeners.call(this);
  _createInput.call(this);
};

FocusView.prototype = Object.create(View.prototype);
FocusView.prototype.constructor = FocusView;

function _completeColorMod() {
  this.backgroundSurf.setProperties({
    backgroundColor: "hsl(145, 63%," + this.color.get()[2] + "%)"
  });
};

function _createBackground() {
 this.backgroundSurf = new Surface({
    size: [undefined, undefined],
    properties: {
      backgroundColor: 'white'
    },
  });
  this.backgroundMod = new Modifier({
  });
  this._add(this.backgroundMod).add(this.backgroundSurf);
};

function _createHeader() {
  this.header = new Surface({
    content: '<h1>FOCUS</h1>',
    size: [undefined, true],
    properties: {
      color: 'black',
      fontStyle: 'light',
      fontSize: '2.5em'
    }

  });
  
  this._add(this.header);
};

function _createButton() {

  this.buttonView = new Surface({
      size: [44, 44],
      content: '<img width="44" src="./img/hamburgerOnClear.png"/>'
  });

  this.buttonModifier = new Modifier({
    origin: [0.5, 1]
  });

  this._add(this.buttonModifier).add(this.buttonView);
};


function _populateTasks() {
  this.tasks = [];
  for (var i = 0; i < Tasks.length; i++) {
    if(Tasks[i].focus) {
      this.tasks.push(Tasks[i]);
    }
  }
};

function _createManyTasks() {
  this.taskMods = [];  
  this.taskViews = [];
 
  this.taskScrollView = new Scrollview();

  for(var i = 0; i < this.tasks.length; i++){
    var taskView = new TaskView({
      text: this.tasks[i].text,
      classes: ['task', 'focus']
    });

    var offset = taskView.options.taskOffset * (i+1);

    var taskMod = new Modifier({
      origin: [0, 0.5],
      transform: Transform.translate(0, offset, 0)
    });
    
    this._add(taskMod).add(taskView);
    this.taskMods.push(taskMod);      
    this.taskViews.push(taskView);      
  }
};
function _createInput() {
  this.inputSurf = new InputSurface({
    size: [undefined,50],
    placeholder: 'Enter task here...'
  });
  
  this.inputMod = new Modifier({
    transform: Transform.translate(0, 300, -1),
    origin: [0, 1]
    // transform: Transform.translate(0, , 0)
  });

  this._add(this.inputMod).add(this.inputSurf);
};

function calculateOffset(tasksLength) {
  var taskViewOffset = new TaskView().options.taskOffset;
  return taskViewOffset * (tasksLength+0.5);
};

var clicked = false; 
function _setListeners() {  
  window.Engine.on("prerender", _completeColorMod.bind(this));

  this.backgroundSurf.on('touchstart', function(){
    
    if(clicked && this.inputSurf.getValue() === ''){
      clicked = false;
      this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});
    } else if (clicked && this.inputSurf.getValue().length){
      var newTask = {text: this.inputSurf.getValue(), focus: true};

      this.tasks.push(newTask);
            
      var taskView = new TaskView(newTask);
      var offset = calculateOffset(this.tasks.length);
      
      var taskMod = new Modifier({  
        origin: [0, 0.425],
        transform: Transform.translate(0, offset, 0)
      });

      _setOneCompleteListener.call(this, taskView);
      this.inputMod.setTransform(Transform.translate(0, 300, -1), {duration: 500});

      this._add(taskMod).add(taskView);
      this.inputSurf.setValue('');
    
    } else {
      clicked = true;
      this.inputMod.setTransform(Transform.translate(0, 400, 1), {duration: 500});
  }
      // this.inputSurf.setProperties({visibility:'visible'});
    //   var offset = calculateOffset(this.tasks.length) + 274;
    //   this.inputMod.setTransform(Transform.translate(0, offset, 0));
    // }  
  }.bind(this));  


  this.buttonView.on('touchstart', function() {
    this._eventOutput.emit('toggleList');
  }.bind(this));
  
  for(var i = 0; i < this.taskViews.length; i++) {
    _setOneCompleteListener.call(this, this.taskViews[i]);     
  }

};
 
function _setOneCompleteListener(view) {
  view.on('completed', function() {
    this.color.set([145, 63, this.lightness], {
      duration: 250
    }, function() {
      Timer.after(function() {
        this.color.set([145, 63, 100], {
          duration: 250
        });      
      }.bind(this), 7);            
    }.bind(this));
  }.bind(this));  
};

module.exports = FocusView;
