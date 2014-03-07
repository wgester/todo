var Scrollview = require('famous/views/scrollview');
var Engine     = require('famous/engine');

function TableView(options) {
    Scrollview.apply(this, arguments);

    bindEvents.call(this);
}

function bindEvents() {
    this.eventInput.on('swap', swap.bind(this));
}

function swap(data) {
    var swapperIndex = data.swapper.index;
    var swappeeIndex = data.swappee.index;

    var swapperNode = this.node.find(swapperIndex);

    var swappeeNode = this.node.find(swappeeIndex);

    if (swapperIndex === this.node.index) {
        this.node = swappeeNode;
    } else if (swappeeIndex === this.node.index) {
        this.node = swapperNode;
    }

    swapperNode.swap(swappeeNode);

    this.eventOutput.emit('swapped', {
        swapper: swapperIndex,
        swappee: swappeeIndex
    });
}

TableView.prototype = Object.create(Scrollview.prototype);

TableView.prototype.emit = function(type, data) {
    if (type == 'update' || type == 'start' || type == 'end' || type == 'swap') this.eventInput.emit(type, data);
    else this.sync.emit(type, data);
};

module.exports = TableView;