window.Engine         = require('famous/engine');
var AppView           = require('./views/AppView');
var Surface           = require('famous/surface')
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var Transitionable    = require("famous/transitions/transitionable");
var WallTransition    = require("famous/transitions/wall-transition");
var SpringTransition  = require("famous/transitions/spring-transition");
var Timer             = require('famous/utilities/timer');
var CanvasSurface     = require('famous/surfaces/canvas-surface');
var bootstrappedData  = require('./views/data.js');
window.$              = require('./jquery');
var TitleView         = require('./views/TitleView');

var devMode = false;
var wrapped = false;
var asanaConnect = true;

var mainCtx = window.Engine.createContext();
mainCtx.setPerspective(1000);
_createStorageAPI();

if (!wrapped) {
  navigator.notification = {
    vibrate: function(time) {
      console.log('vibrate fake for ' + time + 'ms.');
    }
  };
}

if (!_isAndroid() || !wrapped) {
  window.AndroidKeyboard = {
    show: function() {
      console.log("Show android keyboard");
    },
    hide: function() {
      console.log("Hide android keyboard");
    }
  };
} 

function _createStorageAPI() {
  window.memory = {
    read: function(page) {
      if (page) {
        return this.data[page];
      }
      return this.data;
    },
    save: function(inputTask, cb) {
      if (inputTask) {
        this.data[inputTask.page].push(inputTask);
      }
      window.localStorage._taskData = JSON.stringify(this.data);

      if (typeof inputTask === 'function') {
        cb = inputTask;
      }

      if (cb) cb();
    },
    remove: function(inputTask, cb) {
      var thisPagesTasks = this.data[inputTask.page];
      for (var i = 0; i < thisPagesTasks.length; i++) {
        if (thisPagesTasks[i].text === inputTask.text) {
          thisPagesTasks.splice(i, 1);
          i--;
        }
      }
      this.data[inputTask.page] = thisPagesTasks;
      this.save(cb);
    }
  };
  _loadSavedData();
}

function _loadSavedData(cb) {
  if (window.localStorage._taskData === undefined) {
    window.memory.data = {
      "FOCUS" : [],
      "TODAY" : [],
      "LATER" : [],
      "ASANA" : [],
      "NEVER" : []
    };
  } else {
    window.memory.data = JSON.parse(window.localStorage._taskData);
  }
  if (cb) cb();
}

Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('spring', SpringTransition);

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

window.vibrate = function(length) {
  navigator && navigator.notification && navigator.notification.vibrate(length);
}

var titleView = new TitleView({context: mainCtx, devMode: devMode, asana: asanaConnect});
mainCtx.add(titleView);
