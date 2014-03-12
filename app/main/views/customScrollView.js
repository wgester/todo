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
    // if (data.oldIndex < data.newIndex) {
    //     var currentNode = this.node.find(0);
    //     var movedNode = this.node.splice(data.oldIndex, 1);
    //     this.node.splice(data.oldIndex, 0, movedNode);
    //     while (currentNode) {
    //         currentNode.setPosition([0,0]);
    //         currentNode = currentNode.getNext();
    //     }
    //     // this.node.splice(data.newIndex, 0, movedNode);

    // } else {

    // }






    console.log(data);
    if (data.oldIndex < data.newIndex) {
        var movedNode = this.node.find(data.oldIndex);
        var previousNode = movedNode.getPrevious();
        var currentNode = movedNode.getNext();
        while (currentNode && (currentNode.index < data.newIndex + 1)) {
            currentNode.setPrevious(previousNode);
            previousNode.setNext(currentNode);
            currentNode.setPosition([0,0]);
            previousNode.setPosition([0,0]);
            previousNode = currentNode; 
            currentNode = currentNode.getNext();
        }
        if (!currentNode) {
            movedNode.setPrevious(previousNode);
            previousNode.setNext(movedNode);
        } else {
            currentNode.setPrevious(movedNode);
            movedNode.setPrevious(previousNode);
            previousNode.setNext(movedNode);
            movedNode.setNext(currentNode);
        }
        movedNode.setPosition([0,0]);
     
    } else {
        var movedNode = this.node.find(data.oldIndex);
        var previousNode = movedNode.getNext();
        var currentNode = movedNode.getPrevious();
        while (currentNode && (currentNode.index > data.newIndex - 1)) {
            currentNode.setNext(previousNode);
            previousNode.setPrevious(currentNode);
            currentNode.setPosition([0,0]);
            previousNode.setPosition([0,0]);
            previousNode = currentNode; 
            currentNode = currentNode.getPrevious();
        }
        if (!currentNode) {
            movedNode.setNext(previousNode);
            previousNode.setPrevious(movedNode);
        } else {
            currentNode.setNext(movedNode);
            movedNode.setPrevious(currentNode);
            previousNode.setPrevious(movedNode);
            movedNode.setNext(previousNode);
        }
        movedNode.setPosition([0,0]);
    }
    

    
    // var swapperIndex = data.swapper.index;
    // var swappeeIndex = data.swappee.index;

    // var swapperNode = this.node.find(swapperIndex);

    // var swappeeNode = this.node.find(swappeeIndex);

    // if (swapperIndex === this.node.index) {
    //     this.node = swappeeNode;
    // } else if (swappeeIndex === this.node.index) {
    //     this.node = swapperNode;
    // }

    // swapperNode.swap(swappeeNode);

    // this.eventOutput.emit('swapped', {
    //     swapper: swapperIndex,
    //     swappee: swappeeIndex
    // });
}

TableView.prototype = Object.create(Scrollview.prototype);

TableView.prototype.emit = function(type, data) {
    if (type == 'update' || type == 'start' || type == 'end' || type == 'swap') this.eventInput.emit(type, data);
    else this.sync.emit(type, data);
};

module.exports = TableView;