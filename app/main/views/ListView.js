var Surface       = require('famous/surface');
var Modifier      = require('famous/modifier');
var View          = require('famous/view');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var TaskView      = require('./TaskView');
var Tasks         = require('./data');
var InputSurface = require('famous/surfaces/input-surface');
var Timer = require('famous/utilities/timer');


function ListView() {
  View.apply(this, arguments);
  this.color = new Transitionable([360, 100, 100]);
  this.lightness = 75;
    
  _createBackground.call(this);
  _createHeader.call(this);
  _populateTasks.call(this);
  _createInput.call(this);
  _createManyTasks.call(this);
  _setListeners.call(this);
}

ListView.prototype = Object.create(View.prototype);
ListView.prototype.constructor = ListView;

ListView.DEFAULT_OPTIONS = {};

function _completeColorMod() {
  this.backgroundSurf.setProperties({
    backgroundColor: "hsl(145, 63%," + this.color.get()[2] + "%)"
  });
};

function _populateTasks() {
  this.tasks = Tasks;
};

function _createBackground() {
  this.backgroundSurf = new Surface({
    size: [undefined, undefined]
  });
  this.backgroundMod = new Modifier();
  this._add(this.backgroundMod).add(this.backgroundSurf);
};

function _createHeader() {
  this.header = new Surface({
    size: [undefined, true],
    content: '<h1>TODAY</h1>',
    properties: {
      color: 'black',
      fontSize: '2.5em'
    }
  });
  
  this.headerMod = new Modifier();
  
  this._add(this.headerMod).add(this.header);
};

function _createManyTasks() {
  this.taskMods = [];
  this.taskViews = [];
  
  for(var i = 0; i < this.tasks.length; i++){
    var taskView = new TaskView({
      text: this.tasks[i].text
    });

    var offset = taskView.options.taskOffset * (i+2);

    var taskMod = new Modifier({
      origin: [0.2, 0.2],
      transform: Transform.translate(0, offset, 0)
    });
    
    this._add(taskMod).add(taskView);
    this.taskMods.push(taskMod);
    this.taskViews.push(taskView);
  }
};

function _createInput() {
  this.inputSurf = new InputSurface({
    placeholder: 'Enter task here...',

    properties: {
      visibility: 'hidden',
      height: '60px',
    }
  });
  this.inputMod = new Modifier({
    transform: Transform.translate(0, 1000, 0)
  });

  this._add(this.inputMod).add(this.inputSurf);
};


var clicked = false; 

function _setListeners() {
  window.Engine.on("prerender", _completeColorMod.bind(this));

  this.backgroundSurf.on('touchstart', function(){
    
    if(clicked && this.inputSurf.getValue()===''){
      clicked = false;
      this.inputSurf.setProperties({visibility:'hidden'});
    
    } else if (clicked && this.inputSurf.getValue().length){
      called = true;
      var newTask = {text: this.inputSurf.getValue(), focus: true};
      this.tasks.push(newTask);
            
      var taskView = new TaskView(newTask);
      var offset = taskView.options.taskOffset * (this.tasks.length+1);
      
      var taskMod = new Modifier({
        origin: [0, 0.425],
        transform: Transform.translate(0, offset, 0)
      });

      _setOneCompleteListener.call(this, taskView);

      this._add(taskMod).add(taskView);
      this.inputSurf.setValue('');
      this.inputSurf.setProperties({visibility: 'hidden'});
    
    } else {

      clicked = true;
      this.inputSurf.setProperties({visibility:'visible'});
      
      var offset = 39 * this.tasks.length+303;
      this.inputMod.setTransform(Transform.translate(0, offset, 0));
    }
  
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

module.exports = ListView;
