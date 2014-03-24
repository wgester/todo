var Surface = require('famous/surface');

/**
 * @class ImageSurface
 *
 * @description
 *   Creates a famous surface with linked image content
 *   
 * @name ImageSurface
 * @extends Surface
 * @constructor
 *
 * @example
 *   var Engine = require('famous/Engine');
 *   var ImageSurface = require('famous/ImageSurface');
 *   var EventHandler = require('famous/EventHandler');
 *
 *   var Context = Engine.createContext();
 *
 *   var imgSurface = new ImageSurface({
 *       size: [200,200],
 *       properties: {
 *           backgroundColor: '#3cf'
 *       },
 *       content: 'test'
 *   });
 *
 *   imgSurface.setContent('http://ebmedia.eventbrite.com/s3-build/images/3635837/81800181927/1/logo.png')
 *   Context.link(imgSurface);
 */
function ImageSurface(opts) {
    this.imageUrl = undefined;
    Surface.apply(this, arguments);
};

ImageSurface.prototype = Object.create(Surface.prototype);
ImageSurface.prototype.constructor = ImageSurface;
ImageSurface.prototype.elementType = 'img';
ImageSurface.prototype.elementClass = 'famous-surface';

ImageSurface.prototype.setContent = function(imageUrl) {
    this.imageUrl = imageUrl;
    this._contentDirty = true;
};

ImageSurface.prototype.deploy = function(target) {
    target.src = this.imageUrl || '';
};

ImageSurface.prototype.recall = function(target) {
    target.src = '';
};

module.exports = ImageSurface;
