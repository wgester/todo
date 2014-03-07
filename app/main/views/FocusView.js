var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var View = require('famous/view');
var TaskView = require('./TaskView')
var Tasks = require('./data');
var Transform = require('famous/transform');

function FocusView() {
  View.apply(this, arguments);
  
  _createBackground.call(this);
  _createHeader.call(this);
  _populateTasks.call(this);
  _createManyTasks.call(this);
  _createButton.call(this);
  _setListeners.call(this);
  // _createNewTaskSurface.call(this)
};

FocusView.prototype = Object.create(View.prototype);
FocusView.prototype.constructor = FocusView;

function _createBackground() {
 this.backgroundSurf = new Surface({
    size: [undefined, undefined],
    properties: {
      backgroundColor: 'white',
      border: '1px solid black'
    }
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
  }
};

function _setListeners() {  


  this.backgroundSurf.on('touchstart', function(){
    console.log('clicking background');
    var newTask = {text: "HI YOU GUYYSSSSSSSSS", focus: true};
    this.tasks.push(newTask);
        
    var taskView = new TaskView(newTask);
    var offset = taskView.options.taskOffset * (this.tasks.length+1);
    
    var taskMod = new Modifier({
      origin: [0, 0.425],
      transform: Transform.translate(0, offset, 0)
    });
    
    this._add(taskMod).add(taskView);

  }.bind(this));  

  this.buttonView.on('touchstart', function() {
    this._eventOutput.emit('toggleList');
  }.bind(this));

};
 

module.exports = FocusView;