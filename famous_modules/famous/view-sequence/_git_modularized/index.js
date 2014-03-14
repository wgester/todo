/**
 * @class ViewSequence
 *
 * @name ViewSequence
 * @constructor
 * @description
 *   Helper object used to iterate through items sequentially. Used in 
 *   famous views that deal with layout.
 *
 * @param {Array} array Array that will be viewed
 * @param {number} index Index of array to begin at
 * @param {boolean} loop Whether to loop around the array at end
 */
var OptionsManager = require('famous/options-manager');

function ViewSequence(options) {
    this.options = Object.create(ViewSequence.DEFAULT_OPTIONS);

    this._optionsManager = new OptionsManager(this.options);
    this._optionsManager.patch(options);

    this.array = this.options.array || [];
    this.index = this.options.index;
    this.loop = this.options.loop;
    this._prev = undefined;
    this._prevIndex = undefined;
    this._next = undefined;
    this._nextIndex = undefined;
};

ViewSequence.DEFAULT_OPTIONS = {
    index: 0,
    loop: false
};

ViewSequence.prototype._createPrevious = function() {
    var prevOptions = Object.create(this.options);
    prevOptions.array = this.array;
    prevOptions.index = this._prevIndex;
    prevOptions.loop = this.loop;

    var prev = new (this.constructor)(prevOptions);
    prev._next = this;
    prev._nextIndex = this.index;
    return prev;
};

ViewSequence.prototype._createNext = function() {
    var nextOptions = Object.create(this.options);
    nextOptions.array = this.array;
    nextOptions.index = this._nextIndex;
    nextOptions.loop = this.loop;

    var next = new (this.constructor)(nextOptions);
    next._prev = this;
    next._prevIndex = this.index;

    return next;
};

ViewSequence.prototype.getPrevious = function() {
    var prevIndex = this.index - 1;
    if(this.index === 0) {
        if(this.loop) prevIndex = this.array.length - 1;
        else return undefined;
    }
    if(!this._prev || this._prevIndex != prevIndex) {
        this._prevIndex = prevIndex;
        this._prev = this._createPrevious();
    }
    return this._prev;
};

ViewSequence.prototype.getNext = function() {
    var nextIndex = this.index + 1;
    if(nextIndex >= this.array.length) {
        if(this.loop) nextIndex = 0;
        else return undefined;
    }
    if(!this._next || this._nextIndex != nextIndex) {
        this._nextIndex = nextIndex;
        this._next = this._createNext();
    }
    return this._next;
};

ViewSequence.prototype.toString = function() {
    return this.index;
};

ViewSequence.prototype.unshift = function(value) {
    this.array.unshift(value);
    if(!this._prev || this.index === 0) {
        var offset = arguments.length;
        this.array.unshift.apply(this.array, arguments);
        _reindex.call(this, offset);
    }
    else this._prev.unshift.apply(this._prev, arguments);
};

ViewSequence.prototype.push = function(value) {
    this.array.push.apply(this.array, arguments);
};

ViewSequence.prototype.splice = function(index, howMany, addedNodes) {
    var insertionNode = this.find(index);
    var result = insertionNode.get();
    

    if (insertionNode) {
        var nextNode, previousNode;

        for (var i = 0; i < howMany; i++) {
            nextNode = insertionNode._next;
            previousNode = insertionNode._prev;

            nextNode._prev = previousNode;
            previousNode._next = nextNode;

            insertionNode = nextNode;
        }

        var inject;
        for (i = 0; i < arguments.length - 2; i ++) {
            inject = insertionNode._createPrevious();
            inject.setPrevious(previousNode);
            inject.setNext(insertionNode);
            previousNode.setNext(inject);
            insertionNode.setPrevious(inject);
            previousNode = inject;
        }

        var head = this.find(0);

        i = 0;
        while (head) {
            head.setIndex(i);
            i++;
            head = head._next;
        }

        this.array.splice.apply(this.array, arguments);
    }

    return result;

};

 ViewSequence.prototype.moveTo = function(index) {
    var next = this._next;
    var previous = this._prev;
    var thisValue = this.array.splice(this.index, 1);

    if (next) next.setPrevious(previous);
    if (previous) previous.setNext(next);
    
    if (this.index < index) {
        index += 1;
    }

    var insertBefore = this.find(index);

    var insertBeforePrevious = insertBefore._prev;
    if (insertBeforePrevious) {
        insertBefore._prev = this;
        insertBeforePrevious._next = this;

        this._prev = insertBeforePrevious;
        this._next = insertBefore;

        var head = this.find(0);
    } else if (!insertBefore) {
        var insertAfter = this.find(index - 1);
        this._prev = insertAfter;
        this._next = undefined;
        insertAfter._next = this;
        var head = this.find(0);
    } else {
        insertBefore._prev = this;
        this._next = insertBefore;
        this._prev = undefined;
        var head = this;
    }
    if (!previous) {
        var head = next;
    }
    var i = 0;
    while (head) {
        head.setIndex(i);
        i++;
        head = head._next;
    }

    if (this.index < index) {
        index -= 1;
    }

    this.array.splice(index, 0, thisValue[0]);
};

