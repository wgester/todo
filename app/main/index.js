require('famous/polyfills');
window.Engine         = require('famous/engine');
var Surface           = require('famous/surface')
var Modifier          = require('famous/modifier');
var Transform         = require('famous/transform');
var Transitionable    = require("famous/transitions/transitionable");
var WallTransition    = require("famous/transitions/wall-transition");
var SpringTransition  = require("famous/transitions/spring-transition");
var Timer             = require('famous/utilities/timer');
var CanvasSurface     = require('famous/surfaces/canvas-surface');

//// Require local files for subviewing
var AppView           = require('./views/AppView');
var bootstrappedData  = require('./views/data.js');
var TitleView         = require('./views/TitleView');
window.$              = require('./jquery');

//// Development switches for cross-platform building, devMode is for the opening animation, wrapped is for cordova, asanaConnect is for enabling asana integration
var devMode = false;
var wrapped = false;
var asanaConnect = false;

//// Famous context, need for all apps
var mainCtx = window.Engine.createContext();
//// Perspective for viewing 3d transforms, this integer is the "pixel value" in z-space that the camera is positioned 
mainCtx.setPerspective(1000);


_createStorageAPI();

//// Fonts?
window.$("head link[rel='stylesheet']").last().after("<link rel='stylesheet' href='http://fonts.googleapis.com/css?family=Signika+Negative|Quicksand:400,700|Josefin+Sans|Convergence|Julius+Sans+One' type='text/css'>");

//// Shim vibration api for browser development
if (!wrapped) {
  navigator.notification = {
    vibrate: function(time) {
      console.log('vibrate fake for ' + time + 'ms.');
    }
  };
}

//// Shim android keyboard for browser development and ios
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

//// Use localStorage for data store
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

//// Load data from localStorage on startup.  Useful for mobile as localStorate persists until app uninstalls
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

//// Register transitions for simple physics API
Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('spring', SpringTransition);

//// Determine android user agent, will return true on android Chrome, Browser, and wrapped browser
function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};

//// Provide sugar and sheild errors if no vibrate API exists.  Perhaps use a try/catch or promised error handling
window.vibrate = function(length) {
  navigator && navigator.notification && navigator.notification.vibrate(length);
}

//// Start the app with the first subview
var titleView = new TitleView({context: mainCtx, devMode: devMode, asana: asanaConnect});
//// Append this view to the context so it can be rendered
mainCtx.add(titleView);
