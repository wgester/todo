/**
 * @class Timer
 * @description An internal library to reproduce javascript time-based scheduling.
 *   Using standard javascript setTimeout methods can have a negative performance impact
 *   when combined with the Famous rendering process, so instead require Timer and call
 *   Timer.setTimeout, Timer.setInterval, etc.
 * 
 * @name Timer
 * @constructor
 */
var FamousEngine = require('famous/engine');

var _event  = 'prerender';

var getTime = (window.performance)
    ? function(){return performance.now()}
    : function(){return Date.now()}

function addTimerFunction(fn){
    FamousEngine.on(_event, fn);
    return fn;
};

function setTimeout(fn, duration){
    var t = getTime();
    var callback = function(){
        var t2 = getTime();
        if (t2 - t >= duration){
            fn.apply(this, arguments);
            FamousEngine.unbind(_event, callback);
        };
    };
    return addTimerFunction(callback);
};

function setInterval(fn, duration){
    var t = getTime();
    var callback = function(){
        var t2 = getTime();
        if (t2 - t >= duration){
            fn.apply(this, arguments);
            t = getTime();
        };
    };
    return addTimerFunction(callback);
};

function after(fn, numTicks){
    if (numTicks === undefined) return;
    var callback = function(){
        numTicks--;
        if (numTicks <= 0){ //in case numTicks is fraction or negative
            fn.apply(this, arguments);
            clear(callback);
        };
    };
    return addTimerFunction(callback);
};

function every(fn, numTicks){
    numTicks = numTicks || 1;
    var initial = numTicks;
    var callback = function(){
        numTicks--;
        if (numTicks <= 0){ //in case numTicks is fraction or negative
            fn.apply(this, arguments);
            numTicks = initial;
        };
    };
    return addTimerFunction(callback);
};

function clear(fn){
    FamousEngine.unbind(_event, fn);
};

function debounce(func, wait) {
    var timeout, ctx, timestamp, result, args;
    return function () {
        ctx = this;
        args = arguments;
        timestamp = getTime();

        var fn =  function () {
            var last = getTime - timestamp;

            if(last < wait) {
                timeout = setTimeout(fn, wait - last);
            } else {
                timeout = null;
                result = func.apply(ctx, args);
            }
        };

        if(!timeout) {
            timeout = setTimeout(fn, wait);
        }

        return result;
    };
};

module.exports = {
    setTimeout : setTimeout,
    setInterval : setInterval,
    debounce : debounce,
    after : after,
    every : every,
    clear : clear
};
