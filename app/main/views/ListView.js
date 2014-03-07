var Surface       = require('famous/surface');
var Modifier      = require('famous/modifier');
var View          = require('famous/view');
var Transform     = require('famous/transform');
var Transitionable = require("famous/transitions/transitionable");
var TaskView      = require('./TaskView');
var Tasks         = require('./data');

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

function _colorMod() {
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
  this.inputView = new Surface({
    content: '<form><input type="text" placeholder="Enter task here..." size="60"/></form>',
    size: [60, undefined]
  });
    
  this.inputMod = new Modifier({
    transform: Transform.translate(0, 190, 0)
  });
  
  this._add(this.inputMod).add(this.inputView);
};

function _setListeners() {
  window.Engine.on("prerender", _colorMod.bind(this));

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
        }.bind(this), 100); 
      }.bind(this));
    }.bind(this));
        
  }
};

module.exports = ListView;
