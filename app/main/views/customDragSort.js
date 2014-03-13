var DragSort = require('famous/views/drag-sort');
var Transform = require('famous/transform');

function CustomDragSort() {
    DragSort.apply(this, arguments);

    bindEvents.call(this);
}

function bindEvents() {
    // this._eventInput.on('swapped', handleSwap.bind(this));
    this._eventInput.on('finishedDragging', normalizeColors.bind(this));
    // this._dragEvents.on('dragend', handleDragend.bind(this));
}

function handleSwap(data) {
    if (this.index === data.swapper) {
        var offset = this.getSize()[this.projection];
        if (data.swapper < data.swappee) {
            this.modifier.setTransform(Transform.translate(0, offset));
            this.modifier.setTransform(Transform.identity, {
                duration: 300
            });
        }
        if (data.swapper > data.swappee) {
            this.modifier.setTransform(Transform.translate(0, -offset));
            this.modifier.setTransform(Transform.identity, {
                duration: 300
            });
        }
    }
}

function handleDragend() {
    this.setPosition([0, 0], {
        duration: 300,
        curve: 'easeOut'
    });
}

function normalizeColors() {
    var nodes = this.getAllLinkedNodes();

    for (var i = 0; i < nodes.length; i++) {
        var nodeValue = nodes[i].get();
        nodeValue.setColor(i);
    }
}

CustomDragSort.prototype = Object.create(DragSort.prototype);
CustomDragSort.prototype.constructor = CustomDragSort;

module.exports = CustomDragSort;