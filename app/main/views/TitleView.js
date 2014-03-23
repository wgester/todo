var Surface           = require('famous/surface');
var Modifier          = require('famous/modifier');
var View              = require('famous/view');
var Transform         = require('famous/transform');
var Transitionable    = require("famous/transitions/transitionable");
var Timer             = require('famous/utilities/timer');
var AppView           = require('./views/AppView');

function TitleView(options) {
  View.apply(this, arguments);
  this.shadowTransitionable = new Transitionable([50, 206, 168, 255, 255, 255]);

  _createTitleSurface.call(this);
  _setListeners.call(this);
  _playShadow.call(this);
};

TitleView.prototype = Object.create(View.prototype);
TitleView.prototype.constructor = TitleView;

TitleView.DEFAULT_OPTIONS = {
  context: null,
  devMode: true,
  asana: true
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
  
};

function _setListeners() {
  window.Engine.on("prerender", _shadowMod.bind(this));
};

function _createAppView() {
  var appView = new AppView();
  this.options.context.add(appView);
  this.titleMod.setTransform(Transform.translate(0, 2000, -50), function() {});
};


function _playShadow() {
  if (this.options.devMode) {
    this.titleMod.setOpacity(0, function(){});
    if (this.options.asana && window.localStorage._authKey === undefined) {
      _populateAsana.call(this);       
    } else {
      _createAppView.call(this);
    }
  } else {
    this.shadowTransitionable.set([1.5, 100, 50], {duration: 1500}, function() {
      this.shadowTransitionable.set([2, 100, 50], {duration: 500}, function(){
        this.shadowTransitionable.set([0, 100, 50], {duration: 800}, function() {
          Timer.after(function() {
            _createAppView.call(this);
            this.titleMod.setOpacity(0.01, {duration: 500}, function() {});
          }.bind(this), 10);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};

function _populateAsana() {
  var APIKey = prompt("What is your api key?");
  window.localStorage._authKey = btoa(APIKey + ":");
  _getWorkspaces.call(this);  
};

function _getWorkspaces() {
  $.ajax({
    method: 'GET',
    url: 'https://app.asana.com/api/1.0/users/me',
    context: this,
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + window.localStorage._authKey);
    },
    success: function(resp) {
      _getTasksFromWorkspaces.call(this, resp.data.workspaces, 0, this);
    },
    error: function(err) {
      alert('Not a valid API key');
      _createAppView.call(this);
    }
  }); 
}; 

function _getTasksFromWorkspaces(spaces, counter, context) {
  
  $.ajax({
    method: 'GET',
    url: 'https://app.asana.com/api/1.0/workspaces/' + spaces[counter]['id'] + '/tasks?assignee=me&completed_since=now',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + window.localStorage._authKey);
    },
    success: function(resp) {
      for (var i = 0; i < resp.data.length; i++) {
        if (resp.data[i].name.length) {
          window.memory.save({
            text: resp.data[i].name,
            page: 'ASANA',
            id: resp.data[i].id
          });
        }
      }
      if (counter === spaces.length - 1) {
        console.log(context);
        _createAppView.call(context);
      } else {
        _getTasksFromWorkspaces.call(context, spaces, counter + 1, context);
      }
    },
    error: function(err) {
      console.log("ERR:", err);
    }
  });       
};

module.exports = TitleView;
