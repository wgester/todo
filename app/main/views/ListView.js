var Surface         = require('famous/surface');
var Modifier        = require('famous/modifier');
var Transform       = require('famous/transform');
var View            = require('famous/view');


function ListView() {
    View.apply(this, arguments);
}

ListView.prototype = Object.create(View.prototype);
ListView.prototype.constructor = ListView;

ListView.DEFAULT_OPTIONS = {

};


module.exports = ListView;

