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

var devMode = true;
var wrapped = false;
var asanaConnect = true;

_createStorageAPI();

if (!wrapped) {
  console.log('not wrapped');
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
  if (window.localStorage._taskData !== undefined) {
    window.memory.data = JSON.parse(window.localStorage._taskData);
  } else {
    window.memory.data = {
      "FOCUS" : [{ text: 'Focus on this', page: 'FOCUS'}],
      "TODAY" : [{ text: 'Something to do', page: 'TODAY'}],
      "LATER" : [{ text: 'Do this later', page: 'LATER'}],
      "NEVER" : []
    };
  }
  if (cb) cb();
}

Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('spring', SpringTransition);

var mainCtx = window.Engine.createContext();

mainCtx.setPerspective(1000);

var shadowTransitionable = new Transitionable([50, 206, 168, 255, 255, 255]);

var titleSurf = new Surface({
  size: [undefined, undefined],
  classes: ['title'],
  content: '<h1>FOCUS</h1>',
  properties: {
    backgroundColor: '#32CEA8',
    paddingLeft: 0
  }
});

// var whiteGradientSurf = new CanvasSurface({
//   size: [undefined, undefined],
//   canvasSize: [window.innerWidth*2, window.innerHeight*2],
//   classes: ['famous-surface']
// });

// var whiteGradientMod = new Modifier({
//   transform: Transform.translate(0, 600, 0)
// });


// var colorCanvas = whiteGradientSurf.getContext('2d');

// if (_isAndroid) {
//   var radial = colorCanvas.createLinearGradient(
//             300 * 0.5 * 2,    // x0
//             0,                              // y0
//             300 * 0.5 * 2,    // x1
//             500 * 2.5         // y1
//             );

//   radial.addColorStop(0, "rgba(255, 255, 255, 0)");
//   radial.addColorStop(1, "rgba(255, 255, 255, 1)");

//   colorCanvas.fillStyle = radial;
//   colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );
//   mainCtx.add(whiteGradientMod).add(whiteGradientSurf);
// } else {
//    radial = colorCanvas.createRadialGradient(
//                   300 * 0.5 * 2,    // x0
//                   500 * 2,         // y0
//                   0,   // r0

//                   300 * 0.5 * 2,    // x1
//                   500 * 2.5,       // y1
//                   300 * 2.5        // r1
//                   );
//   radial.addColorStop(0, "rgba(255, 255, 255, 1)");
//   radial.addColorStop(1, "rgba(255, 255, 255, 0)");

//   colorCanvas.fillStyle = radial;
//   colorCanvas.fillRect( 0, 0, window.innerWidth* 2, window.innerHeight* 2 );


//   mainCtx.add(whiteGradientMod).add(whiteGradientSurf);
// }



var titleMod = new Modifier({
  opacity: 1
});

function _shadowMod() {
  titleSurf.setProperties({
    textShadow: '0px 0px ' + this.get()[0] + 'px rgba(0, 49, 86, 1)'
  });
};

function _playShadow() {
  if (devMode ) {
    titleMod.setOpacity(0, function(){});
    window.APIKey = prompt("What is your api key?");
    var authKey = btoa(window.APIKey + ":"); 
    $.ajax({
      method: 'GET',
      url: 'https://app.asana.com/api/1.0/projects/10736255381579/tasks?completed_since=now',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authKey);
      },
      success: function(data) {
        window.asanaTasks = data.data;
        var appView = new AppView();
        mainCtx.add(appView);
        titleMod.setTransform(Transform.translate(0, 0, -100));
      },
      error: function(err) {
        console.log("ERR:", err);
      }
    });
    
  } else {
    this.set([1.5, 100, 50], {duration: 1500}, function() {
      this.set([2, 100, 50], {duration: 500}, function(){
        this.set([0, 100, 50], {duration: 800}, function() {
          Timer.after(function() {
            // whiteGradientMod.setTransform(Transform.translate(0, 100, 0), {duration: 500}, function() {
                var appView = new AppView();
                mainCtx.add(appView);
                titleMod.setOpacity(0.5, {duration: 500}, function() {
                  Timer.after(function(){
                    titleMod.setTransform(Transform.translate(0, 2000, -50), function() {});
                  }, 20);
                }.bind(this));
            // });
          }, 7);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
};

function _isAndroid() {
  var userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf("android") > -1;
};


mainCtx.add(titleMod).add(titleSurf);
window.Engine.on("prerender", _shadowMod.bind(shadowTransitionable));

_playShadow.call(shadowTransitionable);

