var Scrollview = require('famous/views/scrollview');
var Engine     = require('famous/engine');

function TableView(options) {
    Scrollview.apply(this, arguments);
    bindEvents.call(this);
}

function bindEvents() {
    this.eventInput.on('shift', shift.bind(this));
    this.eventInput.on('editmodeOn', stopYScroll.bind(this));
    this.eventInput.on('xScroll', stopYScroll.bind(this));
    this.eventInput.on('deleteMe', deleteTask.bind(this));
    this.eventInput.on('swapPage', swapPage.bind(this));
}

function stopYScroll() {
    this._earlyEnd = true;
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

function deleteTask(indexObj) {
    if (indexObj.index === this.node.index) {
        if (this.node.find(this.node.index + 1)) this.node = this.node.find(this.node.index + 1);
    }
    this.node.splice(indexObj.index, 1);
}

function swapPage(indexObj) {
    var currentNode = this.node.find(0);
    while (currentNode && (currentNode.index !== indexObj.index)) {
        currentNode.setPosition([0,0]);
        currentNode = currentNode.getNext();
    }
    var currentNode = this.node.find(indexObj.index + 1);
    while (currentNode) {
        currentNode.setPosition([0,-currentNode.getSize()[1]]);
        currentNode = currentNode.getNext();
    }
    setTimeout(function(){
        if (indexObj.index === this.node.index) {
            if (this.node.find(this.node.index + 1)) this.node = this.node.find(this.node.index + 1);
        }
        this.node.splice(indexObj.index, 1);
        var currentNode = this.node.find(0);
        while (currentNode) {
            currentNode.setPosition([0,0]);
            currentNode = currentNode.getNext();
        }
    }.bind(this), 500);
}

TableView.prototype = Object.create(Scrollview.prototype);

TableView.prototype.emit = function(type, data) {
    if (type == 'update' || type == 'start' || type == 'end' || type == 'swap') this.eventInput.emit(type, data);
    else this.sync.emit(type, data);
};

module.exports = TableView;