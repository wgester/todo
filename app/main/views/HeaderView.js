var Surface   = require('famous/surface');
var Modifier  = require('famous/modifier');
var Transform = require('famous/transform');
var View      = require('famous/view');

function HeaderView() {
  View.apply(this, arguments);
  _createTitle.call(this);
}

HeaderView.prototype = Object.create(View.prototype);
HeaderView.prototype.constructor = HeaderView;

HeaderView.DEFAULT_OPTIONS = {
  text: null,
  classes: ['title'],
  title: 'LATER'
};

function _createTitle() {
  this.titleHeader = new Surface({
    content: '<h1>' + this.options.title + '</h1>',
    properties: {
      color: 'black',
      fontSize: '2.5em',
      backgroundColor: "#3cf"
    }
  });
  this._add(this.titleHeader);  
};


module.exports = HeaderView;