var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var View = require('famous/view');
var TaskView = require('./TaskView')
var Tasks = require('./data');
var Transform = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");

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

  // _createNewTaskSurface.call(this)
};

FocusView.prototype = Object.create(View.prototype);
FocusView.prototype.constructor = FocusView;

function _colorMod() {
  this.backgroundSurf.setProperties({
    backgroundColor: "hsl(145, 63%," + this.color.get()[2] + "%)"
  });
};


function _createBackground() {
 this.backgroundSurf = new Surface({
    size: [undefined, undefined],
    properties: {
      backgroundColor: 'white',
      border: '1px solid black'
    },
    clicked: false
  });
  this.backgroundMod = new Modifier({
  });
  this._add(this.backgroundMod).add(this.backgroundSurf);
};

function _createHeader() {
  this.header = new Surface({
    content: '<h1>FOCUS</h1>',
    size: [60, 100],
    properties: {
      color: 'black',
      fontStyle: 'regular',
      fontSize: '2.5em'
    }

  });
  
  this.headerMod = new Modifier({
  });
  
  this._add(this.headerMod).add(this.header);
};

function _createButton() {
  this.buttonView = new Surface({
    size: [30, 30],
    properties: {
      backgroundColor: 'white',
      border: '1px black solid',
      borderRadius: '20px'
    }
  });
  
  this.buttonMod = new Modifier({
    origin: [0.5, 1]
  });
  
  this._add(this.buttonMod).add(this.buttonView);
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
  this.inputView = new Surface({
    content: '<form><input type="text" placeholder="Enter task here..." size="60"/></form>',
    size: [60, 70],
    properties: {
      visibility: 'hidden'
    }
  });
  this.inputMod = new Modifier({
    transform: Transform.translate(0, 1000, 0)
  });
  this._add(this.inputMod).add(this.inputView);
};

var clicked = false;
function _setListeners() {  

  window.Engine.on("prerender", _colorMod.bind(this));

  this.backgroundSurf.on('touchstart', function(){
    if(clicked){
      clicked = false;
      this.inputView.setProperties({visibility:'hidden'});
    } else {
      clicked = true;
      this.inputView.setProperties({visibility:'visible'});
      var offset = 39 * this.tasks.length+303;
      this.inputMod.setTransform(Transform.translate(0, offset, 0))
      this.inputView.on('submit', function(e){
        e.preventDefault();
        console.log("SUBMITTING");
        var newTask = {text: this.inputView._currTarget.firstChild.firstChild.value, focus: true};
        this.tasks.push(newTask);
            
        var taskView = new TaskView(newTask);
        var offset = taskView.options.taskOffset * (this.tasks.length+1);
        
        var taskMod = new Modifier({
          origin: [0, 0.425],
          transform: Transform.translate(0, offset, 0)
        });
        this._add(taskMod).add(taskView);
        this.inputView.setProperties({visibility: 'hidden'});
      }.bind(this));
    }
  }.bind(this));  
  
  this.buttonView.on('touchstart', function() {
    this._eventOutput.emit('toggleList');
  }.bind(this));
  
  _setCompletionListeners.call(this);

};
 
function _setCompletionListeners() {
  for(var i = 0; i < this.taskViews.length; i++) {
    var view = this.taskViews[i];
    view.on('completed', function() {
      this.color.set([145, 63, this.lightness], {
        duration: 1000
      }, function() {
        window.setTimeout(function() {
          this.color.set([145, 63, 100], {
            duration: 500
          });      
        }.bind(this), 500); 
      }.bind(this));
    }.bind(this));
  }
};


module.exports = FocusView;