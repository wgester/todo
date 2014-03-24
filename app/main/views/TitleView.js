var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var View              = require('famous/view');
var Transform         = require('famous/transform');
var Transitionable    = require("famous/transitions/transitionable");
var Timer             = require('famous/utilities/timer');
var AppView           = require('./views/AppView');
var ImageSurface      = require('famous/surfaces/image-surface');

function TitleView(options) {
  View.apply(this, arguments);
  this.shadowTransitionable = new Transitionable([50, 206, 168, 255, 255, 255]);
  window.asanaIDs = [];
  
  _createTitleSurface.call(this);
  _createSpinner.call(this);
  _createButtons.call(this);
  _setListeners.call(this);
  _playShadow.call(this);
};

TitleView.prototype = Object.create(View.prototype);
TitleView.prototype.constructor = TitleView;

TitleView.DEFAULT_OPTIONS = {
  context: null,
  devMode: true,
  asanaConnect: true
};

function _createTitleSurface() {
  this.titleSurf = new Surface({
    size: [undefined, undefined],
    classes: ['title'],
    content: '<h1>FOCUS</h1>',
    properties: {
      backgroundColor: '#32CEA8',
      paddingLeft: 0
    }
  });  

  this.titleMod = new Modifier({
    opacity: 1
  });

  this._add(this.titleMod).add(this.titleSurf);
};

function _shadowMod() {
  this.titleSurf.setProperties({
    textShadow: '0px 0px ' + this.shadowTransitionable.get()[0] + 'px rgba(0, 49, 86, 1)'
  });
};

function _createButtons() {
  this.syncButton = new Surface({
    size: [undefined, 100],
    content: '<button>Sync with Asana</button>',
    properties: {
      textAlign: 'center',
    }
  });

  this.skipButton = new Surface({
    size: [undefined, 100],
    content: '<button>Skip</button>',
    properties: {
      textAlign: 'center'      
    }
  });

  this.syncButtonMod = new Modifier({
    origin: [0, 0.6],
    opacity: 0
  });

  this.skipButtonMod = new Modifier({
    origin: [0, 0.7],
    opacity: 0
  });
  
  this._add(this.syncButtonMod).add(this.syncButton);
  this._add(this.skipButtonMod).add(this.skipButton);
};

function _hideButtons() {
  this.syncButtonMod.setOpacity(0);
  this.skipButtonMod.setOpacity(0);  
};

function _setListeners() {
  window.Engine.on("prerender", _shadowMod.bind(this));
  
  this.syncButton.on('touchend', function() {
    window.asana = true;
    _hideButtons.call(this);
    _populateAsana.call(this);
  }.bind(this));
  
  this.skipButton.on('touchend', function() {
    window.asana = false;
    _hideButtons.call(this);
    _createAppView.call(this);
  }.bind(this));
};

function _createAppView() {
  var appView = new AppView();
  this.options.context.add(appView);
  this.titleMod.setTransform(Transform.translate(0, 2000, -50), function() {});
};


function _playShadow() {
  if (this.options.devMode) {
    this.titleMod.setOpacity(0);
     _createAppView.call(this); 
  } else {
    this.shadowTransitionable.set([1.5, 100, 50], {duration: 1500}, function() {
      this.shadowTransitionable.set([2, 100, 50], {duration: 500}, function(){
        this.shadowTransitionable.set([0, 100, 50], {duration: 800}, function() {
          Timer.after(function() {
            if (this.options.asanaConnect && window.localStorage._authKey === undefined) {
              this.syncButtonMod.setOpacity(1);
              this.skipButtonMod.setOpacity(1);
            } else {
              window.asana = this.options.asanaConnect;
              _createAppView.call(this);
              this.titleMod.setOpacity(0.01, {duration: 500}, function() {});
            }
          }.bind(this), 10);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};

function _populateAsana() {
  var APIKey = prompt("What is your api key?");
  window.localStorage._authKey = btoa(APIKey + ":");
  _getWorkspaces.call(null, this);  
};

function _createSpinner() {
  this.spinner = new ImageSurface({
    size: [36, 36],
    properties: {
      display: 'none'
    }
  });
  
  this.spinner.setContent('./img/spinner2.gif');
  
  this.spinnerMod = new Modifier({
    origin: [0.5, 0.5]
  });
  
  this._add(this.spinnerMod).add(this.spinner);
};

function loadSpinner() {
  this.spinner.setProperties({'display': 'block'});
};

function closeSpinner() {
  this.spinner.setProperties({'display': 'none'});
};

function _getWorkspaces(context) {
  $.ajax({
    method: 'GET',
    url: 'https://app.asana.com/api/1.0/users/me',
    context: this,
    beforeSend: function(xhr) {
      loadSpinner.call(context);
      xhr.setRequestHeader("Authorization", "Basic " + window.localStorage._authKey);
    },
    success: function(resp) {
      window.workspaces = resp.data.workspaces;
      window.localStorage._workspaces = JSON.stringify(window.workspaces);
      _getTasksFromWorkspaces.call(context, 0, context);
    },
    error: function(err) {
      alert('Not a valid API key');
      closeSpinner.call(context);
      _createAppView.call(context);
    }
  }); 
}; 

function _getTasksFromWorkspaces(counter, context) {
  $.ajax({
    method: 'GET',
    url: 'https://app.asana.com/api/1.0/workspaces/' + window.workspaces[counter]['id'] + '/tasks?assignee=me&completed_since=now',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + window.localStorage._authKey);
    },
    complete: function() {
      closeSpinner.call(context);
    },
    success: function(resp) {
      for (var i = 0; i < resp.data.length; i++) {
        if (resp.data[i].name.length) {
          window.memory.save({
            text: resp.data[i].name,
            page: 'ASANA',
            id: resp.data[i].id
          });
          window.asanaIDs.push(resp.data[i].id);
        }
      }
      if (counter === window.workspaces.length - 1) {
        window.localStorage._asanaIDs = JSON.stringify(window.asanaIDs);
        _createAppView.call(context);
      } else {
        _getTasksFromWorkspaces.call(context, counter + 1, context);
      }
    },
    error: function(err) {
      closeSpinner.call(context);
      console.log("ERR:", err);
    }
  });       
};

module.exports = TitleView;
