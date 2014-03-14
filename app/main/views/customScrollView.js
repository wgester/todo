var Scrollview = require('famous/views/scrollview');
var Engine     = require('famous/engine');

function TableView(options) {
    Scrollview.apply(this, arguments);

    bindEvents.call(this);
}

function bindEvents() {
    this.eventInput.on('shift', shift.bind(this));
    this.eventInput.on('editmodeOn', function() {this._earlyEnd = true;}.bind(this));
}

function shift(data) {
    if (data.newIndex === this.node.index) {
        this.node = this.node.find(data.oldIndex);
    } else if (data.oldIndex === this.node.index) {
        this.node = this.node.find(data.oldIndex + 1);
    } 
    this.node.find(data.oldIndex).moveTo(data.newIndex);
    var currentNode = this.node.find(0);
    while (currentNode) {
        currentNode.setPosition([0,0]);
        currentNode = currentNode.getNext();
    }
}

TableView.prototype = Object.create(Scrollview.prototype);

TableView.prototype.emit = function(type, data) {
    if (type == 'update' || type == 'start' || type == 'end' || type == 'swap') this.eventInput.emit(type, data);
    else this.sync.emit(type, data);
};

module.exports = TableView;