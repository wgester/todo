var Surface       = require('famous/surface');
var Modifier      = require('famous/modifier');
var View          = require('famous/view');
var Transform     = require('famous/transform');

var TaskView      = require('./TaskView');
var Tasks         = require('./data');



function ListView() {
  View.apply(this, arguments);
  
  _createBackground.call(this);
  _createHeader.call(this);
  // _createButton.call(this);
  _populateTasks.call(this);
  _createInput.call(this);
  _createManyTasks.call(this);
  _setListeners.call(this);
}

ListView.prototype = Object.create(View.prototype);
ListView.prototype.constructor = ListView;

ListView.DEFAULT_OPTIONS = {};

function _populateTasks() {
  this.tasks = Tasks;
};

function _createBackground() {
  this.backgroundSurf = new Surface({
    size: [undefined, undefined],
    properties: {
      backgroundColor: 'white',
      border: '1px solid black',
      classes: ['background']

    }
  });
  this.backgroundMod = new Modifier();
  this._add(this.backgroundMod).add(this.backgroundSurf);
};

function _createHeader() {
  this.header = new Surface({
    content: '<h1>TODAY</h1>',
    properties: {
      color: 'black',
      fontSize: '2.5em',
      classes: ['header']
    }
  });
  
  this.headerMod = new Modifier();
  
  this._add(this.headerMod).add(this.header);
};

// function _createButton() {
//   this.buttonView = new Surface({
//     size: [30, 30],
//     properties: {
//       backgroundColor: 'blue'
//     }
//   });
  
//   this.buttonMod = new Modifier({
//     origin: [1, 0]
//   });
  
//   this._add(this.buttonMod).add(this.buttonView);
// };

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
  this.inputView = new Surface({
    content: '<form><input type="text" placeholder="Enter task here..." size="60"/></form>',
    size: [60, undefined]
  
  });
    
  this.inputMod = new Modifier({
    // origin: [0, 1],
    transform: Transform.translate(0, 150, 0)
  });
  
  this._add(this.inputMod).add(this.inputView);
};

function _setListeners() {

// create new task on submit  

  this.backgroundSurf.on('touchstart', function(){
    console.log('touching background');
  }.bind(this));

  this.inputView.on('touchstart', function(){

    console.log('touching input')
  }.bind(this));
  this.inputView.on('submit', function(e) {
    e.preventDefault();

    var newTask = {text: this.inputView._currTarget.firstChild.firstChild.value, focus: false};
    this.tasks.push(newTask);
        
    var taskView = new TaskView(newTask);
    var offset = taskView.options.taskOffset * (this.tasks.length+1);
    
    var taskMod = new Modifier({
      transform: Transform.translate(0, offset, 0)
    });
    
    this._add(taskMod).add(taskView);
  }.bind(this));

// create new task on touch

  
  // this.buttonView.on('touchstart', function() {
  //   this._eventOutput.emit('toggleList');
  // }.bind(this));
};

module.exports = ListView;