ViewSequence.prototype.swap = function(node) {
    var thisIndex = this.getIndex();
    var thatIndex = node.getIndex();

    var thisValue = this.array[thisIndex];
    var thatValue = this.array[thatIndex];

    this.array[thisIndex] = thatValue;
    this.array[thatIndex] = thisValue;

    var thisNext = this.getNext();
    var thatNext = node.getNext();

    var thisPrevious = this.getPrevious();
    var thatPrevious = node.getPrevious();

    if (Math.abs(thisIndex - thatIndex) === 1) {
        if (thisIndex < thatIndex) {
            if (thisPrevious) thisPrevious.setNext(node);

            this.setPrevious(node);
            this.setNext(thatNext);

            node.setPrevious(thisPrevious);
            node.setNext(this);

            if (thatNext) thatNext.setPrevious(this);
        }

        if (thisIndex > thatIndex) {
            if (thatPrevious) thatPrevious.setNext(this);

            node.setPrevious(this);
            node.setNext(thisNext);

            this.setPrevious(thatPrevious);
            this.setNext(node);

            if (thisNext) thisNext.setPrevious(node);
        }
    } else {
        this.setNext(thatNext);
        this.setPrevious(thatPrevious);

        node.setNext(thisNext);
        node.setPrevious(thisPrevious);
    }

    node.setIndex(thisIndex);
    this.setIndex(thatIndex);
};

ViewSequence.prototype.find = function(index) {
    var result = this;

    var direction = (index > this.getIndex()) ? '_next' : '_prev';

    while (result.getIndex() !== index) {
        var subsequentNode = result[direction];
        if (subsequentNode) {
            result = subsequentNode;
        } else {
            return false;
        }
    }

    return result;
};

ViewSequence.prototype.getIndex = function() {
    return this.index;
};

ViewSequence.prototype.setIndex = function(index) {
    if (this._prev) {
        this._prevIndex = index - 1;
    } else {
        this._prevIndex = undefined;
    }
    if (this._next) {
        this._nextIndex = index + 1;
    } else {
        this._nextIndex = undefined;   
    }
    this.index = index;
    return this;
};

ViewSequence.prototype.setNext = function(node) {
    this._next = node;
    return this._next;
};

ViewSequence.prototype.setPrevious = function(node) {
    this._prev = node;
    return this._previous;
};

function _reindex(offset) {
    var i = this.index;
    var currentNode = this;
    while(currentNode && i < this.array.length) {
        currentNode.index += offset;
        if(currentNode._prevIndex !== undefined) currentNode._prevIndex += offset;
        if(currentNode._nextIndex !== undefined) currentNode._nextIndex += offset;
        currentNode = currentNode._next;
    }
}

ViewSequence.prototype.getAllLinkedNodes = function() {
    var result = [];
    var node = this;

    while (node) {
        result.push(node);
        node = node._next;
    }

    node = this._prev;

    while (node) {
        result.unshift(node);
        node = node._prev;
    }

    return result;
};

ViewSequence.prototype.addBehavior = function(func, options) {
    var newChildArray = [];
    for (var i = 0; i < this.array.length; i++) {
        var prevOptions = Object.create(options);
        prevOptions.array = this.array;
        prevOptions.index = i;
        prevOptions.loop = this.loop;
        var behavior = new (func)(prevOptions);

        newChildArray.push(behavior);
    }

    this.array = newChildArray;
};

ViewSequence.prototype.get = function() {
    return this.array[this.index];
};

ViewSequence.prototype.getSize = function() {
    var target = this.get();
    if(!target) return;
    if(!target.getSize) return undefined;
    return target.getSize.apply(target, arguments);
};

ViewSequence.prototype.render = function() {
    var target = this.get();
    if(!target) return;
    console.log(target.render());
    return target.render.apply(target, arguments);
};

module.exports = ViewSequence;