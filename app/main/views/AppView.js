var Surface         = require('famous/surface');
var Modifier        = require('famous/modifier');
var Transform       = require('famous/transform');
var View            = require('famous/view');

var ListView        = require('views/ListView')


function AppView() {
    View.apply(this, arguments);
    _createListView.call(this);
}

AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;

AppView.DEFAULT_OPTIONS = {};


function _createListView() {
    this.listView = new ListView();

    this.listMod = new Modifier();

    this._add(this.listMod).add(this.listView);
}


module.exports = AppView;
