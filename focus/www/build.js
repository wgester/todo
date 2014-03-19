"use strict";

/*eslint no-underscore-dangle: 1, eqeqeq:1*/
// This is a modified version of component-require.
// https://github.com/component/require
//
// This will likely be completely rewritten in the future to handle requires
// across all package ecosystems (famous, npm, component, bower, etc.);
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */
function require(path, parent, orig) {
    var resolved = require.resolve(path);
    // lookup failed
    if (null == resolved) {
        orig = orig || path;
        parent = parent || "root";
        var err = new Error("Failed to require '" + orig + "' from '" + parent + "'");
        err.path = orig;
        err.parent = parent;
        err.require = true;
        throw err;
    }
    var module = require.modules[resolved];
    // perform real require()
    // by invoking the module's
    // registered function
    if (!module._resolving && !module.exports) {
        var mod = {};
        mod.exports = {};
        mod.client = mod.component = true;
        module._resolving = true;
        module.call(this, mod.exports, require.relative(resolved), mod);
        delete module._resolving;
        module.exports = mod.exports;
    }
    return module.exports;
}

/**
 * Registered modules.
 */
require.modules = {};

/**
 * Registered aliases.
 */
require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */
require.resolve = function(path) {
    if (require.modules.hasOwnProperty(path)) {
        return path;
    }
    if (require.aliases.hasOwnProperty(path)) {
        return require.aliases[path];
    }
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */
require.register = function(path, definition) {
    require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */
require.alias = function(from, to) {
    if (!require.modules.hasOwnProperty(from)) {
        throw new Error("Failed to alias '" + from + "', it does not exist");
    }
    require.aliases[to] = from;
};

/**
 * This is meant to mimic the "map" property of the requirejs.config object
 * ref: http://requirejs.org/docs/api.html#config-map
 *
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
require.config = function(config) {
    config = config || {};
    if (config.map) {
        var DAG = config.map;
        for (var key in DAG) {
            if (DAG.hasOwnProperty(key)) {
                var depMap = DAG[key];
                for (var dep in depMap) {
                    if (depMap.hasOwnProperty(dep)) {
                        var from = depMap[dep];
                        var to = [ key, dep ].join(":");
                        require.alias(from, to);
                    }
                }
            }
        }
    }
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */
require.relative = function(parent) {
    // this lambda is localRequire
    return function(path) {
        var resolved = [ parent, path ].join(":");
        return require(resolved, parent, path);
    };
};

require.register("famous_modules/famous/polyfills/_git_modularized/index.js", function(exports, require, module) {
    require("./classList.js");
    require("./functionPrototypeBind.js");
    require("./requestAnimationFrame.js");
}.bind(this));

require.register("famous_modules/famous/polyfills/_git_modularized/classList.js", function(exports, require, module) {
    /*
     * classList.js: Cross-browser full element.classList implementation.
     * 2011-06-15
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */
    /*global self, document, DOMException */
    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
    if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {
        (function(view) {
            "use strict";
            var classListProp = "classList", protoProp = "prototype", elemCtrProto = (view.HTMLElement || view.Element)[protoProp], objCtr = Object, strTrim = String[protoProp].trim || function() {
                return this.replace(/^\s+|\s+$/g, "");
            }, arrIndexOf = Array[protoProp].indexOf || function(item) {
                var i = 0, len = this.length;
                for (;i < len; i++) {
                    if (i in this && this[i] === item) {
                        return i;
                    }
                }
                return -1;
            }, DOMEx = function(type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            }, checkTokenAndGetIndex = function(classList, token) {
                if (token === "") {
                    throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
                }
                if (/\s/.test(token)) {
                    throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
                }
                return arrIndexOf.call(classList, token);
            }, ClassList = function(elem) {
                var trimmedClasses = strTrim.call(elem.className), classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [], i = 0, len = classes.length;
                for (;i < len; i++) {
                    this.push(classes[i]);
                }
                this._updateClassName = function() {
                    elem.className = this.toString();
                };
            }, classListProto = ClassList[protoProp] = [], classListGetter = function() {
                return new ClassList(this);
            };
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function(i) {
                return this[i] || null;
            };
            classListProto.contains = function(token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function(token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    this._updateClassName();
                }
            };
            classListProto.remove = function(token) {
                token += "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    this._updateClassName();
                }
            };
            classListProto.toggle = function(token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.add(token);
                } else {
                    this.remove(token);
                }
            };
            classListProto.toString = function() {
                return this.join(" ");
            };
            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) {
                    // IE 8 doesn't support enumerable:true
                    if (ex.number === -2146823252) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }
        })(self);
    }
}.bind(this));

require.register("famous_modules/famous/polyfills/_git_modularized/functionPrototypeBind.js", function(exports, require, module) {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
}.bind(this));

require.register("famous_modules/famous/polyfills/_git_modularized/requestAnimationFrame.js", function(exports, require, module) {
    // adds requestAnimationFrame functionality
    // Source: http://strd6.com/2011/05/better-window-requestanimationframe-shim/
    window.requestAnimationFrame || (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
        return window.setTimeout(function() {
            callback(+new Date());
        }, 1e3 / 60);
    });
}.bind(this));

require.register("famous_modules/famous/transform/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @namespace Matrix
     * 
     * @description 
     *  * A high-performance matrix math library used to calculate 
     *   affine transforms on surfaces and other renderables.
     *   Famous uses 4x4 matrices corresponding directly to
     *   WebKit matrices (column-major order)
     *    
     *    The internal "type" of a Matrix is a 16-long float array in 
     *    row-major order, with:
     *      * elements [0],[1],[2],[4],[5],[6],[8],[9],[10] forming the 3x3
     *          transformation matrix
     *      * elements [12], [13], [14] corresponding to the t_x, t_y, t_z 
     *          affine translation.
     *      * element [15] always set to 1.
     * 
     * Scope: Ideally, none of these functions should be visible below the 
     * component developer level.
     *
     * @static
     * 
     * @name Matrix
     */
    var Transform = {};
    // WARNING: these matrices correspond to WebKit matrices, which are
    //    transposed from their math counterparts
    Transform.precision = 1e-6;
    Transform.identity = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    /**
     * Multiply two or more Matrix types to return a Matrix.
     *
     * @name Matrix#multiply4x4
     * @function
     * @param {Transform} a left matrix
     * @param {Transform} b right matrix
     * @returns {Transform} the resulting matrix
     */
    Transform.multiply4x4 = function multiply4x4(a, b) {
        var result = [ a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3], a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3], a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3], a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3], a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7], a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7], a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7], a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7], a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11], a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11], a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11], a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11], a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15], a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15] ];
        if (arguments.length <= 2) return result; else return multiply4x4.apply(null, [ result ].concat(Array.prototype.slice.call(arguments, 2)));
    };
    // Transform.setMatrix = function(matrix) {
    //   return matrix;
    // };
    /**
     * Fast-multiply two or more Matrix types to return a
     *    Matrix, assuming bottom row on each is [0 0 0 1].
     *    
     * @name Matrix#multiply
     * @function
     * @param {Transform} a left matrix
     * @param {Transform} b right matrix
     * @returns {Transform} the resulting matrix
     */
    Transform.multiply = function multiply(a, b) {
        if (!a || !b) return a || b;
        var result = [ a[0] * b[0] + a[4] * b[1] + a[8] * b[2], a[1] * b[0] + a[5] * b[1] + a[9] * b[2], a[2] * b[0] + a[6] * b[1] + a[10] * b[2], 0, a[0] * b[4] + a[4] * b[5] + a[8] * b[6], a[1] * b[4] + a[5] * b[5] + a[9] * b[6], a[2] * b[4] + a[6] * b[5] + a[10] * b[6], 0, a[0] * b[8] + a[4] * b[9] + a[8] * b[10], a[1] * b[8] + a[5] * b[9] + a[9] * b[10], a[2] * b[8] + a[6] * b[9] + a[10] * b[10], 0, a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14], 1 ];
        if (arguments.length <= 2) return result; else return multiply.apply(null, [ result ].concat(Array.prototype.slice.call(arguments, 2)));
    };
    /**
     * Return a Matrix translated by additional amounts in each
     *    dimension. This is equivalent to the result of
     *   
     *    Matrix.multiply(Matrix.translate(t[0], t[1], t[2]), m)
     *    
     * @name Matrix#move
     * @function
     * @param {Transform} m a matrix
     * @param {Array.<number>} t delta vector (array of floats && 
     *    array.length == 2 || 3)
     * @returns {Transform} the resulting translated matrix
     */
    Transform.move = function(m, t) {
        if (!t[2]) t[2] = 0;
        return [ m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, m[12] + t[0], m[13] + t[1], m[14] + t[2], 1 ];
    };
    /**
     * Return a Matrix which represents the result of a transform matrix
     *    applied after a move. This is faster than the equivalent multiply.
     *    This is equivalent to the result of
     *
     *    Matrix.multiply(m, Matrix.translate(t[0], t[1], t[2]))
     * 
     * @name Matrix#moveThen
     * @function
     *
     * @param {Array.number} v vector representing initial movement
     * @param {Transform} m matrix to apply afterwards
     * @returns {Transform} the resulting matrix
     */
    Transform.moveThen = function(v, m) {
        if (!v[2]) v[2] = 0;
        var t0 = v[0] * m[0] + v[1] * m[4] + v[2] * m[8];
        var t1 = v[0] * m[1] + v[1] * m[5] + v[2] * m[9];
        var t2 = v[0] * m[2] + v[1] * m[6] + v[2] * m[10];
        return Transform.move(m, [ t0, t1, t2 ]);
    };
    /**
     * Return a Matrix which represents a translation by specified
     *    amounts in each dimension.
     *    
     * @name Matrix#translate
     * @function
     * @param {number} x x translation (delta_x)
     * @param {number} y y translation (delta_y)
     * @param {number} z z translation (delta_z)
     * @returns {Transform} the resulting matrix
     */
    Transform.translate = function(x, y, z) {
        if (z === undefined) z = 0;
        return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1 ];
    };
    /**
     * Return a Matrix which represents a scale by specified amounts
     *    in each dimension.
     *    
     * @name Matrix#scale
     * @function  
     *
     * @param {number} x x scale factor
     * @param {number} y y scale factor
     * @param {number} z z scale factor
     * @returns {Transform} the resulting matrix
     */
    Transform.scale = function(x, y, z) {
        if (z === undefined) z = 1;
        return [ x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents a specified clockwise
     *    rotation around the x axis.
     *    
     * @name Matrix#rotateX
     * @function
     *
     * @param {number} theta radians
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateX = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [ 1, 0, 0, 0, 0, cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents a specified clockwise
     *    rotation around the y axis.
     *    
     * @name Matrix#rotateY
     * @function
     *
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateY = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [ cosTheta, 0, -sinTheta, 0, 0, 1, 0, 0, sinTheta, 0, cosTheta, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents a specified clockwise
     *    rotation around the z axis.
     *    
     * @name Matrix#rotateZ
     * @function
     *
     * @param {number} theta radians
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateZ = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [ cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents composed clockwise
     *    rotations along each of the axes. Equivalent to the result of
     *    multiply(rotateX(phi), rotateY(theta), rotateZ(psi))
     *    
     * @name Matrix#rotate
     * @function
     *
     * @param {number} phi radians to rotate about the positive x axis
     * @param {number} theta radians to rotate about the positive y axis
     * @param {number} psi radians to rotate about the positive z axis
     * @returns {Transform} the resulting matrix
     */
    Transform.rotate = function(phi, theta, psi) {
        var cosPhi = Math.cos(phi);
        var sinPhi = Math.sin(phi);
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var cosPsi = Math.cos(psi);
        var sinPsi = Math.sin(psi);
        var result = [ cosTheta * cosPsi, cosPhi * sinPsi + sinPhi * sinTheta * cosPsi, sinPhi * sinPsi - cosPhi * sinTheta * cosPsi, 0, -cosTheta * sinPsi, cosPhi * cosPsi - sinPhi * sinTheta * sinPsi, sinPhi * cosPsi + cosPhi * sinTheta * sinPsi, 0, sinTheta, -sinPhi * cosTheta, cosPhi * cosTheta, 0, 0, 0, 0, 1 ];
        return result;
    };
    /**
     * Return a Matrix which represents an axis-angle rotation
     *
     * @name Matrix#rotateAxis
     * @function
     *
     * @param {Array.number} v unit vector representing the axis to rotate about
     * @param {number} theta radians to rotate clockwise about the axis
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateAxis = function(v, theta) {
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var verTheta = 1 - cosTheta;
        // versine of theta
        var xxV = v[0] * v[0] * verTheta;
        var xyV = v[0] * v[1] * verTheta;
        var xzV = v[0] * v[2] * verTheta;
        var yyV = v[1] * v[1] * verTheta;
        var yzV = v[1] * v[2] * verTheta;
        var zzV = v[2] * v[2] * verTheta;
        var xs = v[0] * sinTheta;
        var ys = v[1] * sinTheta;
        var zs = v[2] * sinTheta;
        var result = [ xxV + cosTheta, xyV + zs, xzV - ys, 0, xyV - zs, yyV + cosTheta, yzV + xs, 0, xzV + ys, yzV - xs, zzV + cosTheta, 0, 0, 0, 0, 1 ];
        return result;
    };
    /**
     * Return a Matrix which represents a transform matrix applied about
     * a separate origin point.
     * 
     * @name Matrix#aboutOrigin
     * @function
     *
     * @param {Array.number} v origin point to apply matrix
     * @param {Transform} m matrix to apply
     * @returns {Transform} the resulting matrix
     */
    Transform.aboutOrigin = function(v, m) {
        var t0 = v[0] - (v[0] * m[0] + v[1] * m[4] + v[2] * m[8]);
        var t1 = v[1] - (v[0] * m[1] + v[1] * m[5] + v[2] * m[9]);
        var t2 = v[2] - (v[0] * m[2] + v[1] * m[6] + v[2] * m[10]);
        return Transform.move(m, [ t0, t1, t2 ]);
    };
    /**
     * Return a Matrix's webkit css representation to be used with the
     *    CSS3 -webkit-transform style. 
     * @example: -webkit-transform: matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,716,243,0,1)
     *
     * @name Matrix#formatCSS
     * @function
     * 
     * @param {Transform} m a Famous matrix
     * @returns {string} matrix3d CSS style representation of the transform
     */
    Transform.formatCSS = function(m) {
        var result = "matrix3d(";
        for (var i = 0; i < 15; i++) {
            result += m[i] < 1e-6 && m[i] > -1e-6 ? "0," : m[i] + ",";
        }
        result += m[15] + ")";
        return result;
    };
    /**
     * Return a Matrix representation of a skew transformation
     *
     * @name Matrix#skew
     * @function
     * 
     * @param {number} psi radians skewed about the yz plane
     * @param {number} theta radians skewed about the xz plane
     * @param {number} phi radians skewed about the xy plane
     * @returns {Transform} the resulting matrix
     */
    Transform.skew = function(phi, theta, psi) {
        return [ 1, 0, 0, 0, Math.tan(psi), 1, 0, 0, Math.tan(theta), Math.tan(phi), 1, 0, 0, 0, 0, 1 ];
    };
    /**
     * Returns a perspective matrix
     *
     * @name Matrix#perspective
     * @function
     *
     * @param {number} focusZ z position of focal point
     * @returns {Transform} the resulting matrix
     */
    Transform.perspective = function(focusZ) {
        return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / focusZ, 0, 0, 0, 1 ];
    };
    /**
     * Return translation vector component of given Matrix
     * 
     * @name Matrix#getTranslate
     * @function
     *
     * @param {Transform} m matrix
     * @returns {Array.<number>} the translation vector [t_x, t_y, t_z]
     */
    Transform.getTranslate = function(m) {
        return [ m[12], m[13], m[14] ];
    };
    /**
     * Return inverse affine matrix for given Matrix. 
     * Note: This assumes m[3] = m[7] = m[11] = 0, and m[15] = 1. 
     *       Incorrect results if not invertable or preconditions not met.
     *
     * @name Matrix#inverse
     * @function
     * 
     * @param {Transform} m matrix
     * @returns {Transform} the resulting inverted matrix
     */
    Transform.inverse = function(m) {
        var result = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
        // only need to consider 3x3 section for affine
        var c0 = m[5] * m[10] - m[6] * m[9];
        var c1 = m[4] * m[10] - m[6] * m[8];
        var c2 = m[4] * m[9] - m[5] * m[8];
        var c4 = m[1] * m[10] - m[2] * m[9];
        var c5 = m[0] * m[10] - m[2] * m[8];
        var c6 = m[0] * m[9] - m[1] * m[8];
        var c8 = m[1] * m[6] - m[2] * m[5];
        var c9 = m[0] * m[6] - m[2] * m[4];
        var c10 = m[0] * m[5] - m[1] * m[4];
        var detM = m[0] * c0 - m[1] * c1 + m[2] * c2;
        var invD = 1 / detM;
        var result = [ invD * c0, -invD * c4, invD * c8, 0, -invD * c1, invD * c5, -invD * c9, 0, invD * c2, -invD * c6, invD * c10, 0, 0, 0, 0, 1 ];
        result[12] = -m[12] * result[0] - m[13] * result[4] - m[14] * result[8];
        result[13] = -m[12] * result[1] - m[13] * result[5] - m[14] * result[9];
        result[14] = -m[12] * result[2] - m[13] * result[6] - m[14] * result[10];
        return result;
    };
    /**
     * Returns the transpose of a 4x4 matrix
     *
     * @name Matrix#inverse
     * @function
     * 
     * @param {Transform} m matrix
     * @returns {Transform} the resulting transposed matrix
     */
    Transform.transpose = function(m) {
        return [ m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15] ];
    };
    /**
     * Decompose Matrix into separate .translate, .rotate, .scale,
     *    .skew components.
     *    
     * @name Matrix#interpret
     * @function
     *
     * @param {Matrix} M matrix
     * @returns {matrixSpec} object with component matrices .translate,
     *    .rotate, .scale, .skew
     */
    function _normSquared(v) {
        return v.length === 2 ? v[0] * v[0] + v[1] * v[1] : v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    }
    function _norm(v) {
        return Math.sqrt(_normSquared(v));
    }
    function _sign(n) {
        return n < 0 ? -1 : 1;
    }
    Transform.interpret = function(M) {
        // QR decomposition via Householder reflections
        //FIRST ITERATION
        //default Q1 to the identity matrix;
        var x = [ M[0], M[1], M[2] ];
        // first column vector
        var sgn = _sign(x[0]);
        // sign of first component of x (for stability)
        var xNorm = _norm(x);
        // norm of first column vector
        var v = [ x[0] + sgn * xNorm, x[1], x[2] ];
        // v = x + sign(x[0])|x|e1
        var mult = 2 / _normSquared(v);
        // mult = 2/v'v
        //bail out if our Matrix is singular
        if (mult >= Infinity) {
            return {
                translate: Transform.getTranslate(M),
                rotate: [ 0, 0, 0 ],
                scale: [ 0, 0, 0 ],
                skew: [ 0, 0, 0 ]
            };
        }
        //evaluate Q1 = I - 2vv'/v'v
        var Q1 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
        //diagonals
        Q1[0] = 1 - mult * v[0] * v[0];
        // 0,0 entry
        Q1[5] = 1 - mult * v[1] * v[1];
        // 1,1 entry
        Q1[10] = 1 - mult * v[2] * v[2];
        // 2,2 entry
        //upper diagonal
        Q1[1] = -mult * v[0] * v[1];
        // 0,1 entry
        Q1[2] = -mult * v[0] * v[2];
        // 0,2 entry
        Q1[6] = -mult * v[1] * v[2];
        // 1,2 entry
        //lower diagonal
        Q1[4] = Q1[1];
        // 1,0 entry
        Q1[8] = Q1[2];
        // 2,0 entry
        Q1[9] = Q1[6];
        // 2,1 entry
        //reduce first column of M
        var MQ1 = Transform.multiply(Q1, M);
        //SECOND ITERATION on (1,1) minor
        var x2 = [ MQ1[5], MQ1[6] ];
        var sgn2 = _sign(x2[0]);
        // sign of first component of x (for stability)
        var x2Norm = _norm(x2);
        // norm of first column vector
        var v2 = [ x2[0] + sgn2 * x2Norm, x2[1] ];
        // v = x + sign(x[0])|x|e1
        var mult2 = 2 / _normSquared(v2);
        // mult = 2/v'v
        //evaluate Q2 = I - 2vv'/v'v
        var Q2 = [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
        //diagonal
        Q2[5] = 1 - mult2 * v2[0] * v2[0];
        // 1,1 entry
        Q2[10] = 1 - mult2 * v2[1] * v2[1];
        // 2,2 entry
        //off diagonals
        Q2[6] = -mult2 * v2[0] * v2[1];
        // 2,1 entry
        Q2[9] = Q2[6];
        // 1,2 entry
        //calc QR decomposition. Q = Q1*Q2, R = Q'*M
        var Q = Transform.multiply(Q2, Q1);
        //note: really Q transpose
        var R = Transform.multiply(Q, M);
        //remove negative scaling
        var remover = Transform.scale(R[0] < 0 ? -1 : 1, R[5] < 0 ? -1 : 1, R[10] < 0 ? -1 : 1);
        R = Transform.multiply(R, remover);
        Q = Transform.multiply(remover, Q);
        //decompose into rotate/scale/skew matrices
        var result = {};
        result.translate = Transform.getTranslate(M);
        result.rotate = [ Math.atan2(-Q[6], Q[10]), Math.asin(Q[2]), Math.atan2(-Q[1], Q[0]) ];
        if (!result.rotate[0]) {
            result.rotate[0] = 0;
            result.rotate[2] = Math.atan2(Q[4], Q[5]);
        }
        result.scale = [ R[0], R[5], R[10] ];
        result.skew = [ Math.atan2(R[9], result.scale[2]), Math.atan2(R[8], result.scale[2]), Math.atan2(R[4], result.scale[0]) ];
        //double rotation workaround
        if (Math.abs(result.rotate[0]) + Math.abs(result.rotate[2]) > 1.5 * Math.PI) {
            result.rotate[1] = Math.PI - result.rotate[1];
            if (result.rotate[1] > Math.PI) result.rotate[1] -= 2 * Math.PI;
            if (result.rotate[1] < -Math.PI) result.rotate[1] += 2 * Math.PI;
            if (result.rotate[0] < 0) result.rotate[0] += Math.PI; else result.rotate[0] -= Math.PI;
            if (result.rotate[2] < 0) result.rotate[2] += Math.PI; else result.rotate[2] -= Math.PI;
        }
        return result;
    };
    /**
     * Weighted average between two matrices by averaging their
     *     translation, rotation, scale, skew components.
     *     f(M1,M2,t) = (1 - t) * M1 + t * M2
     *
     * @name Matrix#average
     * @function
     *
     * @param {Transform} M1 f(M1,M2,0) = M1
     * @param {Transform} M2 f(M1,M2,1) = M2
     * @param {number} t
     * @returns {Transform}
     */
    Transform.average = function(M1, M2, t) {
        t = t === undefined ? .5 : t;
        var specM1 = Transform.interpret(M1);
        var specM2 = Transform.interpret(M2);
        var specAvg = {
            translate: [ 0, 0, 0 ],
            rotate: [ 0, 0, 0 ],
            scale: [ 0, 0, 0 ],
            skew: [ 0, 0, 0 ]
        };
        for (var i = 0; i < 3; i++) {
            specAvg.translate[i] = (1 - t) * specM1.translate[i] + t * specM2.translate[i];
            specAvg.rotate[i] = (1 - t) * specM1.rotate[i] + t * specM2.rotate[i];
            specAvg.scale[i] = (1 - t) * specM1.scale[i] + t * specM2.scale[i];
            specAvg.skew[i] = (1 - t) * specM1.skew[i] + t * specM2.skew[i];
        }
        return Transform.build(specAvg);
    };
    /**
     * Compose .translate, .rotate, .scale, .skew components into into
     *    Matrix
     *    
     * @name Matrix#build
     * @function
     *
     * @param {matrixSpec} spec object with component matrices .translate,
     *    .rotate, .scale, .skew
     * @returns {Transform} composed martix
     */
    Transform.build = function(spec) {
        var scaleMatrix = Transform.scale(spec.scale[0], spec.scale[1], spec.scale[2]);
        var skewMatrix = Transform.skew(spec.skew[0], spec.skew[1], spec.skew[2]);
        var rotateMatrix = Transform.rotate(spec.rotate[0], spec.rotate[1], spec.rotate[2]);
        return Transform.move(Transform.multiply(rotateMatrix, skewMatrix, scaleMatrix), spec.translate);
    };
    /**
     * Determine if two affine Transforms are component-wise equal
     * Warning: breaks on perspective Transforms
     * 
     * @name Transform#equals
     * @function
     * 
     * @param {Transform} a matrix
     * @param {Transform} b matrix
     * @returns {boolean} 
     */
    Transform.equals = function(a, b) {
        return !Transform.notEquals(a, b);
    };
    /**
     * Determine if two affine Transforms are component-wise unequal
     * Warning: breaks on perspective Transforms
     *
     * @name Transform#notEquals
     * @name function
     *
     * @param {Transform} a matrix
     * @param {Transform} b matrix
     * @returns {boolean} 
     */
    Transform.notEquals = function(a, b) {
        if (a === b) return false;
        if (!(a && b)) return true;
        // shortci
        return !(a && b) || a[12] !== b[12] || a[13] !== b[13] || a[14] !== b[14] || a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2] || a[4] !== b[4] || a[5] !== b[5] || a[6] !== b[6] || a[8] !== b[8] || a[9] !== b[9] || a[10] !== b[10];
    };
    /**
     * Constrain angle-trio components to range of [-pi, pi).
     *
     * @name Matrix#normalizeRotation
     * @function
     * 
     * @param {Array.<number>} rotation phi, theta, psi (array of floats 
     *    && array.length == 3)
     * @returns {Array.<number>} new phi, theta, psi triplet
     *    (array of floats && array.length == 3)
     */
    Transform.normalizeRotation = function(rotation) {
        var result = rotation.slice(0);
        if (result[0] == Math.PI / 2 || result[0] == -Math.PI / 2) {
            result[0] = -result[0];
            result[1] = Math.PI - result[1];
            result[2] -= Math.PI;
        }
        if (result[0] > Math.PI / 2) {
            result[0] = result[0] - Math.PI;
            result[1] = Math.PI - result[1];
            result[2] -= Math.PI;
        }
        if (result[0] < -Math.PI / 2) {
            result[0] = result[0] + Math.PI;
            result[1] = -Math.PI - result[1];
            result[2] -= Math.PI;
        }
        while (result[1] < -Math.PI) result[1] += 2 * Math.PI;
        while (result[1] >= Math.PI) result[1] -= 2 * Math.PI;
        while (result[2] < -Math.PI) result[2] += 2 * Math.PI;
        while (result[2] >= Math.PI) result[2] -= 2 * Math.PI;
        return result;
    };
    module.exports = Transform;
}.bind(this));

require.register("famous_modules/famous/utilities/utility/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @namespace Utility
     *
     * TODO: combine with Utility.js into single utilities object?
     *
     * @description This namespace holds standalone functionality. 
     *    Currently includes 
     *    name mapping for transition curves, name mapping for origin 
     *    pairs, and the after() function.
     *    
     * @static
     * @name Utility
     */
    var Utility = {};
    /**
     * Transition curves mapping independent variable t from domain [0,1] to a
     *    range within [0,1]. Includes functions 'linear', 'easeIn', 'easeOut',
     *    'easeInOut', 'easeOutBounce', 'spring'.
     *
     *    TODO: move these into famous-transitions
     *    
     * @name Utility#curves
     * @deprecated
     * @field
     */
    Utility.Curve = {
        linear: function(t) {
            return t;
        },
        easeIn: function(t) {
            return t * t;
        },
        easeOut: function(t) {
            return t * (2 - t);
        },
        easeInOut: function(t) {
            if (t <= .5) return 2 * t * t; else return -2 * t * t + 4 * t - 1;
        },
        easeOutBounce: function(t) {
            return t * (3 - 2 * t);
        },
        spring: function(t) {
            return (1 - t) * Math.sin(6 * Math.PI * t) + t;
        }
    };
    Utility.Direction = {
        X: 0,
        Y: 1,
        Z: 2
    };
    /**
     * Table of strings mapping origin string types to origin pairs. Includes
     *    concepts of center and combinations of top, left, bottom, right, as
     *    'tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'.
     *
     *    TODO: move these into famous-transitions
     *
     * @name Utility#Origin
     * @deprecated
     * @field
     */
    Utility.Origin = {
        tl: [ 0, 0 ],
        t: [ .5, 0 ],
        tr: [ 1, 0 ],
        l: [ 0, .5 ],
        c: [ .5, .5 ],
        r: [ 1, .5 ],
        bl: [ 0, 1 ],
        b: [ .5, 1 ],
        br: [ 1, 1 ]
    };
    /** 
     * Return wrapper around callback function. Once the wrapper is called N
     *    times, invoke the callback function. Arguments and scope preserved.
     *    
     * @name Utility#after
     * @function 
     * @param {number} count number of calls before callback function invoked
     * @param {Function} callback wrapped callback function
     */
    Utility.after = function(count, callback) {
        var counter = count;
        return function() {
            counter--;
            if (counter === 0) callback.apply(this, arguments);
        };
    };
    /**
     * Load a URL and return its contents in a callback
     * 
     * @name Utility#loadURL
     * @function
     * @param {string} url URL of object
     * @param {function} callback callback to dispatch with content
     */
    Utility.loadURL = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (callback) callback(this.responseText);
            }
        };
        xhr.open("GET", url);
        xhr.send();
    };
    //TODO: can this be put into transform.js
    /** @const */
    Utility.transformInFrontMatrix = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1 ];
    Utility.transformInFront = {
        modify: function(input) {
            return {
                transform: Utility.transformInFrontMatrix,
                target: input
            };
        }
    };
    //TODO: can this be put into transform.js
    /** @const */
    Utility.transformBehindMatrix = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 1 ];
    Utility.transformBehind = {
        modify: function(input) {
            return {
                transform: Utility.transformBehindMatrix,
                target: input
            };
        }
    };
    /**
     * Create a new component based on an existing component configured with custom options
     *
     * @name Utility#customizeComponent
     * @function
     * @param {Object} component Base component class
     * @param {Object} customOptions Options to apply
     * @param {function} initialize Initialization function to run on creation
     * @returns {Object} customized component
     * @deprecated
     */
    Utility.customizeComponent = function(component, customOptions, initialize) {
        var result = function(options) {
            component.call(this, customOptions);
            if (options) this.setOptions(options);
            if (initialize) initialize.call(this);
        };
        result.prototype = Object.create(component.prototype);
        return result;
    };
    /**
     * Create a document fragment from a string of HTML
     *
     * @name Utility#createDocumentFragmentFromHTML
     * @function
     * @param {string} html HTML to convert to DocumentFragment
     * @returns {DocumentFragment} DocumentFragment representing input HTML
     */
    Utility.createDocumentFragmentFromHTML = function(html) {
        var element = document.createElement("div");
        element.innerHTML = html;
        var result = document.createDocumentFragment();
        while (element.hasChildNodes()) result.appendChild(element.firstChild);
        return result;
    };
    /**
     * @deprecated
     */
    Utility.rad2deg = function(rad) {
        return rad * 57.2957795;
    };
    /**
     * @deprecated
     */
    Utility.deg2rad = function(deg) {
        return deg * .0174532925;
    };
    /**
     * @deprecated
     */
    Utility.distance = function(x1, y1, x2, y2) {
        var deltaX = x2 - x1;
        var deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    };
    /**
     * @deprecated
     */
    Utility.distance3D = function(x1, y1, z1, x2, y2, z2) {
        var deltaX = x2 - x1;
        var deltaY = y2 - y1;
        var deltaZ = z2 - z1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    };
    //TODO: can this use inRange, outRange arrays instead
    Utility.map = function(value, inputMin, inputMax, outputMin, outputMax, clamp) {
        var outValue = (value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin;
        if (clamp) {
            if (outputMax > outputMin) {
                if (outValue > outputMax) {
                    outValue = outputMax;
                } else if (outValue < outputMin) {
                    outValue = outputMin;
                }
            } else {
                if (outValue < outputMax) {
                    outValue = outputMax;
                } else if (outValue > outputMin) {
                    outValue = outputMin;
                }
            }
        }
        return outValue;
    };
    //TODO: can this be put into the matrix library?
    /**
     * @deprecated
     */
    Utility.perspective = function(fovy, aspect, near, far) {
        var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
        return [ f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0 ];
    };
    //TODO: can this be put into the matrix library?
    /**
     * @deprecated
     */
    Utility.ortho = function(left, right, bottom, top, near, far) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(far + near) / (far - near);
        return [ 2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, -2 / (far - near), -1, tx, ty, tz, 1 ];
    };
    //TODO: can this be put into the matrix library?
    /**
     * @deprecated
     */
    Utility.normalFromFM = function(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    };
    //TODO: convert to min/max array
    Utility.clamp = function(v, min, max) {
        return Math.max(Math.min(v, max), min);
    };
    /**
     * @deprecated
     */
    Utility.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    };
    /**
     * @deprecated
     */
    Utility.extend = function(a, b) {
        for (var key in b) {
            a[key] = b[key];
        }
        return a;
    };
    Utility.getDevicePixelRatio = function() {
        return window.devicePixelRatio ? window.devicePixelRatio : 1;
    };
    /**
     * @deprecated
     */
    Utility.supportsWebGL = function() {
        return /Android|Chrome|Mozilla/i.test(navigator.appCodeName) && !!window.WebGLRenderingContext && !/iPhone|iPad|iPod/i.test(navigator.userAgent);
    };
    /**
     * @deprecated
     */
    Utility.getSurfacePosition = function getSurfacePosition(surface) {
        var currTarget = surface._currTarget;
        var totalDist = [ 0, 0, 0 ];
        function getAllTransforms(elem) {
            var transform = getTransform(elem);
            if (transform !== "" && transform !== undefined) {
                var offset = parseTransform(transform);
                totalDist[0] += offset[0];
                totalDist[1] += offset[1];
                totalDist[2] += offset[2];
            }
            if (elem.parentElement !== document.body) {
                getAllTransforms(elem.parentNode);
            }
        }
        function parseTransform(transform) {
            var translate = [];
            transform = removeMatrix3d(transform);
            translate[0] = parseInt(transform[12].replace(" ", ""));
            translate[1] = parseInt(transform[13].replace(" ", ""));
            translate[2] = parseInt(transform[14].replace(" ", ""));
            for (var i = 0; i < translate.length; i++) {
                if (typeof translate[i] == "undefined") {
                    translate[i] = 0;
                }
            }
            return translate;
        }
        function removeMatrix3d(mtxString) {
            mtxString = mtxString.replace("matrix3d(", "");
            mtxString = mtxString.replace(")", "");
            return mtxString.split(",");
        }
        function getTransform(elem) {
            var transform = elem["style"]["webkitTransform"] || elem["style"]["transform"];
            return transform;
        }
        if (currTarget) {
            getAllTransforms(currTarget);
        } else {
            return undefined;
        }
        return totalDist;
    };
    /**
     * @deprecated
     */
    Utility.hasUserMedia = function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };
    /**
     * @deprecated
     */
    Utility.getUserMedia = function() {
        return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    };
    /**
     * @deprecated
     */
    Utility.isWebkit = function() {
        return !!window.webkitURL;
    };
    /**
     * @deprecated
     */
    Utility.isAndroid = function() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    };
    /**
     * @deprecated
     */
    Utility.hasLocalStorage = function() {
        return !!window.localStorage;
    };
    /**
     * TODO: move to time utilities library
     * @deprecated
     */
    Utility.timeSince = function(time) {
        var now = Date.now();
        var difference = now - time;
        var minute = 6e4;
        var hour = 60 * minute;
        var day = 24 * hour;
        if (difference < minute) {
            return "Just Now";
        } else if (difference < hour) {
            var minutes = ~~(difference / minute);
            return minutes + "m";
        } else if (difference < day) {
            var hours = ~~(difference / hour);
            return hours + "h";
        } else {
            var days = ~~(difference / day);
            return days + "d";
        }
    };
    module.exports = Utility;
}.bind(this));

require.register("famous_modules/famous/transitions/multiple-transition/_git_modularized/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    /**
     * @class Multiple value transition method
     * @description Transition meta-method to support transitioning multiple 
     *   values with scalar-only methods
     *
     * @name MultipleTransition
     * @constructor
     *
     * @param {Object} method Transionable class to multiplex
     */
    function MultipleTransition(method) {
        this.method = method;
        this._instances = [];
        this.state = [];
    }
    MultipleTransition.SUPPORTS_MULTIPLE = true;
    MultipleTransition.prototype.get = function() {
        for (var i = 0; i < this._instances.length; i++) {
            this.state[i] = this._instances[i].get();
        }
        return this.state;
    };
    MultipleTransition.prototype.set = function(endState, transition, callback) {
        var _allCallback = Utility.after(endState.length, callback);
        for (var i = 0; i < endState.length; i++) {
            if (!this._instances[i]) this._instances[i] = new this.method();
            this._instances[i].set(endState[i], transition, _allCallback);
        }
    };
    MultipleTransition.prototype.reset = function(startState) {
        for (var i = 0; i < startState.length; i++) {
            if (!this._instances[i]) this._instances[i] = new this.method();
            this._instances[i].reset(startState[i]);
        }
    };
    module.exports = MultipleTransition;
}.bind(this));

require.register("famous_modules/famous/transitions/tween-transition/_git_modularized/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    /**
     *
     * @class A state maintainer for a smooth transition between 
     *    numerically-specified states. 
     *
     * @description  Example numeric states include floats or
     *    {@link FamousMatrix} objects. TweenTransitions form the basis
     *    of {@link FamousTransform} objects.
     *
     * An initial state is set with the constructor or set(startValue). A
     *    corresponding end state and transition are set with set(endValue,
     *    transition). Subsequent calls to set(endValue, transition) begin at
     *    the last state. Calls to get(timestamp) provide the _interpolated state
     *    along the way.
     *
     * Note that there is no event loop here - calls to get() are the only way
     *    to find out state projected to the current (or provided) time and are
     *    the only way to trigger callbacks. Usually this kind of object would
     *    be part of the render() path of a visible component.
     *
     * @name TweenTransition
     * @constructor
     *   
     * @param {number|Array.<number>|Object.<number|string, number>} start 
     *    beginning state
     */
    function TweenTransition(options) {
        this.options = Object.create(TweenTransition.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);
        this._startTime = 0;
        this._startValue = 0;
        this._updateTime = 0;
        this._endValue = 0;
        this._curve = undefined;
        this._duration = 0;
        this._active = false;
        this._callback = undefined;
        this.state = 0;
        this.velocity = undefined;
    }
    TweenTransition.SUPPORTS_MULTIPLE = true;
    TweenTransition.DEFAULT_OPTIONS = {
        curve: Utility.Curve.linear,
        duration: 500,
        speed: 0
    };
    var registeredCurves = {};
    /**
     * Add "unit" curve to internal dictionary of registered curves.
     * 
     * @name TweenTransition#registerCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @param {unitCurve} curve function of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     * @returns {boolean} false if key is taken, else true
     */
    TweenTransition.registerCurve = function(curveName, curve) {
        if (!registeredCurves[curveName]) {
            registeredCurves[curveName] = curve;
            return true;
        } else {
            return false;
        }
    };
    /**
     * Remove object with key "curveName" from internal dictionary of registered
     *    curves.
     * 
     * @name TweenTransition#unregisterCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @returns {boolean} false if key has no dictionary value
     */
    TweenTransition.unregisterCurve = function(curveName) {
        if (registeredCurves[curveName]) {
            delete registeredCurves[curveName];
            return true;
        } else {
            return false;
        }
    };
    /**
     * Retrieve function with key "curveName" from internal dictionary of
     *    registered curves. Default curves are defined in the 
     *    {@link Utility.Curve} array, where the values represent {@link
     *    unitCurve} functions.
     *    
     * @name TweenTransition#getCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @returns {unitCurve} curve function of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     */
    TweenTransition.getCurve = function(curveName) {
        return registeredCurves[curveName];
    };
    /**
     * Retrieve all available curves.
     *    
     * @name TweenTransition#getCurves
     * @function
     * @static
     * 
     * @returns {object} curve functions of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     */
    TweenTransition.getCurves = function() {
        return registeredCurves;
    };
    /**
     * Interpolate: If a linear function f(0) = a, f(1) = b, then return f(t)
     *
     * 
     * @name _interpolate
     * @function
     * @static
     * @private 
     * @param {number} a f(0) = a
     * @param {number} b f(1) = b
     * @param {number} t independent variable 
     * @returns {number} f(t) assuming f is linear
     */
    function _interpolate(a, b, t) {
        return (1 - t) * a + t * b;
    }
    function _clone(obj) {
        if (obj instanceof Object) {
            if (obj instanceof Array) return obj.slice(0); else return Object.create(obj);
        } else return obj;
    }
    /**
     * Fill in missing properties in "transition" with those in defaultTransition, and
     *    convert internal named curve to function object, returning as new
     *    object.
     *    
     * 
     * @name _normalize
     * @function
     * @static
     * @private
     * 
     * @param {transition} transition shadowing transition
     * @param {transition} defaultTransition transition with backup properties
     * @returns {transition} newly normalized transition
     */
    function _normalize(transition, defaultTransition) {
        var result = {
            curve: defaultTransition.curve
        };
        if (defaultTransition.duration) result.duration = defaultTransition.duration;
        if (defaultTransition.speed) result.speed = defaultTransition.speed;
        if (transition instanceof Object) {
            if (transition.duration !== undefined) result.duration = transition.duration;
            if (transition.curve) result.curve = transition.curve;
            if (transition.speed) result.speed = transition.speed;
        }
        if (typeof result.curve === "string") result.curve = TweenTransition.getCurve(result.curve);
        return result;
    }
    /**
     * Copy object to internal "default" transition. Missing properties in
     *    provided transitions inherit from this default.
     * 
     * @name TweenTransition#setOptions
     * @function
     *    
     * @param {transition} transition {duration: number, curve: f[0,1] -> [0,1]}
     */
    TweenTransition.prototype.setOptions = function(options) {
        if (options.curve !== undefined) this.options.curve = options.curve;
        if (options.duration !== undefined) this.options.duration = options.duration;
        if (options.speed !== undefined) this.options.speed = options.speed;
    };
    /**
     * Add transition to end state to the queue of pending transitions. Special
     *    Use: calling without a transition resets the object to that state with
     *    no pending actions
     * 
     * @name TweenTransition#set
     * @function
     *    
     * @param {number|FamousMatrix|Array.<number>|Object.<number, number>} endValue
     *    end state to which we _interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be 
     *    instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    TweenTransition.prototype.set = function(endValue, transition, callback) {
        if (!transition) {
            this.reset(endValue);
            if (callback) callback();
            return;
        }
        this._startValue = _clone(this.get());
        transition = _normalize(transition, this.options);
        if (transition.speed) {
            var startValue = this._startValue;
            if (startValue instanceof Object) {
                var variance = 0;
                for (var i in startValue) variance += (endValue[i] - startValue[i]) * (endValue[i] - startValue[i]);
                transition.duration = Math.sqrt(variance) / transition.speed;
            } else {
                transition.duration = Math.abs(endValue - startValue) / transition.speed;
            }
        }
        this._startTime = Date.now();
        this._endValue = _clone(endValue);
        this._startVelocity = _clone(transition.velocity);
        this._duration = transition.duration;
        this._curve = transition.curve;
        this._active = true;
        this._callback = callback;
    };
    /**
     * Cancel all transitions and reset to a stable state
     *
     * @name TweenTransition#reset
     * @function
     *
     * @param {number|Array.<number>|Object.<number, number>} startValue
     *    stable state to set to
     */
    TweenTransition.prototype.reset = function(startValue, startVelocity) {
        if (this._callback) {
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        this.state = _clone(startValue);
        this.velocity = _clone(startVelocity);
        this._startTime = 0;
        this._duration = 0;
        this._updateTime = 0;
        this._startValue = this.state;
        this._startVelocity = this.velocity;
        this._endValue = this.state;
        this._active = false;
    };
    TweenTransition.prototype.getVelocity = function() {
        return this.velocity;
    };
    /**
     * Get _interpolated state of current action at provided time. If the last
     *    action has completed, invoke its callback.
     * 
     * @name TweenTransition#get
     * @function
     *    
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     * @returns {number|Object.<number|string, number>} beginning state
     *    _interpolated to this point in time.
     */
    TweenTransition.prototype.get = function(timestamp) {
        this.update(timestamp);
        return this.state;
    };
    /**
     * Update internal state to the provided timestamp. This may invoke the last
     *    callback and begin a new action.
     * 
     * @name TweenTransition#update
     * @function
     * 
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     */
    function _calculateVelocity(current, start, curve, duration, t) {
        var velocity;
        var eps = 1e-7;
        var speed = (curve(t) - curve(t - eps)) / eps;
        if (current instanceof Array) {
            velocity = [];
            for (var i = 0; i < current.length; i++) velocity[i] = speed * (current[i] - start[i]) / duration;
        } else velocity = speed * (current - start) / duration;
        return velocity;
    }
    function _calculateState(start, end, t) {
        var state;
        if (start instanceof Array) {
            state = [];
            for (var i = 0; i < start.length; i++) state[i] = _interpolate(start[i], end[i], t);
        } else state = _interpolate(start, end, t);
        return state;
    }
    TweenTransition.prototype.update = function(timestamp) {
        if (!this._active) {
            if (this._callback) {
                var callback = this._callback;
                this._callback = undefined;
                callback();
            }
            return;
        }
        if (!timestamp) timestamp = Date.now();
        if (this._updateTime >= timestamp) return;
        this._updateTime = timestamp;
        var timeSinceStart = timestamp - this._startTime;
        if (timeSinceStart >= this._duration) {
            this.state = this._endValue;
            this.velocity = _calculateVelocity(this.state, this._startValue, this._curve, this._duration, 1);
            this._active = false;
        } else if (timeSinceStart < 0) {
            this.state = this._startValue;
            this.velocity = this._startVelocity;
        } else {
            var t = timeSinceStart / this._duration;
            this.state = _calculateState(this._startValue, this._endValue, this._curve(t));
            this.velocity = _calculateVelocity(this.state, this._startValue, this._curve, this._duration, t);
        }
    };
    /**
     * Is there at least one action pending completion?
     * 
     * @name TweenTransition#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    TweenTransition.prototype.isActive = function() {
        return this._active;
    };
    /**
     * Halt transition at current state and erase all pending actions.
     * 
     * @name TweenTransition#halt
     * @function
     */
    TweenTransition.prototype.halt = function() {
        this.reset(this.get());
    };
    /* Register all the default curves */
    TweenTransition.registerCurve("linear", Utility.Curve.linear);
    TweenTransition.registerCurve("easeIn", Utility.Curve.easeIn);
    TweenTransition.registerCurve("easeOut", Utility.Curve.easeOut);
    TweenTransition.registerCurve("easeInOut", Utility.Curve.easeInOut);
    TweenTransition.registerCurve("easeOutBounce", Utility.Curve.easeOutBounce);
    TweenTransition.registerCurve("spring", Utility.Curve.spring);
    TweenTransition.customCurve = function(v1, v2) {
        v1 = v1 || 0;
        v2 = v2 || 0;
        return function(t) {
            return v1 * t + (-2 * v1 - v2 + 3) * t * t + (v1 + v2 - 2) * t * t * t;
        };
    };
    module.exports = TweenTransition;
}.bind(this));

require.register("famous_modules/famous/transitions/transitionable/_git_modularized/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    var MultipleTransition = require("famous/transitions/multiple-transition");
    var TweenTransition = require("famous/transitions/tween-transition");
    /**
     *
     * @class Transitionable 
     *
     * @description  An engineInstance maintainer for a smooth transition between 
     *    numerically-specified engineInstances. Example numeric engineInstances include floats or
     *    {@link FamousMatrix} objects. Transitionables form the basis
     *    of {@link FamousTransform} objects.
     *
     * An initial engineInstance is set with the constructor or set(startState). A
     *    corresponding end engineInstance and transition are set with set(endState,
     *    transition). Subsequent calls to set(endState, transition) begin at
     *    the last engineInstance. Calls to get(timestamp) provide the interpolated engineInstance
     *    along the way.
     *
     * Note that there is no event loop here - calls to get() are the only way
     *    to find engineInstance projected to the current (or provided) time and are
     *    the only way to trigger callbacks. Usually this kind of object would
     *    be part of the render() path of a visible component.
     * 
     * @name Transitionable
     * @constructor
     * @example 
     *   function FamousFader(engineInstance, transition) { 
     *     if(typeof engineInstance == 'undefined') engineInstance = 0; 
     *     if(typeof transition == 'undefined') transition = true; 
     *     this.transitionHelper = new Transitionable(engineInstance);
     *     this.transition = transition; 
     *   }; 
     *   
     *   FamousFader.prototype = { 
     *     show: function(callback) { 
     *       this.set(1, this.transition, callback); 
     *     }, 
     *     hide: function(callback) { 
     *       this.set(0, this.transition, callback); 
     *     }, 
     *     set: function(engineInstance, transition, callback) { 
     *       this.transitionHelper.halt();
     *       this.transitionHelper.set(engineInstance, transition, callback); 
     *     }, 
     *     render: function(target) { 
     *       var currOpacity = this.transitionHelper.get();
     *       return {opacity: currOpacity, target: target}; 
     *     } 
     *   };
     *   
     * @param {number|Array.<number>|Object.<number|string, number>} start 
     *    beginning engineInstance
     */
    function Transitionable(start) {
        this.currentAction = null;
        this.actionQueue = [];
        this.callbackQueue = [];
        this.state = 0;
        this.velocity = undefined;
        this._callback = undefined;
        this._engineInstance = null;
        this._currentMethod = null;
        this.set(start);
    }
    var transitionMethods = {};
    Transitionable.registerMethod = function(name, engineClass) {
        if (!(name in transitionMethods)) {
            transitionMethods[name] = engineClass;
            return true;
        } else return false;
    };
    Transitionable.unregisterMethod = function(name) {
        if (name in transitionMethods) {
            delete transitionMethods[name];
            return true;
        } else return false;
    };
    function _loadNext() {
        if (this._callback) {
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        if (this.actionQueue.length <= 0) {
            this.set(this.get());
            // no update required
            return;
        }
        this.currentAction = this.actionQueue.shift();
        this._callback = this.callbackQueue.shift();
        var method = null;
        var endValue = this.currentAction[0];
        var transition = this.currentAction[1];
        if (transition instanceof Object && transition.method) {
            method = transition.method;
            if (typeof method === "string") method = transitionMethods[method];
        } else {
            method = TweenTransition;
        }
        if (this._currentMethod !== method) {
            if (!(endValue instanceof Object) || method.SUPPORTS_MULTIPLE === true || endValue.length <= method.SUPPORTS_MULTIPLE) {
                this._engineInstance = new method();
            } else {
                this._engineInstance = new MultipleTransition(method);
            }
            this._currentMethod = method;
        }
        this._engineInstance.reset(this.state, this.velocity);
        if (this.velocity !== undefined) transition.velocity = this.velocity;
        this._engineInstance.set(endValue, transition, _loadNext.bind(this));
    }
    /**
     * Add transition to end engineInstance to the queue of pending transitions. Special
     *    Use: calling without a transition resets the object to that engineInstance with
     *    no pending actions
     * 
     * @name Transitionable#set
     * @function
     *    
     * @param {number|FamousMatrix|Array.<number>|Object.<number, number>} endState
     *    end engineInstance to which we interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be 
     *    instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Transitionable.prototype.set = function(endState, transition, callback) {
        if (!transition) {
            this.reset(endState);
            if (callback) callback();
            return this;
        }
        var action = [ endState, transition ];
        this.actionQueue.push(action);
        this.callbackQueue.push(callback);
        if (!this.currentAction) _loadNext.call(this);
        return this;
    };
    /**
     * Cancel all transitions and reset to a stable engineInstance
     *
     * @name Transitionable#reset
     * @function
     *
     * @param {number|Array.<number>|Object.<number, number>} startState
     *    stable engineInstance to set to
     */
    Transitionable.prototype.reset = function(startState, startVelocity) {
        this._currentMethod = null;
        this._engineInstance = null;
        this.state = startState;
        this.velocity = startVelocity;
        this.currentAction = null;
        this.actionQueue = [];
        this.callbackQueue = [];
    };
    /**
     * Add delay action to the pending action queue queue.
     * 
     * @name Transitionable#delay
     * @function
     * 
     * @param {number} duration delay time (ms)
     * @param {function()} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Transitionable.prototype.delay = function(duration, callback) {
        this.set(this._engineInstance.get(), {
            duration: duration,
            curve: function() {
                return 0;
            }
        }, callback);
    };
    /**
     * Get interpolated engineInstance of current action at provided time. If the last
     *    action has completed, invoke its callback. TODO: What if people want
     *    timestamp == 0?
     * 
     * @name Transitionable#get
     * @function
     *    
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     * @returns {number|Object.<number|string, number>} beginning engineInstance
     *    interpolated to this point in time.
     */
    Transitionable.prototype.get = function(timestamp) {
        if (this._engineInstance) {
            if (this._engineInstance.getVelocity) this.velocity = this._engineInstance.getVelocity();
            this.state = this._engineInstance.get(timestamp);
        }
        return this.state;
    };
    /**
     * Is there at least one action pending completion?
     * 
     * @name Transitionable#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    Transitionable.prototype.isActive = function() {
        return !!this.currentAction;
    };
    /**
     * Halt transition at current engineInstance and erase all pending actions.
     * 
     * @name Transitionable#halt
     * @function
     */
    Transitionable.prototype.halt = function() {
        this.set(this.get());
    };
    module.exports = Transitionable;
}.bind(this));

require.register("famous_modules/famous/modifier/_git_modularized/index.js", function(exports, require, module) {
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var Utility = require("famous/utilities/utility");
    /**
     *
     * @class Modifier
     *
     * @description A collection of visual changes to be
     *    applied to another renderable component. This collection includes a
     *    transform matrix, an opacity constant, and an origin specifier. These
     *    are all managed separately inside this object, and each operates
     *    independently. Modifier objects can be linked within any context or view
     *    capable of displaying renderables. Objects' subsequent siblings and children
     *    are transformed by the amounts specified in the modifier's properties.
     *
     * Renaming suggestion: Change parameters named "transform" to 
     * "transformMatrix" in here.
     *    
     * @name Modifier
     * @constructor
     * @example
     *   var Engine         = require('famous/Engine');
     *   var FamousSurface  = require('famous/Surface');
     *   var Modifier       = require('famous/Modifier');
     *   var FM             = require('famous/Matrix');
     *
     *   var Context = Engine.createContext();
     *
     *   var surface = new FamousSurface({
     *       size: [200,200],
     *       properties: {
     *           backgroundColor: '#3cf'
     *       },
     *       content: 'test'
     *   });
     *   
     *   var modifier = new Modifier({
     *       origin: [0,0],
     *       transform: FM.translate(400,0,0)
     *   })
     *
     *   Context.link(modifier).link(surface);
     */
    function Modifier(opts) {
        var transform = Transform.identity;
        var opacity = 1;
        var origin = undefined;
        var size = undefined;
        /* maintain backwards compatibility for scene compiler */
        if (arguments.length > 1 || arguments[0] instanceof Array) {
            if (arguments[0] !== undefined) transform = arguments[0];
            if (arguments[1] !== undefined) opacity = arguments[1];
            origin = arguments[2];
            size = arguments[3];
        } else if (opts) {
            if (opts.transform) transform = opts.transform;
            if (opts.opacity !== undefined) opacity = opts.opacity;
            if (opts.origin) origin = opts.origin;
            if (opts.size) size = opts.size;
        }
        this.transformTranslateState = new Transitionable([ 0, 0, 0 ]);
        this.transformRotateState = new Transitionable([ 0, 0, 0 ]);
        this.transformSkewState = new Transitionable([ 0, 0, 0 ]);
        this.transformScaleState = new Transitionable([ 1, 1, 1 ]);
        this.opacityState = new Transitionable(opacity);
        this.originState = new Transitionable([ 0, 0 ]);
        this.sizeState = new Transitionable([ 0, 0 ]);
        this._originEnabled = false;
        this._sizeEnabled = false;
        this.setTransform(transform);
        this.setOpacity(opacity);
        this.setOrigin(origin);
        this.setSize(size);
    }
    /**
     * Get current interpolated positional transform matrix at this point in
     *    time.
     * (Scope: Component developers and deeper)
     *
     * @name Modifier#getTransform
     * @function
     *  
     * @returns {FamousMatrix} webkit-compatible positional transform matrix.
     */
    Modifier.prototype.getTransform = function() {
        if (this.isActive()) {
            return Transform.build({
                translate: this.transformTranslateState.get(),
                rotate: this.transformRotateState.get(),
                skew: this.transformSkewState.get(),
                scale: this.transformScaleState.get()
            });
        } else return this.getFinalTransform();
    };
    /**
     * Get most recently provided end state positional transform matrix.
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#getFinalTransform
     * @function
     * 
     * @returns {FamousMatrix} webkit-compatible positional transform matrix.
     */
    Modifier.prototype.getFinalTransform = function() {
        return this._finalTransform;
    };
    /**
     * Add positional transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions Note: If we called setTransform in that "start state" way,
     *    then called with a transition, we begin form that start state.
     * 
     * @name Modifier#setTransform
     * @function
     *    
     * @param {FamousMatrix} transform end state positional transformation to
     *    which we interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setTransform = function(transform, transition, callback) {
        var _callback = callback ? Utility.after(4, callback) : undefined;
        if (transition) {
            if (this._transformDirty) {
                var startState = Transform.interpret(this.getFinalTransform());
                this.transformTranslateState.set(startState.translate);
                this.transformRotateState.set(startState.rotate);
                this.transformSkewState.set(startState.skew);
                this.transformScaleState.set(startState.scale);
                this._transformDirty = false;
            }
            var endState = Transform.interpret(transform);
            this.transformTranslateState.set(endState.translate, transition, _callback);
            this.transformRotateState.set(endState.rotate, transition, _callback);
            this.transformSkewState.set(endState.skew, transition, _callback);
            this.transformScaleState.set(endState.scale, transition, _callback);
        } else {
            this.transformTranslateState.halt();
            this.transformRotateState.halt();
            this.transformSkewState.halt();
            this.transformScaleState.halt();
            this._transformDirty = true;
        }
        this._finalTransform = transform;
    };
    /**
     * Get current interpolated opacity constant at this point in time.
     * 
     * @name Modifier#getOpacity
     * @function
     * 
     * @returns {number} interpolated opacity number. float w/ range [0..1]
     */
    Modifier.prototype.getOpacity = function() {
        return this.opacityState.get();
    };
    /**
     * Add opacity transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions.
     * 
     * @name Modifier#setOpacity
     * @function
     *    
     * @param {number} opacity end state opacity constant to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. If undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setOpacity = function(opacity, transition, callback) {
        this.opacityState.set(opacity, transition, callback);
    };
    /**
     * Get current interpolated origin pair at this point in time.
     *
     * @returns {Array.<number>} interpolated origin pair
     */
    Modifier.prototype.getOrigin = function() {
        return this._originEnabled ? this.originState.get() : undefined;
    };
    /**
     * Add origin transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions
     * 
     * @name Modifier#setOrigin
     * @function
     *    
     * @param {Array.<number>} origin end state origin pair to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. if undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setOrigin = function(origin, transition, callback) {
        this._originEnabled = !!origin;
        if (!origin) origin = [ 0, 0 ];
        if (!(origin instanceof Array)) origin = Utility.origins[origin];
        this.originState.set(origin, transition, callback);
    };
    /**
     * Get current interpolated size at this point in time.
     *
     * @returns {Array.<number>} interpolated size
     */
    Modifier.prototype.getSize = function() {
        return this._sizeEnabled ? this.sizeState.get() : undefined;
    };
    /**
     * Add size transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions
     * 
     * @name Modifier#setSize
     * @function
     *    
     * @param {Array.<number>} size end state size to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. if undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setSize = function(size, transition, callback) {
        this._sizeEnabled = !!size;
        if (!size) size = [ 0, 0 ];
        this.sizeState.set(size, transition, callback);
    };
    /**
     * Copy object to internal "default" transition. Missing properties in
     *    provided transitions inherit from this default.
     * 
     * (Scope: Component developers and deeper)
     * @name Modifier#setDefaultTransition
     * @function
     *    
     * @param {transition} transition {duration: number, curve: f[0,1] -> [0,1]}
     */
    Modifier.prototype.setDefaultTransition = function(transition) {
        this.transformTranslateState.setDefault(transition);
        this.transformRotateState.setDefault(transition);
        this.transformSkewState.setDefault(transition);
        this.transformScaleState.setDefault(transition);
        this.opacityState.setDefault(transition);
        this.originState.setDefault(transition);
        this.sizeState.setDefault(transition);
    };
    /**
     * Halt the entire transformation at current state.
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#halt
     * @function
     */
    Modifier.prototype.halt = function() {
        this.transformTranslateState.halt();
        this.transformRotateState.halt();
        this.transformSkewState.halt();
        this.transformScaleState.halt();
        this.opacityState.halt();
        this.originState.halt();
        this.sizeState.halt();
    };
    /**
     * Have we reached our end state in the motion transform?
     * 
     * @name Modifier#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    Modifier.prototype.isActive = function() {
        return this.transformTranslateState.isActive() || this.transformRotateState.isActive() || this.transformSkewState.isActive() || this.transformScaleState.isActive();
    };
    /**
     * * Return {@renderSpec} for this Modifier, applying to the provided
     *    target component. The transform will be applied to the entire target
     *    tree in the following way: 
     *    * Positional Matrix (this.getTransform) - Multiplicatively 
     *    * Opacity (this.getOpacity) - Applied multiplicatively.
     *    * Origin (this.getOrigin) - Children shadow parents
     *
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#modify
     * @function
     * 
     * @param {renderSpec} target (already rendered) renderable component to
     *    which to apply the transform.
     * @returns {renderSpec} render spec for this Modifier, including the
     *    provided target
     */
    Modifier.prototype.modify = function(target) {
        return {
            transform: this.getTransform(),
            opacity: this.getOpacity(),
            origin: this.getOrigin(),
            size: this.getSize(),
            target: target
        };
    };
    module.exports = Modifier;
}.bind(this));

require.register("famous_modules/famous/animation/easing/_git_modularized/index.js", function(exports, require, module) {
    /*
     *  EasingNameNorm: 
     *  @param {float} t: (time) expects a number between 0 and 1.
     *  @returns {float}: between 0 and 1, based on the curve.
     *  NOTE: Can only use Norm functions with FamousTransforms, passed in as a curve.
     *
     *  @example:
     *  var curve = { 
     *      curve: Easing.inOutBackNorm,
     *      duration: 500
     *  }
     *  yourTransform.setTransform(FM.identity, curve);
     *
     *  This would animate over 500 milliseconds back to [0, 0, 0]
     *
     *      
     *  EasingName: 
     *  @param {float} t: current normalized time: expects a number between 0 and 1.
     *
     *  @param {float} b: start value
     *
     *  @param {float} c: the total change of the easing function.
     * 
     *  @param {float} d: the duration of the tween, normally left at 1.
     *
     *  @returns {float}: number between b and b+c;
     *
     *  Most often used with the Animation engine:
     *  @example:
     *  animation.update = function() {
     *      someFunction.set(Easing.inOutCubic(this.getTime(), 0, 1000, 1.0)); 
     *  }
     *
     *  this would output numbers between 0 and 1000.
     *
     */
    var Easing = {
        linear: function(t, b, c, d) {
            return t * (c / d) + b;
        },
        linearNorm: function(t) {
            return t;
        },
        inQuad: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        inQuadNorm: function(t) {
            return t * t;
        },
        outQuad: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        outQuadNorm: function(t) {
            return -(t -= 1) * t + 1;
        },
        inOutQuad: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * (--t * (t - 2) - 1) + b;
        },
        inOutQuadNorm: function(t) {
            if ((t /= .5) < 1) return .5 * t * t;
            return -.5 * (--t * (t - 2) - 1);
        },
        inCubic: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        inCubicNorm: function(t) {
            return t * t * t;
        },
        outCubic: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        outCubicNorm: function(t) {
            return --t * t * t + 1;
        },
        inOutCubic: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        inOutCubicNorm: function(t) {
            if ((t /= .5) < 1) return .5 * t * t * t;
            return .5 * ((t -= 2) * t * t + 2);
        },
        inQuart: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        inQuartNorm: function(t) {
            return t * t * t * t;
        },
        outQuart: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        outQuartNorm: function(t) {
            return -(--t * t * t * t - 1);
        },
        inOutQuart: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        inOutQuartNorm: function(t) {
            if ((t /= .5) < 1) return .5 * t * t * t * t;
            return -.5 * ((t -= 2) * t * t * t - 2);
        },
        inQuint: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        inQuintNorm: function(t) {
            return t * t * t * t * t;
        },
        outQuint: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        outQuintNorm: function(t) {
            return --t * t * t * t * t + 1;
        },
        inOutQuint: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        inOutQuintNorm: function(t) {
            if ((t /= .5) < 1) return .5 * t * t * t * t * t;
            return .5 * ((t -= 2) * t * t * t * t + 2);
        },
        inSine: function(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        inSineNorm: function(t) {
            return -1 * Math.cos(t * (Math.PI / 2)) + 1;
        },
        outSine: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        outSineNorm: function(t) {
            return Math.sin(t * (Math.PI / 2));
        },
        inOutSine: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        inOutSineNorm: function(t) {
            return -.5 * (Math.cos(Math.PI * t) - 1);
        },
        inExpo: function(t, b, c, d) {
            return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        inExpoNorm: function(t) {
            return t == 0 ? 0 : Math.pow(2, 10 * (t - 1));
        },
        outExpo: function(t, b, c, d) {
            return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        outExpoNorm: function(t) {
            return t == 1 ? 1 : -Math.pow(2, -10 * t) + 1;
        },
        inOutExpo: function(t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        inOutExpoNorm: function(t) {
            if (t == 0) return 0;
            if (t == 1) return 1;
            if ((t /= .5) < 1) return .5 * Math.pow(2, 10 * (t - 1));
            return .5 * (-Math.pow(2, -10 * --t) + 2);
        },
        inCirc: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        inCircNorm: function(t) {
            return -(Math.sqrt(1 - t * t) - 1);
        },
        outCirc: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        outCircNorm: function(t) {
            return Math.sqrt(1 - --t * t);
        },
        inOutCirc: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        inOutCircNorm: function(t) {
            // return Easing.inOutCirc(t, 0.0, 1.0, 1.0); 
            if ((t /= .5) < 1) return -.5 * (Math.sqrt(1 - t * t) - 1);
            return .5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        inElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        inElasticNorm: function(t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t == 0) return 0;
            if (t == 1) return 1;
            if (!p) p = .3;
            s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
        },
        outElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        outElasticNorm: function(t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t == 0) return 0;
            if (t == 1) return 1;
            if (!p) p = .3;
            s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
        },
        inOutElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        inOutElasticNorm: function(t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t == 0) return 0;
            if ((t /= .5) == 2) return 1;
            if (!p) p = .3 * 1.5;
            s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * .5 + 1;
        },
        inBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        inBackNorm: function(t, s) {
            if (s == undefined) s = 1.70158;
            return t * t * ((s + 1) * t - s);
        },
        outBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        outBackNorm: function(t, s) {
            if (s == undefined) s = 1.70158;
            return --t * t * ((s + 1) * t + s) + 1;
        },
        inOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        inOutBackNorm: function(t, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= .5) < 1) return .5 * (t * t * (((s *= 1.525) + 1) * t - s));
            return .5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
        },
        inBounce: function(t, b, c, d) {
            return c - Easing.outBounce(d - t, 0, c, d) + b;
        },
        inBounceNorm: function(t) {
            return 1 - Easing.outBounceNorm(1 - t);
        },
        outBounce: function(t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * (7.5625 * t * t) + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
            }
        },
        outBounceNorm: function(t) {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                return 7.5625 * (t -= 1.5 / 2.75) * t + .75;
            } else if (t < 2.5 / 2.75) {
                return 7.5625 * (t -= 2.25 / 2.75) * t + .9375;
            } else {
                return 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
            }
        },
        inOutBounce: function(t, b, c, d) {
            if (t < d / 2) return Easing.inBounce(t * 2, 0, c, d) * .5 + b;
            return Easing.outBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        },
        inOutBounceNorm: function(t) {
            if (t < .5) return Easing.inBounceNorm(t * 2) * .5;
            return Easing.outBounceNorm(t * 2 - 1) * .5 + .5;
        }
    };
    module.exports = Easing;
}.bind(this));

require.register("famous_modules/famous/entity/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @class Entity.
     * @description A singleton class that maintains a 
     *    global registry of rendered surfaces
     * @name Entity
     * 
     */
    var entities = [];
    function register(entity) {
        var id = entities.length;
        set(id, entity);
        return id;
    }
    function get(id) {
        return entities[id];
    }
    function set(id, entity) {
        entities[id] = entity;
    }
    module.exports = {
        register: register,
        get: get,
        set: set
    };
}.bind(this));

require.register("famous_modules/famous/event-handler/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @class EventHandler 
     * @description This object gives the user the opportunity to explicitly 
     *   control event propagation in their application. EventHandler forwards received events to a set of 
     *   provided callback functions. It allows events to be captured, processed,
     *   and optionally piped through to other event handlers.
     *
     * @name EventHandler
     * @constructor
     * 
     * @example
     *   var Engine = require('famous/Engine');
     *   var Surface = require('famous/Surface');
     *   var EventHandler = require('famous/EventHandler');
     *
     *   var Context = Engine.createContext();
     *
     *   var surface = new Surface({
     *       size: [200,200],
     *       properties: {
     *           backgroundColor: '#3cf'
     *       },
     *       content: 'test'
     *   });
     *
     *   eventListener = new EventHandler();
     *   surface.pipe(eventListener);
     *
     *   Context.add(surface);
     *
     *   eventInput.on('click', function(){
     *     alert('received click');
     *   });
     * 
     */
    function EventHandler() {
        this.listeners = {};
        this.downstream = [];
        // downstream event handlers
        this.downstreamFn = [];
        // downstream functions
        this.upstream = [];
        // upstream event handlers
        this.upstreamListeners = {};
        // upstream listeners
        this.owner = this;
    }
    /**
     * Send event data to all handlers matching provided 'type' key. If handler 
     *    is not set to "capture", pass on to any next handlers also. Event's 
     *    "origin" field is set to this object if not yet set.
     *
     * @name EventHandler#emit
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event received event data
     * @returns {boolean} true if this event has been handled by any handler
     */
    EventHandler.prototype.emit = function(type, event) {
        if (!event) event = {};
        var handlers = this.listeners[type];
        var handled = false;
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].call(this.owner, event)) handled = true;
            }
        }
        return _emitNext.call(this, type, event) || handled;
    };
    /**
     * Send event data to downstream handlers responding to this event type.
     *
     * @name _emitNext
     * @function
     * @private
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event received event data
     * @returns {boolean} true if this event has been handled by any 
     *   downstream handler
     */
    function _emitNext(type, event) {
        var handled = false;
        for (var i = 0; i < this.downstream.length; i++) {
            handled = this.downstream[i].emit(type, event) || handled;
        }
        for (var i = 0; i < this.downstreamFn.length; i++) {
            handled = this.downstreamFn[i](type, event) || handled;
        }
        return handled;
    }
    /**
     * Add handler function to set of callback functions for the provided 
     *   event type.  
     *   The handler will receive the original emitted event data object
     *   as its sole argument.
     * 
     * @name EventHandler#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {function(string, Object)} handler handler function
     * @returns {EventHandler} this
     */
    EventHandler.prototype.on = function(type, handler) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
            var upstreamListener = this.emit.bind(this, type);
            this.upstreamListeners[type] = upstreamListener;
            for (var i = 0; i < this.upstream.length; i++) {
                this.upstream[i].on(type, upstreamListener);
            }
        }
        var index = this.listeners[type].indexOf(handler);
        if (index < 0) this.listeners[type].push(handler);
        return this;
    };
    /**
     * Remove handler function from set of callback functions for the provided 
     *   event type. 
     * Undoes work of {@link EventHandler#on}
     * 
     * @name EventHandler#unbind
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {function(string, Object)} handler
     */
    EventHandler.prototype.unbind = function(type, handler) {
        var index = this.listeners[type].indexOf(handler);
        if (index >= 0) this.listeners[type].splice(index, 1);
    };
    /** 
     * Add handler object to set of DOWNSTREAM handlers.
     * 
     * @name EventHandler#pipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    EventHandler.prototype.pipe = function(target) {
        if (target.subscribe instanceof Function) return target.subscribe(this);
        var downstreamCtx = target instanceof Function ? this.downstreamFn : this.downstream;
        var index = downstreamCtx.indexOf(target);
        if (index < 0) downstreamCtx.push(target);
        if (target instanceof Function) target("pipe"); else target.emit && target.emit("pipe");
        return target;
    };
    /**
     * Remove handler object from set of DOWNSTREAM handlers.
     * Undoes work of {@link EventHandler#pipe}
     * 
     * @name EventHandler#unpipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    EventHandler.prototype.unpipe = function(target) {
        if (target.unsubscribe instanceof Function) return target.unsubscribe(this);
        var downstreamCtx = target instanceof Function ? this.downstreamFn : this.downstream;
        var index = downstreamCtx.indexOf(target);
        if (index >= 0) {
            downstreamCtx.splice(index, 1);
            if (target instanceof Function) target("unpipe"); else target.emit && target.emit("unpipe");
            return target;
        } else return false;
    };
    /**
     * Automatically listen to events from an UPSTREAM event handler
     *
     * @name EventHandler#subscribe
     * @function
     * @param {emitterObject} source source emitter object
     */
    EventHandler.prototype.subscribe = function(source) {
        var index = this.upstream.indexOf(source);
        if (index < 0) {
            this.upstream.push(source);
            for (var type in this.upstreamListeners) {
                source.on(type, this.upstreamListeners[type]);
            }
        }
        return this;
    };
    /**
     * Stop listening to events from an UPSTREAM event handler
     *
     * @name EventHandler#unsubscribe
     * @function
     * @param {emitterObject} source source emitter object
     */
    EventHandler.prototype.unsubscribe = function(source) {
        var index = this.upstream.indexOf(source);
        if (index >= 0) {
            this.upstream.splice(index, 1);
            for (var type in this.upstreamListeners) {
                source.unbind(type, this.upstreamListeners[type]);
            }
        }
        return this;
    };
    /**
     * Call event handlers with this set to owner
     *
     * @name EventHandler#bindThis
     * @function
     * @param {Object} owner object this EventHandler belongs to
     */
    EventHandler.prototype.bindThis = function(owner) {
        this.owner = owner;
    };
    /**
     * Assign an event handler to receive an object's events. 
     *
     * @name EventHandler#setInputHandler
     * @static
     * @function
     * @param {Object} object object to mix in emit function
     * @param {emitterObject} handler assigned event handler
     */
    EventHandler.setInputHandler = function(object, handler) {
        object.emit = handler.emit.bind(handler);
        if (handler.subscribe && handler.unsubscribe) {
            object.subscribe = handler.subscribe.bind(handler);
            object.unsubscribe = handler.unsubscribe.bind(handler);
        }
    };
    /**
     * Assign an event handler to emit an object's events
     *
     * @name EventHandler#setOutputHandler
     * @static
     * @function
     * @param {Object} object object to mix in pipe/unpipe/on/unbind functions
     * @param {emitterObject} handler assigned event emitter
     */
    EventHandler.setOutputHandler = function(object, handler) {
        if (handler instanceof EventHandler) handler.bindThis(object);
        object.pipe = handler.pipe.bind(handler);
        object.unpipe = handler.unpipe.bind(handler);
        object.on = handler.on.bind(handler);
        object.unbind = handler.unbind.bind(handler);
    };
    module.exports = EventHandler;
}.bind(this));

require.register("famous_modules/famous/surface/_git_modularized/index.js", function(exports, require, module) {
    var Entity = require("famous/entity");
    var EventHandler = require("famous/event-handler");
    var Transform = require("famous/transform");
    var usePrefix = document.body.style.webkitTransform !== undefined;
    /**
     * @class Surface
     * @description A base class for viewable content and event
     *    targets inside a Famous applcation, containing a renderable document
     *    fragment. Like an HTML div, it can accept internal markup,
     *    properties, classes, and handle events. This is a public
     *    interface and can be extended.
     * 
     * @name Surface
     * @constructor
     * 
     * @param {Array.<number>} size Width and height in absolute pixels (array of ints)
     * @param {string} content Document content (e.g. HTML) managed by this
     *    surface.
     */
    function Surface(options) {
        this.options = {};
        this.properties = {};
        this.content = "";
        this.classList = [];
        this.size = undefined;
        this._classesDirty = true;
        this._stylesDirty = true;
        this._sizeDirty = true;
        this._contentDirty = true;
        this._dirtyClasses = [];
        this._matrix = undefined;
        this._opacity = 1;
        this._origin = undefined;
        this._size = undefined;
        /** @ignore */
        this.eventForwarder = function(event) {
            this.emit(event.type, event);
        }.bind(this);
        this.eventHandler = new EventHandler();
        this.eventHandler.bindThis(this);
        this.id = Entity.register(this);
        if (options) this.setOptions(options);
        this._currTarget = undefined;
    }
    Surface.prototype.elementType = "div";
    Surface.prototype.elementClass = "famous-surface";
    /**
     * Bind a handler function to occurrence of event type on this surface.
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the Surface upon which the event occurs, then 
     *   by the on() method of the FamousContext containing that surface, and
     *   finally as a default, the FamousEngine itself.
     * 
     * @name Surface#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Surface.prototype.on = function(type, fn) {
        if (this._currTarget) this._currTarget.addEventListener(type, this.eventForwarder);
        this.eventHandler.on(type, fn);
    };
    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Surface#on}
     * 
     * @name Surface#unbind
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler 
     */
    Surface.prototype.unbind = function(type, fn) {
        this.eventHandler.unbind(type, fn);
    };
    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     * 
     * @name Surface#emit
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {Object} event event data
     * @returns {boolean}  true if event was handled along the event chain.
     */
    Surface.prototype.emit = function(type, event) {
        if (event && !event.origin) event.origin = this;
        var handled = this.eventHandler.emit(type, event);
        if (handled && event.stopPropagation) event.stopPropagation();
        return handled;
    };
    /**
     * Pipe all events to a target {@link emittoerObject}
     *
     * @name Surface#pipe
     * @function
     * @param {emitterObject} target emitter object
     * @returns {emitterObject} target (to allow for chaining)
     */
    Surface.prototype.pipe = function(target) {
        return this.eventHandler.pipe(target);
    };
    /**
     * Stop piping all events at the FamousEngine level to a target emitter 
     *   object.  Undoes the work of #pipe.
     * 
     * @name Surface#unpipe
     * @function
     * @param {emitterObject} target emitter object
     */
    Surface.prototype.unpipe = function(target) {
        return this.eventHandler.unpipe(target);
    };
    /**
     * Return spec for this surface. Note that for a base surface, this is
     *    simply an id.
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#render
     * @function
     * @returns {number} Spec for this surface (spec id)
     */
    Surface.prototype.render = function() {
        return this.id;
    };
    /**
     * Set CSS-style properties on this Surface. Note that this will cause
     *    dirtying and thus re-rendering, even if values do not change (confirm)
     *    
     * @name Surface#setProperties
     * @function
     * @param {Object} properties property dictionary of "key" => "value"
     */
    Surface.prototype.setProperties = function(properties) {
        for (var n in properties) {
            this.properties[n] = properties[n];
        }
        this._stylesDirty = true;
    };
    /**
     * Get CSS-style properties on this Surface.
     * 
     * @name Surface#getProperties
     * @function
     * @returns {Object} Dictionary of properties of this Surface.
     */
    Surface.prototype.getProperties = function() {
        return this.properties;
    };
    /**
     * Add CSS-style class to the list of classes on this Surface. Note
     *   this will map directly to the HTML property of the actual
     *   corresponding rendered <div>. 
     *   These will be deployed to the document on call to .setup().
     *    
     * @param {string} className name of class to add
     */
    Surface.prototype.addClass = function(className) {
        if (this.classList.indexOf(className) < 0) {
            this.classList.push(className);
            this._classesDirty = true;
        }
    };
    /**
     * Remove CSS-style class from the list of classes on this Surface.
     *   Note this will map directly to the HTML property of the actual
     *   corresponding rendered <div>. 
     *   These will be deployed to the document on call to #setup().
     *    
     * @name Surface#removeClass
     * @function
     * @param {string} className name of class to remove
     */
    Surface.prototype.removeClass = function(className) {
        var i = this.classList.indexOf(className);
        if (i >= 0) {
            this._dirtyClasses.push(this.classList.splice(i, 1)[0]);
            this._classesDirty = true;
        }
    };
    Surface.prototype.setClasses = function(classList) {
        var removal = [];
        for (var i = 0; i < this.classList.length; i++) {
            if (classList.indexOf(this.classList[i]) < 0) removal.push(this.classList[i]);
        }
        for (var i = 0; i < removal.length; i++) this.removeClass(removal[i]);
        // duplicates are already checked by addClass()
        for (var i = 0; i < classList.length; i++) this.addClass(classList[i]);
    };
    /**
     * Get array of CSS-style classes attached to this div.
     * 
     * @name Surface#getClasslist
     * @function
     * @returns {Array.<string>} Returns an array of classNames
     */
    Surface.prototype.getClassList = function() {
        return this.classList;
    };
    /**
     * Set or overwrite inner (HTML) content of this surface. Note that this
     *    causes a re-rendering if the content has changed.
     * 
     * @name Surface#setContent
     * @function
     *    
     * @param {string} content HTML content
     */
    Surface.prototype.setContent = function(content) {
        if (this.content != content) {
            this.content = content;
            this._contentDirty = true;
        }
    };
    /**
     * Return inner (HTML) content of this surface.
     * 
     * @name Surface#getContent
     * @function
     * 
     * @returns {string} inner (HTML) content
     */
    Surface.prototype.getContent = function() {
        return this.content;
    };
    /**
     * Set options for this surface
     *
     * @name Surface#setOptions
     * @function
     *
     * @param {Object} options options hash
     */
    Surface.prototype.setOptions = function(options) {
        if (options.size) this.setSize(options.size);
        if (options.classes) this.setClasses(options.classes);
        if (options.properties) this.setProperties(options.properties);
        if (options.content) this.setContent(options.content);
    };
    /**
     *   Attach Famous event handling to document events emanating from target
     *     document element.  This occurs just after deployment to the document.
     *     Calling this enables methods like #on and #pipe.
     *    
     * @private
     * @param {Element} target document element
     */
    function _bindEvents(target) {
        for (var i in this.eventHandler.listeners) {
            target.addEventListener(i, this.eventForwarder);
        }
    }
    /**
     *   Detach Famous event handling from document events emanating from target
     *     document element.  This occurs just before recall from the document.
     *     Calling this enables methods like #on and #pipe.
     *    
     * 
     * @name Surface#_unbindEvents
     * @function
     * @private
     * @param {Element} target document element
     */
    function _unbindEvents(target) {
        for (var i in this.eventHandler.listeners) {
            target.removeEventListener(i, this.eventForwarder);
        }
    }
    /**
     *  Apply to document all changes from #removeClass since last #setup().
     *    
     * @name Surface#_cleanupClasses
     * @function
     * @private
     * @param {Element} target document element
     */
    function _cleanupClasses(target) {
        for (var i = 0; i < this._dirtyClasses.length; i++) target.classList.remove(this._dirtyClasses[i]);
        this._dirtyClasses = [];
    }
    /**
     * Apply values of all Famous-managed styles to the document element.
     *   These will be deployed to the document on call to #setup().
     * 
     * @name Surface#_applyStyles
     * @function
     * @private
     * @param {Element} target document element
     */
    function _applyStyles(target) {
        for (var n in this.properties) {
            target.style[n] = this.properties[n];
        }
    }
    /**
     * Clear all Famous-managed styles from the document element.
     *   These will be deployed to the document on call to #setup().
     * 
     * @name Surface#_cleanupStyles
     * @function
     * @private
     * @param {Element} target document element
     */
    function _cleanupStyles(target) {
        for (var n in this.properties) {
            target.style[n] = "";
        }
    }
    var _setMatrix;
    var _setOrigin;
    var _setInvisible;
    /**
     * Directly apply given FamousMatrix to the document element as the 
     *   appropriate webkit CSS style.
     * 
     * @name SurfaceManager#setMatrix
     * @function
     * @static
     * @private
     * @param {Element} element document element
     * @param {FamousMatrix} matrix 
     */
    if (usePrefix) _setMatrix = function(element, matrix) {
        element.style.webkitTransform = Transform.formatCSS(matrix);
    }; else _setMatrix = function(element, matrix) {
        element.style.transform = Transform.formatCSS(matrix);
    };
    /**
     * Directly apply given origin coordinates to the document element as the 
     *   appropriate webkit CSS style.
     * 
     * @name SurfaceManager#setOrigin
     * @function
     * @static
     * @private
     * @param {Element} element document element
     * @param {FamousMatrix} matrix 
     */
    if (usePrefix) _setOrigin = function(element, origin) {
        element.style.webkitTransformOrigin = _formatCSSOrigin(origin);
    }; else _setOrigin = function(element, origin) {
        element.style.transformOrigin = _formatCSSOrigin(origin);
    };
    /**
     * Shrink given document element until it is effectively invisible.   
     *   This destroys any existing transform properties.  
     *   Note: Is this the ideal implementation?
     *
     * @name SurfaceManager#setInvisible
     * @function
     * @static
     * @private
     * @param {Element} element document element
     */
    if (usePrefix) _setInvisible = function(element) {
        element.style.webkitTransform = "scale3d(0.0001,0.0001,1)";
        element.style.opacity = 0;
    }; else _setInvisible = function(element) {
        element.style.transform = "scale3d(0.0001,0.0001,1)";
        element.style.opacity = 0;
    };
    function _xyNotEquals(a, b) {
        if (!(a && b)) return a !== b;
        return a[0] !== b[0] || a[1] !== b[1];
    }
    function _formatCSSOrigin(origin) {
        return (100 * origin[0]).toFixed(6) + "% " + (100 * origin[1]).toFixed(6) + "%";
    }
    /**
     * Sets up an element to be ready for commits
     *  
     * (Scope: Device developers and deeper)
     * @name Surface#setup
     * @function
     * 
     * @param {Element} target document element
     */
    Surface.prototype.setup = function(allocator) {
        var target = allocator.allocate(this.elementType);
        if (this.elementClass) {
            if (this.elementClass instanceof Array) {
                for (var i = 0; i < this.elementClass.length; i++) {
                    target.classList.add(this.elementClass[i]);
                }
            } else {
                target.classList.add(this.elementClass);
            }
        }
        _bindEvents.call(this, target);
        _setOrigin(target, [ 0, 0 ]);
        // handled internally
        target.style.display = "";
        this._currTarget = target;
        this._stylesDirty = true;
        this._classesDirty = true;
        this._sizeDirty = true;
        this._contentDirty = true;
        this._matrix = undefined;
        this._opacity = undefined;
        this._origin = undefined;
        this._size = undefined;
    };
    /**
     * Apply all changes stored in the Surface object to the actual element
     * This includes changes to classes, styles, size, and content, but not
     * transforms or opacities, which are managed by (@link SurfaceManager).
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#commit
     * @function
     */
    Surface.prototype.commit = function(context) {
        if (!this._currTarget) this.setup(context.allocator);
        var target = this._currTarget;
        var matrix = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;
        if (this.size) {
            var origSize = size;
            size = [ this.size[0], this.size[1] ];
            if (size[0] === undefined && origSize[0]) size[0] = origSize[0];
            if (size[1] === undefined && origSize[1]) size[1] = origSize[1];
        }
        if (_xyNotEquals(this._size, size)) {
            this._size = [ size[0], size[1] ];
            this._sizeDirty = true;
        }
        if (!matrix && this._matrix) {
            this._matrix = undefined;
            this._opacity = 0;
            _setInvisible(target);
            return;
        }
        if (this._opacity !== opacity) {
            this._opacity = opacity;
            target.style.opacity = Math.min(opacity, .999999);
        }
        if (_xyNotEquals(this._origin, origin) || Transform.notEquals(this._matrix, matrix)) {
            if (!matrix) matrix = Transform.identity;
            if (!origin) origin = [ 0, 0 ];
            this._origin = [ origin[0], origin[1] ];
            this._matrix = matrix;
            var aaMatrix = matrix;
            if (origin) {
                aaMatrix = Transform.moveThen([ -this._size[0] * origin[0], -this._size[1] * origin[1] ], matrix);
            }
            _setMatrix(target, aaMatrix);
        }
        if (!(this._classesDirty || this._stylesDirty || this._sizeDirty || this._contentDirty)) return;
        if (this._classesDirty) {
            _cleanupClasses.call(this, target);
            var classList = this.getClassList();
            for (var i = 0; i < classList.length; i++) target.classList.add(classList[i]);
            this._classesDirty = false;
        }
        if (this._stylesDirty) {
            _applyStyles.call(this, target);
            this._stylesDirty = false;
        }
        if (this._sizeDirty) {
            if (this._size) {
                target.style.width = this._size[0] !== true ? this._size[0] + "px" : "";
                target.style.height = this._size[1] !== true ? this._size[1] + "px" : "";
            }
            this._sizeDirty = false;
        }
        if (this._contentDirty) {
            this.deploy(target);
            this.eventHandler.emit("deploy");
            this._contentDirty = false;
        }
    };
    /**
     *  Remove all Famous-relevant attributes from a document element.
     *    This is called by SurfaceManager's detach().
     *    This is in some sense the reverse of .deploy().
     *    Note: If you're trying to destroy a surface, don't use this. 
     *    Just remove it from the render tree.
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#cleanup
     * @function
     * @param {Element} target target document element
     */
    Surface.prototype.cleanup = function(allocator) {
        var target = this._currTarget;
        target.style.display = "none";
        this.eventHandler.emit("recall");
        this.recall(target);
        target.style.width = "";
        target.style.height = "";
        this._size = undefined;
        _cleanupStyles.call(this, target);
        var classList = this.getClassList();
        _cleanupClasses.call(this, target);
        for (var i = 0; i < classList.length; i++) target.classList.remove(classList[i]);
        if (this.elementClass) {
            if (this.elementClass instanceof Array) {
                for (var i = 0; i < this.elementClass.length; i++) {
                    target.classList.remove(this.elementClass[i]);
                }
            } else {
                target.classList.remove(this.elementClass);
            }
        }
        _unbindEvents.call(this, target);
        this._currTarget = undefined;
        allocator.deallocate(target);
        _setInvisible(target);
    };
    /**
     * Directly output this surface's fully prepared inner document content to 
     *   the provided containing parent element.
     *   This translates to innerHTML in the DOM sense.
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#deploy
     * @function
     * @param {Element} target Document parent of this container
     */
    Surface.prototype.deploy = function(target) {
        var content = this.getContent();
        if (content instanceof Node) {
            while (target.hasChildNodes()) target.removeChild(target.firstChild);
            target.appendChild(content);
        } else target.innerHTML = content;
    };
    /**
     * Remove any contained document content associated with this surface 
     *   from the actual document.  
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#recall
     * @function
     */
    Surface.prototype.recall = function(target) {
        var df = document.createDocumentFragment();
        while (target.hasChildNodes()) df.appendChild(target.firstChild);
        this.setContent(df);
    };
    /** 
     *  Get the x and y dimensions of the surface.  This normally returns
     *    the size of the rendered surface unless setSize() was called
     *    more recently than setup().
     * 
     * @name Surface#getSize
     * @function
     * @param {boolean} actual return actual size
     * @returns {Array.<number>} [x,y] size of surface
     */
    Surface.prototype.getSize = function(actual) {
        if (actual) return this._size; else return this.size || this._size;
    };
    /**
     * Set x and y dimensions of the surface.  This takes effect upon
     *   the next call to this.{#setup()}.
     * 
     * @name Surface#setSize
     * @function
     * @param {Array.<number>} size x,y size array
     */
    Surface.prototype.setSize = function(size) {
        this.size = size ? [ size[0], size[1] ] : undefined;
        this._sizeDirty = true;
    };
    module.exports = Surface;
}.bind(this));

require.register("famous_modules/famous/surfaces/input-surface/_git_modularized/index.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    /**
     *  HTML Input Surface
     *
     *  @class A famo.us surface in the form of an HTML
     *  input element.
     */
    function InputSurface(options) {
        this._placeholder = options.placeholder || "";
        this._value = options.value || "";
        this._type = options.type || "text";
        Surface.apply(this, arguments);
    }
    InputSurface.prototype = Object.create(Surface.prototype);
    InputSurface.prototype.elementType = "input";
    InputSurface.prototype.elementClass = "famous-surface";
    /**
     * @name InputSurface#setPlaceholder
     * @param {string} Value to set the html placeholder to.
     * Triggers a repaint next tick.
     * @returns this, allowing method chaining.
     */
    InputSurface.prototype.setPlaceholder = function(str) {
        this._placeholder = str;
        this._contentDirty = true;
        return this;
    };
    /**
     * @name InputSurface#setValue
     * @param {string} Value to set the main input value to.
     * Triggers a repaint next tick.
     * @returns this, allowing method chaining.
     */
    InputSurface.prototype.setValue = function(str) {
        this._value = str;
        this._contentDirty = true;
        return this;
    };
    /** 
     * @name InputSurface#setType
     * @param {string} Set the type of the input surface.
     * Triggers a repaint next tick.
     * @returns this, allowing method chaining.
     */
    InputSurface.prototype.setType = function(str) {
        this._type = str;
        this._contentDirty = true;
        return this;
    };
    /**
     * @name InputSurface#getValue
     * @returns {string} value of current input.
     */
    InputSurface.prototype.getValue = function() {
        if (this._currTarget) {
            return this._currTarget.value;
        } else {
            return this._value;
        }
    };
    /**
     * @name InputSurface#deploy
     * sets the placeholder, value and type of the input.
     */
    InputSurface.prototype.deploy = function(target) {
        if (this._placeholder !== "") target.placeholder = this._placeholder;
        target.value = this._value;
        target.type = this._type;
    };
    module.exports = InputSurface;
}.bind(this));

require.register("famous_modules/famous/surfaces/canvas-surface/_git_modularized/index.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    /**
     * @class A surface containing an HTML5 Canvas element
     *
     * @description 
     *   
     * @name CanvasSurface
     * @extends Surface
     * @constructor
     */
    function CanvasSurface(options) {
        if (options && options.canvasSize) this.canvasSize = options.canvasSize;
        Surface.apply(this, arguments);
        if (!this.canvasSize) this.canvasSize = this.getSize();
        this.backBuffer = document.createElement("canvas");
        if (this.canvasSize) {
            this.backBuffer.width = this.canvasSize[0];
            this.backBuffer.height = this.canvasSize[1];
        }
        this._contextId = undefined;
    }
    CanvasSurface.prototype = Object.create(Surface.prototype);
    CanvasSurface.prototype.constructor = CanvasSurface;
    CanvasSurface.prototype.elementType = "canvas";
    CanvasSurface.prototype.elementClass = "surface";
    CanvasSurface.prototype.setContent = function() {};
    CanvasSurface.prototype.deploy = function(target) {
        if (this.canvasSize) {
            target.width = this.canvasSize[0];
            target.height = this.canvasSize[1];
        }
        if (this._contextId === "2d") {
            target.getContext(this._contextId).drawImage(this.backBuffer, 0, 0);
            this.backBuffer.width = 0;
            this.backBuffer.height = 0;
        }
    };
    CanvasSurface.prototype.recall = function(target) {
        var size = this.getSize();
        this.backBuffer.width = target.width;
        this.backBuffer.height = target.height;
        if (this._contextId === "2d") {
            this.backBuffer.getContext(this._contextId).drawImage(target, 0, 0);
            target.width = 0;
            target.height = 0;
        }
    };
    /**
     * Returns the canvas element's context
     *
     * @name CanvasSurface#getContext
     * @function
     * @param {string} contextId context identifier
     */
    CanvasSurface.prototype.getContext = function(contextId) {
        this._contextId = contextId;
        return this._currTarget ? this._currTarget.getContext(contextId) : this.backBuffer.getContext(contextId);
    };
    CanvasSurface.prototype.setSize = function(size, canvasSize) {
        Surface.prototype.setSize.apply(this, arguments);
        if (canvasSize) this.canvasSize = canvasSize.slice(0);
        if (this._currTarget) {
            this._currTarget.width = this.canvasSize[0];
            this._currTarget.height = this.canvasSize[1];
        }
    };
    module.exports = CanvasSurface;
}.bind(this));

require.register("famous_modules/famous/options-manager/_git_modularized/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    /**
     * @class OptionsManager
     * @description 
     *   A collection of methods for setting options which can be extended
     *   onto other classes
     *
     * @name OptionsManager
     * @constructor
     *
     *  **** WARNING **** 
     *  You can only pass through objects that will compile into valid JSON. 
     *
     *  Valid options: 
     *      Strings,
     *      Arrays,
     *      Objects,
     *      Numbers,
     *      Nested Objects,
     *      Nested Arrays
     *
     *  This excludes: 
     *      Document Fragments,
     *      Functions
     */
    function OptionsManager(value) {
        this._value = value;
        this.eventOutput = null;
    }
    OptionsManager.patch = function(source, patch) {
        var manager = new OptionsManager(source);
        for (var i = 1; i < arguments.length; i++) manager.patch(arguments[i]);
        return source;
    };
    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    }
    OptionsManager.prototype.patch = function() {
        var myState = this._value;
        for (var i = 0; i < arguments.length; i++) {
            var patch = arguments[i];
            for (var k in patch) {
                if (k in myState && patch[k] && patch[k].constructor === Object && myState[k] && myState[k].constructor === Object) {
                    if (!myState.hasOwnProperty(k)) myState[k] = Object.create(myState[k]);
                    this.key(k).patch(patch[k]);
                    if (this.eventOutput) this.eventOutput.emit("change", {
                        id: k,
                        value: this.key(k).value()
                    });
                } else this.set(k, patch[k]);
            }
        }
        return this;
    };
    OptionsManager.prototype.setOptions = OptionsManager.prototype.patch;
    OptionsManager.prototype.key = function(key) {
        var result = new OptionsManager(this._value[key]);
        if (!(result._value instanceof Object) || result._value instanceof Array) result._value = {};
        return result;
    };
    OptionsManager.prototype.get = function(key) {
        return this._value[key];
    };
    OptionsManager.prototype.getOptions = OptionsManager.prototype.get;
    OptionsManager.prototype.set = function(key, value) {
        var originalValue = this.get(key);
        this._value[key] = value;
        if (this.eventOutput && value !== originalValue) this.eventOutput.emit("change", {
            id: key,
            value: value
        });
        return this;
    };
    OptionsManager.prototype.value = function() {
        return this._value;
    };
    /* These will be overridden once this.eventOutput is created */
    OptionsManager.prototype.on = function() {
        _createEventOutput.call(this);
        return this.on.apply(this, arguments);
    };
    OptionsManager.prototype.unbind = function() {
        _createEventOutput.call(this);
        return this.unbind.apply(this, arguments);
    };
    OptionsManager.prototype.pipe = function() {
        _createEventOutput.call(this);
        return this.pipe.apply(this, arguments);
    };
    OptionsManager.prototype.unpipe = function() {
        _createEventOutput.call(this);
        return this.unpipe.apply(this, arguments);
    };
    module.exports = OptionsManager;
}.bind(this));

require.register("famous_modules/famous/view-sequence/_git_modularized/index.js", function(exports, require, module) {
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
    var OptionsManager = require("famous/options-manager");
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
    }
    ViewSequence.DEFAULT_OPTIONS = {
        index: 0,
        loop: false
    };
    ViewSequence.prototype._createPrevious = function() {
        var prevOptions = Object.create(this.options);
        prevOptions.array = this.array;
        prevOptions.index = this._prevIndex;
        prevOptions.loop = this.loop;
        var prev = new this.constructor(prevOptions);
        prev._next = this;
        prev._nextIndex = this.index;
        return prev;
    };
    ViewSequence.prototype._createNext = function() {
        var nextOptions = Object.create(this.options);
        nextOptions.array = this.array;
        nextOptions.index = this._nextIndex;
        nextOptions.loop = this.loop;
        var next = new this.constructor(nextOptions);
        next._prev = this;
        next._prevIndex = this.index;
        return next;
    };
    ViewSequence.prototype.getPrevious = function() {
        var prevIndex = this.index - 1;
        if (this.index === 0) {
            if (this.loop) prevIndex = this.array.length - 1; else return undefined;
        }
        if (!this._prev || this._prevIndex != prevIndex) {
            this._prevIndex = prevIndex;
            this._prev = this._createPrevious();
        }
        return this._prev;
    };
    ViewSequence.prototype.getNext = function() {
        var nextIndex = this.index + 1;
        if (nextIndex >= this.array.length) {
            if (this.loop) nextIndex = 0; else return undefined;
        }
        if (!this._next || this._nextIndex != nextIndex) {
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
        if (!this._prev || this.index === 0) {
            var offset = arguments.length;
            this.array.unshift.apply(this.array, arguments);
            _reindex.call(this, offset);
        } else this._prev.unshift.apply(this._prev, arguments);
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
                if (nextNode) nextNode._prev = previousNode;
                if (previousNode) previousNode._next = nextNode;
                insertionNode = nextNode;
            }
            var inject;
            for (i = 0; i < arguments.length - 2; i++) {
                inject = insertionNode._createPrevious();
                inject.setPrevious(previousNode);
                inject.setNext(insertionNode);
                previousNode.setNext(inject);
                insertionNode.setPrevious(inject);
                previousNode = inject;
            }
            var head = this.find(0);
            if (!head) head = this.find(1);
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
        var direction = index > this.getIndex() ? "_next" : "_prev";
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
        while (currentNode && i < this.array.length) {
            currentNode.index += offset;
            if (currentNode._prevIndex !== undefined) currentNode._prevIndex += offset;
            if (currentNode._nextIndex !== undefined) currentNode._nextIndex += offset;
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
            var behavior = new func(prevOptions);
            newChildArray.push(behavior);
        }
        this.array = newChildArray;
    };
    ViewSequence.prototype.get = function() {
        return this.array[this.index];
    };
    ViewSequence.prototype.getSize = function() {
        var target = this.get();
        if (!target) return;
        if (!target.getSize) return undefined;
        return target.getSize.apply(target, arguments);
    };
    ViewSequence.prototype.render = function() {
        var target = this.get();
        if (!target) return;
        console.log(target.render());
        return target.render.apply(target, arguments);
    };
    module.exports = ViewSequence;
}.bind(this));

require.register("famous_modules/famous/views/sequential-layout/_git_modularized/index.js", function(exports, require, module) {
    var OptionsManager = require("famous/options-manager");
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var ViewSequence = require("famous/view-sequence");
    var Utility = require("famous/utilities/utility");
    /**
     * @class Lays out specified renderables sequentially.
     * @description
     * @name SequentialLayout
     * @constructor
     * @example 
     *           var Engine = require('famous/Engine');
     *           var SequentialLayout = require('famous-views/SequentialLayout');
     *           var Surface = require('famous/Surface');
     *
     *           var Context = Engine.createContext();
     *           var sequentiallayout = new SequentialLayout({
     *               itemSpacing: 2
     *           });
     *
     *           var surfaces = [];
     *           for (var index = 0; index < 10; index++) {
     *               surfaces.push(
     *                   new Surface({
     *                       content: 'test ' + String(index + 1),
     *                       size: [window.innerWidth * 0.1 - 1, undefined],
     *                       properties: {
     *                           backgroundColor: '#3cf',
     *                       }
     *                   })
     *               );
     *           }
     *
     *           sequentiallayout.sequenceFrom(surfaces);
     *           Context.link(sequentiallayout);
     */
    function SequentialLayout(options) {
        this._items = null;
        this._size = null;
        this._outputFunction = SequentialLayout.DEFAULT_OUTPUT_FUNCTION;
        this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
        this.optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);
    }
    SequentialLayout.DEFAULT_OPTIONS = {
        direction: Utility.Direction.X,
        defaultItemSize: [ 50, 50 ],
        itemSpacing: 0
    };
    SequentialLayout.DEFAULT_OUTPUT_FUNCTION = function(input, offset, index) {
        var transform = this.options.direction === Utility.Direction.X ? Transform.translate(offset, 0) : Transform.translate(0, offset);
        return {
            transform: transform,
            target: input.render()
        };
    };
    SequentialLayout.prototype.getSize = function() {
        if (!this._size) this.render();
        // hack size in
        return this._size;
    };
    SequentialLayout.prototype.sequenceFrom = function(items) {
        if (items instanceof Array) items = new ViewSequence(items);
        this._items = items;
        return this;
    };
    SequentialLayout.prototype.setOptions = function(options) {
        this.optionsManager.setOptions.apply(this.optionsManager, arguments);
        return this;
    };
    SequentialLayout.prototype.setOutputFunction = function(outputFunction) {
        this._outputFunction = outputFunction;
        return this;
    };
    SequentialLayout.prototype.render = function() {
        var length = 0;
        var girth = 0;
        var lengthDim = this.options.direction === Utility.Direction.X ? 0 : 1;
        var girthDim = this.options.direction === Utility.Direction.X ? 1 : 0;
        var currentNode = this._items;
        var result = [];
        while (currentNode) {
            var item = currentNode.get();
            if (length) length += this.options.itemSpacing;
            // start flush
            var itemSize;
            if (item && item.getSize) itemSize = item.getSize();
            if (!itemSize) itemSize = this.options.defaultItemSize;
            if (itemSize[girthDim] !== true) girth = Math.max(girth, itemSize[girthDim]);
            var output = this._outputFunction.call(this, item, length, result.length);
            result.push(output);
            if (itemSize[lengthDim] && itemSize[lengthDim] !== true) length += itemSize[lengthDim];
            currentNode = currentNode.getNext();
        }
        if (!girth) girth = undefined;
        if (!this._size) this._size = [ 0, 0 ];
        this._size[lengthDim] = length;
        this._size[girthDim] = girth;
        return {
            size: this.getSize(),
            target: result
        };
    };
    module.exports = SequentialLayout;
}.bind(this));

require.register("famous_modules/famous/spec-parser/_git_modularized/index.js", function(exports, require, module) {
    var Transform = require("famous/transform");
    /**
     * @class SpecParser 
     * 
     * @description 
     *   This object translates the rendering instructions of type 
     *   {@link renderSpec} that {@link renderableComponent} objects generate 
     *   into direct document update instructions of type {@link updateSpec} 
     *   for the {@link SurfaceManager}.
     *   Scope: The {@link renderSpec} should be visible to component developers
     *   and deeper.  However, SpecParser This should not be visible below the 
     *   level of device developer.
     *
     * @name SpecParser
     * @constructor
     * 
     * @example 
     *   var parsedSpec = SpecParser.parse(spec);
     *   this.surfaceManager.update(parsedSpec);
     */
    function SpecParser() {
        this.reset();
    }
    /**
     * Convert a {@link renderSpec} coming from the context's render chain to an
     *    update spec for the update chain. This is the only major entrypoint
     *    for a consumer of this class. An optional callback of signature
     *    "function({@link updateSpec})" can be provided for call upon parse
     *    completion.
     *    
     * @name SpecParser#parse
     * @function
     * @static
     * 
     * @param {renderSpec} spec input render spec
     * @param {function(Object)} callback updateSpec-accepting function for 
     *   call on  completion
     * @returns {updateSpec} the resulting update spec (if no callback 
     *   specified, else none)
     */
    SpecParser.parse = function(spec, context, callback) {
        var sp = new SpecParser();
        var result = sp.parse(spec, context, Transform.identity);
        if (callback) callback(result); else return result;
    };
    /**
     * Convert a renderSpec coming from the context's render chain to an update
     *    spec for the update chain. This is the only major entrypoint for a
     *    consumer of this class.
     *    
     * @name SpecParser#parse
     * @function
     * 
     * @param {renderSpec} spec input render spec
     * @returns {updateSpec} the resulting update spec
     */
    SpecParser.prototype.parse = function(spec, context) {
        this.reset();
        this._parseSpec(spec, context, Transform.identity);
        return this.result;
    };
    /**
     * Prepare SpecParser for re-use (or first use) by setting internal state 
     *  to blank.
     *    
     * @name SpecParser#reset
     * @function
     */
    SpecParser.prototype.reset = function() {
        this.result = {};
    };
    /**
     * Transforms a delta vector to apply inside the context of another transform
     *
     * @name _vecInContext
     * @function
     * @private
     *
     * @param {Array.number} vector to apply
     * @param {FamousMatrix} matrix context 
     * @returns {Array.number} transformed delta vector
     */
    function _vecInContext(v, m) {
        return [ v[0] * m[0] + v[1] * m[4] + v[2] * m[8], v[0] * m[1] + v[1] * m[5] + v[2] * m[9], v[0] * m[2] + v[1] * m[6] + v[2] * m[10] ];
    }
    var _originZeroZero = [ 0, 0 ];
    /**
     * From the provided renderSpec tree, recursively compose opacities,
     *    origins, transforms, and groups corresponding to each surface id from
     *    the provided renderSpec tree structure. On completion, those
     *    properties of 'this' object should be ready to use to build an
     *    updateSpec.
     *    
     *    
     * @name SpecParser#_parseSpec
     * @function
     * @private
     * 
     * @param {renderSpec} spec input render spec for a node in the render tree.
     * @param {number|undefined} group group id to apply to this subtree
     * @param {FamousMatrix} parentTransform positional transform to apply to
     *    this subtree.
     * @param {origin=} parentOrigin origin behavior to apply to this subtree
     */
    SpecParser.prototype._parseSpec = function(spec, parentContext, sizeCtx) {
        if (spec === undefined) {} else if (typeof spec === "number") {
            var id = spec;
            var transform = parentContext.transform;
            if (parentContext.size && parentContext.origin && (parentContext.origin[0] || parentContext.origin[1])) {
                var originAdjust = [ parentContext.origin[0] * parentContext.size[0], parentContext.origin[1] * parentContext.size[1], 0 ];
                transform = Transform.move(transform, _vecInContext(originAdjust, sizeCtx));
            }
            this.result[id] = {
                transform: transform,
                opacity: parentContext.opacity,
                origin: parentContext.origin || _originZeroZero,
                size: parentContext.size
            };
        } else if (spec instanceof Array) {
            for (var i = 0; i < spec.length; i++) {
                this._parseSpec(spec[i], parentContext, sizeCtx);
            }
        } else if (spec.target !== undefined) {
            var target = spec.target;
            var transform = parentContext.transform;
            var opacity = parentContext.opacity;
            var origin = parentContext.origin;
            var size = parentContext.size;
            if (spec.opacity !== undefined) opacity = parentContext.opacity * spec.opacity;
            if (spec.transform) transform = Transform.multiply(parentContext.transform, spec.transform);
            if (spec.origin) origin = spec.origin;
            if (spec.size) {
                size = spec.size;
                var parentSize = parentContext.size;
                size = [ spec.size[0] || parentSize[0], spec.size[1] || parentSize[1] ];
                if (parentSize && origin && (origin[0] || origin[1])) {
                    transform = Transform.move(transform, _vecInContext([ origin[0] * parentSize[0], origin[1] * parentSize[1], 0 ], sizeCtx));
                    transform = Transform.moveThen([ -origin[0] * size[0], -origin[1] * size[1], 0 ], transform);
                }
                origin = null;
            }
            this._parseSpec(target, {
                transform: transform,
                opacity: opacity,
                origin: origin,
                size: size
            }, parentContext.transform);
        }
    };
    module.exports = SpecParser;
}.bind(this));

require.register("famous_modules/famous/render-node/_git_modularized/index.js", function(exports, require, module) {
    var Entity = require("famous/entity");
    var SpecParser = require("famous/spec-parser");
    /**
     * @class A tree node wrapping a
     *   {@link renderableComponent} (like a {@link FamousTransform} or
     *   {@link FamousSurface}) for insertion into the render tree.
     *
     * @description Note that class may be removed in the near future.
     *
     * Scope: Ideally, RenderNode should not be visible below the level
     * of component developer.
     *
     * @name RenderNode
     * @constructor
     *
     * @example  < This should not be used by component engineers >
     *
     * @param {renderableComponent} child Target renderable component
     */
    function RenderNode(object) {
        this._object = object ? object : null;
        this._child = null;
        this._hasCached = false;
        this._resultCache = {};
        this._prevResults = {};
        this._childResult = null;
    }
    /**
     * Append a renderable to its children.
     *
     * @name RenderNode#add
     * @function
     *
     * @returns {RenderNode} this render node
     */
    RenderNode.prototype.add = function(child) {
        var childNode = child instanceof RenderNode ? child : new RenderNode(child);
        if (this._child instanceof Array) this._child.push(childNode); else if (this._child) {
            this._child = [ this._child, childNode ];
            this._childResult = [];
        } else this._child = childNode;
        return childNode;
    };
    RenderNode.prototype.get = function() {
        return this._object || this._child.get();
    };
    RenderNode.prototype.getSize = function() {
        var target = this.get();
        if (target && target.getSize) {
            return target.getSize();
        } else {
            return this._child && this._child.getSize ? this._child.getSize() : null;
        }
    };
    RenderNode.prototype.commit = function(context) {
        var renderResult = this.render(undefined, this._hasCached);
        if (renderResult !== true) {
            // free up some divs from the last loop
            for (var i in this._prevResults) {
                if (!(i in this._resultCache)) {
                    var object = Entity.get(i);
                    if (object.cleanup) object.cleanup(context.allocator);
                }
            }
            this._prevResults = this._resultCache;
            this._resultCache = {};
            _applyCommit(renderResult, context, this._resultCache);
            this._hasCached = true;
        }
    };
    function _applyCommit(spec, context, cacheStorage) {
        var result = SpecParser.parse(spec, context);
        for (var i in result) {
            var childNode = Entity.get(i);
            var commitParams = result[i];
            commitParams.allocator = context.allocator;
            var commitResult = childNode.commit(commitParams);
            if (commitResult) _applyCommit(commitResult, context, cacheStorage); else cacheStorage[i] = commitParams;
        }
    }
    /**
     * Render the component wrapped directly by this node.
     *
     * @name RenderNode#render
     * @function
     *
     * @returns {renderSpec} render specification for the component subtree
     *    only under this node.
     */
    RenderNode.prototype.render = function() {
        if (this._object && this._object.render) return this._object.render();
        var result = {};
        if (this._child instanceof Array) {
            result = this._childResult;
            var children = this._child;
            for (var i = 0; i < children.length; i++) {
                result[i] = children[i].render();
            }
        } else if (this._child) {
            result = this._child.render();
        }
        if (this._object && this._object.modify) result = this._object.modify(result);
        return result;
    };
    module.exports = RenderNode;
}.bind(this));

require.register("famous_modules/famous/view/_git_modularized/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    var OptionsManager = require("famous/options-manager");
    var RenderNode = require("famous/render-node");
    /**
     * @class View
     *
     * @description 
     *  Consists of a render node paired with an input event handler and an
     *  output event handler. Useful for quickly creating elements within applications
     *  with large event systems.
     *   
     * @name View
     * @constructor
     * @example
     *   var Engine = require('famous/Engine');
     *   var FamousSurface = require('famous/Surface');
     *   var View = require('famous/View');
     *
     *   var Context = Engine.createContext();
     *
     *   var surface = new FamousSurface({
     *      size: [500,500],
     *      properties: {
     *           backgroundColor: 'red'
     *      }
     *   });
     *   
     *   var view = new View();
     *   view._link(surface);
     *
     *   Context.link(view);
     */
    function View(options) {
        this._node = new RenderNode();
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
        this.options = Object.create(this.constructor.DEFAULT_OPTIONS || View.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);
    }
    View.DEFAULT_OPTIONS = {};
    // no defaults
    View.prototype.getOptions = function() {
        return this._optionsManager.value();
    };
    View.prototype.setOptions = function(options) {
        this._optionsManager.patch(options);
    };
    //TODO: remove underscore
    //Mark comments: remove this function instead; non-underscored version would present abstraction violation
    View.prototype._add = function() {
        return this._node.add.apply(this._node, arguments);
    };
    View.prototype.render = function() {
        return this._node.render.apply(this._node, arguments);
    };
    View.prototype.getSize = function() {
        if (this._node && this._node.getSize) {
            return this._node.getSize.apply(this._node, arguments) || this.options.size;
        } else return this.options.size;
    };
    module.exports = View;
}.bind(this));

require.register("famous_modules/famous/views/header-footer-layout/_git_modularized/index.js", function(exports, require, module) {
    var Entity = require("famous/entity");
    var RenderNode = require("famous/render-node");
    var Transform = require("famous/transform");
    /**
     * @class A flexible layout that can sequentially lay out three renderables
     * @description
     *   Takes a header and footer of determinate length and a content of 
     *   flexible length. If headerSize property is omitted the size of the
     *   linked renderable will be used as the header size.
     * @name HeaderFooterLayout
     * @constructor
     * @example 
     *   var header = new Surface({
     *       size: [undefined, 100],
     *       content: 'Header / Caption'
     *   });
     *   var content = new Surface({
     *       content: 'Lorem ipsum sit dolor amet'
     *   });
     *   var footer = new Surface({
     *       size: [undefined, 100],
     *       content: 'Footer goes here'
     *   });
     *
     *   var myLayout = new HeaderFooterLayout();
     *   myLayout.id.header.link(header); // attach header
     *   myLayout.id.content.link(content); // attach content (will be auto-sized)
     *   myLayout.id.footer.link(footer); // attach footer
     *
     *   myContext.link(myLayout);
     */
    function HeaderFooterLayout(options) {
        this.options = Object.create(HeaderFooterLayout.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);
        this._entityId = Entity.register(this);
        this._header = new RenderNode();
        this._footer = new RenderNode();
        this._content = new RenderNode();
        this.id = {
            header: this._header,
            footer: this._footer,
            content: this._content
        };
    }
    /** @const */
    HeaderFooterLayout.DIRECTION_X = 0;
    /** @const */
    HeaderFooterLayout.DIRECTION_Y = 1;
    HeaderFooterLayout.DEFAULT_OPTIONS = {
        direction: HeaderFooterLayout.DIRECTION_Y,
        headerSize: undefined,
        footerSize: undefined,
        defaultHeaderSize: 0,
        defaultFooterSize: 0
    };
    HeaderFooterLayout.prototype.render = function() {
        return this._entityId;
    };
    HeaderFooterLayout.prototype.setOptions = function(options) {
        for (var key in HeaderFooterLayout.DEFAULT_OPTIONS) {
            if (options[key] !== undefined) this.options[key] = options[key];
        }
    };
    function _resolveNodeSize(node, defaultSize) {
        var nodeSize = node.getSize();
        return nodeSize ? nodeSize[this.options.direction] : defaultSize;
    }
    function _outputTransform(offset) {
        if (this.options.direction == HeaderFooterLayout.DIRECTION_X) return Transform.translate(offset, 0, 0); else return Transform.translate(0, offset, 0);
    }
    function _finalSize(directionSize, size) {
        if (this.options.direction == HeaderFooterLayout.DIRECTION_X) return [ directionSize, size[1] ]; else return [ size[0], directionSize ];
    }
    HeaderFooterLayout.prototype.commit = function(context) {
        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;
        var headerSize = this.options.headerSize !== undefined ? this.options.headerSize : _resolveNodeSize.call(this, this._header, this.options.defaultHeaderSize);
        var footerSize = this.options.footerSize !== undefined ? this.options.footerSize : _resolveNodeSize.call(this, this._footer, this.options.defaultFooterSize);
        var contentSize = size[this.options.direction] - headerSize - footerSize;
        var topOrigin = [ .5, .5 ];
        var bottomOrigin = [ .5, .5 ];
        topOrigin[this.options.direction] = 0;
        bottomOrigin[this.options.direction] = 1;
        var result = [ {
            origin: topOrigin,
            size: _finalSize.call(this, headerSize, size),
            target: this._header.render()
        }, {
            transform: _outputTransform.call(this, headerSize),
            origin: topOrigin,
            size: _finalSize.call(this, contentSize, size),
            target: this._content.render()
        }, {
            origin: bottomOrigin,
            size: _finalSize.call(this, footerSize, size),
            target: this._footer.render()
        } ];
        transform = Transform.moveThen([ -size[0] * origin[0], -size[1] * origin[1], 0 ], transform);
        var nextSpec = {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: result
        };
        return nextSpec;
    };
    module.exports = HeaderFooterLayout;
}.bind(this));

require.register("famous_modules/famous/views/light-box/_git_modularized/index.js", function(exports, require, module) {
    var Transform = require("famous/transform");
    var Modifier = require("famous/modifier");
    var RenderNode = require("famous/render-node");
    var Utility = require("famous/utilities/utility");
    /**
     * @class Show, hide, or switch between different renderables 
     *   with a configurable transitions and in/out states
     * @description
     * @name LightBox
     * @constructor
     */
    function LightBox(options) {
        this.options = {
            inTransform: Transform.scale(.001, .001, .001),
            inOpacity: 0,
            inOrigin: [ .5, .5 ],
            outTransform: Transform.scale(.001, .001, .001),
            outOpacity: 0,
            outOrigin: [ .5, .5 ],
            showTransform: Transform.identity,
            showOpacity: 1,
            showOrigin: [ .5, .5 ],
            inTransition: true,
            outTransition: true,
            overlap: false
        };
        if (options) this.setOptions(options);
        this._showing = false;
        this.nodes = [];
        this.transforms = [];
    }
    LightBox.prototype.getOptions = function() {
        return this.options;
    };
    LightBox.prototype.setOptions = function(options) {
        if (options.inTransform !== undefined) this.options.inTransform = options.inTransform;
        if (options.inOpacity !== undefined) this.options.inOpacity = options.inOpacity;
        if (options.inOrigin !== undefined) this.options.inOrigin = options.inOrigin;
        if (options.outTransform !== undefined) this.options.outTransform = options.outTransform;
        if (options.outOpacity !== undefined) this.options.outOpacity = options.outOpacity;
        if (options.outOrigin !== undefined) this.options.outOrigin = options.outOrigin;
        if (options.showTransform !== undefined) this.options.showTransform = options.showTransform;
        if (options.showOpacity !== undefined) this.options.showOpacity = options.showOpacity;
        if (options.showOrigin !== undefined) this.options.showOrigin = options.showOrigin;
        if (options.inTransition !== undefined) this.options.inTransition = options.inTransition;
        if (options.outTransition !== undefined) this.options.outTransition = options.outTransition;
        if (options.overlap !== undefined) this.options.overlap = options.overlap;
    };
    LightBox.prototype.show = function(renderable, transition, callback) {
        if (!renderable) {
            return this.hide(callback);
        }
        if (transition instanceof Function) {
            callback = transition;
            transition = undefined;
        }
        if (this._showing) {
            if (this.options.overlap) this.hide(); else {
                this.hide(this.show.bind(this, renderable, callback));
                return;
            }
        }
        this._showing = true;
        var transform = new Modifier({
            transform: this.options.inTransform,
            opacity: this.options.inOpacity,
            origin: this.options.inOrigin
        });
        var node = new RenderNode();
        node.add(transform).add(renderable);
        this.nodes.push(node);
        this.transforms.push(transform);
        var _cb = callback ? Utility.after(3, callback) : undefined;
        if (!transition) transition = this.options.inTransition;
        transform.setTransform(this.options.showTransform, transition, _cb);
        transform.setOpacity(this.options.showOpacity, transition, _cb);
        transform.setOrigin(this.options.showOrigin, transition, _cb);
    };
    LightBox.prototype.hide = function(transition, callback) {
        if (!this._showing) return;
        this._showing = false;
        if (transition instanceof Function) {
            callback = transition;
            transition = undefined;
        }
        var node = this.nodes[this.nodes.length - 1];
        var transform = this.transforms[this.transforms.length - 1];
        var _cb = Utility.after(3, function() {
            this.nodes.splice(this.nodes.indexOf(node), 1);
            this.transforms.splice(this.transforms.indexOf(transform), 1);
            if (callback) callback.call(this);
        }.bind(this));
        if (!transition) transition = this.options.outTransition;
        transform.setTransform(this.options.outTransform, transition, _cb);
        transform.setOpacity(this.options.outOpacity, transition, _cb);
        transform.setOrigin(this.options.outOrigin, transition, _cb);
    };
    LightBox.prototype.render = function() {
        var result = [];
        for (var i = 0; i < this.nodes.length; i++) {
            result.push(this.nodes[i].render());
        }
        return result;
    };
    module.exports = LightBox;
}.bind(this));

require.register("famous_modules/famous/element-allocator/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @class Helper object to {@link Context} that handles the process of 
     *   creating and allocating DOM elements within a managed div.  
     * @description
     * @name ElementAllocator
     * @constructor
     * 
     */
    function ElementAllocator(container) {
        if (!container) container = document.createDocumentFragment();
        this.container = container;
        this.detachedNodes = {};
        this.nodeCount = 0;
    }
    ElementAllocator.prototype.migrate = function(container) {
        var oldContainer = this.container;
        if (container === oldContainer) return;
        if (oldContainer instanceof DocumentFragment) {
            container.appendChild(oldContainer);
        } else {
            while (oldContainer.hasChildNodes()) {
                container.appendChild(oldContainer.removeChild(oldContainer.firstChild));
            }
        }
        this.container = container;
    };
    ElementAllocator.prototype.allocate = function(type) {
        type = type.toLowerCase();
        if (!(type in this.detachedNodes)) this.detachedNodes[type] = [];
        var nodeStore = this.detachedNodes[type];
        var result;
        if (nodeStore.length > 0) {
            result = nodeStore.pop();
        } else {
            result = document.createElement(type);
            this.container.appendChild(result);
        }
        this.nodeCount++;
        return result;
    };
    ElementAllocator.prototype.deallocate = function(element) {
        var nodeType = element.nodeName.toLowerCase();
        var nodeStore = this.detachedNodes[nodeType];
        nodeStore.push(element);
        this.nodeCount--;
    };
    ElementAllocator.prototype.getNodeCount = function() {
        return this.nodeCount;
    };
    module.exports = ElementAllocator;
}.bind(this));

require.register("famous_modules/famous/context/_git_modularized/index.js", function(exports, require, module) {
    var RenderNode = require("famous/render-node");
    var EventHandler = require("famous/event-handler");
    var SpecParser = require("famous/spec-parser");
    var ElementAllocator = require("famous/element-allocator");
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    /**
     * @class Context 
     * @description The top-level container for a Famous-renderable piece of the 
     *    document.  It is directly updated
     *   by the process-wide FamousEngine object, and manages one 
     *   render tree–event tree pair, which can contain other
     *   renderables and events.
     *
     * This constructor should only be called by the engine.
     * @name Context
     * @constructor
     * 
     * @example
     *   var mainDiv = document.querySelector('#main'); 
     *   var mainContext = FamousEngine.createContext(mainDiv);
     *   var surface = new FamousSurface([300,50], 'Hello World');
     *   mainContext.link(surface);
     *
     * 
     */
    function Context(container) {
        this.container = container;
        this.allocator = new ElementAllocator(container);
        this.srcNode = new RenderNode();
        this.eventHandler = new EventHandler();
        this._size = _getElementSize(this.container);
        this.perspectiveState = new Transitionable(0);
        this._perspective = undefined;
        this.eventHandler.on("resize", function() {
            this._size = _getElementSize(this.container);
        }.bind(this));
    }
    function _getElementSize(element) {
        return [ element.clientWidth, element.clientHeight ];
    }
    Context.prototype.getAllocator = function() {
        return this.allocator;
    };
    /**
     * Add renderables to this Context
     *
     * @name Context#add
     * @function
     * @param {renderableComponent} obj 
     * @returns {RenderNode} new node wrapping this object
     */
    Context.prototype.add = function(obj) {
        return this.srcNode.add(obj);
    };
    /**
     * Move this context to another container
     *
     * @name Context#migrate
     * @function
     * @param {Node} container Container node to migrate to
     */
    Context.prototype.migrate = function(container) {
        if (container === this.container) return;
        this.container = container;
        this.allocator.migrate(container);
    };
    /**
     * Gets viewport size for Context
     *
     * @name Context#getSize
     * @function
     *
     * @returns {Array} viewport size
     */
    Context.prototype.getSize = function() {
        return this._size;
    };
    /**
     * Sets viewport size for Context
     *
     * @name Context#setSize
     * @function
     */
    Context.prototype.setSize = function(size) {
        if (!size) size = _getElementSize(this.container);
        this._size = size;
    };
    /**
     * Run the render loop and then the run the update loop for the content 
     *   managed by this context. 
     *
     * @name Context#update
     * @function
     */
    Context.prototype.update = function() {
        var perspective = this.perspectiveState.get();
        if (perspective !== this._perspective) {
            this.container.style.perspective = perspective ? perspective.toFixed() + "px" : "";
            this.container.style.webkitPerspective = perspective ? perspective.toFixed() : "";
            this._perspective = perspective;
        }
        if (this.srcNode) {
            this.srcNode.commit({
                allocator: this.getAllocator(),
                transform: Transform.identity,
                opacity: 1,
                origin: [ 0, 0 ],
                size: this._size
            });
        }
    };
    Context.prototype.getPerspective = function() {
        return this.perspectiveState.get();
    };
    Context.prototype.setPerspective = function(perspective, transition, callback) {
        return this.perspectiveState.set(perspective, transition, callback);
    };
    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @name Context#emit
     * @function
     *
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     */
    Context.prototype.emit = function(type, event) {
        return this.eventHandler.emit(type, event);
    };
    /**
     * Bind a handler function to an event type occuring in the context.
     *   These events will either come link calling {@link Context#emit} or
     *   directly link the document.  
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the FamousSurface upon which the event occurs, then 
     *   by the on() method of the Context containing that surface, and
     *   finally as a default, the FamousEngine itself. 
     *
     * @name Context#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Context.prototype.on = function(type, handler) {
        return this.eventHandler.on(type, handler);
    };
    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Context#on}
     *
     * @name Context#unbind
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler 
     */
    Context.prototype.unbind = function(type, handler) {
        return this.eventHandler.unbind(type, handler);
    };
    /**
     * Emit Context events to downstream event handler
     *
     * @name Context#pipe
     * @function
     * @param {EventHandler} target downstream event handler
     */
    Context.prototype.pipe = function(target) {
        return this.eventHandler.pipe(target);
    };
    /**
     * Stop emitting events to a downstream event handler
     *
     * @name Context#unpipe
     * @function
     * @param {EventHandler} target downstream event handler
     */
    Context.prototype.unpipe = function(target) {
        return this.eventHandler.unpipe(target);
    };
    module.exports = Context;
}.bind(this));

require.register("famous_modules/famous/engine/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @namespace Engine
     * 
     * @description The singleton object initiated upon process
     *    startup which manages all active {@link Context} instances, runs
     *    the render dispatch loop, and acts as a global listener and dispatcher
     *    for all events. Public functions include
     *    adding contexts and functions for execution at each render tick.
     * 
     *   On static initialization, window.requestAnimationFrame is called with
     *   the event loop function, step().
     * 
     *   Note: Any window in which Engine runs will prevent default 
     *     scrolling behavior on the 'touchmove' event.
     * @static
     * 
     * @name Engine
     * 
     * @example
     *   var mainDiv = document.querySelector('#main'); 
     *   var mainContext = Engine.createContext(mainDiv);
     *   var surface = new FamousSurface([300,50], 'Hello World');
     *   mainContext.from(helloWorldSurface);
     */
    var Context = require("famous/context");
    var EventHandler = require("famous/event-handler");
    var OptionsManager = require("famous/options-manager");
    var Engine = {};
    var contexts = [];
    var nextTickQueue = [];
    var deferQueue = [];
    var lastTime = Date.now();
    var frameTime = undefined;
    var frameTimeLimit = undefined;
    var loopEnabled = true;
    var eventForwarders = {};
    var eventHandler = new EventHandler();
    var options = {
        containerType: "div",
        containerClass: "famous-container",
        fpsCap: undefined,
        runLoop: true
    };
    var optionsManager = new OptionsManager(options);
    optionsManager.on("change", function(data) {
        if (data.id === "fpsCap") setFPSCap(data.value); else if (data.id === "runLoop") {
            // kick off the loop only if it was stopped
            if (!loopEnabled && data.value) {
                loopEnabled = true;
                requestAnimationFrame(loop);
            }
        }
    });
    /** @const */
    var MAX_DEFER_FRAME_TIME = 10;
    /**
     * Inside requestAnimationFrame loop, this function is called which:
     *   - calculates current FPS (throttling loop if it is over limit set in setFPSCap)
     *   - emits dataless 'prerender' event on start of loop
     *   - calls in order any one-shot functions registered by nextTick on last loop.
     *   - calls Context.update on all {@link Context} objects registered.
     *   - emits dataless 'postrender' event on end of loop
     * @name Engine#step
     * @function
     * @private
     */
    Engine.step = function() {
        var currentTime = Date.now();
        // skip frame if we're over our framerate cap
        if (frameTimeLimit && currentTime - lastTime < frameTimeLimit) return;
        frameTime = currentTime - lastTime;
        lastTime = currentTime;
        eventHandler.emit("prerender");
        // empty the queue
        for (var i = 0; i < nextTickQueue.length; i++) nextTickQueue[i].call(this);
        nextTickQueue.splice(0);
        // limit total execution time for deferrable functions
        while (deferQueue.length && Date.now() - currentTime < MAX_DEFER_FRAME_TIME) {
            deferQueue.shift().call(this);
        }
        for (var i = 0; i < contexts.length; i++) contexts[i].update();
        eventHandler.emit("postrender");
    };
    function loop() {
        if (options.runLoop) {
            Engine.step();
            requestAnimationFrame(loop);
        } else loopEnabled = false;
    }
    requestAnimationFrame(loop);
    /**
     * Upon main document window resize (unless on an "input" HTML element)
     *   - scroll to the top left corner of the window
     *   - For each managed {@link Context}: emit the 'resize' event and update its size 
     * @name Engine#step
     * @function
     * @static
     * @private
     * 
     * @param {Object=} event
     */
    function handleResize(event) {
        if (document.activeElement && document.activeElement.nodeName == "INPUT") {
            document.activeElement.addEventListener("blur", function deferredResize() {
                this.removeEventListener("blur", deferredResize);
                handleResize(event);
            });
            return;
        }
        window.scrollTo(0, 0);
        for (var i = 0; i < contexts.length; i++) {
            contexts[i].emit("resize");
        }
        eventHandler.emit("resize");
    }
    window.addEventListener("resize", handleResize, false);
    handleResize();
    // prevent scrolling via browser
    window.addEventListener("touchmove", function(event) {
        event.preventDefault();
    }, false);
    /**
     * Pipes all events to a target object that implements the #emit() interface.
     * TODO: Confirm that "uncaught" events that bubble up to the document.
     * @name Engine#pipe
     * @function
     * @param {emitterObject} target target emitter object
     * @returns {emitterObject} target emitter object (for chaining)
     */
    Engine.pipe = function(target) {
        if (target.subscribe instanceof Function) return target.subscribe(Engine); else return eventHandler.pipe(target);
    };
    /**
     * Stop piping all events at the Engine level to a target emitter 
     *   object.  Undoes the work of {@link Engine#pipe}.
     * 
     * @name Engine#unpipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    Engine.unpipe = function(target) {
        if (target.unsubscribe instanceof Function) return target.unsubscribe(Engine); else return eventHandler.unpipe(target);
    };
    /**
     * Bind a handler function to a document or Engine event.
     *   These events will either come from calling {@link Engine#emit} or
     *   directly from the document.  The document events to which Engine 
     *   listens by default include: 'touchstart', 'touchmove', 'touchend', 
     *   'touchcancel', 
     *   'click', 'keydown', 'keyup', 'keypress', 'mousemove', 
     *   'mouseover', 'mouseout'.  
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the FamousSurface upon which the event occurs, then 
     *   by the on() method of the Context containing that surface, and
     *   finally as a default, the Engine itself.
     * @static
     * @name Engine#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Engine.on = function(type, handler) {
        if (!(type in eventForwarders)) {
            eventForwarders[type] = eventHandler.emit.bind(eventHandler, type);
            document.body.addEventListener(type, eventForwarders[type]);
        }
        return eventHandler.on(type, handler);
    };
    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @static
     * @name Engine#emit
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     */
    Engine.emit = function(type, event) {
        return eventHandler.emit(type, event);
    };
    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Engine#on}
     * 
     * @static
     * @name Engine#unbind
     * @function
     * @param {string} type 
     * @param {function(string, Object)} handler 
     */
    Engine.unbind = function(type, handler) {
        return eventHandler.unbind(type, handler);
    };
    /**
     * Return the current calculated frames per second of the Engine.
     * 
     * @static
     * @name Engine#getFPS
     * @function
     * @returns {number} calculated fps
     */
    Engine.getFPS = function() {
        return 1e3 / frameTime;
    };
    /**
     * Set the maximum fps at which the system should run. If internal render
     *    loop is called at a greater frequency than this FPSCap, Engine will
     *    throttle render and update until this rate is achieved.
     * 
     * @static
     * @name Engine#setFPS
     * @function
     * @param {number} fps desired fps
     */
    Engine.setFPSCap = function(fps) {
        frameTimeLimit = Math.floor(1e3 / fps);
    };
    /**
     * Return engine options
     * 
     * @static
     * @name Engine#getOptions
     * @function
     * @returns {Object} options
     */
    Engine.getOptions = function() {
        return optionsManager.getOptions.apply(optionsManager, arguments);
    };
    /**
     * Set engine options
     * 
     * @static
     * @name Engine#setOptions
     * @function
     */
    Engine.setOptions = function(options) {
        return optionsManager.setOptions.apply(optionsManager, arguments);
    };
    /**
     * Creates a new context for Famous rendering and event handling with
     *    provided HTML element as top of each tree. This will be tracked by the
     *    process-wide {@link Engine}.
     *
     * Note: syntactic sugar
     *
     * @static
     * @name Engine#createContext
     * @function
     * @param {Element} el Top of document tree
     * @returns {Context}
     */
    Engine.createContext = function(el) {
        if (el === undefined) {
            el = document.createElement(options.containerType);
            el.classList.add(options.containerClass);
            document.body.appendChild(el);
        } else if (!(el instanceof Element)) {
            el = document.createElement(options.containerType);
            console.warn("Tried to create context on non-existent element");
        }
        var context = new Context(el);
        Engine.registerContext(context);
        return context;
    };
    /**
     * Registers a context
     *
     * @static
     * @name FamousEngine#registerContext
     * @function
     * @param {Context} context Context to register
     * @returns {FamousContext}
     */
    Engine.registerContext = function(context) {
        contexts.push(context);
        return context;
    };
    /**
     * Queue a function to be executed on the next tick of the {@link
     *    Engine}.  The function's only argument will be the 
     *    JS window object.
     *    
     * @static
     * @name Engine#nextTick
     * @function
     * @param {Function} fn
     */
    Engine.nextTick = function(fn) {
        nextTickQueue.push(fn);
    };
    /**
     * Queue a function to be executed sometime soon, at a time that is
     *    unlikely to affect framerate.
     *
     * @static
     * @name Engine#defer
     * @function
     * @param {Function} fn
     */
    Engine.defer = function(fn) {
        deferQueue.push(fn);
    };
    module.exports = Engine;
}.bind(this));

require.register("famous_modules/famous/utilities/timer/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @class Timer
     * @description An internal library to reproduce javascript time-based scheduling.
     *   Using standard javascript setTimeout methods can have a negative performance impact
     *   when combined with the Famous rendering process, so instead require Timer and call
     *   Timer.setTimeout, Timer.setInterval, etc.
     * 
     * @name Timer
     * @constructor
     */
    var Engine = require("famous/engine");
    var _event = "prerender";
    var getTime = window.performance ? function() {
        return performance.now();
    } : function() {
        return Date.now();
    };
    function addTimerFunction(fn) {
        Engine.on(_event, fn);
        return fn;
    }
    function setTimeout(fn, duration) {
        var t = getTime();
        var callback = function() {
            var t2 = getTime();
            if (t2 - t >= duration) {
                fn.apply(this, arguments);
                Engine.unbind(_event, callback);
            }
        };
        return addTimerFunction(callback);
    }
    function setInterval(fn, duration) {
        var t = getTime();
        var callback = function() {
            var t2 = getTime();
            if (t2 - t >= duration) {
                fn.apply(this, arguments);
                t = getTime();
            }
        };
        return addTimerFunction(callback);
    }
    function after(fn, numTicks) {
        if (numTicks === undefined) return;
        var callback = function() {
            numTicks--;
            if (numTicks <= 0) {
                //in case numTicks is fraction or negative
                fn.apply(this, arguments);
                clear(callback);
            }
        };
        return addTimerFunction(callback);
    }
    function every(fn, numTicks) {
        numTicks = numTicks || 1;
        var initial = numTicks;
        var callback = function() {
            numTicks--;
            if (numTicks <= 0) {
                //in case numTicks is fraction or negative
                fn.apply(this, arguments);
                numTicks = initial;
            }
        };
        return addTimerFunction(callback);
    }
    function clear(fn) {
        Engine.unbind(_event, fn);
    }
    function debounce(func, wait) {
        var timeout, ctx, timestamp, result, args;
        return function() {
            ctx = this;
            args = arguments;
            timestamp = getTime();
            var fn = function() {
                var last = getTime - timestamp;
                if (last < wait) {
                    timeout = setTimeout(fn, wait - last);
                } else {
                    timeout = null;
                    result = func.apply(ctx, args);
                }
            };
            if (!timeout) {
                timeout = setTimeout(fn, wait);
            }
            return result;
        };
    }
    module.exports = {
        setTimeout: setTimeout,
        setInterval: setInterval,
        debounce: debounce,
        after: after,
        every: every,
        clear: clear
    };
}.bind(this));

require.register("famous_modules/famous/surfaces/container-surface/_git_modularized/index.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Context = require("famous/context");
    /**
     * @class ContainerSurface
     *
     * @description 
     *   An object designed to contain surfaces and set properties
     *   to be applied to all of them at once.
     *  * A container surface will enforce these properties on the 
     *   surfaces it contains:
     *     * size (clips contained surfaces to its own width and height)
     *     * origin
     *     * its own opacity and transform, which will be automatically 
     *       applied to  all Surfaces contained directly and indirectly.
     *   These properties are maintained through a {@link 
     *   SurfaceManager} unique to this Container Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name ContainerSurface
     * @extends Surface
     * @constructor
     */
    function ContainerSurface(options) {
        Surface.call(this, options);
        this._container = document.createElement("div");
        this._container.classList.add("famous-group");
        this._container.style.width = "100%";
        this._container.style.height = "100%";
        this._container.style.position = "relative";
        this._shouldRecalculateSize = false;
        this.context = new Context(this._container);
        this.setContent(this._container);
    }
    ContainerSurface.prototype = Object.create(Surface.prototype);
    ContainerSurface.prototype.constructor = ContainerSurface;
    ContainerSurface.prototype.elementType = "div";
    ContainerSurface.prototype.elementClass = "famous-surface";
    ContainerSurface.prototype.link = function() {
        return this.context.link.apply(this.context, arguments);
    };
    ContainerSurface.prototype.add = function() {
        return this.context.add.apply(this.context, arguments);
    };
    ContainerSurface.prototype.mod = function() {
        return this.context.mod.apply(this.context, arguments);
    };
    ContainerSurface.prototype.render = function() {
        if (this._sizeDirty) this._shouldRecalculateSize = true;
        return Surface.prototype.render.apply(this, arguments);
    };
    ContainerSurface.prototype.deploy = function() {
        this._shouldRecalculateSize = true;
        return Surface.prototype.deploy.apply(this, arguments);
    };
    ContainerSurface.prototype.commit = function(context, transform, opacity, origin, size) {
        var previousSize = this._size ? [ this._size[0], this._size[1] ] : null;
        var result = Surface.prototype.commit.apply(this, arguments);
        if (this._shouldRecalculateSize || previousSize && (this._size[0] !== previousSize[0] || this._size[1] !== previousSize[1])) {
            this.context.setSize();
            this._shouldRecalculateSize = false;
        }
        this.context.update();
        return result;
    };
    module.exports = ContainerSurface;
}.bind(this));

require.register("famous_modules/famous/input/touch-tracker/_git_modularized/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    /**
     * @class Helper to TouchSync – tracks piped in touch events, organizes touch 
     *        events by ID, and emits track events back to TouchSync.
     * @description
     * @name TouchTracker
     * @constructor
     */
    function TouchTracker(selective) {
        this.selective = selective;
        this.touchHistory = {};
        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        EventHandler.setOutputHandler(this, this.eventOutput);
        this.eventInput.on("touchstart", _handleStart.bind(this));
        this.eventInput.on("touchmove", _handleMove.bind(this));
        this.eventInput.on("touchend", _handleEnd.bind(this));
        this.eventInput.on("touchcancel", _handleEnd.bind(this));
        this.eventInput.on("unpipe", _handleUnpipe.bind(this));
    }
    function _timestampTouch(touch, origin, history, count) {
        var touchClone = {};
        for (var i in touch) touchClone[i] = touch[i];
        return {
            touch: touchClone,
            origin: origin,
            timestamp: Date.now(),
            count: count,
            history: history
        };
    }
    function _handleStart(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var data = _timestampTouch(touch, event.origin, undefined, event.touches.length);
            this.eventOutput.emit("trackstart", data);
            if (!this.selective && !this.touchHistory[touch.identifier]) this.track(data);
        }
    }
    function _handleMove(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var history = this.touchHistory[touch.identifier];
            if (history) {
                var data = _timestampTouch(touch, event.origin, history, event.touches.length);
                this.touchHistory[touch.identifier].push(data);
                this.eventOutput.emit("trackmove", data);
            }
        }
    }
    function _handleEnd(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var history = this.touchHistory[touch.identifier];
            if (history) {
                var data = _timestampTouch(touch, event.origin, history, event.touches.length);
                this.eventOutput.emit("trackend", data);
                delete this.touchHistory[touch.identifier];
            }
        }
    }
    function _handleUnpipe(event) {
        for (var i in this.touchHistory) {
            var history = this.touchHistory[i];
            this.eventOutput.emit("trackend", {
                touch: history[history.length - 1].touch,
                timestamp: Date.now(),
                count: 0,
                history: history
            });
            delete this.touchHistory[i];
        }
    }
    TouchTracker.prototype.track = function(data) {
        this.touchHistory[data.touch.identifier] = [ data ];
    };
    module.exports = TouchTracker;
}.bind(this));

require.register("famous_modules/famous/input/touch-sync/_git_modularized/index.js", function(exports, require, module) {
    var TouchTracker = require("famous/input/touch-tracker");
    var EventHandler = require("famous/event-handler");
    /**
     * @class Handles piped in touch events. On update it outputs an
     *        object with position, velocity, acceleration, and touch id. On end
     *        it outputs an object with position, velocity, count, and touch id.
     * @description
     * @name TouchSync
     * @constructor
     * @example
     * 
     *     var Engine = require('famous/Engine');
     *     var Surface = require('famous/Surface');
     *     var Modifier = require('famous/Modifier');
     *     var FM = require('famous/Matrix');
     *     var TouchSync = require('famous-sync/TouchSync');
     *     var Context = Engine.createContext();
     *
     *     var surface = new Surface({
     *         size: [200,200],
     *         properties: {
     *             backgroundColor: 'red'
     *         }
     *     });
     *
     *     var modifier = new Modifier({
     *         transform: undefined
     *     });
     *
     *     var position = 0;
     *     var sync = new TouchSync(function(){
     *         return position;
     *     }, {direction: TouchSync.DIRECTION_Y});  
     *
     *     surface.pipe(sync);
     *     sync.on('update', function(data) {
     *         var edge = window.innerHeight - (surface.getSize()[1])
     *         if (data.p > edge) {
     *             position = edge;
     *         } else if (data.p < 0) {
     *             position = 0;
     *         } else {
     *             position = data.p;
     *         }
     *         modifier.setTransform(FM.translate(0, position, 0));
     *         surface.setContent('position' + position + '<br>' + 'velocity' + data.v.toFixed(2));
     *     });
     *     Context.link(modifier).link(surface);
     * 
     */
    function TouchSync(targetSync, options) {
        this.targetGet = targetSync;
        this.output = new EventHandler();
        this.touchTracker = new TouchTracker();
        this.options = {
            direction: undefined,
            rails: false,
            scale: 1
        };
        if (options) {
            this.setOptions(options);
        } else {
            this.setOptions(this.options);
        }
        EventHandler.setOutputHandler(this, this.output);
        EventHandler.setInputHandler(this, this.touchTracker);
        this.touchTracker.on("trackstart", _handleStart.bind(this));
        this.touchTracker.on("trackmove", _handleMove.bind(this));
        this.touchTracker.on("trackend", _handleEnd.bind(this));
    }
    /** @const */
    TouchSync.DIRECTION_X = 0;
    /** @const */
    TouchSync.DIRECTION_Y = 1;
    function _handleStart(data) {
        this.output.emit("start", {
            count: data.count,
            touch: data.touch.identifier
        });
    }
    function _handleMove(data) {
        var history = data.history;
        var prevTime = history[history.length - 2].timestamp;
        var currTime = history[history.length - 1].timestamp;
        var prevTouch = history[history.length - 2].touch;
        var currTouch = history[history.length - 1].touch;
        var diffX = currTouch.pageX - prevTouch.pageX;
        var diffY = currTouch.pageY - prevTouch.pageY;
        if (this.options.rails) {
            if (Math.abs(diffX) > Math.abs(diffY)) diffY = 0; else diffX = 0;
        }
        var diffTime = Math.max(currTime - prevTime, 8);
        // minimum tick time
        var velX = diffX / diffTime;
        var velY = diffY / diffTime;
        //DV edits to send acceleration and velocity
        if (history.length > 2) {
            var prevprevTouch = history[history.length - 3].touch;
            var accelX = (currTouch.pageX - 2 * prevTouch.pageX + prevprevTouch.pageX) / (diffTime * diffTime);
            var accelY = (currTouch.pageY - 2 * prevTouch.pageY + prevprevTouch.pageY) / (diffTime * diffTime);
        } else {
            var accelX = 0;
            var accelY = 0;
        }
        var prevPos = this.targetGet();
        var scale = this.options.scale;
        var nextPos;
        var nextVel;
        var nextAccel;
        if (this.options.direction == TouchSync.DIRECTION_X) {
            nextPos = prevPos + scale * diffX;
            nextVel = scale * velX;
            nextAccel = scale * velY;
        } else if (this.options.direction == TouchSync.DIRECTION_Y) {
            nextPos = prevPos + scale * diffY;
            nextVel = scale * velY;
            nextAccel = scale * accelY;
        } else {
            nextPos = [ prevPos[0] + scale * diffX, prevPos[1] + scale * diffY ];
            nextVel = [ scale * velX, scale * velY ];
            nextAccel = [ scale * accelX, scale * accelY ];
        }
        this.output.emit("update", {
            p: nextPos,
            v: nextVel,
            a: nextAccel,
            touch: data.touch.identifier
        });
    }
    function _handleEnd(data) {
        var nextVel = this.options.direction !== undefined ? 0 : [ 0, 0 ];
        var history = data.history;
        var count = data.count;
        var pos = this.targetGet();
        if (history.length > 1) {
            var prevTime = history[history.length - 2].timestamp;
            var currTime = history[history.length - 1].timestamp;
            var prevTouch = history[history.length - 2].touch;
            var currTouch = history[history.length - 1].touch;
            var diffX = currTouch.pageX - prevTouch.pageX;
            var diffY = currTouch.pageY - prevTouch.pageY;
            if (this.options.rails) {
                if (Math.abs(diffX) > Math.abs(diffY)) diffY = 0; else diffX = 0;
            }
            var diffTime = Math.max(currTime - prevTime, 1);
            // minimum tick time
            var velX = diffX / diffTime;
            var velY = diffY / diffTime;
            var scale = this.options.scale;
            var nextVel;
            if (this.options.direction == TouchSync.DIRECTION_X) nextVel = scale * velX; else if (this.options.direction == TouchSync.DIRECTION_Y) nextVel = scale * velY; else nextVel = [ scale * velX, scale * velY ];
        }
        this.output.emit("end", {
            p: pos,
            v: nextVel,
            count: count,
            touch: data.touch.identifier
        });
    }
    TouchSync.prototype.setOptions = function(options) {
        if (options.direction !== undefined) this.options.direction = options.direction;
        if (options.rails !== undefined) this.options.rails = options.rails;
        if (options.scale !== undefined) this.options.scale = options.scale;
    };
    TouchSync.prototype.getOptions = function() {
        return this.options;
    };
    module.exports = TouchSync;
}.bind(this));

require.register("famous_modules/famous/math/vector/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @class An immutable three-element floating point vector.
     *
     * @description Note that if not using the "out" parameter,
     *    then funtions return a common reference to an internal register.
     *
     * * Class/Namespace TODOs:
     *   * Are there any vector STANDARDS in JS that we can use instead of our own library?
     *   * Is it confusing that this is immutable?
     *   * All rotations are counter-clockwise in a right-hand system.  Need to doc this
     *     somewhere since Famous render engine's rotations are left-handed (clockwise)
     *
     * Constructor: Take three elts or an array and make new vec.
     *
     * @name Vector
     * @constructor
     */
    function Vector(x, y, z) {
        if (arguments.length === 1) this.set(x); else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        return this;
    }
    var register = new Vector(0, 0, 0);
    /**
     * Add to another Vector, element-wise.
     *
     * @name Vector#add
     * @function
     * @returns {Vector}
     */
    Vector.prototype.add = function(v) {
        return register.setXYZ(this.x + (v.x || 0), this.y + (v.y || 0), this.z + (v.z || 0));
    };
    /**
     * Subtract from another Vector, element-wise.
     *
     * @name Vector#sub
     * @function
     * @returns {Vector}
     */
    Vector.prototype.sub = function(v) {
        return register.setXYZ(this.x - v.x, this.y - v.y, this.z - v.z);
    };
    /**
     * Scale Vector by floating point r.
     *
     * @name Vector#mult
     * @function
     * @returns {number}
     */
    Vector.prototype.mult = function(r) {
        return register.setXYZ(r * this.x, r * this.y, r * this.z);
    };
    /**
     * Scale Vector by floating point 1/r.
     *
     * @name Vector#div
     * @function
     * @returns {number}
     */
    Vector.prototype.div = function(r) {
        return this.mult(1 / r);
    };
    /**
     * Return cross product with another Vector (LHC)
     *
     * @name Vector#cross
     * @function
     * @returns {Vector}
     */
    Vector.prototype.cross = function(v) {
        var x = this.x, y = this.y, z = this.z;
        var vx = v.x, vy = v.y, vz = v.z;
        return register.setXYZ(z * vy - y * vz, x * vz - z * vx, y * vx - x * vy);
    };
    /**
     * Component-wise equality test between this and Vector v.
     * @name Vector#equals
     * @function
     * @returns {boolean}
     */
    Vector.prototype.equals = function(v) {
        return v.x == this.x && v.y == this.y && v.z == this.z;
    };
    /**
     * Rotate clockwise around x-axis by theta degrees.
     *
     * @name Vector#rotateX
     * @function
     * @returns {Vector}
     */
    Vector.prototype.rotateX = function(theta) {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return register.setXYZ(x, y * cosTheta - z * sinTheta, y * sinTheta + z * cosTheta);
    };
    /**
     * Rotate clockwise around y-axis by theta degrees.
     *
     * @name Vector#rotateY
     * @function
     * @returns {Vector}
     */
    Vector.prototype.rotateY = function(theta, out) {
        out = out || register;
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return out.setXYZ(z * sinTheta + x * cosTheta, y, z * cosTheta - x * sinTheta);
    };
    /**
     * Rotate clockwise around z-axis by theta degrees.
     *
     * @name Vector#rotateZ
     * @function
     * @returns {Vector}
     */
    Vector.prototype.rotateZ = function(theta) {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return register.setXYZ(x * cosTheta - y * sinTheta, x * sinTheta + y * cosTheta, z);
    };
    /**
     * Take dot product of this with a second Vector
     *
     * @name Vector#dot
     * @function
     * @returns {number}
     */
    Vector.prototype.dot = function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    };
    /**
     * Take dot product of this with a this Vector
     *
     * @name Vector#normSquared
     * @function
     * @returns {number}
     */
    Vector.prototype.normSquared = function() {
        return this.dot(this);
    };
    /**
     * Find Euclidean length of the Vector.
     *
     * @name Vector#norm
     * @function
     * @returns {number}
     */
    Vector.prototype.norm = function() {
        return Math.sqrt(this.normSquared());
    };
    /**
     * Scale Vector to specified length.
     * If length is less than internal tolerance, set vector to [length, 0, 0].
     *
     * * TODOs:
     *    * There looks to be a bug or unexplained behavior in here.  Why would
     *      we defer to a multiple of e_x for being below tolerance?
     *
     * @name Vector#normalize
     * @function
     * @returns {Vector}
     */
    Vector.prototype.normalize = function(length) {
        length = length !== undefined ? length : 1;
        var tolerance = 1e-7;
        var norm = this.norm();
        if (Math.abs(norm) > tolerance) return register.set(this.mult(length / norm)); else return register.setXYZ(length, 0, 0);
    };
    /**
     * Make a separate copy of the Vector.
     *
     * @name Vector#clone
     * @function
     * @returns {Vector}
     */
    Vector.prototype.clone = function() {
        return new Vector(this);
    };
    /**
     * True if and only if every value is 0 (or falsy)
     *
     * @name Vector#isZero
     * @function
     * @returns {boolean}
     */
    Vector.prototype.isZero = function() {
        return !(this.x || this.y || this.z);
    };
    Vector.prototype.setFromArray = function(v) {
        this.x = v[0];
        this.y = v[1];
        this.z = v[2] || 0;
        return this;
    };
    /**
     * Set this Vector to the values in the provided Array or Vector.
     *
     * TODO: set from Array disambiguation
     *
     * @name Vector#set
     * @function
     * @returns {Vector}
     */
    Vector.prototype.set = function(v) {
        if (v instanceof Array) {
            this.setFromArray(v);
        }
        if (v instanceof Vector) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }
        if (typeof v == "number") {
            this.x = v;
            this.y = 0;
            this.z = 0;
        }
        if (this !== register) register.clear();
        return this;
    };
    /**
     * Put result of last internal calculation in
     *   specified output vector.
     *
     * @name Vector#put
     * @function
     * @returns {Vector}
     */
    Vector.prototype.put = function(v) {
        v.set(register);
    };
    /**
     * Set elements directly and clear internal register.
     *   This is the a "mutating" method on this Vector.
     *
     *
     * @name Vector#setXYZ
     * @function
     */
    Vector.prototype.setXYZ = function(x, y, z) {
        register.clear();
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };
    /**
     * Set elements to 0.
     *
     * @name Vector#clear
     * @function
     */
    Vector.prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    };
    /**
     * Scale this Vector down to specified "cap" length.
     * If Vector shorter than cap, or cap is Infinity, do nothing.
     *
     *
     * @name Vector#cap
     * @function
     * @returns {Vector}
     */
    Vector.prototype.cap = function(cap) {
        if (cap === Infinity) return register.set(this);
        var norm = this.norm();
        if (norm > cap) return register.set(this.mult(cap / norm)); else return register.set(this);
    };
    /**
     * Return projection of this Vector onto another.
     *
     * @name Vector#project
     * @function
     * @returns {Vector}
     */
    Vector.prototype.project = function(n) {
        return n.mult(this.dot(n));
    };
    /**
     * Reflect this Vector across provided vector.
     *
     * @name Vector#reflect
     * @function
     */
    Vector.prototype.reflectAcross = function(n) {
        n.set(n.normalize());
        return register.set(this.sub(this.project(n).mult(2)));
    };
    /**
     * Convert Vector to three-element array.
     *
     * * TODOs:
     *   * Why do we have this and get()?
     *
     * @name Vector#toArray
     * @function
     */
    Vector.prototype.toArray = function() {
        return [ this.x, this.y, this.z ];
    };
    /**
     * Convert Vector to three-element array.
     *
     * * TODOs:
     *   * Why do we have this and toArray()?
     *
     * @name Vector#get
     * @function
     */
    Vector.prototype.get = function() {
        return this.toArray();
    };
    module.exports = Vector;
}.bind(this));

require.register("famous_modules/famous/physics/bodies/particle/_git_modularized/index.js", function(exports, require, module) {
    var RenderNode = require("famous/render-node");
    var Vector = require("famous/math/vector");
    var Matrix = require("famous/transform");
    /**
     *
     * @class A unit controlled by the physics engine which serves to provide position. 
     *
     * @description This is essentially the state object for the a particle's
     *    fundamental properties of position, velocity, acceleration, and force,
     *    which makes its position available through the render() function.
     *    Legal opts: (p)osition, (v)elocity, (a)cceleration, (f)orce, (m)ass,
     *       restitution, and dissipation.
     * 
     *
     * * Class/Namespace TODOs
     *
     * @name Particle
     * @constructor
     */
    function Particle(opts) {
        opts = opts || {};
        this.p = opts.p ? new Vector(opts.p) : new Vector(0, 0, 0);
        this.v = opts.v ? new Vector(opts.v) : new Vector(0, 0, 0);
        this.f = opts.f ? new Vector(opts.f) : new Vector(0, 0, 0);
        //scalars
        this.m = opts.m !== undefined ? opts.m : 1;
        //mass
        this.restitution = opts.restitution !== undefined ? opts.restitution : .5;
        //collision damping
        this.dissipation = opts.dissipation !== undefined ? opts.dissipation : 0;
        //velocity damping
        this.axis = opts.axis !== undefined ? opts.axis : undefined;
        //TODO: find better solution
        this.setImmunity(opts.immunity || Particle.IMMUNITIES.NONE);
        this.mInv = 1 / this.m;
        this.size = [ 0, 0, 0 ];
        //bounding box
        this.node = undefined;
        this.spec = {
            size: [ false, false ],
            target: {
                origin: [ .5, .5 ],
                transform: undefined,
                target: undefined
            }
        };
    }
    Particle.AXIS = {
        X: 1,
        Y: 2,
        Z: 4
    };
    Particle.IMMUNITIES = {
        NONE: 0,
        POSITION: 1,
        VELOCITY: 2,
        ROTATION: 4,
        AGENTS: 8,
        UPDATE: 16
    };
    for (var key in Particle.IMMUNITIES) Particle.IMMUNITIES.ALL |= Particle.IMMUNITIES[key];
    /**
     * Basic setter function for position Vector  
     * @name Particle#setPos
     * @function
     */
    Particle.prototype.setPos = function(p) {
        this.p.set(p);
    };
    /**
     * Basic getter function for position Vector 
     * @name Particle#getPos
     * @function
     */
    Particle.prototype.getPos = function() {
        return this.p.get();
    };
    /**
     * Basic setter function for velocity Vector 
     * @name Particle#setVel
     * @function
     */
    Particle.prototype.setVel = function(v) {
        if (this.hasImmunity(Particle.IMMUNITIES.VELOCITY)) return;
        this.v.set(v);
    };
    /**
     * Basic getter function for velocity Vector 
     * @name Particle#getVel
     * @function
     */
    Particle.prototype.getVel = function() {
        return this.v.get();
    };
    /**
     * Basic setter function for mass quantity 
     * @name Particle#setMass
     * @function
     */
    Particle.prototype.setMass = function(m) {
        this.m = m;
        this.mInv = 1 / m;
    };
    /**
     * Basic getter function for mass quantity 
     * @name Particle#getMass
     * @function
     */
    Particle.prototype.getMass = function() {
        return this.m;
    };
    Particle.prototype.addImmunity = function(immunity) {
        if (typeof immunity == "string") immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        this.immunity |= immunity;
    };
    Particle.prototype.removeImmunity = function(immunity) {
        if (typeof immunity == "string") immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        this.immunity &= ~immunity;
    };
    Particle.prototype.setImmunity = function(immunity) {
        if (typeof immunity == "string") immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        this.immunity = immunity;
    };
    Particle.prototype.hasImmunity = function(immunity) {
        if (typeof immunity == "string") immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        return this.getImmunity() & immunity;
    };
    /**
     * Basic getter function for immunity
     * @name Particle#getImmunity
     * @function
     */
    Particle.prototype.getImmunity = function() {
        return this.immunity;
    };
    /**
     * Set position, velocity, force, and accel Vectors each to (0, 0, 0)
     * @name Particle#reset
     * @function
     */
    Particle.prototype.reset = function(p, v) {
        p = p || [ 0, 0, 0 ];
        v = v || [ 0, 0, 0 ];
        this.setPos(p);
        this.setVel(v);
    };
    /**
     * Add force Vector to existing internal force Vector
     * @name Particle#applyForce
     * @function
     */
    Particle.prototype.applyForce = function(force) {
        if (this.hasImmunity(Particle.IMMUNITIES.AGENTS)) return;
        this.f.set(this.f.add(force));
    };
    /**
     * Add impulse (force*time) Vector to this Vector's velocity. 
     * @name Particle#applyImpulse
     * @function
     */
    Particle.prototype.applyImpulse = function(impulse) {
        if (this.hasImmunity(Particle.IMMUNITIES.AGENTS)) return;
        this.setVel(this.v.add(impulse.mult(this.mInv)));
    };
    /**
     * Get kinetic energy of the particle.
     * @name Particle#getEnergy
     * @function
     */
    Particle.prototype.getEnergy = function() {
        return .5 * this.m * this.v.normSquared();
    };
    /**
     * Generate current positional transform from position (calculated)
     *   and rotation (provided only at construction time)
     * @name Particle#getTransform
     * @function
     */
    Particle.prototype.getTransform = function() {
        var p = this.p;
        var axis = this.axis;
        if (axis !== undefined) {
            if (axis & ~Particle.AXIS.X) {
                p.x = 0;
            }
            if (axis & ~Particle.AXIS.Y) {
                p.y = 0;
            }
            if (axis & ~Particle.AXIS.Z) {
                p.z = 0;
            }
        }
        return Matrix.translate(p.x, p.y, p.z);
    };
    /**
     * Declare that this Particle's position will affect the provided node
     *    in the render tree.
     * 
     * @name Particle#link
     * @function
     *    
     * @returns {FamousRenderNode} a new render node for the provided
     *    renderableComponent.
     */
    Particle.prototype.link = function(obj) {
        if (!this.node) this.node = new RenderNode();
        return this.node.link(obj);
    };
    Particle.prototype.add = function(obj) {
        if (!this.node) this.node = new RenderNode();
        return this.node.add(obj);
    };
    Particle.prototype.replace = function(obj) {
        this.node.object = obj;
    };
    /**
     * Return {@link renderSpec} of this particle.  This will render the render tree
     *   attached via #from and adjusted by the particle's caluculated position
     *
     * @name Particle#render
     * @function
     */
    Particle.prototype.render = function(target) {
        target = target !== undefined ? target : this.node.render();
        this.spec.target.transform = this.getTransform();
        this.spec.target.target = target;
        return this.spec;
    };
    module.exports = Particle;
}.bind(this));

require.register("famous_modules/famous/physics/forces/force/_git_modularized/index.js", function(exports, require, module) {
    var Vector = require("famous/math/vector");
    /** @constructor */
    function Force() {
        this.force = new Vector();
    }
    Force.prototype.setOpts = function(opts) {
        for (var key in opts) this.opts[key] = opts[key];
    };
    Force.prototype.applyConstraint = function() {};
    Force.prototype.setupSlider = function(slider, property) {
        property = property || slider.opts.name;
        slider.setOpts({
            value: this.opts[property]
        });
        if (slider.init) slider.init();
        slider.on("change", function(data) {
            this.opts[property] = data.value;
        }.bind(this));
    };
    Force.prototype.getEnergy = function() {
        return 0;
    };
    module.exports = Force;
}.bind(this));

require.register("famous_modules/famous/physics/forces/drag/_git_modularized/index.js", function(exports, require, module) {
    var Force = require("famous/physics/forces/force");
    /** @constructor */
    function Drag(opts) {
        this.opts = {
            strength: .01,
            forceFunction: Drag.FORCE_FUNCTIONS.LINEAR
        };
        if (opts) this.setOpts(opts);
        Force.call(this);
    }
    Drag.prototype = Object.create(Force.prototype);
    Drag.prototype.constructor = Force;
    Drag.FORCE_FUNCTIONS = {
        LINEAR: function(v) {
            return v;
        },
        QUADRATIC: function(v) {
            return v.mult(v.norm());
        }
    };
    Drag.prototype.applyForce = function(particles) {
        var strength = this.opts.strength;
        var forceFunction = this.opts.forceFunction;
        var force = this.force;
        for (var index = 0; index < particles.length; index++) {
            var particle = particles[index];
            forceFunction(particle.v).mult(-strength).put(force);
            particle.applyForce(force);
        }
    };
    Drag.prototype.setOpts = function(opts) {
        for (var key in opts) this.opts[key] = opts[key];
    };
    module.exports = Drag;
}.bind(this));

require.register("famous_modules/famous/physics/constraints/constraint/_git_modularized/index.js", function(exports, require, module) {
    /** @constructor */
    function Constraint() {}
    Constraint.prototype.setOpts = function(opts) {
        for (var key in opts) this.opts[key] = opts[key];
    };
    Constraint.prototype.applyConstraint = function() {};
    Constraint.prototype.setupSlider = function(slider, property) {
        property = property || slider.opts.name;
        slider.setOpts({
            value: this.opts[property]
        });
        if (slider.init) slider.init();
        slider.on("change", function(data) {
            this.opts[property] = data.value;
        }.bind(this));
    };
    module.exports = Constraint;
}.bind(this));

require.register("famous_modules/famous/physics/integrator/symplectic-euler/_git_modularized/index.js", function(exports, require, module) {
    /** @constructor */
    function SymplecticEuler(opts) {
        this.opts = {
            velocityCap: Infinity,
            angularVelocityCap: Infinity
        };
        if (opts) this.setOpts(opts);
    }
    SymplecticEuler.prototype.integrateVelocity = function(particle, dt) {
        var v = particle.v, m = particle.m, f = particle.f;
        if (f.isZero()) return;
        particle.setVel(v.add(f.mult(dt / m)));
        f.clear();
    };
    SymplecticEuler.prototype.integratePosition = function(particle, dt) {
        var p = particle.p, v = particle.v;
        if (v.isZero()) return;
        v.set(v.cap(this.opts.velocityCap));
        particle.setPos(p.add(v.mult(dt)));
    };
    SymplecticEuler.prototype.integrateAngularMomentum = function(particle, dt) {
        var L = particle.L, t = particle.t;
        if (t.isZero()) return;
        t.set(t.cap(this.opts.angularVelocityCap));
        L.add(t.mult(dt)).put(L);
        t.clear();
    };
    SymplecticEuler.prototype.integrateOrientation = function(particle, dt) {
        var q = particle.q, w = particle.w;
        if (w.isZero()) return;
        q.set(q.add(q.multiply(w).scalarMultiply(.5 * dt)));
        q.set(q.normalize());
    };
    SymplecticEuler.prototype.setOpts = function(opts) {
        for (var key in opts) this.opts[key] = opts[key];
    };
    module.exports = SymplecticEuler;
}.bind(this));

require.register("famous_modules/famous/math/quaternion/_git_modularized/index.js", function(exports, require, module) {
    /**
     * @constructor
     */
    function Quaternion(w, x, y, z) {
        if (arguments.length === 1) this.set(w); else {
            this.w = w !== undefined ? w : 1;
            //Angle
            this.x = x !== undefined ? x : 0;
            //Axis.x
            this.y = y !== undefined ? y : 0;
            //Axis.y
            this.z = z !== undefined ? z : 0;
        }
        return this;
    }
    var register = new Quaternion(1, 0, 0, 0);
    Quaternion.prototype.add = function(q) {
        return register.setWXYZ(this.w + q.w, this.x + q.x, this.y + q.y, this.z + q.z);
    };
    Quaternion.prototype.sub = function(q) {
        return register.setWXYZ(this.w - q.w, this.x - q.x, this.y - q.y, this.z - q.z);
    };
    Quaternion.prototype.scalarDivide = function(s) {
        return this.scalarMultiply(1 / s);
    };
    Quaternion.prototype.scalarMultiply = function(s) {
        return register.setWXYZ(this.w * s, this.x * s, this.y * s, this.z * s);
    };
    Quaternion.prototype.multiply = function(q) {
        //left-handed coordinate system multiplication
        var x1 = this.x, y1 = this.y, z1 = this.z, w1 = this.w;
        var x2 = q.x, y2 = q.y, z2 = q.z, w2 = q.w || 0;
        return register.setWXYZ(w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2, x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2, y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1, z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2);
    };
    var conj = new Quaternion(1, 0, 0, 0);
    Quaternion.prototype.rotateVector = function(v) {
        conj.set(this.conj());
        return register.set(this.multiply(v).multiply(conj));
    };
    Quaternion.prototype.inverse = function() {
        return register.set(this.conj().scalarDivide(this.normSquared()));
    };
    Quaternion.prototype.negate = function() {
        return this.scalarMultiply(-1);
    };
    Quaternion.prototype.conj = function() {
        return register.setWXYZ(this.w, -this.x, -this.y, -this.z);
    };
    Quaternion.prototype.normalize = function(length) {
        length = length === undefined ? 1 : length;
        return this.scalarDivide(length * this.norm());
    };
    Quaternion.prototype.makeFromAngleAndAxis = function(angle, v) {
        //left handed quaternion creation: theta -> -theta
        var n = v.normalize();
        var ha = angle * .5;
        var s = -Math.sin(ha);
        this.x = s * n.x;
        this.y = s * n.y;
        this.z = s * n.z;
        this.w = Math.cos(ha);
        return this;
    };
    Quaternion.prototype.setWXYZ = function(w, x, y, z) {
        register.clear();
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };
    Quaternion.prototype.set = function(v) {
        if (v instanceof Array) {
            this.w = v[0];
            this.x = v[1];
            this.y = v[2];
            this.z = v[3];
        } else {
            this.w = v.w;
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }
        if (this !== register) register.clear();
        return this;
    };
    Quaternion.prototype.put = function(q) {
        q.set(register);
    };
    Quaternion.prototype.clone = function() {
        return new Quaternion(this);
    };
    Quaternion.prototype.clear = function() {
        this.w = 1;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
    };
    Quaternion.prototype.isEqual = function(q) {
        return q.w == this.w && q.x == this.x && q.y == this.y && q.z == this.z;
    };
    Quaternion.prototype.dot = function(q) {
        return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
    };
    Quaternion.prototype.normSquared = function() {
        return this.dot(this);
    };
    Quaternion.prototype.norm = function() {
        return Math.sqrt(this.normSquared());
    };
    Quaternion.prototype.isZero = function() {
        return !(this.x || this.y || this.z);
    };
    Quaternion.prototype.getMatrix = function() {
        var temp = this.normalize(1);
        var x = temp.x, y = temp.y, z = temp.z, w = temp.w;
        //LHC system flattened to column major = RHC flattened to row major
        return [ 1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w, 0, 2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w, 0, 2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y, 0, 0, 0, 0, 1 ];
    };
    Quaternion.prototype.getMatrix3x3 = function() {
        var temp = this.normalize(1);
        var x = temp.x, y = temp.y, z = temp.z, w = temp.w;
        //LHC system flattened to row major
        return [ [ 1 - 2 * y * y - 2 * z * z, 2 * x * y + 2 * z * w, 2 * x * z - 2 * y * w ], [ 2 * x * y - 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z + 2 * x * w ], [ 2 * x * z + 2 * y * w, 2 * y * z - 2 * x * w, 1 - 2 * x * x - 2 * y * y ] ];
    };
    var epsilon = 1e-5;
    Quaternion.prototype.slerp = function(q, t) {
        var omega, cosomega, sinomega, scaleFrom, scaleTo;
        cosomega = this.dot(q);
        if (1 - cosomega > epsilon) {
            omega = Math.acos(cosomega);
            sinomega = Math.sin(omega);
            scaleFrom = Math.sin((1 - t) * omega) / sinomega;
            scaleTo = Math.sin(t * omega) / sinomega;
        } else {
            scaleFrom = 1 - t;
            scaleTo = t;
        }
        return register.set(this.scalarMultiply(scaleFrom / scaleTo).add(q).multiply(scaleTo));
    };
    module.exports = Quaternion;
}.bind(this));

require.register("famous_modules/famous/physics/bodies/body/_git_modularized/index.js", function(exports, require, module) {
    var Particle = require("famous/physics/bodies/particle");
    var Vector = require("famous/math/vector");
    var Quaternion = require("famous/math/quaternion");
    var Transform = require("famous/transform");
    function Body(opts) {
        Particle.call(this, opts);
        this.q = opts.q ? new Quaternion(opts.q) : new Quaternion();
        //orientation
        this.w = opts.w ? new Vector(opts.w) : new Vector();
        //angular velocity
        this.L = opts.L ? new Vector(opts.L) : new Vector();
        //angular momentum
        this.t = opts.t ? new Vector(opts.t) : new Vector();
        //torque
        this.I = [ 1, 0, 0, 1, 0, 0, 1, 0, 0 ];
        //inertia tensor
        this.Iinv = [ 1, 0, 0, 1, 0, 0, 1, 0, 0 ];
        //inverse inertia tensor
        this.w.w = 0;
        //quaternify the angular velocity
        //register
        this.pWorld = new Vector();
    }
    Body.prototype = Object.create(Particle.prototype);
    Body.prototype.constructor = Body;
    Body.IMMUNITIES = Particle.IMMUNITIES;
    Body.prototype.updateAngularVelocity = function() {
        var Iinv = this.Iinv;
        var L = this.L;
        var Lx = L.x, Ly = L.y, Lz = L.z;
        var I0 = Iinv[0], I1 = Iinv[1], I2 = Iinv[2];
        this.w.setXYZ(I0[0] * Lx + I0[1] * Ly + I0[2] * Lz, I1[0] * Lx + I1[1] * Ly + I1[2] * Lz, I2[0] * Lx + I2[1] * Ly + I2[2] * Lz);
    };
    Body.prototype.toWorldCoordinates = function(localPosition) {
        var q = this.q;
        localPosition.w = 0;
        return this.pWorld.set(q.inverse().multiply(localPosition).multiply(q));
    };
    Body.prototype.getEnergy = function() {
        var w = this.w;
        var I = this.I;
        var wx = w.x, wy = w.y, wz = w.z;
        var I0 = this.I[0], I1 = I[1], I2 = I[2];
        return .5 * (this.m * this.v.normSquared() + I0[0] * wx * wx + I0[1] * wx * wy + I0[2] * wx * wz + I1[0] * wy * wx + I1[1] * wy * wy + I1[2] * wy * wz + I2[0] * wz * wx + I2[1] * wz * wy + I2[2] * wz * wz);
    };
    Body.prototype.reset = function(p, v, q, L) {
        this.setPos(p || [ 0, 0, 0 ]);
        this.setVel(v || [ 0, 0, 0 ]);
        this.w.clear();
        this.setOrientation(q || [ 1, 0, 0, 0 ]);
        this.setAngularMomentum(L || [ 0, 0, 0 ]);
    };
    Body.prototype.setOrientation = function(q) {
        this.q.set(q);
    };
    Body.prototype.setAngularMomentum = function(L) {
        this.L.set(L);
    };
    Body.prototype.applyForce = function(force, location) {
        if (this.hasImmunity(Body.IMMUNITIES.AGENTS)) return;
        this.f.set(this.f.add(force));
        if (location !== undefined) this.applyTorque(location.cross(force));
    };
    Body.prototype.applyTorque = function(torque) {
        if (this.hasImmunity(Body.IMMUNITIES.ROTATION)) return;
        this.t.set(this.t.add(torque));
    };
    Body.prototype.getTransform = function() {
        return Transform.move(this.q.getMatrix(), this.p.get());
    };
    module.exports = Body;
}.bind(this));

require.register("famous_modules/famous/physics/bodies/circle/_git_modularized/index.js", function(exports, require, module) {
    var Body = require("famous/physics/bodies/body");
    /**
     * @class An elemental circle-shaped Particle in the physics engine.
     * 
     * @description This is a region defined by a radius.
     *    Its size is the dimension of the bounding square.
     *
     *
     * * Class/Namespace TODOs
     * 
     * * opts: 
     *    * r: radius
     *    * inherited opts from: {@link Particle}.
     * 
     * @name Circle
     * @extends Particle
     * @constructor
     * @example TODO
     */
    function Circle(opts) {
        Body.call(this, opts);
        opts = opts || {};
        this.r = opts.r || 0;
        //radius
        this.size = [ 2 * this.r, 2 * this.r ];
        var r = this.r;
        var m = this.m;
        this.I = [ [ .25 * m * r * r, 0, 0 ], [ 0, .25 * m * r * r, 0 ], [ 0, 0, .5 * m * r * r ] ];
        this.Iinv = [ [ 4 / (m * r * r), 0, 0 ], [ 0, 4 / (m * r * r), 0 ], [ 0, 0, 2 / (m * r * r) ] ];
    }
    Circle.prototype = Object.create(Body.prototype);
    Circle.prototype.constructor = Circle;
    Circle.IMMUNITIES = Body.IMMUNITIES;
    module.exports = Circle;
}.bind(this));

require.register("famous_modules/famous/physics/bodies/rectangle/_git_modularized/index.js", function(exports, require, module) {
    var Body = require("famous/physics/bodies/body");
    /*
     * @class An elemental rectangle-shaped Particle in the physics engine.
     * 
     * @description This is a region defined by a 2D box. 
     *
     * * Class/Namespace TODOs
     * 
     * * opts: 
     *   * size: ([height, width]) array
     *   * inherited opts from: {@link Particle}.
     *
     * @name Rectangle
     * @extends Particle
     * @example TODO
     * @constructor
     */
    function Rectangle(opts) {
        Body.call(this, opts);
        opts = opts || {};
        this.size = opts.size || [ 0, 0 ];
        var w = this.size[0];
        var h = this.size[1];
        this.I = [ [ h * h / 12, 0, 0 ], [ 0, w * w / 12, 0 ], [ 0, 0, (w * w + h * h) / 12 ] ];
        this.Iinv = [ [ 12 / (h * h), 0, 0 ], [ 0, 12 / (w * w), 0 ], [ 0, 0, 12 / (w * w + h * h) ] ];
    }
    Rectangle.prototype = Object.create(Body.prototype);
    Rectangle.prototype.constructor = Rectangle;
    Rectangle.IMMUNITIES = Body.IMMUNITIES;
    module.exports = Rectangle;
}.bind(this));

require.register("famous_modules/famous/physics/engine/_git_modularized/index.js", function(exports, require, module) {
    var Particle = require("famous/physics/bodies/particle");
    var Body = require("famous/physics/bodies/body");
    var Circle = require("famous/physics/bodies/circle");
    var Rectangle = require("famous/physics/bodies/rectangle");
    var Force = require("famous/physics/forces/force");
    var Constraint = require("famous/physics/constraints/constraint");
    var Integrator = require("famous/physics/integrator/symplectic-euler");
    /** @constructor */
    function PhysicsEngine(opts) {
        //default options
        this.opts = {
            speed: 1,
            steps: 1,
            velocityCap: Infinity,
            angularVelocityCap: Infinity,
            constraintSteps: 1,
            constraintTolerance: 1e-4
        };
        if (opts) this.setOpts(opts);
        this._particles = [];
        //list of managed particles
        this._agents = {};
        //list of managed agents
        this._forces = [];
        //list of IDs of agents that are forces
        this._constraints = [];
        //list of IDs of agents that are constraints
        this._playing = true;
        this._buffer = 0;
        this._timestep = 1e3 / 60 / this.opts.steps;
        this._prevTime = undefined;
        this._currTime = undefined;
        this._integrator = new Integrator({
            velocityCap: this.opts.velocityCap,
            angularVelocityCap: this.opts.angularVelocityCap
        });
        this._currAgentId = 0;
        this.BODIES = PhysicsEngine.BODIES;
    }
    /* enum */
    PhysicsEngine.BODIES = {
        POINT: Particle,
        BODY: Body,
        CIRCLE: Circle,
        RECTANGLE: Rectangle
    };
    PhysicsEngine.IMMUNITIES = Particle.IMMUNITIES;
    //PRIVATE METHODS
    function getTime() {
        return Date.now();
    }
    //PUBLIC METHODS
    PhysicsEngine.prototype.setOpts = function(opts) {
        for (var key in opts) if (this.opts[key]) this.opts[key] = opts[key];
    };
    PhysicsEngine.prototype.addBody = function(body) {
        this._particles.push(body);
        return body;
    };
    // TODO: deprecate
    PhysicsEngine.prototype.createParticle = function(opts) {
        return this.addBody(new Particle(opts));
    };
    PhysicsEngine.prototype.createBody = function(opts) {
        var shape = opts.shape || PhysicsEngine.BODIES.POINT;
        return this.addBody(new shape(opts));
    };
    PhysicsEngine.prototype.remove = function(target) {
        var index = this._particles.indexOf(target);
        if (index > -1) {
            for (var i = 0; i < Object.keys(this._agents); i++) this.detachFrom(i, target);
            this._particles.splice(index, 1);
        }
    };
    function attachOne(agent, targets, source) {
        if (targets === undefined) targets = this.getParticles();
        if (!(targets instanceof Array)) targets = [ targets ];
        this._agents[this._currAgentId] = {
            agent: agent,
            targets: targets,
            source: source
        };
        _mapAgentArray.call(this, agent).push(this._currAgentId);
        return this._currAgentId++;
    }
    PhysicsEngine.prototype.attach = function(agents, targets, source) {
        if (agents instanceof Array) {
            var agentIDs = [];
            for (var i = 0; i < agents.length; i++) agentIDs[i] = attachOne.call(this, agents[i], targets, source);
            return agentIDs;
        } else return attachOne.call(this, agents, targets, source);
    };
    PhysicsEngine.prototype.attachTo = function(agentID, target) {
        _getBoundAgent.call(this, agentID).targets.push(target);
    };
    PhysicsEngine.prototype.detach = function(id) {
        // detach from forces/constraints array
        var agent = this.getAgent(id);
        var agentArray = _mapAgentArray.call(this, agent);
        var index = agentArray.indexOf(id);
        agentArray.splice(index, 1);
        // detach agents array
        delete this._agents[id];
    };
    PhysicsEngine.prototype.detachFrom = function(id, target) {
        var boundAgent = _getBoundAgent.call(this, id);
        if (boundAgent.source === target) this.detach(id); else {
            var targets = boundAgent.targets;
            var index = targets.indexOf(target);
            if (index > -1) targets.splice(index, 1);
        }
    };
    PhysicsEngine.prototype.detachAll = function() {
        this._agents = {};
        this._forces = [];
        this._constraints = [];
        this._currAgentId = 0;
    };
    function _mapAgentArray(agent) {
        if (agent instanceof Force) return this._forces;
        if (agent instanceof Constraint) return this._constraints;
    }
    function _getBoundAgent(id) {
        return this._agents[id];
    }
    PhysicsEngine.prototype.getAgent = function(id) {
        return _getBoundAgent.call(this, id).agent;
    };
    PhysicsEngine.prototype.getParticles = function() {
        return this._particles;
    };
    PhysicsEngine.prototype.getParticlesExcept = function(particles) {
        var result = [];
        this.forEachParticle(function(particle) {
            if (particles.indexOf(particle) === -1) result.push(particle);
        });
        return result;
    };
    PhysicsEngine.prototype.getPos = function(particle) {
        return (particle || this._particles[0]).getPos();
    };
    PhysicsEngine.prototype.getVel = function(particle) {
        return (particle || this._particles[0]).getVel();
    };
    PhysicsEngine.prototype.getTransform = function(particle) {
        return (particle || this._particles[0]).getTransform();
    };
    PhysicsEngine.prototype.setPos = function(pos, particle) {
        (particle || this._particles[0]).setPos(pos);
    };
    PhysicsEngine.prototype.setVel = function(vel, particle) {
        (particle || this._particles[0]).setVel(vel);
    };
    PhysicsEngine.prototype.forEachParticle = function(fn, args) {
        var particles = this.getParticles();
        for (var index = 0, len = particles.length; index < len; index++) fn.call(this, particles[index], args);
    };
    function _updateForce(index) {
        var boundAgent = _getBoundAgent.call(this, this._forces[index]);
        boundAgent.agent.applyForce(boundAgent.targets, boundAgent.source);
    }
    function _updateConstraint(index, dt) {
        var boundAgent = this._agents[this._constraints[index]];
        return boundAgent.agent.applyConstraint(boundAgent.targets, boundAgent.source, dt);
    }
    function updateForces() {
        for (var index = this._forces.length - 1; index > -1; index--) _updateForce.call(this, index);
    }
    function updateConstraints(dt) {
        //Todo: while statement here until tolerance is met
        var err = Infinity;
        var iteration = 0;
        var tolerance = this.opts.constraintTolerance;
        while (iteration < this.opts.constraintSteps) {
            err = 0;
            for (var index = this._constraints.length - 1; index > -1; index--) err += _updateConstraint.call(this, index, dt);
            iteration++;
        }
    }
    function _updateVelocity(particle, dt) {
        if (particle.hasImmunity(Particle.IMMUNITIES.UPDATE)) return;
        this._integrator.integrateVelocity(particle, dt);
    }
    function _updateAngularVelocity(particle) {
        if (particle.hasImmunity(Particle.IMMUNITIES.ROTATION)) return;
        if (particle instanceof Body) particle.updateAngularVelocity();
    }
    function _updateAngularMomentum(particle, dt) {
        if (particle.hasImmunity(Particle.IMMUNITIES.ROTATION)) return;
        if (particle instanceof Body) this._integrator.integrateAngularMomentum(particle, dt);
    }
    function _updatePosition(particle, dt) {
        if (particle.hasImmunity(Particle.IMMUNITIES.UPDATE)) return;
        this._integrator.integratePosition(particle, dt);
    }
    function _updateOrientation(particle, dt) {
        if (particle.hasImmunity(Particle.IMMUNITIES.ROTATION)) return;
        if (particle instanceof Body) this._integrator.integrateOrientation(particle, dt);
    }
    function updateVelocities(dt) {
        this.forEachParticle(_updateVelocity, dt);
    }
    function updatePositions(dt) {
        this.forEachParticle(_updatePosition, dt);
    }
    function updateAngularVelocities() {
        this.forEachParticle(_updateAngularVelocity);
    }
    function updateAngularMomenta(dt) {
        this.forEachParticle(_updateAngularMomentum, dt);
    }
    function updateOrientations(dt) {
        this.forEachParticle(_updateOrientation, dt);
    }
    function integrate(dt) {
        updateForces.call(this);
        updateVelocities.call(this, dt);
        updateAngularMomenta.call(this, dt);
        updateAngularVelocities.call(this, dt);
        updateConstraints.call(this, dt);
        updatePositions.call(this, dt);
        updateOrientations.call(this, dt);
    }
    PhysicsEngine.prototype.step = function(dt) {
        if (!this._playing) return;
        //set previous time on initialization
        if (!this._prevTime) this._prevTime = getTime();
        //set current frame's time
        this._currTime = getTime();
        //milliseconds elapsed since last frame
        var dtFrame = this._currTime - this._prevTime;
        this._prevTime = this._currTime;
        if (dtFrame == 0) return;
        //robust integration
        // this._buffer += dtFrame;
        // while (this._buffer > this._timestep){
        //     integrate.call(this, this.opts.speed * this._timestep);
        //     this._buffer -= this._timestep;
        // };
        //simple integration
        integrate.call(this, this.opts.speed * this._timestep);
    };
    PhysicsEngine.prototype.render = function(target) {
        this.step();
        var result = [];
        this.forEachParticle(function(particle) {
            result.push(particle.render(target));
        });
        return result;
    };
    PhysicsEngine.prototype.play = function() {
        this._prevTime = getTime();
        this._playing = true;
    };
    PhysicsEngine.prototype.pause = function() {
        this._playing = false;
    };
    PhysicsEngine.prototype.toggle = function() {
        this._playing ? this.pause() : this.play();
    };
    PhysicsEngine.prototype.reverseTime = function() {
        this.opts.speed *= -1;
    };
    PhysicsEngine.prototype.reverseVelocities = function() {
        this.forEachParticle(function(particle) {
            particle.v.mult(-1, particle.v);
        });
    };
    module.exports = PhysicsEngine;
}.bind(this));

require.register("famous_modules/famous/transitions/drag-transition/_git_modularized/index.js", function(exports, require, module) {
    var PE = require("famous/physics/engine");
    var Drag = require("famous/physics/forces/drag");
    /** @constructor */
    function DragTransition(state) {
        this.drag = new Drag({
            strength: DragTransition.DEFAULT_OPTIONS.strength
        });
        this._restTolerance = 1e-8;
        this._active = false;
        this.PE = new PE();
        this.particle = this.PE.createParticle();
        this.PE.attach(this.drag, this.particle);
        this.dimensions = undefined;
        _setTarget.call(this, state || 0);
    }
    DragTransition.SUPPORTS_MULTIPLE = 3;
    DragTransition.DEFAULT_OPTIONS = {
        strength: .01,
        velocity: 0
    };
    function _update() {
        if (!this._active) {
            if (this._callback) {
                var cb = this._callback;
                this._callback = undefined;
                cb();
            }
            return;
        }
        this.PE.step();
        var energy = _getEnergy.call(this);
        if (energy < this._restTolerance) {
            _sleep.call(this);
            _setParticleVelocity.call(this, [ 0, 0, 0 ]);
        }
    }
    function _getEnergy() {
        return this.particle.getEnergy();
    }
    function _setupDefinition(def) {
        var defaults = DragTransition.DEFAULT_OPTIONS;
        if (def.strength === undefined) def.strength = defaults.strength;
        this.drag.setOpts({
            strength: def.strength
        });
        //setup particle
        _setParticleVelocity.call(this, def.velocity);
    }
    function _wake() {
        this.PE.play();
        this._active = true;
    }
    function _sleep() {
        this.PE.pause();
        this._active = false;
    }
    function _setTarget(state) {
        _setParticlePosition.call(this, state);
    }
    function _setParticlePosition(p) {
        this.particle.p.set(p);
    }
    function _setParticleVelocity(v) {
        this.particle.v.set(v);
    }
    function _getParticlePosition() {
        return this.dimensions === 1 ? this.particle.p.x : this.particle.p.get();
    }
    function _getParticleVelocity() {
        return this.dimensions === 1 ? this.particle.v.x : this.particle.v.get();
    }
    function _setCallback(callback) {
        this.callback = callback;
    }
    DragTransition.prototype.reset = function(state, velocity) {
        if (state instanceof Array) this.dimensions = state.length; else this.dimensions = 1;
        if (velocity !== undefined) _setParticleVelocity.call(this, velocity);
        _setTarget.call(this, state);
        _setCallback.call(this, undefined);
    };
    DragTransition.prototype.getVelocity = function() {
        return _getParticleVelocity.call(this);
    };
    DragTransition.prototype.halt = function() {
        this.set(this.get());
    };
    DragTransition.prototype.get = function() {
        _update.call(this);
        return _getParticlePosition.call(this);
    };
    DragTransition.prototype.set = function(state, definition, callback) {
        if (!definition) {
            this.reset(state);
            if (callback) callback();
            return;
        }
        if (state instanceof Array) this.dimensions = state.length; else this.dimensions = 1;
        _wake.call(this);
        _setupDefinition.call(this, definition);
        _setTarget.call(this, state);
        _setCallback.call(this, callback);
    };
    module.exports = DragTransition;
}.bind(this));

require.register("famous_modules/famous/physics/forces/spring/_git_modularized/index.js", function(exports, require, module) {
    var Force = require("famous/physics/forces/force");
    var Vector = require("famous/math/vector");
    var EventHandler = require("famous/event-handler");
    /** @constructor */
    function Spring(opts) {
        this.opts = {
            period: 300,
            dampingRatio: .1,
            length: 0,
            lMin: 0,
            lMax: Infinity,
            anchor: undefined,
            forceFunction: Spring.FORCE_FUNCTIONS.HOOK,
            restTolerance: 1e-5
        };
        if (opts) this.setOpts(opts);
        this.eventOutput = undefined;
        this._atRest = false;
        this.init();
        Force.call(this);
        //registers
        this.disp = new Vector(0, 0, 0);
    }
    Spring.prototype = Object.create(Force.prototype);
    Spring.prototype.constructor = Force;
    Spring.FORCE_FUNCTIONS = {
        FENE: function(dist, rMax) {
            var rMaxSmall = rMax * .99;
            var r = Math.max(Math.min(dist, rMaxSmall), -rMaxSmall);
            return r / (1 - r * r / (rMax * rMax));
        },
        HOOK: function(dist) {
            return dist;
        }
    };
    function setForceFunction(fn) {
        this.forceFunction = fn;
    }
    function calcStiffness() {
        var opts = this.opts;
        opts.stiffness = Math.pow(2 * Math.PI / opts.period, 2);
    }
    function calcDamping() {
        var opts = this.opts;
        opts.damping = 4 * Math.PI * opts.dampingRatio / opts.period;
    }
    function getEnergy(strength, dist) {
        return .5 * strength * dist * dist;
    }
    Spring.prototype.init = function() {
        setForceFunction.call(this, this.opts.forceFunction);
        calcStiffness.call(this);
        calcDamping.call(this);
    };
    Spring.prototype.applyForce = function(targets, source) {
        var force = this.force;
        var disp = this.disp;
        var opts = this.opts;
        var stiffness = opts.stiffness;
        var damping = opts.damping;
        var restLength = opts.length;
        var lMax = opts.lMax;
        var anchor = opts.anchor || source.p;
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            disp.set(anchor.sub(target.p));
            var dist = disp.norm() - restLength;
            if (dist == 0) return;
            //if dampingRatio specified, then override strength and damping
            var m = target.m;
            stiffness *= m;
            damping *= m;
            force.set(disp.normalize(stiffness * this.forceFunction(dist, lMax)));
            if (damping) if (source) force.set(force.add(target.v.sub(source.v).mult(-damping))); else force.set(force.add(target.v.mult(-damping)));
            target.applyForce(force);
            if (source) source.applyForce(force.mult(-1));
            if (this.eventOutput) {
                var energy = target.getEnergy() + getEnergy(stiffness, dist);
                _fireAtRest.call(this, energy, target);
            }
        }
    };
    function _fireAtRest(energy, target) {
        if (energy < this.opts.restTolerance) {
            if (!this._atRest) this.eventOutput.emit("atRest", {
                particle: target
            });
            this._atRest = true;
        } else this._atRest = false;
    }
    Spring.prototype.getEnergy = function(target, source) {
        var opts = this.opts;
        var restLength = opts.length, anchor = opts.anchor || source.p, strength = opts.stiffness;
        var dist = anchor.sub(target.p).norm() - restLength;
        return .5 * strength * dist * dist;
    };
    Spring.prototype.setOpts = function(opts) {
        if (opts.anchor !== undefined) {
            if (opts.anchor.p instanceof Vector) this.opts.anchor = opts.anchor.p;
            if (opts.anchor instanceof Vector) this.opts.anchor = opts.anchor;
            if (opts.anchor instanceof Array) this.opts.anchor = new Vector(opts.anchor);
        }
        if (opts.period !== undefined) this.opts.period = opts.period;
        if (opts.dampingRatio !== undefined) this.opts.dampingRatio = opts.dampingRatio;
        if (opts.length !== undefined) this.opts.length = opts.length;
        if (opts.lMin !== undefined) this.opts.lMin = opts.lMin;
        if (opts.lMax !== undefined) this.opts.lMax = opts.lMax;
        if (opts.forceFunction !== undefined) this.opts.forceFunction = opts.forceFunction;
        if (opts.restTolerance !== undefined) this.opts.restTolerance = opts.restTolerance;
        this.init();
    };
    Spring.prototype.setAnchor = function(anchor) {
        if (this.opts.anchor === undefined) this.opts.anchor = new Vector();
        this.opts.anchor.set(anchor);
    };
    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    }
    Spring.prototype.on = function() {
        _createEventOutput.call(this);
        return this.on.apply(this, arguments);
    };
    Spring.prototype.unbind = function() {
        _createEventOutput.call(this);
        return this.unbind.apply(this, arguments);
    };
    Spring.prototype.pipe = function() {
        _createEventOutput.call(this);
        return this.pipe.apply(this, arguments);
    };
    Spring.prototype.unpipe = function() {
        _createEventOutput.call(this);
        return this.unpipe.apply(this, arguments);
    };
    module.exports = Spring;
}.bind(this));

require.register("famous_modules/famous/transitions/spring-transition/_git_modularized/index.js", function(exports, require, module) {
    var PE = require("famous/physics/engine");
    var Spring = require("famous/physics/forces/spring");
    var Vector = require("famous/math/vector");
    /** @constructor */
    function SpringTransition(state) {
        state = state || 0;
        this.endState = new Vector(state);
        this.initState = new Vector();
        this._dimensions = undefined;
        this._restTolerance = 1e-8;
        this._absRestTolerance = this._restTolerance;
        this._active = false;
        this._callback = undefined;
        this.PE = new PE();
        this.spring = new Spring({
            anchor: this.endState
        });
        this.particle = this.PE.createParticle();
        this.PE.attach(this.spring, this.particle);
    }
    SpringTransition.SUPPORTS_MULTIPLE = 3;
    SpringTransition.DEFAULT_OPTIONS = {
        period: 300,
        dampingRatio: .5,
        velocity: 0
    };
    function _update() {
        if (!this._active) {
            if (this._callback) {
                var cb = this._callback;
                this._callback = undefined;
                cb();
            }
            return;
        }
        this.PE.step();
        if (_getEnergy.call(this) < this._absRestTolerance) {
            _setParticlePosition.call(this, this.endState);
            _setParticleVelocity.call(this, [ 0, 0, 0 ]);
            _sleep.call(this);
        }
    }
    function _getEnergy() {
        return this.particle.getEnergy() + this.spring.getEnergy(this.particle);
    }
    function _setupDefinition(def) {
        var defaults = SpringTransition.DEFAULT_OPTIONS;
        if (def.period === undefined) def.period = defaults.period;
        if (def.dampingRatio === undefined) def.dampingRatio = defaults.dampingRatio;
        if (def.velocity === undefined) def.velocity = defaults.velocity;
        if (def.period < 150) console.warn("period may be unstable, increase the period or use a stiff transition");
        //setup spring
        this.spring.setOpts({
            period: def.period,
            dampingRatio: def.dampingRatio
        });
        //setup particle
        _setParticleVelocity.call(this, def.velocity);
    }
    function _setAbsoluteRestTolerance() {
        var distance = this.endState.sub(this.initState).normSquared();
        this._absRestTolerance = distance === 0 ? this._restTolerance : this._restTolerance * distance;
    }
    function _setTarget(target) {
        this.endState.set(target);
        _setAbsoluteRestTolerance.call(this);
    }
    function _wake() {
        this.PE.play();
        this._active = true;
    }
    function _sleep() {
        this.PE.pause();
        this._active = false;
    }
    function _setParticlePosition(p) {
        this.particle.p.set(p);
    }
    function _setParticleVelocity(v) {
        this.particle.v.set(v);
    }
    function _getParticlePosition() {
        return this._dimensions === 0 ? this.particle.p.x : this.particle.p.get();
    }
    function _getParticleVelocity() {
        return this._dimensions === 0 ? this.particle.v.x : this.particle.v.get();
    }
    function _setCallback(callback) {
        this._callback = callback;
    }
    SpringTransition.prototype.reset = function(pos, vel) {
        this._dimensions = pos instanceof Array ? pos.length : 0;
        this.initState.set(pos);
        _setParticlePosition.call(this, pos);
        _setTarget.call(this, pos);
        if (vel) _setParticleVelocity.call(this, vel);
        _setCallback.call(this, undefined);
    };
    SpringTransition.prototype.getVelocity = function() {
        return _getParticleVelocity.call(this);
    };
    SpringTransition.prototype.setVelocity = function(v) {
        this.call(this, _setParticleVelocity(v));
    };
    SpringTransition.prototype.halt = function() {
        this.set(this.get());
    };
    SpringTransition.prototype.get = function() {
        _update.call(this);
        return _getParticlePosition.call(this);
    };
    SpringTransition.prototype.set = function(endState, definition, callback) {
        if (!definition) {
            this.reset(endState);
            if (callback) callback();
            return;
        }
        this._dimensions = endState instanceof Array ? endState.length : 0;
        _wake.call(this);
        _setupDefinition.call(this, definition);
        _setTarget.call(this, endState);
        _setCallback.call(this, callback);
    };
    module.exports = SpringTransition;
}.bind(this));

require.register("famous_modules/famous/input/mouse-sync/_git_modularized/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    /**
     * @class Handles piped in mouse drag events. Outputs an object with two
     *        properties, position and velocity.
     * @description
     * @name MouseSync
     * @constructor
     * @example
     * 
     *     var Engine = require('famous/Engine');
     *     var Surface = require('famous/Surface');
     *     var Modifier = require('famous/Modifier');
     *     var FM = require('famous/Matrix');
     *     var MouseSync = require('famous-sync/MouseSync');
     *     var Context = Engine.createContext();
     *
     *     var surface = new Surface({
     *         size: [200,200],
     *         properties: {
     *             backgroundColor: 'red'
     *         }
     *     });
     *
     *     var modifier = new Modifier({
     *         transform: undefined
     *     });
     *
     *     var position = 0;
     *     var sync = new MouseSync(function(){
     *         return position;
     *     }, {direction: MouseSync.DIRECTION_Y});  
     *
     *     surface.pipe(sync);
     *     sync.on('update', function(data) {
     *         var edge = window.innerHeight - (surface.getSize()[1])
     *         if (data.p > edge) {
     *             position = edge;
     *         } else if (data.p < 0) {
     *             position = 0;
     *         } else {
     *             position = data.p;
     *         }
     *         modifier.setTransform(FM.translate(0, position, 0));
     *         surface.setContent('position' + position + '<br>' + 'velocity' + data.v.toFixed(2));
     *     });
     *     Context.link(modifier).link(surface);
     * 
     */
    function MouseSync(targetGet, options) {
        this.targetGet = targetGet;
        this.options = {
            direction: undefined,
            rails: false,
            scale: 1,
            stallTime: 50,
            propogate: true
        };
        if (options) {
            this.setOptions(options);
        } else {
            this.setOptions(this.options);
        }
        this.input = new EventHandler();
        this.output = new EventHandler();
        EventHandler.setInputHandler(this, this.input);
        EventHandler.setOutputHandler(this, this.output);
        this._prevCoord = undefined;
        this._prevTime = undefined;
        this._prevVel = undefined;
        this.input.on("mousedown", _handleStart.bind(this));
        this.input.on("mousemove", _handleMove.bind(this));
        this.input.on("mouseup", _handleEnd.bind(this));
        this.options.propogate ? this.input.on("mouseleave", _handleLeave.bind(this)) : this.input.on("mouseleave", _handleEnd.bind(this));
    }
    /** @const */
    MouseSync.DIRECTION_X = 0;
    /** @const */
    MouseSync.DIRECTION_Y = 1;
    function _handleStart(e) {
        e.preventDefault();
        // prevent drag
        this._prevCoord = [ e.clientX, e.clientY ];
        this._prevTime = Date.now();
        this._prevVel = this.options.direction !== undefined ? 0 : [ 0, 0 ];
        this.output.emit("start");
    }
    function _handleMove(e) {
        if (!this._prevCoord) return;
        var prevCoord = this._prevCoord;
        var prevTime = this._prevTime;
        var currCoord = [ e.clientX, e.clientY ];
        var currTime = Date.now();
        var diffX = currCoord[0] - prevCoord[0];
        var diffY = currCoord[1] - prevCoord[1];
        if (this.options.rails) {
            if (Math.abs(diffX) > Math.abs(diffY)) diffY = 0; else diffX = 0;
        }
        var diffTime = Math.max(currTime - prevTime, 8);
        // minimum tick time
        var velX = diffX / diffTime;
        var velY = diffY / diffTime;
        var prevPos = this.targetGet();
        var scale = this.options.scale;
        var nextPos;
        var nextVel;
        if (this.options.direction == MouseSync.DIRECTION_X) {
            nextPos = prevPos + scale * diffX;
            nextVel = scale * velX;
        } else if (this.options.direction == MouseSync.DIRECTION_Y) {
            nextPos = prevPos + scale * diffY;
            nextVel = scale * velY;
        } else {
            nextPos = [ prevPos[0] + scale * diffX, prevPos[1] + scale * diffY ];
            nextVel = [ scale * velX, scale * velY ];
        }
        this.output.emit("update", {
            p: nextPos,
            v: nextVel
        });
        this._prevCoord = currCoord;
        this._prevTime = currTime;
        this._prevVel = nextVel;
    }
    function _handleEnd(e) {
        if (!this._prevCoord) return;
        var prevTime = this._prevTime;
        var currTime = Date.now();
        if (currTime - prevTime > this.options.stallTime) this._prevVel = this.options.direction == undefined ? [ 0, 0 ] : 0;
        var pos = this.targetGet();
        this.output.emit("end", {
            p: pos,
            v: this._prevVel
        });
        this._prevCoord = undefined;
        this._prevTime = undefined;
        this._prevVel = undefined;
    }
    function _handleLeave(e) {
        if (!this._prevCoord) return;
        var boundMove = function(e) {
            _handleMove.call(this, e);
        }.bind(this);
        var boundEnd = function(e) {
            _handleEnd.call(this, e);
            document.removeEventListener("mousemove", boundMove);
            document.removeEventListener("mouseup", boundEnd);
        }.bind(this);
        document.addEventListener("mousemove", boundMove);
        document.addEventListener("mouseup", boundEnd);
    }
    MouseSync.prototype.getOptions = function() {
        return this.options;
    };
    MouseSync.prototype.setOptions = function(options) {
        if (options.direction !== undefined) this.options.direction = options.direction;
        if (options.rails !== undefined) this.options.rails = options.rails;
        if (options.scale !== undefined) this.options.scale = options.scale;
        if (options.stallTime !== undefined) this.options.stallTime = options.stallTime;
        if (options.propogate !== undefined) this.options.propogate = options.propogate;
    };
    module.exports = MouseSync;
}.bind(this));

require.register("famous_modules/famous/input/scroll-sync/_git_modularized/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    var Engine = require("famous/engine");
    /**
     * @class Handles piped in mousewheel events. Can be used as delegate of
     *        GenericSync.
     * @description
     * @name ScrollSync
     * @constructor
     * @example
     * 
     *     var Engine = require('famous/Engine');
     *     var Surface = require('famous/Surface');
     *     var Modifier = require('famous/Modifier');
     *     var FM = require('famous/Matrix');
     *     var ScrollSync = require('famous-sync/ScrollSync');
     *     var Context = Engine.createContext();
     *
     *     var surface = new Surface({
     *         size: [200,200],
     *         properties: {
     *             backgroundColor: 'red'
     *         }
     *     });
     *
     *     var modifier = new Modifier({
     *         transform: undefined
     *     });
     *
     *     var position = 0;
     *     var sync = new ScrollSync(function(){
     *         return position;
     *     }, {direction: ScrollSync.DIRECTION_Y});  
     *
     *     surface.pipe(sync);
     *     sync.on('update', function(data) {
     *         var edge = window.innerHeight - (surface.getSize()[1])
     *         if (data.p > edge) {
     *             position = edge;
     *         } else if (data.p < 0) {
     *             position = 0;
     *         } else {
     *             position = data.p;
     *         }
     *         modifier.setTransform(FM.translate(0, position, 0));
     *         surface.setContent('position' + position + '<br>' + 'velocity' + data.v.toFixed(2));
     *     });
     *     Context.link(modifier).link(surface);
     * 
     */
    function ScrollSync(targetSync, options) {
        this.targetGet = targetSync;
        this.options = {
            direction: undefined,
            minimumEndSpeed: Infinity,
            rails: false,
            scale: 1,
            stallTime: 50,
            lineHeight: 40
        };
        if (options) {
            this.setOptions(options);
        } else {
            this.setOptions(this.options);
        }
        this.input = new EventHandler();
        this.output = new EventHandler();
        EventHandler.setInputHandler(this, this.input);
        EventHandler.setOutputHandler(this, this.output);
        this._prevTime = undefined;
        this._prevVel = undefined;
        this.input.on("mousewheel", _handleMove.bind(this));
        this.input.on("wheel", _handleMove.bind(this));
        this.inProgress = false;
        this._loopBound = false;
    }
    /** @const */
    ScrollSync.DIRECTION_X = 0;
    /** @const */
    ScrollSync.DIRECTION_Y = 1;
    function _newFrame() {
        var now = Date.now();
        if (this.inProgress && now - this._prevTime > this.options.stallTime) {
            var pos = this.targetGet();
            this.inProgress = false;
            var finalVel = 0;
            if (Math.abs(this._prevVel) >= this.options.minimumEndSpeed) finalVel = this._prevVel;
            this.output.emit("end", {
                p: pos,
                v: finalVel,
                slip: true
            });
        }
    }
    function _handleMove(e) {
        e.preventDefault();
        if (!this.inProgress) {
            this.inProgress = true;
            this.output.emit("start", {
                slip: true
            });
            if (!this._loopBound) {
                Engine.on("prerender", _newFrame.bind(this));
                this._loopBound = true;
            }
        }
        var prevTime = this._prevTime;
        var diffX = e.wheelDeltaX !== undefined ? e.wheelDeltaX : -e.deltaX;
        var diffY = e.wheelDeltaY !== undefined ? e.wheelDeltaY : -e.deltaY;
        if (e.deltaMode === 1) {
            // units in lines, not pixels
            diffX *= this.options.lineHeight;
            diffY *= this.options.lineHeight;
        }
        var currTime = Date.now();
        if (this.options.rails) {
            if (Math.abs(diffX) > Math.abs(diffY)) diffY = 0; else diffX = 0;
        }
        var diffTime = Math.max(currTime - prevTime, 8);
        // minimum tick time
        var velX = diffX / diffTime;
        var velY = diffY / diffTime;
        var prevPos = this.targetGet();
        var scale = this.options.scale;
        var nextPos;
        var nextVel;
        if (this.options.direction == ScrollSync.DIRECTION_X) {
            nextPos = prevPos + scale * diffX;
            nextVel = scale * velX;
        } else if (this.options.direction == ScrollSync.DIRECTION_Y) {
            nextPos = prevPos + scale * diffY;
            nextVel = scale * velY;
        } else {
            nextPos = [ prevPos[0] + scale * diffX, prevPos[1] + scale * diffY ];
            nextVel = [ scale * velX, scale * velY ];
        }
        this.output.emit("update", {
            p: nextPos,
            v: nextVel,
            slip: true
        });
        this._prevTime = currTime;
        this._prevVel = nextVel;
    }
    ScrollSync.prototype.getOptions = function() {
        return this.options;
    };
    ScrollSync.prototype.setOptions = function(options) {
        if (options.direction !== undefined) this.options.direction = options.direction;
        if (options.minimumEndSpeed !== undefined) this.options.minimumEndSpeed = options.minimumEndSpeed;
        if (options.rails !== undefined) this.options.rails = options.rails;
        if (options.scale !== undefined) this.options.scale = options.scale;
        if (options.stallTime !== undefined) this.options.stallTime = options.stallTime;
    };
    module.exports = ScrollSync;
}.bind(this));

require.register("famous_modules/famous/input/generic-sync/_git_modularized/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    var TouchSync = require("famous/input/touch-sync");
    var ScrollSync = require("famous/input/scroll-sync");
    /**
     * @class Combines multiple types of event handling (e.g. touch, trackpad 
     *     scrolling) into one standardized interface for inclusion in  
     *     widgets. TouchSync and ScrollSync are enabled by default.
     * @description
     * @name GenericSync
     * @constructor
     * @example 
     * 
     *     var Engine = require('famous/Engine');
     *     var Surface = require('famous/Surface');
     *     var Modifier = require('famous/Modifier');
     *     var FM = require('famous/Matrix');
     *     var GenericSync = require('famous-sync/GenericSync');
     *     var Context = Engine.createContext();
     *
     *     var surface = new Surface({
     *         size: [200,200],
     *         properties: {
     *             backgroundColor: 'red'
     *         }
     *     });
     *
     *     var modifier = new Modifier({
     *         transform: undefined
     *     });
     *
     *     var position = 0;
     *     var sync = new GenericSync(function(){
     *         return position;
     *     }, {direction: GenericSync.DIRECTION_Y});  
     *
     *     surface.pipe(sync);
     *     sync.on('update', function(data) {
     *         var edge = window.innerHeight - (surface.getSize()[1])
     *         if (data.p > edge) {
     *             position = edge;
     *         } else if (data.p < 0) {
     *             position = 0;
     *         } else {
     *             position = data.p;
     *         }
     *         modifier.setTransform(FM.translate(0, position, 0));
     *         surface.setContent('position' + position + '<br>' + 'velocity' + data.v.toFixed(2));
     *     });
     *     Context.link(modifier).link(surface);
     * 
     */
    function GenericSync(targetGet, options) {
        this.targetGet = targetGet;
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);
        this._handlers = undefined;
        this.options = {
            syncClasses: defaultClasses
        };
        this._handlerOptions = this.options;
        if (options) this.setOptions(options);
        if (!this._handlers) _updateHandlers.call(this);
    }
    var defaultClasses = [ TouchSync, ScrollSync ];
    GenericSync.register = function(syncClass) {
        if (defaultClasses.indexOf(syncClass) < 0) defaultClasses.push(syncClass);
    };
    /** @const */
    GenericSync.DIRECTION_X = 0;
    /** @const */
    GenericSync.DIRECTION_Y = 1;
    /** @const */
    GenericSync.DIRECTION_Z = 2;
    function _updateHandlers() {
        if (this._handlers) {
            for (var i = 0; i < this._handlers.length; i++) {
                this.eventInput.unpipe(this._handlers[i]);
                this._handlers[i].unpipe(this.eventOutput);
            }
        }
        this._handlers = [];
        for (var i = 0; i < this.options.syncClasses.length; i++) {
            var _SyncClass = this.options.syncClasses[i];
            this._handlers[i] = new _SyncClass(this.targetGet, this._handlerOptions);
            this.eventInput.pipe(this._handlers[i]);
            this._handlers[i].pipe(this.eventOutput);
        }
    }
    GenericSync.prototype.setOptions = function(options) {
        this._handlerOptions = options;
        if (options.syncClasses) {
            this.options.syncClasses = options.syncClasses;
            _updateHandlers.call(this);
        }
        if (this._handlers) {
            for (var i = 0; i < this._handlers.length; i++) {
                this._handlers[i].setOptions(this._handlerOptions);
            }
        }
    };
    module.exports = GenericSync;
}.bind(this));

require.register("famous_modules/famous/modifiers/draggable/_git_modularized/index.js", function(exports, require, module) {
    var Transform = require("famous/transform");
    var MouseSync = require("famous/input/mouse-sync");
    var TouchSync = require("famous/input/touch-sync");
    var GenericSync = require("famous/input/generic-sync");
    var Transitionable = require("famous/transitions/transitionable");
    var EventHandler = require("famous/event-handler");
    var DragTransition = require("famous/transitions/drag-transition");
    Transitionable.registerMethod("drag", DragTransition);
    /**
     * @class Draggable
     * @description
     * Makes the linked renderables responsive to dragging.
     * @name Draggable
     * @constructor
     * @example 
     *  define(function(require, exports, module) {
     *      var Engine = require('famous/Engine');
     *      var Draggable = require('famous-modifiers/Draggable');
     *      var Surface = require('famous/Surface');
     *
     *      var Context = Engine.createContext();
     *      var draggable = new Draggable();
     *      var surface = new Surface({
     *          content: 'test',
     *          properties: {
     *              backgroundColor:'#3cf'
     *          },
     *          size: [300, 300]
     *      });
     *
     *      surface.pipe(draggable);
     *
     *      Context.link(draggable).link(surface);
     *  });
     */
    function Draggable(options) {
        this.options = Object.create(Draggable.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);
        this._positionState = new Transitionable([ 0, 0 ]);
        this._differential = [ 0, 0 ];
        this._active = true;
        this.sync = new GenericSync(function() {
            return this._differential;
        }.bind(this), {
            scale: this.options.scale,
            syncClasses: [ TouchSync ]
        });
        this.eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this.sync);
        EventHandler.setOutputHandler(this, this.eventOutput);
        _bindEvents.call(this);
    }
    //binary representation of directions for bitwise operations
    var _direction = {
        x: 1,
        //001
        y: 2
    };
    Draggable.DEFAULT_OPTIONS = {
        projection: _direction.x | _direction.y,
        scale: 1,
        xRange: [ -Infinity, Infinity ],
        yRange: [ -Infinity, Infinity ],
        snapX: 0,
        snapY: 0,
        transition: {
            duration: 0
        }
    };
    function _clamp(x, range) {
        return Math.min(Math.max(x, range[0]), range[1]);
    }
    function _handleStart() {
        if (!this._active) return;
        if (this._positionState.isActive()) this._positionState.halt();
        this.eventOutput.emit("dragstart", {
            p: this.getPosition()
        });
    }
    function _handleMove(event) {
        if (!this._active) return;
        this._differential = event.p;
        var newDifferential = _mapDifferential.call(this, this._differential);
        //buffer the differential if snapping is set
        this._differential[0] -= newDifferential[0];
        this._differential[1] -= newDifferential[1];
        var pos = this.getPosition();
        //modify position by reference
        pos[0] += newDifferential[0];
        pos[1] += newDifferential[1];
        //handle bounding box
        if (this.options.xRange) {
            var xRange = this.options.xRange;
            pos[0] = _clamp(pos[0], xRange);
        }
        if (this.options.yRange) {
            var yRange = this.options.yRange;
            pos[1] = _clamp(pos[1], yRange);
        }
        this.eventOutput.emit("dragmove", {
            p: pos
        });
    }
    function _handleEnd(event) {
        if (!this._active) return;
        this.eventOutput.emit("dragend", {
            p: this.getPosition(),
            v: event.v
        });
    }
    function _bindEvents() {
        this.sync.on("start", _handleStart.bind(this));
        this.sync.on("update", _handleMove.bind(this));
        this.sync.on("end", _handleEnd.bind(this));
    }
    function _mapDifferential(differential) {
        var opts = this.options;
        var projection = opts.projection;
        var snapX = opts.snapX;
        var snapY = opts.snapY;
        //axes
        var tx = projection & _direction.x ? differential[0] : 0;
        var ty = projection & _direction.y ? differential[1] : 0;
        //snapping
        if (snapX > 0) tx -= tx % snapX;
        if (snapY > 0) ty -= ty % snapY;
        return [ tx, ty ];
    }
    Draggable.prototype.setOptions = function(options) {
        var opts = this.options;
        if (options.projection !== undefined) {
            var proj = options.projection;
            this.options.projection = 0;
            [ "x", "y" ].forEach(function(val) {
                if (proj.indexOf(val) != -1) opts.projection |= _direction[val];
            });
        }
        if (options.scale !== undefined) opts.scale = options.scale;
        if (options.xRange !== undefined) opts.xRange = options.xRange;
        if (options.yRange !== undefined) opts.yRange = options.yRange;
        if (options.snapX !== undefined) opts.snapX = options.snapX;
        if (options.snapY !== undefined) opts.snapY = options.snapY;
    };
    Draggable.prototype.getPosition = function() {
        return this._positionState.get();
    };
    Draggable.prototype.setRelativePosition = function(p, transition, callback) {
        var pos = this.getPosition();
        var relativePosition = [ pos[0] + p[0], pos[1] + p[1] ];
        this.setPosition(relativePosition, transition, callback);
    };
    Draggable.prototype.setPosition = function(p, transition, callback) {
        if (this._positionState.isActive()) this._positionState.halt();
        this._positionState.set(p, transition, callback);
    };
    Draggable.prototype.activate = function() {
        this._active = true;
    };
    Draggable.prototype.deactivate = function() {
        this._active = false;
    };
    Draggable.prototype.toggle = function() {
        this._active = !this._active;
    };
    Draggable.prototype.modify = function(target) {
        var pos = this.getPosition();
        return {
            transform: Transform.translate(pos[0], pos[1]),
            target: target
        };
    };
    module.exports = Draggable;
}.bind(this));

require.register("famous_modules/famous/views/drag-sort/_git_modularized/index.js", function(exports, require, module) {
    var ViewSequence = require("famous/view-sequence");
    var Draggable = require("famous/modifiers/draggable");
    var Modifier = require("famous/modifier");
    var EventHandler = require("famous/event-handler");
    var Matrix = require("famous/transform");
    var Utility = require("famous/utilities/utility");
    var OptionsManager = require("famous/options-manager");
    var DragTransition = require("famous/transitions/drag-transition");
    function DragSort(options) {
        ViewSequence.apply(this, arguments);
        this._optionsManager.patch(Object.create(DragSort.DEFAULT_OPTIONS));
        this._optionsManager.patch(options);
        this.modifier = new Modifier();
        this.draggable = new Draggable(this.options.draggable);
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        this._dragEvents = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
        this._eventInput.pipe(this.draggable);
        this.draggable.pipe(this._dragEvents);
        bindEvents.call(this);
        this.projection = this.options.draggable.projection === "y" ? 1 : 0;
        initializeDragMemory.call(this);
        this.deactivate();
    }
    DragSort.DEFAULT_OPTIONS = {
        draggable: {
            projection: "y"
        },
        getForwardSwapThreshold: function() {
            return this.currentNode.getNext() ? this.currentNode.getNext().getSize()[this.projection] * .5 + this.currentPosition : 0;
        },
        getPreviousSwapThreshold: function() {
            return this.currentNode.getPrevious() ? this.currentNode.getPrevious().getSize()[this.projection] * -.5 + this.currentPosition : 0;
        }
    };
    function initializeDragMemory() {
        this.lastScroll = 0;
        this.scrollOffset = 0;
        this.dragging = false;
        this.draggablePosition = 0;
        this.currentNode = this;
        this.currentPosition = 0;
        this.direction = null;
    }
    function bindEvents() {
        this._eventInput.on("editmodeOn", this.activate.bind(this));
        this._eventInput.on("editmodeOff", this.deactivate.bind(this));
        this._dragEvents.on("dragstart", handleDragStart.bind(this));
        this._dragEvents.on("dragmove", handleDragMove.bind(this));
        this._dragEvents.on("dragend", handleDragEnd.bind(this));
        this._eventInput.on("deleteTask", deleteTask.bind(this));
    }
    function deleteTask() {
        this._eventOutput.emit("deleteMe", {
            index: this.index
        });
    }
    function handleDragStart() {
        this.dragging = true;
        this.projection = this.options.draggable.projection === "y" ? 1 : 0;
        this.modifier.setTransform(Utility.transformInFrontMatrix);
    }
    function handleDragMove() {
        this.forwardsSwapBarrier = this.options.getForwardSwapThreshold.call(this);
        this.backwardsSwapBarrier = this.options.getPreviousSwapThreshold.call(this);
        this.draggablePosition = this.draggable.getPosition()[this.projection];
        if (this.draggablePosition > this.currentPosition) {
            forwardsDrag.call(this);
        } else {
            backwardsDrag.call(this);
        }
    }
    function forwardsDrag() {
        if (!this.forwardsSwapBarrier) return;
        if (dragIsAForwardSwap.call(this)) {
            forwardSwap.call(this);
        }
    }
    function dragIsAForwardSwap() {
        return this.draggablePosition > this.forwardsSwapBarrier ? true : false;
    }
    function forwardSwap() {
        if (!this.direction) {
            this.direction = "forward";
        }
        var adjustedPosition = [ 0, 0 ];
        this.currentNode = this.currentNode.getNext();
        if (this.direction === "backward" && this.currentNode !== this) {
            this.currentNode.getPrevious().setPosition([ 0, 0 ], {
                duration: 165,
                curve: "easeOut"
            });
            this.currentPosition += this.currentNode.getSize()[this.projection];
            return;
        }
        if (this.index !== this.currentNode.index) {
            adjustedPosition[this.projection] = -this.currentNode.getSize()[this.projection];
            this.currentNode.setPosition(adjustedPosition, {
                duration: 165,
                curve: "easeOut"
            });
            this.currentPosition += this.currentNode.getSize()[this.projection];
        } else {
            adjustedPosition[this.projection] = -this.currentNode.getSize()[this.projection];
            this.currentNode.getPrevious().setPosition([ 0, 0 ], {
                duration: 165,
                curve: "easeOut"
            });
            this.currentPosition += this.currentNode.getSize()[this.projection];
            this.direction = null;
        }
    }
    function backwardsDrag() {
        if (!this.backwardsSwapBarrier) return;
        if (dragIsABackwardSwap.call(this)) {
            backwardSwap.call(this);
        }
    }
    function dragIsABackwardSwap() {
        return this.draggablePosition < this.backwardsSwapBarrier ? true : false;
    }
    function backwardSwap() {
        if (!this.direction) {
            this.direction = "backward";
        }
        var adjustedPosition = [ 0, 0 ];
        this.currentNode = this.currentNode.getPrevious();
        if (this.direction === "forward" && this.currentNode !== this) {
            this.currentNode.getNext().setPosition([ 0, 0 ], {
                duration: 165,
                curve: "easeOut"
            });
            this.currentPosition -= this.currentNode.getSize()[this.projection];
            return;
        }
        if (this.index !== this.currentNode.index) {
            adjustedPosition[this.projection] = this.currentNode.getSize()[this.projection];
            this.currentNode.setPosition(adjustedPosition, {
                duration: 165,
                curve: "easeOut"
            });
            this.currentPosition -= this.currentNode.getSize()[this.projection];
        } else {
            adjustedPosition[this.projection] = this.currentNode.getSize()[this.projection];
            this.currentNode.getNext().setPosition([ 0, 0 ], {
                duration: 165,
                curve: "easeOut"
            });
            this.currentPosition -= this.currentNode.getSize()[this.projection];
            this.direction = null;
        }
    }
    function handleDragEnd(data) {
        if (Math.abs(data.v[1]) > .5) {
            if (data.v[1] > 0) {
                var v = 1;
            } else {
                var v = -1;
            }
            console.log(this);
            this.draggable._positionState.set(data.p, {
                method: "drag",
                strength: 1e-4,
                velocity: [ 0, v ]
            });
            this._eventOutput.emit("swapPage", {
                index: this.index,
                page: this.array[this.index].taskItem.page
            });
        } else {
            if (this.index !== this.currentNode.index) {
                this._eventOutput.emit("shift", {
                    oldIndex: this.index,
                    newIndex: this.currentNode.index
                });
            } else {
                this.setPosition([ 0, 0 ], {
                    duration: 165,
                    curve: "easeOut"
                });
            }
        }
        this.dragging = false;
        this.modifier.setTransform(Matrix.Identity);
        initializeDragMemory.call(this);
    }
    DragSort.prototype = Object.create(ViewSequence.prototype);
    DragSort.prototype.constructor = DragSort;
    DragSort.prototype.activate = function() {
        this.activated = true;
        this.draggable.activate();
        return this;
    };
    DragSort.prototype.deactivate = function() {
        this.activated = false;
        this.draggable.deactivate();
        return this;
    };
    DragSort.prototype.isActive = function() {
        return this.activated;
    };
    DragSort.prototype.setPosition = function(position, transition, callback) {
        return this.draggable.setPosition(position, transition, callback);
    };
    DragSort.prototype.render = function() {
        var target = this.get();
        if (!target) return;
        var valueSpec = target.render.apply(target, arguments);
        var fullspec = {
            transform: this.modifier.getTransform(),
            target: this.draggable.modify(valueSpec)
        };
        return fullspec;
    };
    module.exports = DragSort;
}.bind(this));

require.register("famous_modules/famous/group/_git_modularized/index.js", function(exports, require, module) {
    var Context = require("famous/context");
    var Transform = require("famous/transform");
    var Surface = require("famous/surface");
    /**
     * @class (DEPRECATED) An object designed to contain surfaces and set properties
     *   to be applied to all of them at once.
     *
     * @description
     *  NOTE: DEPRECATED, consider using ContainerSurface instead
     *  * A group will enforce these properties on the 
     *   surfaces it contains:
     *     * size (clips contained surfaces to its own width and height)
     *     * origin
     *     * its own opacity and transform, which will be automatically 
     *       applied to  all Surfaces contained directly and indirectly.
     *   These properties are maintained through a {@link 
     *   SurfaceManager} unique to this Container Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name Group
     * @extends Surface
     * @constructor
     */
    function Group(options) {
        Surface.call(this, options);
        this._shouldRecalculateSize = false;
        this._container = document.createDocumentFragment();
        this.context = new Context(this._container);
        this.setContent(this._container);
        this._groupSize = [ undefined, undefined ];
        this._origin = undefined;
        this._originTransfer = {
            render: function(input) {
                return {
                    origin: this._origin,
                    target: input
                };
            }.bind(this)
        };
    }
    /** @const */
    Group.SIZE_ZERO = [ 0, 0 ];
    Group.prototype = Object.create(Surface.prototype);
    Group.prototype.elementType = "div";
    Group.prototype.elementClass = "famous-group";
    Group.prototype.add = function() {
        var segment = this.context.add(this._originTransfer);
        return segment.add.apply(segment, arguments);
    };
    Group.prototype.add = function() {
        return this.context.add.apply(this.context, arguments);
    };
    Group.prototype.render = function() {
        return Surface.prototype.render.call(this);
    };
    Group.prototype.deploy = function(target) {
        this.context.migrate(target);
    };
    Group.prototype.recall = function(target) {
        this._container = document.createDocumentFragment();
        this.context.migrate(this._container);
    };
    Group.prototype.commit = function(context) {
        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;
        transform = Transform.moveThen([ -origin[0] * size[0], -origin[1] * size[1], 0 ], transform);
        var result = Surface.prototype.commit.call(this, context, transform, opacity, origin, Group.SIZE_ZERO);
        this._origin = origin;
        if (size[0] != this._groupSize[0] || size[1] != this._groupSize[1]) {
            this.context.setSize(size);
            this._groupSize[0] = size[0];
            this._groupSize[1] = size[1];
        }
        this.context.update();
        return result;
    };
    module.exports = Group;
}.bind(this));

require.register("famous_modules/famous/views/scrollview/_git_modularized/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    var PhysicsEngine = require("famous/physics/engine");
    var Particle = require("famous/physics/bodies/particle");
    var Drag = require("famous/physics/forces/drag");
    var Spring = require("famous/physics/forces/spring");
    var Transform = require("famous/transform");
    var EventHandler = require("famous/event-handler");
    var GenericSync = require("famous/input/generic-sync");
    var ViewSequence = require("famous/view-sequence");
    var Group = require("famous/group");
    var Entity = require("famous/entity");
    /**
     * @class Lays out the sequenced renderables sequentially and makes them scrollable.
     * @description Items outside the viewport are automatically culled.
     * @name Scrollview
     * @constructor
     * @example 
     *   var myScrollview = new Scrollview({
     *       itemSpacing: 20
     *   });
     * 
     *   var mySequence = new ViewSequence();
     *   for(var i = 0; i < 50; i++) {
     *       surfaces.push(new Surface({content: 'Item ' + i}));
     *   }
     *   myScrollview.sequenceFrom(surfaces); // link items into scrollview
     *
     *   Engine.pipe(myScrollview); // let events on root window control the scrollview
     *   myContext.link(myScrollview); // link scrollview into myContext
     */
    function Scrollview(options) {
        this.options = {
            direction: Utility.Direction.Y,
            rails: true,
            itemSpacing: 0,
            clipSize: undefined,
            margin: undefined,
            friction: .001,
            drag: 1e-4,
            edgeGrip: .5,
            edgePeriod: 300,
            edgeDamp: 1,
            paginated: false,
            pagePeriod: 500,
            pageDamp: .8,
            pageStopSpeed: Infinity,
            pageSwitchSpeed: 1,
            speedLimit: 10
        };
        this.node = null;
        this.physicsEngine = new PhysicsEngine();
        this.particle = new Particle();
        this.physicsEngine.addBody(this.particle);
        this.spring = new Spring({
            anchor: [ 0, 0, 0 ]
        });
        this.drag = new Drag({
            forceFunction: Drag.FORCE_FUNCTIONS.QUADRATIC
        });
        this.friction = new Drag({
            forceFunction: Drag.FORCE_FUNCTIONS.LINEAR
        });
        this.sync = new GenericSync(function() {
            return -this.getPosition();
        }.bind(this), {
            direction: this.options.direction == Utility.Direction.X ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y
        });
        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        this.rawInput = new EventHandler();
        this.rawInput.pipe(this.sync);
        this.sync.pipe(this.eventInput);
        this.sync.pipe(this.eventOutput);
        this.rawInput.pipe(this.eventInput);
        EventHandler.setInputHandler(this, this.rawInput);
        EventHandler.setOutputHandler(this, this.eventOutput);
        this._outputFunction = null;
        this._masterOutputFunction = null;
        this.setOutputFunction();
        // use default
        this.touchCount = 0;
        this._springAttached = false;
        this._onEdge = 0;
        // -1 for top, 1 for bottom
        this._springPosition = 0;
        this._touchVelocity = undefined;
        this._earlyEnd = false;
        this._masterOffset = 0;
        // minimize writes
        this._offsetDifferential = 0;
        // avoid batch
        this._lastFrameNode = null;
        if (options) this.setOptions(options); else this.setOptions({});
        _bindEvents.call(this);
        this.group = new Group();
        this.group.add({
            render: _innerRender.bind(this)
        });
        this._entityId = Entity.register(this);
        this._contextSize = [ window.innerWidth, window.innerHeight ];
        this._size = [ this._contextSize[0], this._contextSize[1] ];
        this._offsets = {};
    }
    function _handleStart(event) {
        this.touchCount = event.count;
        if (event.count === undefined) this.touchCount = 1;
        _detachAgents.call(this);
        this.setVelocity(0);
        this._touchVelocity = 0;
        this._earlyEnd = false;
    }
    function _handleMove(event) {
        var pos = -event.p;
        var vel = -event.v;
        if (this._onEdge && event.slip) {
            if (vel < 0 && this._onEdge < 0 || vel > 0 && this._onEdge > 0) {
                if (!this._earlyEnd) {
                    _handleEnd.call(this, event);
                    this._earlyEnd = true;
                }
            } else if (this._earlyEnd && Math.abs(vel) > Math.abs(this.particle.getVel()[0])) {
                _handleStart.call(this, event);
            }
        }
        if (this._earlyEnd) return;
        this._touchVelocity = vel;
        if (event.slip) this.setVelocity(vel); else this.setPosition(pos);
    }
    function _handleEnd(event) {
        this.touchCount = event.count || 0;
        if (!this.touchCount) {
            _detachAgents.call(this);
            if (this._onEdge) this._springAttached = true;
            _attachAgents.call(this);
            var vel = -event.v;
            var speedLimit = this.options.speedLimit;
            if (event.slip) speedLimit *= this.options.edgeGrip;
            if (vel < -speedLimit) vel = -speedLimit; else if (vel > speedLimit) vel = speedLimit;
            this.setVelocity(vel);
            this._touchVelocity = undefined;
        }
    }
    function _bindEvents() {
        this.eventInput.on("start", _handleStart.bind(this));
        this.eventInput.on("update", _handleMove.bind(this));
        this.eventInput.on("end", _handleEnd.bind(this));
        this.eventInput.on("editmodeOn", function() {
            this._earlyEnd = true;
        }.bind(this));
    }
    function _attachAgents() {
        if (this._springAttached) this.physicsEngine.attach([ this.spring ], this.particle); else this.physicsEngine.attach([ this.drag, this.friction ], this.particle);
    }
    function _detachAgents() {
        this._springAttached = false;
        this.physicsEngine.detachAll();
    }
    function _sizeForDir(size) {
        if (!size) size = this._contextSize;
        var dimension = this.options.direction === Utility.Direction.X ? 0 : 1;
        return size[dimension] === undefined ? this._contextSize[dimension] : size[dimension];
    }
    function _shiftOrigin(amount) {
        this._springPosition += amount;
        this._offsetDifferential -= amount;
        this.setPosition(this.getPosition() + amount);
        this.spring.setOpts({
            anchor: [ this._springPosition, 0, 0 ]
        });
    }
    function _normalizeState() {
        var atEdge = false;
        while (!atEdge && this.getPosition() < 0) {
            var prevNode = this.node.getPrevious ? this.node.getPrevious() : null;
            if (prevNode) {
                var prevSize = prevNode.getSize ? prevNode.getSize() : this._contextSize;
                var dimSize = _sizeForDir.call(this, prevSize) + this.options.itemSpacing;
                _shiftOrigin.call(this, dimSize);
                this._masterOffset -= dimSize;
                this.node = prevNode;
            } else atEdge = true;
        }
        var size = this.node && this.node.getSize ? this.node.getSize() : this._contextSize;
        while (!atEdge && this.getPosition() >= _sizeForDir.call(this, size) + this.options.itemSpacing) {
            var nextNode = this.node.getNext ? this.node.getNext() : null;
            if (nextNode) {
                var dimSize = _sizeForDir.call(this, size) + this.options.itemSpacing;
                _shiftOrigin.call(this, -dimSize);
                this._masterOffset += dimSize;
                this.node = nextNode;
                size = this.node.getSize ? this.node.getSize() : this._contextSize;
            } else atEdge = true;
        }
        if (Math.abs(this._masterOffset) > _getClipSize.call(this) + this.options.margin) this._masterOffset = 0;
    }
    function _handleEdge(edgeDetected) {
        if (!this._onEdge && edgeDetected) {
            this.sync.setOptions({
                scale: this.options.edgeGrip
            });
            if (!this.touchCount && !this._springAttached) {
                this._springAttached = true;
                this.physicsEngine.attach([ this.spring ], this.particle);
            }
        } else if (this._onEdge && !edgeDetected) {
            this.sync.setOptions({
                scale: 1
            });
            if (this._springAttached && Math.abs(this.getVelocity()) < .001) {
                this.setVelocity(0);
                this.setPosition(this._springPosition);
                // reset agents, detaching the spring
                _detachAgents.call(this);
                _attachAgents.call(this);
            }
        }
        this._onEdge = edgeDetected;
    }
    function _handlePagination() {
        if (this.touchCount == 0 && !this._springAttached && !this._onEdge) {
            if (this.options.paginated && Math.abs(this.getVelocity()) < this.options.pageStopSpeed) {
                var nodeSize = this.node.getSize ? this.node.getSize() : this._contextSize;
                // parameters to determine when to switch
                var velSwitch = Math.abs(this.getVelocity()) > this.options.pageSwitchSpeed;
                var velNext = this.getVelocity() > 0;
                var posNext = this.getPosition() > .5 * _sizeForDir.call(this, nodeSize);
                if (velSwitch && velNext || !velSwitch && posNext) this.goToNextPage(); else _attachPageSpring.call(this);
            }
        }
    }
    function _attachPageSpring() {
        _setSpring.call(this, 0, {
            period: this.options.pagePeriod,
            damp: this.options.pageDamp
        });
        if (!this._springAttached) {
            this._springAttached = true;
            this.physicsEngine.attach([ this.spring ], this.particle);
        }
    }
    function _setSpring(position, parameters) {
        this._springPosition = position;
        this.spring.setOpts({
            anchor: [ this._springPosition, 0, 0 ],
            period: parameters ? parameters.period : this.options.edgePeriod,
            dampingRatio: parameters ? parameters.damp : this.options.edgeDamp
        });
    }
    function _output(node, offset, target) {
        var size = node.getSize ? node.getSize() : this._contextSize;
        var transform = this._outputFunction(offset);
        target.push({
            transform: transform,
            target: node.render()
        });
        return _sizeForDir.call(this, size);
    }
    function _getClipSize() {
        if (this.options.clipSize) return this.options.clipSize; else return _sizeForDir.call(this, this._contextSize);
    }
    Scrollview.prototype.getPosition = function(node) {
        var pos = this.particle.getPos()[0];
        if (node === undefined) return pos; else {
            var offset = this._offsets[node];
            if (offset !== undefined) return pos - offset + this._offsetDifferential; else return undefined;
        }
    };
    Scrollview.prototype.setPosition = function(pos) {
        this.particle.setPos([ pos, 0, 0 ]);
    };
    Scrollview.prototype.getVelocity = function() {
        return this.touchCount ? this._touchVelocity : this.particle.getVel()[0];
    };
    Scrollview.prototype.setVelocity = function(v) {
        this.particle.setVel([ v, 0, 0 ]);
    };
    Scrollview.prototype.getOptions = function() {
        return this.options;
    };
    Scrollview.prototype.setOptions = function(options) {
        if (options.direction !== undefined) {
            this.options.direction = options.direction;
            if (this.options.direction === "x") this.options.direction = Utility.Direction.X; else if (this.options.direction === "y") this.options.direction = Utility.Direction.Y;
        }
        if (options.rails !== undefined) this.options.rails = options.rails;
        if (options.itemSpacing !== undefined) this.options.itemSpacing = options.itemSpacing;
        if (options.clipSize !== undefined) {
            if (options.clipSize !== this.options.clipSize) this._onEdge = 0;
            // recalculate edge on resize
            this.options.clipSize = options.clipSize;
        }
        if (options.margin !== undefined) this.options.margin = options.margin;
        if (options.drag !== undefined) this.options.drag = options.drag;
        if (options.friction !== undefined) this.options.friction = options.friction;
        if (options.edgeGrip !== undefined) this.options.edgeGrip = options.edgeGrip;
        if (options.edgePeriod !== undefined) this.options.edgePeriod = options.edgePeriod;
        if (options.edgeDamp !== undefined) this.options.edgeDamp = options.edgeDamp;
        if (options.paginated !== undefined) this.options.paginated = options.paginated;
        if (options.pageStopSpeed !== undefined) this.options.pageStopSpeed = options.pageStopSpeed;
        if (options.pageSwitchSpeed !== undefined) this.options.pageSwitchSpeed = options.pageSwitchSpeed;
        if (options.pagePeriod !== undefined) this.options.pagePeriod = options.pagePeriod;
        if (options.pageDamp !== undefined) this.options.pageDamp = options.pageDamp;
        if (options.speedLimit !== undefined) this.options.speedLimit = options.speedLimit;
        if (this.options.margin === undefined) this.options.margin = .5 * Math.max(window.innerWidth, window.innerHeight);
        this.drag.setOpts({
            strength: this.options.drag
        });
        this.friction.setOpts({
            strength: this.options.friction
        });
        this.spring.setOpts({
            period: this.options.edgePeriod,
            dampingRatio: this.options.edgeDamp
        });
        this.sync.setOptions({
            rails: this.options.rails,
            direction: this.options.direction == Utility.Direction.X ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y
        });
    };
    Scrollview.prototype.setOutputFunction = function(fn, masterFn) {
        if (!fn) {
            fn = function(offset) {
                return this.options.direction == Utility.Direction.X ? Transform.translate(offset, 0) : Transform.translate(0, offset);
            }.bind(this);
            if (!masterFn) masterFn = fn;
        }
        this._outputFunction = fn;
        this._masterOutputFunction = masterFn ? masterFn : function(offset) {
            return Transform.inverse(fn(-offset));
        };
    };
    Scrollview.prototype.goToPreviousPage = function() {
        if (!this.node) return;
        var prevNode = this.node.getPrevious ? this.node.getPrevious() : null;
        if (prevNode) {
            var positionModification = _sizeForDir.call(this, this.node.getSize()) + this.options.itemSpacing;
            this.node = prevNode;
            this._springPosition -= positionModification;
            _shiftOrigin.call(this, positionModification);
            _attachPageSpring.call(this);
        }
        return prevNode;
    };
    Scrollview.prototype.goToNextPage = function() {
        if (!this.node) return;
        var nextNode = this.node.getNext ? this.node.getNext() : null;
        if (nextNode) {
            var positionModification = _sizeForDir.call(this, this.node.getSize()) + this.options.itemSpacing;
            this.node = nextNode;
            this._springPosition += positionModification;
            _shiftOrigin.call(this, -positionModification);
            _attachPageSpring.call(this);
        }
        return nextNode;
    };
    Scrollview.prototype.getCurrentNode = function() {
        return this.node;
    };
    Scrollview.prototype.sequenceFrom = function(node) {
        if (node instanceof Array) node = new ViewSequence({
            array: node
        });
        this.node = node;
        this._lastFrameNode = node;
    };
    Scrollview.prototype.getSize = function() {
        return this._size;
    };
    Scrollview.prototype.render = function() {
        if (!this.node) return;
        this.physicsEngine.step();
        return this._entityId;
    };
    Scrollview.prototype.commit = function(context) {
        var transform = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;
        // reset edge detection on size change
        if (!this.options.clipSize && (size[0] !== this._contextSize[0] || size[1] !== this._contextSize[1])) {
            this._onEdge = 0;
            this._contextSize = size;
            if (this.options.direction === Utility.Direction.X) {
                this._size[0] = _getClipSize.call(this);
                this._size[1] = undefined;
            } else {
                this._size[0] = undefined;
                this._size[1] = _getClipSize.call(this);
            }
        }
        _normalizeState.call(this);
        var pos = this.getPosition();
        var scrollTransform = this._masterOutputFunction(-(pos + this._masterOffset));
        return {
            transform: Transform.moveThen([ -origin[0] * size[0], -origin[1] * size[1], 0 ], transform),
            opacity: opacity,
            origin: origin,
            size: size,
            target: {
                transform: scrollTransform,
                origin: origin,
                target: this.group.render()
            }
        };
    };
    function _innerRender() {
        var offsets = {};
        var pos = this.getPosition();
        var result = [];
        var edgeDetected = 0;
        // -1 for top, 1 for bottom
        // forwards
        var offset = 0;
        var currNode = this.node;
        offsets[currNode] = 0;
        while (currNode && offset - pos < _getClipSize.call(this) + this.options.margin) {
            offset += _output.call(this, currNode, offset + this._masterOffset, result) + this.options.itemSpacing;
            currNode = currNode.getNext ? currNode.getNext() : null;
            offsets[currNode] = offset;
            if (!currNode && offset - pos - this.options.itemSpacing <= _getClipSize.call(this)) {
                if (!this._onEdge) _setSpring.call(this, offset - _getClipSize.call(this) - this.options.itemSpacing);
                edgeDetected = 1;
            }
        }
        // backwards
        currNode = this.node && this.node.getPrevious ? this.node.getPrevious() : null;
        offset = 0;
        if (currNode) {
            var size = currNode.getSize ? currNode.getSize() : this._contextSize;
            offset -= _sizeForDir.call(this, size) + this.options.itemSpacing;
        } else {
            if (pos <= 0) {
                if (!this._onEdge) _setSpring.call(this, 0);
                edgeDetected = -1;
            }
        }
        while (currNode && offset - pos > -(_getClipSize.call(this) + this.options.margin)) {
            offsets[currNode] = offset;
            _output.call(this, currNode, offset + this._masterOffset, result);
            currNode = currNode.getPrevious ? currNode.getPrevious() : null;
            if (currNode) {
                var size = currNode.getSize ? currNode.getSize() : this._contextSize;
                offset -= _sizeForDir.call(this, size) + this.options.itemSpacing;
            }
        }
        this._offsetDifferential = 0;
        this._offsets = offsets;
        _handleEdge.call(this, edgeDetected);
        _handlePagination.call(this);
        if (this.options.paginated && this._lastFrameNode !== this.node) {
            this.eventOutput.emit("pageChange");
            this._lastFrameNode = this.node;
        }
        return result;
    }
    module.exports = Scrollview;
}.bind(this));

require.register("famous_modules/famous/physics/constraints/wall/_git_modularized/index.js", function(exports, require, module) {
    var Constraint = require("famous/physics/constraints/constraint");
    var Vector = require("famous/math/vector");
    var EventHandler = require("famous/event-handler");
    /** @constructor */
    function Wall(opts) {
        this.opts = {
            restitution: .7,
            k: 0,
            n: new Vector(),
            d: 0,
            onContact: Wall.ON_CONTACT.REFLECT
        };
        if (opts) this.setOpts(opts);
        //registers
        this.diff = new Vector();
        this.impulse = new Vector();
        this.slop = -1;
        this.eventOutput = undefined;
    }
    Wall.prototype = Object.create(Constraint.prototype);
    Wall.prototype.constructor = Constraint;
    Wall.ON_CONTACT = {
        REFLECT: 0,
        WRAP: 1,
        ABSORB: 2
    };
    Wall.prototype.setOpts = function(opts) {
        if (opts.restitution !== undefined) this.opts.restitution = opts.restitution;
        if (opts.k !== undefined) this.opts.k = opts.k;
        if (opts.d !== undefined) this.opts.d = opts.d;
        if (opts.onContact !== undefined) this.opts.onContact = opts.onContact;
        if (opts.n !== undefined) this.opts.n.set(opts.n);
    };
    Wall.prototype.getNormalVelocity = function(v) {
        var n = this.opts.n;
        return v.dot(n);
    };
    Wall.prototype.getDistance = function(p) {
        var n = this.opts.n, d = this.opts.d;
        return p.dot(n) + d;
    };
    Wall.prototype.onEnter = function(particle, overlap, dt) {
        var p = particle.p, v = particle.v, m = particle.m, n = this.opts.n, action = this.opts.onContact, restitution = this.opts.restitution, impulse = this.impulse;
        var k = this.opts.k;
        var gamma = 0;
        if (this.eventOutput) {
            var data = {
                particle: particle,
                wall: this,
                overlap: overlap
            };
            this.eventOutput.emit("preCollision", data);
            this.eventOutput.emit("collision", data);
        }
        switch (action) {
          case Wall.ON_CONTACT.REFLECT:
            var lambda = overlap < this.slop ? -((1 + restitution) * n.dot(v) + k / dt * (overlap - this.slop)) / (m * dt + gamma) : -((1 + restitution) * n.dot(v)) / (m * dt + gamma);
            impulse.set(n.mult(dt * lambda));
            particle.applyImpulse(impulse);
            particle.setPos(p.add(n.mult(-overlap)));
            break;

          case Wall.ON_CONTACT.ABSORB:
            var lambda = n.dot(v) / (m * dt + gamma);
            impulse.set(n.mult(dt * lambda));
            particle.applyImpulse(impulse);
            particle.setPos(p.add(n.mult(-overlap)));
            v.clear();
            break;

          case Wall.ON_CONTACT.WRAP:
            if (overlap < -particle.r) break;
        }
        if (this.eventOutput) this.eventOutput.emit("postCollision", data);
    };
    Wall.prototype.onExit = function(particle, overlap, dt) {
        var action = this.opts.onContact;
        var p = particle.p;
        var n = this.opts.n;
        if (action == Wall.ON_CONTACT.REFLECT) {
            particle.setPos(p.add(n.mult(-overlap)));
        } else if (action == Wall.ON_CONTACT.WRAP) {} else if (action == Wall.ON_CONTACT.ABSORB) {}
    };
    Wall.prototype.applyConstraint = function(particles, source, dt) {
        var n = this.opts.n;
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i], p = particle.p, v = particle.v, r = particle.r || 0;
            var overlap = this.getDistance(p.add(n.mult(-r)));
            //if semi-penetrable then detect nv as well
            var nv = this.getNormalVelocity(v);
            if (overlap <= 0) {
                if (nv < 0) this.onEnter(particle, overlap, dt); else this.onExit(particle, overlap, dt);
            }
        }
    };
    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    }
    Wall.prototype.on = function() {
        _createEventOutput.call(this);
        return this.on.apply(this, arguments);
    };
    Wall.prototype.unbind = function() {
        _createEventOutput.call(this);
        return this.unbind.apply(this, arguments);
    };
    Wall.prototype.pipe = function() {
        _createEventOutput.call(this);
        return this.pipe.apply(this, arguments);
    };
    Wall.prototype.unpipe = function() {
        _createEventOutput.call(this);
        return this.unpipe.apply(this, arguments);
    };
    module.exports = Wall;
}.bind(this));

require.register("famous_modules/famous/transitions/wall-transition/_git_modularized/index.js", function(exports, require, module) {
    var PE = require("famous/physics/engine");
    var Spring = require("famous/physics/forces/spring");
    // var Spring = require('famous/physics/constraints/stiff-spring');
    var Wall = require("famous/physics/constraints/wall");
    var Vector = require("famous/math/vector");
    /*
    * Define a physical transition by attaching a spring and or wall to a target location
    * The definition for the transition allows one to specify the parameters of the
    * spring and wall and starting velocity
    */
    /** @constructor */
    function WallTransition(state) {
        state = state || 0;
        this.endState = new Vector(state);
        this.initState = new Vector();
        this._active = false;
        this.spring = new Spring({
            anchor: this.endState
        });
        this.wall = new Wall();
        this._restTolerance = 1e-8;
        this._absRestTolerance = this._restTolerance;
        this._callback = undefined;
        this.PE = new PE();
        this.particle = this.PE.createParticle({
            p: this.endState
        });
        this.PE.attach([ this.wall, this.spring ], this.particle);
    }
    WallTransition.SUPPORTS_MULTIPLE = 3;
    WallTransition.DEFAULT_OPTIONS = {
        period: 300,
        dampingRatio: 0,
        restitution: .5,
        velocity: 0
    };
    function _update() {
        if (!this._active) {
            if (this._callback) {
                var cb = this._callback;
                this._callback = undefined;
                cb();
            }
            return;
        }
        this.PE.step();
        var energy = _getEnergy.call(this);
        if (energy < this._absRestTolerance) {
            _sleep.call(this);
            _setParticlePosition.call(this, this.endState);
            _setParticleVelocity.call(this, [ 0, 0, 0 ]);
        }
    }
    function _getEnergy() {
        return this.particle.getEnergy() + this.spring.getEnergy(this.particle);
    }
    function _setAbsoluteRestTolerance() {
        var distance = this.endState.sub(this.initState).normSquared();
        this._absRestTolerance = distance === 0 ? this._restTolerance : this._restTolerance * distance;
    }
    function _setupDefinition(def) {
        var defaults = WallTransition.DEFAULT_OPTIONS;
        if (def.period === undefined) def.period = defaults.period;
        if (def.dampingRatio === undefined) def.dampingRatio = defaults.dampingRatio;
        if (def.velocity === undefined) def.velocity = defaults.velocity;
        if (def.restitution === undefined) def.restitution = defaults.restitution;
        //setup spring
        this.spring.setOpts({
            period: def.period,
            dampingRatio: def.dampingRatio
        });
        //setup wall
        this.wall.setOpts({
            restitution: def.restitution
        });
        //setup particle
        _setParticleVelocity.call(this, def.velocity);
    }
    function _wake() {
        this.PE.play();
        this._active = true;
    }
    function _sleep() {
        this.PE.pause();
        this._active = false;
    }
    function _setTarget(target) {
        this.endState.set(target);
        var dist = this.endState.sub(this.initState).norm();
        this.wall.setOpts({
            d: this.endState.norm(),
            n: dist == 0 ? this.particle.v.normalize(-1) : this.endState.sub(this.initState).normalize(-1)
        });
        _setAbsoluteRestTolerance.call(this);
    }
    function _setParticlePosition(p) {
        this.particle.p.set(p);
    }
    function _setParticleVelocity(v) {
        this.particle.v.set(v);
    }
    function _getParticlePosition() {
        return this.dimensions === 0 ? this.particle.p.x : this.particle.p.get();
    }
    function _getParticleVelocity() {
        return this.dimensions === 0 ? this.particle.v.x : this.particle.v.get();
    }
    function _setCallback(callback) {
        this._callback = callback;
    }
    WallTransition.prototype.reset = function(pos, vel) {
        this.dimensions = pos instanceof Array ? pos.length : 0;
        this.initState.set(pos);
        _setParticlePosition.call(this, pos);
        if (vel) _setParticleVelocity.call(this, vel);
        _setTarget.call(this, pos);
        _setCallback.call(this, undefined);
    };
    WallTransition.prototype.getVelocity = function() {
        return _getParticleVelocity.call(this);
    };
    WallTransition.prototype.setVelocity = function(v) {
        this.call(this, _setParticleVelocity(v));
    };
    WallTransition.prototype.halt = function() {
        this.set(this.get());
    };
    WallTransition.prototype.get = function() {
        _update.call(this);
        return _getParticlePosition.call(this);
    };
    WallTransition.prototype.set = function(endState, definition, callback) {
        if (!definition) {
            this.reset(endState);
            if (callback) callback();
            return;
        }
        this.dimensions = endState instanceof Array ? endState.length : 0;
        _wake.call(this);
        _setupDefinition.call(this, definition);
        _setTarget.call(this, endState);
        _setCallback.call(this, callback);
    };
    module.exports = WallTransition;
}.bind(this));

require.register("app/main/index.js", function(exports, require, module) {
    window.Engine = require("famous/engine");
    var AppView = require("./views/AppView");
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var WallTransition = require("famous/transitions/wall-transition");
    var SpringTransition = require("famous/transitions/spring-transition");
    var Timer = require("famous/utilities/timer");
    var CanvasSurface = require("famous/surfaces/canvas-surface");
    var devMode = true;
    Transitionable.registerMethod("wall", WallTransition);
    Transitionable.registerMethod("spring", SpringTransition);
    var mainCtx = window.Engine.createContext();
    mainCtx.setPerspective(1e3);
    var shadowTransitionable = new Transitionable([ 50, 206, 168, 255, 255, 255 ]);
    var titleSurf = new Surface({
        size: [ undefined, undefined ],
        classes: [ "title" ],
        content: "<h1>FOCUS</h1>",
        properties: {
            backgroundColor: "#32CEA8",
            paddingLeft: 0
        }
    });
    var whiteGradientSurf = new CanvasSurface({
        size: [ undefined, undefined ],
        canvasSize: [ window.innerWidth * 2, window.innerHeight * 2 ],
        classes: [ "famous-surface" ]
    });
    var whiteGradientMod = new Modifier({
        transform: Transform.translate(0, 600, 0)
    });
    var colorCanvas = whiteGradientSurf.getContext("2d");
    if (_isAndroid) {
        var radial = colorCanvas.createLinearGradient(300 * .5 * 2, // x0
        0, // y0
        300 * .5 * 2, // x1
        500 * 2.5);
        radial.addColorStop(0, "rgba(255, 255, 255, 0)");
        radial.addColorStop(1, "rgba(255, 255, 255, 1)");
        colorCanvas.fillStyle = radial;
        colorCanvas.fillRect(0, 0, window.innerWidth * 2, window.innerHeight * 2);
        mainCtx.add(whiteGradientMod).add(whiteGradientSurf);
    } else {
        radial = colorCanvas.createRadialGradient(300 * .5 * 2, // x0
        500 * 2, // y0
        0, // r0
        300 * .5 * 2, // x1
        500 * 2.5, // y1
        300 * 2.5);
        radial.addColorStop(0, "rgba(255, 255, 255, 1)");
        radial.addColorStop(1, "rgba(255, 255, 255, 0)");
        colorCanvas.fillStyle = radial;
        colorCanvas.fillRect(0, 0, window.innerWidth * 2, window.innerHeight * 2);
        mainCtx.add(whiteGradientMod).add(whiteGradientSurf);
    }
    var titleMod = new Modifier({
        opacity: 1
    });
    function _shadowMod() {
        titleSurf.setProperties({
            textShadow: "0px 0px " + this.get()[0] + "px rgba(0, 49, 86, 1)"
        });
    }
    function _playShadow() {
        if (devMode) {
            titleMod.setOpacity(0, function() {});
            var appView = new AppView();
            mainCtx.add(appView);
            titleMod.setTransform(Transform.translate(0, 0, -100));
        } else {
            this.set([ 1.5, 100, 50 ], {
                duration: 1500
            }, function() {
                this.set([ 2, 100, 50 ], {
                    duration: 500
                }, function() {
                    this.set([ 0, 100, 50 ], {
                        duration: 800
                    }, function() {
                        Timer.after(function() {
                            whiteGradientMod.setTransform(Transform.translate(0, 100, 0), {
                                duration: 500
                            }, function() {
                                Timer.after(function() {
                                    var appView = new AppView();
                                    mainCtx.add(appView);
                                    titleMod.setTransform(Transform.translate(0, 2e3, -50), {
                                        duration: 0
                                    }, function() {
                                        titleMod.setOpacity(0, function() {});
                                    });
                                }, 20);
                            });
                        }, 7);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }
    }
    function _isAndroid() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    }
    mainCtx.add(titleMod).add(titleSurf);
    window.Engine.on("prerender", _shadowMod.bind(shadowTransitionable));
    _playShadow.call(shadowTransitionable);
}.bind(this));

require.register("app/main/fonts/specimen_files/easytabs.js", function(exports, require, module) {
    (function($) {
        $.fn.easyTabs = function(option) {
            var param = jQuery.extend({
                fadeSpeed: "fast",
                defaultContent: 1,
                activeClass: "active"
            }, option);
            $(this).each(function() {
                var thisId = "#" + this.id;
                if (param.defaultContent == "") {
                    param.defaultContent = 1;
                }
                if (typeof param.defaultContent == "number") {
                    var defaultTab = $(thisId + " .tabs li:eq(" + (param.defaultContent - 1) + ") a").attr("href").substr(1);
                } else {
                    var defaultTab = param.defaultContent;
                }
                $(thisId + " .tabs li a").each(function() {
                    var tabToHide = $(this).attr("href").substr(1);
                    $("#" + tabToHide).addClass("easytabs-tab-content");
                });
                hideAll();
                changeContent(defaultTab);
                function hideAll() {
                    $(thisId + " .easytabs-tab-content").hide();
                }
                function changeContent(tabId) {
                    hideAll();
                    $(thisId + " .tabs li").removeClass(param.activeClass);
                    $(thisId + " .tabs li a[href=#" + tabId + "]").closest("li").addClass(param.activeClass);
                    if (param.fadeSpeed != "none") {
                        $(thisId + " #" + tabId).fadeIn(param.fadeSpeed);
                    } else {
                        $(thisId + " #" + tabId).show();
                    }
                }
                $(thisId + " .tabs li").click(function() {
                    var tabId = $(this).find("a").attr("href").substr(1);
                    changeContent(tabId);
                    return false;
                });
            });
        };
    })(jQuery);
}.bind(this));

require.register("app/main/views/AppView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    var PageView = require("./PageView");
    var Lightbox = require("famous/views/light-box");
    var CanvasSurface = require("famous/surfaces/canvas-surface");
    var InputSurface = require("famous/surfaces/input-surface");
    var Transitionable = require("famous/transitions/transitionable");
    function AppView() {
        View.apply(this, arguments);
        this.headerSizeTransitionable = new Transitionable([ 70 ]);
        _createGradientSurfaces.call(this);
        _createCompletionSurface.call(this);
        _createLightBox.call(this);
        _createAppViews.call(this);
        _renderFocusPage.call(this);
    }
    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;
    AppView.DEFAULT_OPTIONS = {
        transition: {
            duration: 300,
            curve: "easeOut"
        },
        menuDropTransition: {
            duration: 200,
            curve: "easeIn"
        },
        wall: {
            method: "wall",
            period: 300,
            dampingRatio: .3
        },
        noTransition: {
            duration: 0
        },
        colors: [ [ "#ffffff", "#32CEA8" ], [ "#ffffff", "#FFFFCD", "#87CEFA" ], [ "#3690FF", "#8977C6" ], [ "#F5A9BC", "#FA5858" ] ]
    };
    function _isAndroid() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    }
    function _createLightBox() {
        this.lightBox = new Lightbox({
            inTransition: this.options.noTransition,
            inTransform: Transform.translate(0, 0, 0),
            inOpacity: 1,
            outOpacity: 1,
            overlap: true
        });
        this.lightBox.optionsForSwipeUp = false;
        this._add(this.lightBox);
    }
    // function _createInputView() {
    //   this.inputSurf = new InputSurface({
    //     size: [undefined, 60],
    //     properties: {background: 'white', margin: 0, opacity: '1'},
    //     classes: ['task']
    //   });
    //   this.inputSurf.setPlaceholder('here');
    //   this.inputMod = new Modifier({
    //     transform: Transform.translate(0, 70, -1)
    //   });
    //   this._add(this.inputMod).add(this.inputSurf);
    // }
    function _addPageView(title, previousPage, nextPage) {
        var pageViewOptions = {
            title: title,
            transition: this.options.transition,
            wall: this.options.wall
        };
        var newView = this[title + "View"] = new PageView(pageViewOptions);
    }
    function _addPageRelations(page, previousPage, nextPage) {
        this[page + "View"].previousPage = previousPage && this[previousPage + "View"];
        this[page + "View"].nextPage = nextPage && this[nextPage + "View"];
        _addEventListeners.call(this, this[page + "View"], this[page + "Modifier"]);
    }
    //toggle up
    //outTransition: easeOut
    //outTransform:  Transform.translate(0, -600, 1)
    //inTransition: false
    //inTransform: Transform.translate(0, 0, -1)
    //toggle down
    //outTransition: false
    //outTransform:  Transform.translate(0, 0, -1)
    //inTransition: wall
    //inTransform: Transform.translate(0, -600, 1)
    function _addEventListeners(newView, newModifier) {
        // window.Engine.on('prerender', )
        newView.on("togglePageViewUp", function() {
            if (newView.nextPage) {
                if (!this.lightBox.optionsForSwipeUp) {
                    this.lightBox.setOptions({
                        outTransition: this.options.transition,
                        outTransform: Transform.translate(0, -1200, 1),
                        inTransition: this.options.noTransition,
                        inTransform: Transform.translate(0, 0, -5)
                    });
                    this.lightBox.optionsForSwipeUp = true;
                }
                this.lightBox.show(newView.nextPage);
                newView.nextPage.contents.animateTasksIn(newView.nextPage.options.title);
                newView.nextPage.contents._eventOutput.emit("opened");
                newView.nextPage.header._eventOutput.emit("opened");
                newView.contents._eventOutput.emit("closed");
                newView.header._eventOutput.emit("closed");
            }
        }.bind(this));
        newView.on("togglePageViewDown", function() {
            if (newView.previousPage) {
                if (this.lightBox.optionsForSwipeUp) {
                    this.lightBox.setOptions({
                        outTransition: this.options.noTransition,
                        outTransform: Transform.translate(0, 0, -5),
                        inTransition: this.options.wall,
                        inTransform: Transform.translate(0, -1200, 1)
                    });
                    this.lightBox.optionsForSwipeUp = false;
                }
                this.lightBox.show(newView.previousPage);
                newView.previousPage.contents.animateTasksIn(newView.previousPage.options.title);
                newView.previousPage.contents._eventOutput.emit("opened");
                newView.previousPage.header._eventOutput.emit("opened");
                newView.contents._eventOutput.emit("closed");
                newView.header._eventOutput.emit("closed");
            }
        }.bind(this));
    }
    function _createAppViews() {
        _addPageView.call(this, "FOCUS");
        _addPageView.call(this, "TODAY");
        _addPageView.call(this, "LATER");
        _addPageView.call(this, "NEVER");
        _addPageRelations.call(this, "FOCUS", null, "TODAY");
        _addPageRelations.call(this, "TODAY", "FOCUS", "LATER");
        _addPageRelations.call(this, "LATER", "TODAY", "NEVER");
        _addPageRelations.call(this, "NEVER", "LATER", null);
    }
    function _renderFocusPage() {
        this.lightBox.show(this.FOCUSView);
        this.FOCUSView.contents.animateTasksIn("FOCUS");
    }
    function _createGradientSurfaces(pages) {
        window.faderSurfaces = [];
        window.faderMods = [];
        for (var i = 0; i < this.options.colors.length; i++) {
            var backgroundSurf = new CanvasSurface({
                size: [ window.innerWidth, window.innerHeight ],
                canvasSize: [ window.innerWidth * 2, window.innerHeight * 2 ],
                classes: [ "famous-surface", "gradient" ]
            });
            var startOpacity = i === 0 ? 1 : 0;
            var backgroundMod = new Modifier({
                opacity: startOpacity,
                transform: Transform.translate(0, 0, 0)
            });
            window.faderSurfaces.push(backgroundSurf);
            window.faderMods.push(backgroundMod);
            this._add(backgroundMod).add(backgroundSurf);
        }
        _colorSurfaces.call(this);
    }
    function _colorSurfaces() {
        for (var i = 0; i < window.faderSurfaces.length; i++) {
            var colorCanvas = window.faderSurfaces[i].getContext("2d");
            if (_isAndroid()) {
                var radial = colorCanvas.createLinearGradient(300, // x0
                0, // y0
                300, // x1
                1500);
                if (this.options.colors[i][2]) {
                    radial.addColorStop(0, this.options.colors[i][2]);
                    radial.addColorStop(.9, this.options.colors[i][1]);
                    radial.addColorStop(1, this.options.colors[i][1]);
                } else {
                    radial.addColorStop(1, this.options.colors[i][0]);
                    radial.addColorStop(0, this.options.colors[i][1]);
                }
            } else {
                var radial = colorCanvas.createRadialGradient(300, // x0
                1200, // y0
                0, // r0
                300, // x1
                1400, // y1
                1200);
                if (this.options.colors[i][2]) {
                    radial.addColorStop(0, this.options.colors[i][0]);
                    radial.addColorStop(.2, this.options.colors[i][1]);
                    radial.addColorStop(1, this.options.colors[i][2]);
                } else {
                    radial.addColorStop(0, this.options.colors[i][0]);
                    radial.addColorStop(1, this.options.colors[i][1]);
                }
            }
            colorCanvas.fillStyle = radial;
            colorCanvas.fillRect(0, 0, window.innerWidth * 2, window.innerHeight * 2);
        }
    }
    function _createCompletionSurface() {
        window.completionSurf = new CanvasSurface({
            size: [ window.innerWidth, window.innerHeight ],
            canvasSize: [ window.innerWidth * 2, window.innerHeight * 2 ],
            classes: [ "famous-surface" ],
            properties: {
                backgroundColor: "#81EBC4"
            }
        });
        window.completionMod = new Modifier({
            opacity: 0,
            transform: Transform.translate(0, 0, 0)
        });
        this._add(window.completionMod).add(window.completionSurf);
    }
    module.exports = AppView;
}.bind(this));

require.register("app/main/views/BoxContainer.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    var InputSurface = require("famous/surfaces/input-surface");
    var Box = require("./BoxView");
    function BoxContainer(options) {
        View.apply(this, arguments);
        _createInput.call(this);
    }
    function _isAndroid() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    }
    function _createInput() {
        this.box = new Box();
        this.boxMod = new Modifier();
        _isAndroid() ? this.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [ 30, 0, 150 ])) : this.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [ 10, 0, 70 ]));
        this.inputSurf = this.box.topSurf;
        this.frontSurf = this.box.frontSurf;
        this._add(this.boxMod).add(this.box);
    }
    BoxContainer.prototype = Object.create(View.prototype);
    BoxContainer.prototype.constructor = BoxContainer;
    module.exports = BoxContainer;
}.bind(this));

require.register("app/main/views/BoxView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    var InputSurface = require("famous/surfaces/input-surface");
    function Box(options) {
        View.apply(this, arguments);
        this._optionsManager.patch(Box.DEFAULT_OPTIONS);
        var faceSize = this.options.face.size[0];
        var left = new Modifier({
            transform: Transform.rotate(0, 1.57, 0)
        });
        var right = new Modifier({
            transform: Transform.move(Transform.rotate(0, 1.57, 0), [ 300, 0 ])
        });
        var top = new Modifier({
            transform: Transform.move(Transform.rotate(1.57, 0, 0), [ 0, 0, -50 ])
        });
        var bottom = new Modifier({
            transform: Transform.move(Transform.rotate(-1.57, 0, 0), [ 0, 50, 0 ])
        });
        var back = new Modifier({
            transform: Transform.move(Transform.rotate(6.28, 0, 0), [ 0, 0, -50 ])
        });
        this.frontSurf = new Surface(this.options.face);
        var leftSurf = new Surface({
            size: [ 50, 50 ],
            properties: this.options.face.properties
        });
        var rightSurf = new Surface({
            size: [ 50, 50 ],
            properties: this.options.face.properties
        });
        this.topSurf = new InputSurface({
            size: this.options.face.size,
            properties: {
                background: "white",
                margin: 0,
                opacity: "0.5"
            }
        });
        var bottomSurf = new Surface(this.options.face);
        var backSurf = new Surface(this.options.face);
        this._add(this.frontSurf);
        this._add(left).add(leftSurf);
        this._add(right).add(rightSurf);
        this._add(top).add(this.topSurf);
        this._add(bottom).add(bottomSurf);
        this._add(back).add(backSurf);
    }
    Box.DEFAULT_OPTIONS = {
        face: {
            size: [ 300, 50 ],
            properties: {
                margin: 0,
                opacity: .5,
                // backgroundColor: 'gray',
                visibility: "hidden"
            }
        }
    };
    Box.prototype = Object.create(View.prototype);
    module.exports = Box;
}.bind(this));

require.register("app/main/views/Color.js", function(exports, require, module) {
    /**
     * @class Allows you to make the shown renderables behave like an accordion through 
     * the open and close methods.
     * @description
     * @name Color
     * @constructor
     * @example
     * 
     * define(function(require, exports, module) {
     *     var Engine = require('famous/Engine');
     *     var Surface = require('famous/Surface');
     *     var Color = require('famous-color/Color');
     *     var Context = Engine.createContext();
     *     
     *     var color = new Color(80, 255, 255);
     *     var hex = color.getHex();
     *     var surface    = new Surface({
     *         size: [300, 300],
     *         properties: {
     *             backgroundColor: hex
     *         }
     *     });
     *     Context.link(surface);
     *
     *     var toggle = true;
     *     surface.on('click', function(){
     *         if (toggle) {
     *             hex = color.setFromRGBA(255,0,0).getHex();
     *         } else {
     *             hex = color.setHue(60).getHex();
     *         }
     *         surface.setProperties({
     *             backgroundColor: hex
     *         })
     *         toggle = !toggle;
     *     });
     * });
     */
    function Color(r, g, b, a) {
        if (r instanceof Color) {
            this.r = r.r;
            this.g = r.g;
            this.b = r.b;
            this.a = r.a;
            this.hex = r.getHex();
        } else if (typeof r == "string") {
            if (r[0] == "#") this.setFromHex(r); else this.setFromRGBAString(r);
        } else {
            this.r = typeof r === "undefined" ? 255 : r;
            this.g = typeof g === "undefined" ? 255 : g;
            this.b = typeof b === "undefined" ? 255 : b;
            this.a = typeof a === "undefined" ? 1 : a;
            this.hex = this.getHex();
        }
    }
    /**
     * Return the object's hue, calculated from its rgb value
     * 
     * @name Color#getHue
     * @function
     */
    Color.prototype.getHue = function() {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h = 0;
        var d = max - min;
        switch (max) {
          case r:
            {
                h = (g - b) / d + (g < b ? 6 : 0);
            }
            break;

          case g:
            {
                h = (b - r) / d + 2;
            }
            break;

          case b:
            {
                h = (r - g) / d + 4;
            }
            break;
        }
        h *= 60;
        if (isNaN(h)) {
            h = 0;
        }
        return h;
    };
    /**
     * Return the object's saturation, calculated from its rgb value
     * 
     * @name Color#getSaturation
     * @function
     */
    Color.prototype.getSaturation = function() {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > .5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

              case g:
                h = (b - r) / d + 2;
                break;

              case b:
                h = (r - g) / d + 4;
                break;
            }
            h *= 60;
        }
        return s * 100;
    };
    /**
     * Return the object's brightness, calculated from its rgb value
     * 
     * @name Color#getBrightness
     * @function
     */
    Color.prototype.getBrightness = function() {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        return Math.max(r, g, b) * 100;
    };
    /**
     * Return the object's lightness, calculated from its rgb value
     * 
     * @name Color#getBrightness
     * @function
     */
    Color.prototype.getLightness = function() {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 * 100;
    };
    /**
     * Return the object's hexidecimal color value, calculated from its rgb value
     * 
     * @name Color#getHex
     * @function
     */
    Color.prototype.getHex = function() {
        function toHex(num) {
            var hex = num.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
        return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
    };
    /**
     * Return the object's hue, saturation, and lightness , calculated from its 
     *     rgb value
     * 
     * @name Color#getHSL
     * @function
     */
    Color.prototype.getHSL = function() {
        var r = this.r / 255;
        var g = this.g / 255;
        var b = this.b / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > .5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

              case g:
                h = (b - r) / d + 2;
                break;

              case b:
                h = (r - g) / d + 4;
                break;
            }
            h *= 60;
        }
        return [ h, s * 100, l * 100 ];
    };
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    /**
     * Set the object's rgb and hex value, calculated from its values for hue, 
     *     saturation, and lightness
     * 
     * @name Color#setFromHSL
     * @function
     */
    Color.prototype.setFromHSL = function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        var r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            var q = l < .5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        this.r = Math.round(r * 255);
        this.g = Math.round(g * 255);
        this.b = Math.round(b * 255);
        this.hex = this.getHex();
        return this;
    };
    /**
     * Set the object's rgb and hex value, calculated from its hexidecimal color value
     * 
     * @name Color#setFromHex
     * @function
     */
    Color.prototype.setFromHex = function(hex) {
        hex = hex.charAt(0) === "#" ? hex.substring(1, hex.length) : hex;
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        this.hex = "#" + hex;
        this.r = parseInt(hex.substring(0, 2), 16);
        this.g = parseInt(hex.substring(2, 4), 16);
        this.b = parseInt(hex.substring(4, 6), 16);
        if (this.a == undefined) this.a = 1;
        return this;
    };
    /**
     * Resets the object's rgb value, its hex value, and optionally its alpha 
     *     value from passed in values
     * 
     * @name Color#setFromRGBA
     * @function
     */
    Color.prototype.setFromRGBA = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        if (a) this.a = a;
        this.hex = this.getHex();
        return this;
    };
    /**
     * Resets the object's hue from passed in value
     * 
     * @name Color#setHue
     * @function
     */
    Color.prototype.setHue = function(h) {
        var hsl = this.getHSL();
        return this.setFromHSL(h, hsl[1], hsl[2]);
    };
    /**
     * Resets the object's saturation from passed in value
     * 
     * @name Color#setSaturation
     * @function
     */
    Color.prototype.setSaturation = function(s) {
        var hsl = this.getHSL();
        return this.setFromHSL(hsl[0], s, hsl[2]);
    };
    /**
     * Resets the object's lightness from passed in value
     * 
     * @name Color#setLightness
     * @function
     */
    Color.prototype.setLightness = function(l) {
        var hsl = this.getHSL();
        return this.setFromHSL(hsl[0], hsl[1], l);
    };
    Color.prototype.setFromRGBAString = function(rgbaString) {
        var colorString = rgbaString.match(/\(([^()]+)\)/g);
        if (!colorString) return;
        colorString = colorString[0];
        colorString = colorString.substring(1, colorString.length - 1);
        var colorArray = colorString.split(",");
        for (var i = 0; i < colorArray.length; i++) {
            colorArray[i] = parseFloat(colorArray[i]);
        }
        return this.setFromRGBA(colorArray[0], colorArray[1], colorArray[2], colorArray[3]);
    };
    /**
     * Duplicates the current object with identical rgb and hex values
     * 
     * @name Color#clone
     * @function
     */
    Color.prototype.clone = function() {
        return new Color(this.r, this.g, this.b, this.a);
    };
    /**
     * Returns normalized red, green, blue, and alpha values as an array
     * 
     * @name Color#toNormalizeColorArray
     * @function
     */
    Color.prototype.toNormalizeColorArray = function() {
        return [ this.r / 255, this.g / 255, this.b / 255, this.a ];
    };
    /**
     * Returns new color object with hue, saturation, and lightness set based on
     *     a normalized scale between the current object's hsl and a second
     *     object's hsl. The value passed in determines the amount of
     *     hsl change, on a scale from 0 to 1.
     * 
     * @name Color#lerp
     * @function
     */
    Color.prototype.lerp = function(other, value) {
        var hsl1 = this.getHSL();
        var hsl2 = other.getHSL();
        var hue = hsl1[0] + (hsl2[0] - hsl1[0]) * value;
        var sat = hsl1[1] + (hsl2[1] - hsl1[1]) * value;
        var lgt = hsl1[2] + (hsl2[2] - hsl1[2]) * value;
        var color = new Color();
        color.setFromHSL(hue, sat, lgt);
        return color;
    };
    module.exports = Color;
}.bind(this));

require.register("app/main/views/ContentView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    var Scrollview = require("famous/views/scrollview");
    var TaskView = require("./TaskView");
    var Tasks = require("./data");
    var Box = require("./BoxView");
    var BoxContainer = require("./BoxContainer");
    var Timer = require("famous/utilities/timer");
    var InputSurface = require("famous/surfaces/input-surface");
    var DragSort = require("famous/views/drag-sort");
    var CustomScrollView = require("./customScrollView");
    var TaskItem = require("./TaskItem");
    var Color = require("./Color");
    function ContentView() {
        View.apply(this, arguments);
        this.lightness = 75;
        this.inputToggled = false;
        this.shown = {};
        _setBackground.call(this);
        _createTasks.call(this);
        _setListeners.call(this);
    }
    ContentView.prototype = Object.create(View.prototype);
    ContentView.prototype.constructor = ContentView;
    ContentView.DEFAULT_OPTIONS = {
        title: "later",
        classes: [ "contents" ],
        inputDuration: 300,
        views: {
            FOCUS: [ 0 ],
            TODAY: [ 1 ],
            LATER: [ 2 ],
            NEVER: [ 3 ]
        },
        gradientDuration: 800,
        completionDuration: 500
    };
    function _isAndroid() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    }
    function _setBackground() {
        var index = this.options.views[this.options.title][0];
        this.backgroundSurf = window.faderSurfaces[index];
        this.backgroundMod = window.faderMods[index];
        this.touchSurf = new Surface({
            size: [ undefined, undefined ],
            properties: {
                backgroundColor: "transparent"
            }
        });
        this.touchMod = new Modifier({
            transform: Transform.translate(0, 0, 0)
        });
        this._add(this.touchMod).add(this.touchSurf);
    }
    function _createTasks() {
        this.tasks = Tasks;
        this.taskCount = 0;
        this.customscrollview = new CustomScrollView({
            page: this.options.title
        });
        this.customdragsort = new DragSort({
            draggable: {
                xRange: [ 0, 0 ]
            }
        });
        var node = this.customdragsort;
        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].page === this.options.title) {
                var newTask = new TaskView({
                    text: this.tasks[i].text,
                    index: this.taskCount,
                    page: this.options.title
                });
                this.customdragsort.push(newTask);
                if (node.getNext()) node = node._next;
                newTask.pipe(node);
                node.pipe(this.customscrollview);
                newTask.pipe(this.customscrollview);
                this.customscrollview.pipe(node);
                this.taskCount++;
            }
        }
        this.scrollMod = new Modifier({
            transform: Transform.translate(0, 0, 1)
        });
        this.customscrollview.sequenceFrom(this.customdragsort);
        this.customscrollview.pipe(this._eventInput);
        this._add(this.scrollMod).add(this.customscrollview);
    }
    function _setListeners() {
        _gradientListener.call(this);
        _newTaskListener.call(this);
        _inputListeners.call(this);
    }
    function _newTaskListener() {
        this.on("saveNewTask", function(val) {
            var node = this.customdragsort.find(0);
            if (this.options.title === "FOCUS" && this.taskCount > 2) {
                return;
            }
            var newTask = new TaskView({
                text: val,
                index: this.taskCount,
                page: this.options.title
            });
            this.customdragsort.push(newTask);
            for (var j = 0; j < this.taskCount - 1; j++) {
                node = node._next;
            }
            if (node.getNext()) node = node._next;
            newTask.pipe(node);
            node.pipe(this.customscrollview);
            newTask.pipe(this.customscrollview);
            // newTask.pipe(this.customdragsort);
            this.customscrollview.pipe(node);
            _openInputListener.call(this, newTask);
            _closeInputListener.call(this, newTask);
            _completionListener.call(this, newTask);
            this.taskCount++;
        }.bind(this));
    }
    function _inputListeners() {
        for (var i = 0; i < this.customdragsort.array.length; i++) {
            _openInputListener.call(this, this.customdragsort.array[i]);
            _closeInputListener.call(this, this.customdragsort.array[i]);
            _completionListener.call(this, this.customdragsort.array[i]);
        }
        this.touchSurf.on("touchstart", function() {
            this.inputToggled = !this.inputToggled;
            this.inputToggled ? this._eventOutput.emit("showInput") : this._eventOutput.emit("hideInput");
        }.bind(this));
    }
    function _openInputListener(task) {
        task.on("openInput", function() {
            this.inputToggled = true;
            this._eventOutput.emit("showInput");
        }.bind(this));
    }
    function _closeInputListener(task) {
        task.on("closeInputOrEdit", function(options) {
            if (this.inputToggled) {
                this._eventOutput.emit("hideInput");
                this.inputToggled = false;
            } else {
                this._eventOutput.emit("openEdit", options);
            }
        }.bind(this));
    }
    function _gradientListener() {
        this.on("opened", function() {
            this.backgroundMod.setOpacity(1, {
                duration: this.options.gradientDuration
            }, function() {});
        }.bind(this));
        this.on("closed", function() {
            this.backgroundMod.setOpacity(0, {
                duration: this.options.gradientDuration
            }, function() {});
        }.bind(this));
    }
    function _completionListener(task) {
        task.on("completed", function() {
            this.taskCount--;
        }.bind(this));
        task.on("deleted", function() {
            this.taskCount--;
        }.bind(this));
    }
    /* PROBLEMS:
    1. get splice to work
    2. increase timeout for each one, decrease duration so that it comes in later and faster
    */
    ContentView.prototype.animateTasksIn = function(title) {
        this.shown = {};
        var counter = 1;
        Engine.on("prerender", function() {
            var toShow = {};
            var scrollview;
            if (this.customscrollview.options.page === title) {
                // only check the right scrollview
                scrollview = this.customscrollview;
            }
            if (scrollview._offsets[0] === undefined) return;
            // check if offsets empty
            for (var task in scrollview._offsets) {
                if (task !== "undefined") {
                    var taskObject = scrollview.node.array[task];
                    var taskOffset = scrollview._offsets[task];
                    if (taskOffset > -60 && taskOffset < window.innerHeight) {
                        toShow[taskObject] = true;
                        if (!this.shown[taskObject] && taskObject) {
                            // if task object hasn't been shown, animate in.
                            counter++;
                            taskObject.animateIn(counter);
                        }
                    }
                }
            }
            // RESET ANIMATION
            // for(var taskObj in this.shown) {
            //   if(!(taskObj in toShow)) {
            //     taskObj.resetAnimation();
            //   }
            // }
            this.shown = toShow;
        }.bind(this));
    };
    module.exports = ContentView;
}.bind(this));

require.register("app/main/views/FooterView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    function FooterView() {
        View.apply(this, arguments);
        this.options.title !== "NEVER" && _createButton.call(this);
        this.options.title !== "NEVER" && _buttonListener.call(this);
    }
    FooterView.prototype = Object.create(View.prototype);
    FooterView.prototype.constructor = FooterView;
    FooterView.DEFAULT_OPTIONS = {
        classes: [ "footer" ]
    };
    function _createButton() {
        this.buttonSurf = new Surface({
            content: "<img width='40' height='40' src='./img/hamburgerOnClear.png'/>",
            properties: {
                textAlign: "center"
            }
        });
        this.buttonModifier = new Modifier({
            origin: [ .5, 1 ]
        });
        this._add(this.buttonModifier).add(this.buttonSurf);
    }
    function _buttonListener() {
        this.buttonSurf.on("touchend", function() {
            this._eventOutput.emit("togglePageViewUp");
            console.log();
        }.bind(this));
    }
    module.exports = FooterView;
}.bind(this));

require.register("app/main/views/HeaderView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    var Color = require("./Color");
    var Transitionable = require("famous/transitions/transitionable");
    var Box = require("./BoxView");
    var BoxContainer = require("./BoxContainer");
    function HeaderView() {
        View.apply(this, arguments);
        this.inputToggled = false;
        _createTitle.call(this);
        _createInput.call(this);
        _buttonListener.call(this);
        _setListeners.call(this);
    }
    HeaderView.prototype = Object.create(View.prototype);
    HeaderView.prototype.constructor = HeaderView;
    HeaderView.DEFAULT_OPTIONS = {
        text: null,
        classes: [ "title" ],
        title: "LATER",
        openDuration: 800,
        closedDuration: 100,
        inputDuration: 300
    };
    function _isAndroid() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    }
    function _createInput() {
        this.boxContainer = new BoxContainer();
        this.bodMod = new Modifier();
        if (_isAndroid()) {
            this.boxMod = new Modifier({
                transform: Transform.translate(0, 90, 0)
            });
        } else {
            this.boxMod = new Modifier({
                transform: Transform.translate(0, 80, 0)
            });
        }
        this._add(this.boxMod).add(this.boxContainer);
    }
    function _createTitle() {
        this.titleHeader = new Surface({
            content: "<h1>" + this.options.title + "</h1>",
            properties: {
                backgroundColor: "transparent"
            }
        });
        this.titleMod = new Modifier({
            opacity: 0
        });
        this.options.title === "FOCUS" && this.titleMod.setOpacity(1, undefined, function() {});
        this._add(this.titleMod).add(this.titleHeader);
    }
    function _buttonListener() {
        this.titleHeader.on("touchend", function() {
            this._eventOutput.emit("togglePageViewDown");
        }.bind(this));
    }
    function _setListeners() {
        this.on("opened", function() {
            this.titleMod.setOpacity(1, {
                duration: this.options.openDuration
            }, function() {
                this.titleMod.setTransform(Transform.translate(0, 0, 1), {
                    duration: this.options.openDurationf
                }, function() {});
            }.bind(this));
        }.bind(this));
        this.on("closed", function() {
            this.titleMod.setOpacity(0, {
                duration: this.options.closedDuration
            }, function() {
                this.titleMod.setTransform(Transform.translate(0, 0, 0), {
                    duration: this.options.closedDuration
                }, function() {});
            }.bind(this));
        }.bind(this));
        _setInputListener.call(this);
    }
    function _setInputListener() {
        this.inputXOffset = _isAndroid() ? 30 : 10;
        this.inputZOffset = _isAndroid() ? 150 : 70;
        if (this.options.title === "FOCUS") {
            this.titleHeader.on("touchstart", function() {
                this.inputToggled = !this.inputToggled;
                this.inputToggled ? this._eventOutput.emit("showInput") : this._eventOutput.emit("focusHideInput");
            }.bind(this));
        }
        this.on("showInput", function(e) {
            this.boxContainer.frontSurf.setProperties({
                visibility: "visible"
            });
            this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(-1.57, 0, 0), [ this.inputXOffset, 70, this.inputZOffset ]), {
                duration: this.options.inputDuration
            });
        }.bind(this));
        this.on("hideInput", function() {
            this.value = this.boxContainer.inputSurf.getValue();
            this.boxContainer.inputSurf.setValue("");
            this.boxContainer.boxMod.setTransform(Transform.move(Transform.rotate(0, 0, 0), [ this.inputXOffset, 0, this.inputZOffset ]), {
                duration: this.options.inputDuration
            }, function() {
                this.boxContainer.frontSurf.setProperties({
                    visibility: "hidden"
                });
            }.bind(this));
        }.bind(this));
    }
    module.exports = HeaderView;
}.bind(this));

require.register("app/main/views/ListView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var View = require("famous/view");
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var TaskView = require("./TaskView");
    var Tasks = require("./data");
    var InputSurface = require("famous/surfaces/input-surface");
    var Timer = require("famous/utilities/timer");
    function ListView() {
        View.apply(this, arguments);
        this.color = new Transitionable([ 360, 100, 100 ]);
        this.lightness = 75;
        _createBackground.call(this);
        _createHeader.call(this);
        _populateTasks.call(this);
        _createInput.call(this);
        _createManyTasks.call(this);
        _setListeners.call(this);
    }
    ListView.prototype = Object.create(View.prototype);
    ListView.prototype.constructor = ListView;
    ListView.DEFAULT_OPTIONS = {};
    function _completeColorMod() {
        this.backgroundSurf.setProperties({
            backgroundColor: "hsl(145, 63%," + this.color.get()[2] + "%)"
        });
    }
    function _populateTasks() {
        this.tasks = Tasks;
    }
    function _createBackground() {
        this.backgroundSurf = new Surface({
            size: [ undefined, undefined ]
        });
        this.backgroundMod = new Modifier();
        this._add(this.backgroundMod).add(this.backgroundSurf);
    }
    function _createHeader() {
        this.header = new Surface({
            size: [ undefined, true ],
            content: "<h1>TODAY</h1>",
            properties: {
                color: "black",
                fontSize: "2.5em"
            }
        });
        this.headerMod = new Modifier();
        this._add(this.headerMod).add(this.header);
    }
    function _createManyTasks() {
        this.taskMods = [];
        this.taskViews = [];
        for (var i = 0; i < this.tasks.length; i++) {
            var taskView = new TaskView({
                text: this.tasks[i].text
            });
            var offset = taskView.options.taskOffset * (i + 2);
            var taskMod = new Modifier({
                origin: [ .2, .2 ],
                transform: Transform.translate(0, offset, 0)
            });
            this._add(taskMod).add(taskView);
            this.taskMods.push(taskMod);
            this.taskViews.push(taskView);
        }
    }
    function _createInput() {
        this.inputSurf = new InputSurface({
            placeholder: "Enter task here...",
            properties: {
                visibility: "hidden",
                height: "60px"
            }
        });
        this.inputMod = new Modifier({
            transform: Transform.translate(0, 1e3, 0)
        });
        this._add(this.inputMod).add(this.inputSurf);
    }
    var clicked = false;
    function _setListeners() {
        window.Engine.on("prerender", _completeColorMod.bind(this));
        this.backgroundSurf.on("touchstart", function() {
            if (clicked && this.inputSurf.getValue() === "") {
                clicked = false;
                this.inputSurf.setProperties({
                    visibility: "hidden"
                });
            } else if (clicked && this.inputSurf.getValue().length) {
                called = true;
                var newTask = {
                    text: this.inputSurf.getValue(),
                    focus: true
                };
                this.tasks.push(newTask);
                var taskView = new TaskView(newTask);
                var offset = taskView.options.taskOffset * (this.tasks.length + 1);
                var taskMod = new Modifier({
                    origin: [ 0, .425 ],
                    transform: Transform.translate(0, offset, 0)
                });
                _setOneCompleteListener.call(this, taskView);
                this._add(taskMod).add(taskView);
                this.inputSurf.setValue("");
                this.inputSurf.setProperties({
                    visibility: "hidden"
                });
            } else {
                clicked = true;
                this.inputSurf.setProperties({
                    visibility: "visible"
                });
                var offset = 39 * this.tasks.length + 303;
                this.inputMod.setTransform(Transform.translate(0, offset, 0));
            }
        }.bind(this));
        for (var i = 0; i < this.taskViews.length; i++) {
            _setOneCompleteListener.call(this, this.taskViews[i]);
        }
    }
    function _setOneCompleteListener(view) {
        view.on("completed", function() {
            this.color.set([ 145, 63, this.lightness ], {
                duration: 250
            }, function() {
                Timer.after(function() {
                    this.color.set([ 145, 63, 100 ], {
                        duration: 250
                    });
                }.bind(this), 7);
            }.bind(this));
        }.bind(this));
    }
    module.exports = ListView;
}.bind(this));

require.register("app/main/views/PageView.js", function(exports, require, module) {
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var View = require("famous/view");
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var GenericSync = require("famous/input/generic-sync");
    var InputSurface = require("famous/surfaces/input-surface");
    var Timer = require("famous/utilities/timer");
    var Draggable = require("famous/modifiers/draggable");
    var HeaderFooter = require("famous/views/header-footer-layout");
    var Utility = require("famous/utilities/utility");
    var Color = require("./Color");
    var Tasks = require("./data");
    var TaskView = require("./TaskView");
    var HeaderView = require("./HeaderView");
    var FooterView = require("./FooterView");
    var ContentView = require("./ContentView");
    function PageView() {
        View.apply(this, arguments);
        this.toggleUpOrDown = "down";
        if (this.options.title === "FOCUS") {
            this.headerSizeTransitionable = new Transitionable([ this.options.focusHeader ]);
        } else {
            this.headerSizeTransitionable = new Transitionable([ this.options.regSmallHeader ]);
        }
        this.offPage = false;
        _createLayout.call(this);
        _pipeSubviewEventsToAppView.call(this);
        _createEditLightbox.call(this);
        _setListeners.call(this);
    }
    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;
    PageView.DEFAULT_OPTIONS = {
        title: "LATER",
        yPositionToggleThreshold: 250,
        velocityToggleThreshold: .75,
        headerSizeDuration: 300,
        regSmallHeader: 70,
        regBigHeader: 140,
        focusHeader: window.innerHeight / 2,
        editInputAnimation: {
            method: "spring",
            period: 500,
            dampingRatio: .6
        },
        shadowFadeDuration: 200
    };
    function _createEditLightbox() {
        this.editLightBox = new View();
        this.editLBMod = new Modifier({
            transform: Transform.translate(0, 0, -10)
        });
        this.shadow = new Surface({
            size: [ undefined, 650 ],
            classes: [ "shadowed" ]
        });
        this.shadowMod = new Modifier({
            opacity: .01
        });
        this.editSurface = new InputSurface({
            size: [ undefined, 60 ],
            classes: [ "edit" ],
            properties: {
                backgroundColor: "white"
            }
        });
        this.editMod = new Modifier({
            origin: [ 0, 0 ],
            transform: Transform.translate(0, 600, 0)
        });
        this.shadow.on("touchstart", function() {
            var editedText = this.editSurface.getValue();
            debugger;
            var editedTask = this.contents.customdragsort.array[this.taskIndex].taskItem;
            editedTask._eventOutput.emit("saveTask", editedText);
            _editInputFlyOut.call(this);
            Timer.after(_lightboxFadeOut.bind(this), 10);
        }.bind(this));
        this.editLightBox._add(this.editMod).add(this.editSurface);
        this.editLightBox._add(this.shadowMod).add(this.shadow);
        this._add(this.editLBMod).add(this.editLightBox);
    }
    function _createLayout() {
        this.layout = new HeaderFooter({
            headerSize: 70,
            footerSize: 40
        });
        this.footer = new FooterView({
            title: this.options.title
        });
        this.header = new HeaderView({
            title: this.options.title
        });
        this.contents = new ContentView({
            title: this.options.title
        });
        this.layout.id["header"].add(this.header);
        this.layout.id["content"].add(this.contents);
        this.layout.id["footer"].add(Utility.transformInFront).add(this.footer);
        this._add(this.layout);
    }
    function _setHeaderSize() {
        this.layout.setOptions({
            headerSize: this.headerSizeTransitionable.get()[0]
        });
    }
    function _pipeSubviewEventsToAppView() {
        this.footer.pipe(this._eventOutput);
        this.header.pipe(this._eventOutput);
    }
    function _setListeners() {
        window.Engine.on("prerender", _setHeaderSize.bind(this));
        this.contents.on("showInput", function() {
            this.header._eventOutput.emit("showInput");
            if (this.options.title !== "FOCUS") {
                this.headerSizeTransitionable.set([ this.options.regBigHeader ], {
                    duration: this.options.headerSizeDuration
                }, function() {});
            }
        }.bind(this));
        this.contents.on("hideInput", function() {
            this.header._eventOutput.emit("hideInput");
            if (this.options.title !== "FOCUS") {
                this.headerSizeTransitionable.set([ this.options.regSmallHeader ], {
                    duration: this.options.headerSizeDuration
                }, function() {
                    this.header.value.length && this.contents._eventOutput.emit("saveNewTask", this.header.value);
                }.bind(this));
            } else if (this.header.value.length) {
                this.contents._eventOutput.emit("saveNewTask", this.header.value);
            }
        }.bind(this));
        this.header.on("focusHideInput", function() {
            this.header._eventOutput.emit("hideInput");
            this.header.value.length && this.contents._eventOutput.emit("saveNewTask", this.header.value);
        }.bind(this));
        this.contents.on("openEdit", function(options) {
            this.taskIndex = options.index;
            this.editSurface.setValue(options.text);
            _lightboxFadeIn.call(this);
            Timer.after(_editInputFlyIn.bind(this), 5);
        }.bind(this));
    }
    function _lightboxFadeOut() {
        this.shadowMod.setOpacity(.01, {
            duration: this.options.shadowFadeDuration
        }, function() {
            this.editLBMod.setTransform(Transform.translate(0, 0, -10), {
                duration: 0
            }, function() {});
        }.bind(this));
    }
    function _lightboxFadeIn() {
        this.editLBMod.setTransform(Transform.translate(0, 0, 2), {
            duration: 0
        }, function() {
            this.shadowMod.setOpacity(1, {
                duration: this.options.shadowFadeDuration
            }, function() {});
        }.bind(this));
    }
    function _editInputFlyIn() {
        this.editTaskOffset = this.options.title === "FOCUS" ? window.innerHeight / 2 + this.taskIndex * 60 : (this.taskIndex + 1) * 60;
        this.editMod.setTransform(Transform.translate(0, this.editTaskOffset, 0));
        this.editMod.setTransform(Transform.translate(0, 40, 0), this.options.editInputAnimation, function() {});
    }
    function _editInputFlyOut() {
        this.editMod.setTransform(Transform.translate(0, this.editTaskOffset, 0), {
            duration: 300
        }, function() {});
    }
    module.exports = PageView;
}.bind(this));

require.register("app/main/views/TaskItem.js", function(exports, require, module) {
    var Engine = require("famous/engine");
    var View = require("famous/view");
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var Matrix = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var HeaderFooter = require("famous/views/header-footer-layout");
    var Utility = require("famous/utilities/utility");
    var SequentialLayout = require("famous/views/sequential-layout");
    var ViewSequence = require("famous/view-sequence");
    var Draggable = require("famous/modifiers/draggable");
    var Transform = require("famous/transform");
    var Easing = require("famous/animation/easing");
    function TaskItem(options) {
        View.apply(this, arguments);
        this.timeTouched = 0;
        this.page = this.options.page;
        this.text = this.options.text;
        _createLayout.call(this);
        _bindEvents.call(this);
        _setDate.call(this);
    }
    TaskItem.prototype = Object.create(View.prototype);
    TaskItem.prototype.constructor = TaskItem;
    TaskItem.DEFAULT_OPTIONS = {
        index: null,
        surface: {
            classes: [ "task" ],
            size: [ undefined, 60 ],
            properties: {
                webkitUserSelect: "none"
            }
        },
        taskItemSpringTransition: {
            method: "spring",
            duration: 200
        },
        taskItemExitTransition: {
            curve: "easeIn",
            duration: 200
        },
        dragThreshold: 600
    };
    function _createLayout() {
        this.checkBox = new Surface({
            size: [ this.options.deleteCheckWidth, 60 ],
            classes: [ "task" ],
            content: '<img class="checkIcon" src="./img/check_icon.png">',
            properties: {
                webkitUserSelect: "none"
            }
        });
        this.deleteBox = new Surface({
            size: [ this.options.deleteCheckWidth, 60 ],
            classes: [ "task" ],
            content: '<img class="deleteIcon" src="./img/x_icon.png">',
            properties: {
                webkitUserSelect: "none"
            }
        });
        this.contents = new Surface({
            size: [ window.innerWidth, 60 ],
            classes: [ "task" ],
            content: "<p>" + this.options.text + "</p>",
            properties: {
                webkitUserSelect: "none"
            }
        });
        var surfaces = [ this.checkBox, this.contents, this.deleteBox ];
        this.taskItemViewSequence = new ViewSequence({
            array: surfaces,
            index: 0
        });
        this.taskItemLayout = new SequentialLayout();
        this.taskItemLayout.sequenceFrom(this.taskItemViewSequence);
        this.contents.pipe(this);
        this._eventInput.pipe(this._eventOutput);
        this.taskItemModifier = new Modifier({
            transform: Matrix.identity,
            size: this.options.surface.size
        });
        this.draggable = new Draggable({
            projection: "x",
            xRange: [ -1 * this.options.deleteCheckWidth, this.options.deleteCheckWidth ]
        });
        // this.pipe(this.draggable);
        this._add(this.taskItemModifier).add(this.draggable).add(this.taskItemLayout);
    }
    function _bindEvents() {
        this._eventInput.on("touchstart", handleStart.bind(this));
        this._eventInput.on("touchmove", handleMove.bind(this));
        this._eventInput.on("touchend", handleEnd.bind(this));
        this._eventInput.on("click", handleClick.bind(this));
        this.on("saveTask", saveTask.bind(this));
        Engine.on("prerender", findTimeDeltas.bind(this));
        Engine.on("prerender", checkForDragging.bind(this));
    }
    function handleClick() {
        if (this.timeTouched < this.clickThreshold) {}
    }
    function handleStart(data) {
        this._eventInput.pipe(this.draggable);
        this.touched = true;
        this.distanceThreshold = false;
        this.touchStart = [ data.targetTouches[0]["pageX"], data.targetTouches[0]["pageY"] ];
        this.touchCurrent = [ data.targetTouches[0]["pageX"], data.targetTouches[0]["pageY"] ];
    }
    function handleMove(data) {
        this.touchCurrent = [ data.targetTouches[0]["pageX"], data.targetTouches[0]["pageY"] ];
        var distance = Math.sqrt(Math.pow(this.touchStart[0] - this.touchCurrent[0], 2) + Math.pow(this.touchStart[1] - this.touchCurrent[1], 2));
        if (distance > 35 && !this.distanceThreshold) {
            this.distanceThreshold = true;
            var xDistance = Math.abs(this.touchStart[0] - this.touchCurrent[0]);
            var yDistance = Math.abs(this.touchStart[1] - this.touchCurrent[1]);
            if (xDistance > yDistance) {
                this._eventOutput.emit("xScroll");
            }
            if (yDistance >= xDistance) {
                this._eventOutput.emit("yScroll");
                this._eventInput.unpipe(this.draggable);
            }
        }
    }
    function handleEnd() {
        this.touched = false;
        replaceTask.call(this);
        var xDistance = Math.abs(this.touchStart[0] - this.touchCurrent[0]);
        var yDistance = Math.abs(this.touchStart[1] - this.touchCurrent[1]);
        if (this.touchStart[1] < 90) {
            this._eventOutput.emit("openInput");
        } else if (xDistance < 10 && yDistance < 10 && this.timeTouched > 0 && this.timeTouched < 200) {
            this._eventOutput.emit("closeInputOrEdit", {
                text: this.options.text,
                index: this.options.index
            });
        }
        this.timeTouched = 0;
        this._eventInput.pipe(this.draggable);
    }
    function findTimeDeltas() {
        this.lastFrameTime = this.now;
        this.now = Date.now();
        this.timeDelta = this.now - this.lastFrameTime;
    }
    function _setDate() {
        this.now = Date.now();
        this.lastFrameTime = Date.now();
    }
    function checkForDragging(data) {
        if (this.touched) {
            this.timeTouched += this.timeDelta;
            if (this.timeTouched > this.options.dragThreshold) {
                var distance = Math.sqrt(Math.pow(this.touchStart[0] - this.touchCurrent[0], 2) + Math.pow(this.touchStart[1] - this.touchCurrent[1], 2));
                if (distance < 25) {
                    this._eventInput.unpipe(this.draggable);
                    this.timeTouched = 0;
                    this._eventOutput.emit("editmodeOn");
                    this.touched = false;
                    dragmode.call(this);
                } else {
                    this.touched = false;
                }
            }
        }
    }
    function dragmode() {
        this.contents.addClass("dragging");
        this.taskItemModifier.setTransform(Matrix.translate(0, 0, 40), {
            curve: "easeOut",
            duration: 300
        });
    }
    function replaceTask() {
        this.taskItemModifier.setTransform(Matrix.identity, {
            curve: "easeOut",
            duration: 100
        }, function() {
            this._eventOutput.emit("editmodeOff");
            this._eventOutput.emit("finishedDragging");
            this.contents.removeClass("dragging");
            var xPosition = this.draggable.getPosition()[0];
            if (xPosition > this.options.xThreshold) {
                _checkOffTask.call(this);
            } else if (xPosition < -1 * this.options.xThreshold) {
                _deleteTask.call(this);
            } else {
                _springTaskBack.call(this);
            }
        }.bind(this));
    }
    function _checkOffTask() {
        this.deleteBox.addClass("invisible");
        this.draggable.setPosition([ -1 * this.options.deleteCheckWidth - window.innerWidth, 0 ], this.options.taskItemExitTransition, function() {
            console.log("check me off");
            this._eventOutput.emit("completed");
            this._eventOutput.emit("deleteTask");
        }.bind(this));
    }
    function _deleteTask() {
        this.checkBox.addClass("invisible");
        this.draggable.setPosition([ this.options.deleteCheckWidth + window.innerWidth, 0 ], this.options.taskItemExitTransition, function() {
            this._eventOutput.emit("deleted");
            this._eventOutput.emit("deleteTask");
        }.bind(this));
    }
    function _springTaskBack() {
        this.draggable.setPosition([ 0, 0 ], this.options.taskItemSpringTransition);
    }
    function saveTask(text) {
        this.contents.setContent("<p>" + text + "</p>");
    }
    module.exports = TaskItem;
}.bind(this));

require.register("app/main/views/TaskView.js", function(exports, require, module) {
    var Draggable = require("famous/modifiers/draggable");
    var Transform = require("famous/transform");
    var View = require("famous/view");
    var TaskItem = require("./TaskItem");
    var Modifier = require("famous/modifier");
    function TaskView(options) {
        View.apply(this, arguments);
        _addTaskItem.call(this);
        this.options.transition = {
            duration: 1300,
            curve: "easeInOut"
        };
        this.animateIn = animateIn;
        this.reset = resetAnimation;
    }
    TaskView.prototype = Object.create(View.prototype);
    TaskView.prototype.constructor = TaskView;
    TaskView.DEFAULT_OPTIONS = {
        deleteCheckWidth: 100,
        xThreshold: 95
    };
    function _addTaskItem() {
        this.taskItem = new TaskItem(this.options);
        this.taskItemModifier = new Modifier({
            transform: Transform.translate(-1 * this.options.deleteCheckWidth, 1e3, 0),
            size: [ undefined, 60 ],
            opacity: .1
        });
        this.taskItem.pipe(this._eventOutput);
        this._add(this.taskItemModifier).add(this.taskItem);
    }
    /*-----------------------ANIMATION-------------------------------*/
    function animateIn(counter) {
        this.taskItemModifier.setTransform(Transform.translate(-1 * this.options.deleteCheckWidth, 0, 0), {
            duration: 180 * counter,
            curve: "easeInOut"
        });
        this.taskItemModifier.setOpacity(1, this.options.transition);
    }
    module.exports = TaskView;
    function resetAnimation() {
        this.taskItemModifier.setTransform(Transform.translate(-1 * this.options.deleteCheckWidth, 200, 0), this.options.transition);
        this.taskItemModifier.setOpacity(.1, this.options.transition);
    }
}.bind(this));

require.register("app/main/views/colorData.js", function(exports, require, module) {
    var colorData = {};
    colorData.focusColors = [ .2, .8, .7, 1, // green
    .2, .8, .7, 1, 1, 1, 1, 1, // white
    1, 1, 1, 1 ];
    colorData.todayColors = [ .5, .8, 1, 1, // light blue
    .5, .8, 1, 1, 1, 1, 1, 1, // white
    1, 1, 1, 1 ];
    colorData.laterColors = [ .5, .5, .8, 1, // purple
    .5, .5, .8, 1, .2, .6, 1, 1, // blue
    .2, .6, 1, 1 ];
    colorData.neverColors = [ .2, .8, .7, 1, // green
    .2, .8, .7, 1, 1, 1, 1, 1, // white
    1, 1, 1, 1 ];
    module.exports = colorData;
}.bind(this));

require.register("app/main/views/customScrollView.js", function(exports, require, module) {
    var Scrollview = require("famous/views/scrollview");
    var Engine = require("famous/engine");
    function TableView(options) {
        Scrollview.apply(this, arguments);
        bindEvents.call(this);
        this.options.page = options.page;
    }
    function bindEvents() {
        this.eventInput.on("shift", shift.bind(this));
        this.eventInput.on("editmodeOn", stopYScroll.bind(this));
        this.eventInput.on("xScroll", stopYScroll.bind(this));
        this.eventInput.on("deleteMe", deleteTask.bind(this));
        this.eventInput.on("swapPage", swapPage.bind(this));
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
            currentNode.setPosition([ 0, 0 ]);
            currentNode = currentNode.getNext();
        }
    }
    function deleteTask(indexObj) {
        if (indexObj.index === this.node.index) {
            if (this.node.find(this.node.index + 1)) this.node = this.node.find(this.node.index + 1);
        }
        this.node.splice(indexObj.index, 1);
        console.log(this.node);
    }
    function swapPage(indexObj) {
        var currentNode = this.node.find(0);
        while (currentNode && currentNode.index !== indexObj.index) {
            currentNode.setPosition([ 0, 0 ]);
            currentNode = currentNode.getNext();
        }
        var currentNode = this.node.find(indexObj.index + 1);
        while (currentNode) {
            currentNode.setPosition([ 0, -currentNode.getSize()[1] ]);
            currentNode = currentNode.getNext();
        }
        setTimeout(function() {
            console.log(indexObj);
            if (indexObj.index === this.node.index) {
                if (this.node.find(this.node.index + 1)) this.node = this.node.find(this.node.index + 1);
            }
            this.eventOutput.emit("saveNewTask", {
                text: this.node.splice(indexObj.index, 1).taskItem.text
            });
            var currentNode = this.node.find(0);
            while (currentNode) {
                currentNode.setPosition([ 0, 0 ]);
                currentNode = currentNode.getNext();
            }
        }.bind(this), 300);
    }
    TableView.prototype = Object.create(Scrollview.prototype);
    TableView.prototype.emit = function(type, data) {
        if (type == "update" || type == "start" || type == "end" || type == "swap") this.eventInput.emit(type, data); else this.sync.emit(type, data);
    };
    module.exports = TableView;
}.bind(this));

require.register("app/main/views/data.js", function(exports, require, module) {
    var tasks = [ {
        text: "make an app",
        page: "FOCUS"
    }, {
        text: "be awesome",
        page: "FOCUS"
    }, {
        text: "moonlight as catwoman",
        page: "FOCUS"
    }, {
        text: "find phone",
        page: "TODAY"
    }, {
        text: "be awesome",
        page: "TODAY"
    }, {
        text: "make app, heeeere",
        page: "TODAY"
    }, {
        text: "eat lunch",
        page: "TODAY"
    }, {
        text: "eat dinner",
        page: "TODAY"
    }, {
        text: "eat dinner",
        page: "LATER"
    }, {
        text: "eat dinner",
        page: "LATER"
    }, {
        text: "eat dinner",
        page: "LATER"
    }, {
        text: "eat dinner",
        page: "LATER"
    }, {
        text: "eat dinner",
        page: "LATER"
    }, {
        text: "eat dinner",
        page: "LATER"
    }, {
        text: "eat lunch",
        page: "TODAY"
    }, {
        text: "eat dinner",
        page: "TODAY"
    }, {
        text: "eat lunch",
        page: "TODAY"
    }, {
        text: "eat dinner",
        page: "NEVER"
    }, {
        text: "eat lunch",
        page: "NEVER"
    }, {
        text: "eat dinner",
        page: "NEVER"
    }, // { text: 'make an app', page: 'FOCUS'},
    // { text: 'eat lunch', page: 'TODAY'},
    // { text: 'be awesome', page: 'FOCUS'},
    // { text: 'eat dinner', page: 'TODAY'},
    // { text: 'eat lunch', page: 'TODAY'},
    // { text: 'be awesome', page: 'FOCUS'},
    // { text: 'eat dinner', page: 'TODAY'},
    // { text: 'eat lunch', page: 'TODAY'},
    // { text: 'be awesome', page: 'FOCUS'},
    // { text: 'eat dinner', page: 'TODAY'},
    // { text: 'make an app', page: 'FOCUS'},
    // { text: 'eat lunch', page: 'TODAY'},
    // { text: 'be awesome', page: 'FOCUS'},
    // { text: 'eat dinner', page: 'TODAY'},
    // { text: 'eat lunch', page: 'TODAY'},
    // { text: 'be awesome', page: 'FOCUS'},
    // { text: 'eat dinner', page: 'TODAY'},
    // { text: 'eat lunch', page: 'TODAY'},
    // { text: 'be awesome', page: 'FOCUS'},
    {
        text: "finish work",
        page: "TODAY"
    } ];
    module.exports = tasks;
}.bind(this));

require.register("app/main/views/webGL/sylvester.js", function(exports, require, module) {
    // === Sylvester ===
    // Vector and Matrix mathematics modules for JavaScript
    // Copyright (c) 2007 James Coglan
    // 
    // Permission is hereby granted, free of charge, to any person obtaining
    // a copy of this software and associated documentation files (the "Software"),
    // to deal in the Software without restriction, including without limitation
    // the rights to use, copy, modify, merge, publish, distribute, sublicense,
    // and/or sell copies of the Software, and to permit persons to whom the
    // Software is furnished to do so, subject to the following conditions:
    // 
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    // 
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    // THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    // FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    // DEALINGS IN THE SOFTWARE.
    var Sylvester = {
        version: "0.1.3",
        precision: 1e-6
    };
    function Vector() {}
    Vector.prototype = {
        // Returns element i of the vector
        e: function(i) {
            return i < 1 || i > this.elements.length ? null : this.elements[i - 1];
        },
        // Returns the number of elements the vector has
        dimensions: function() {
            return this.elements.length;
        },
        // Returns the modulus ('length') of the vector
        modulus: function() {
            return Math.sqrt(this.dot(this));
        },
        // Returns true iff the vector is equal to the argument
        eql: function(vector) {
            var n = this.elements.length;
            var V = vector.elements || vector;
            if (n != V.length) {
                return false;
            }
            do {
                if (Math.abs(this.elements[n - 1] - V[n - 1]) > Sylvester.precision) {
                    return false;
                }
            } while (--n);
            return true;
        },
        // Returns a copy of the vector
        dup: function() {
            return Vector.create(this.elements);
        },
        // Maps the vector to another vector according to the given function
        map: function(fn) {
            var elements = [];
            this.each(function(x, i) {
                elements.push(fn(x, i));
            });
            return Vector.create(elements);
        },
        // Calls the iterator for each element of the vector in turn
        each: function(fn) {
            var n = this.elements.length, k = n, i;
            do {
                i = k - n;
                fn(this.elements[i], i + 1);
            } while (--n);
        },
        // Returns a new vector created by normalizing the receiver
        toUnitVector: function() {
            var r = this.modulus();
            if (r === 0) {
                return this.dup();
            }
            return this.map(function(x) {
                return x / r;
            });
        },
        // Returns the angle between the vector and the argument (also a vector)
        angleFrom: function(vector) {
            var V = vector.elements || vector;
            var n = this.elements.length, k = n, i;
            if (n != V.length) {
                return null;
            }
            var dot = 0, mod1 = 0, mod2 = 0;
            // Work things out in parallel to save time
            this.each(function(x, i) {
                dot += x * V[i - 1];
                mod1 += x * x;
                mod2 += V[i - 1] * V[i - 1];
            });
            mod1 = Math.sqrt(mod1);
            mod2 = Math.sqrt(mod2);
            if (mod1 * mod2 === 0) {
                return null;
            }
            var theta = dot / (mod1 * mod2);
            if (theta < -1) {
                theta = -1;
            }
            if (theta > 1) {
                theta = 1;
            }
            return Math.acos(theta);
        },
        // Returns true iff the vector is parallel to the argument
        isParallelTo: function(vector) {
            var angle = this.angleFrom(vector);
            return angle === null ? null : angle <= Sylvester.precision;
        },
        // Returns true iff the vector is antiparallel to the argument
        isAntiparallelTo: function(vector) {
            var angle = this.angleFrom(vector);
            return angle === null ? null : Math.abs(angle - Math.PI) <= Sylvester.precision;
        },
        // Returns true iff the vector is perpendicular to the argument
        isPerpendicularTo: function(vector) {
            var dot = this.dot(vector);
            return dot === null ? null : Math.abs(dot) <= Sylvester.precision;
        },
        // Returns the result of adding the argument to the vector
        add: function(vector) {
            var V = vector.elements || vector;
            if (this.elements.length != V.length) {
                return null;
            }
            return this.map(function(x, i) {
                return x + V[i - 1];
            });
        },
        // Returns the result of subtracting the argument from the vector
        subtract: function(vector) {
            var V = vector.elements || vector;
            if (this.elements.length != V.length) {
                return null;
            }
            return this.map(function(x, i) {
                return x - V[i - 1];
            });
        },
        // Returns the result of multiplying the elements of the vector by the argument
        multiply: function(k) {
            return this.map(function(x) {
                return x * k;
            });
        },
        x: function(k) {
            return this.multiply(k);
        },
        // Returns the scalar product of the vector with the argument
        // Both vectors must have equal dimensionality
        dot: function(vector) {
            var V = vector.elements || vector;
            var i, product = 0, n = this.elements.length;
            if (n != V.length) {
                return null;
            }
            do {
                product += this.elements[n - 1] * V[n - 1];
            } while (--n);
            return product;
        },
        // Returns the vector product of the vector with the argument
        // Both vectors must have dimensionality 3
        cross: function(vector) {
            var B = vector.elements || vector;
            if (this.elements.length != 3 || B.length != 3) {
                return null;
            }
            var A = this.elements;
            return Vector.create([ A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0] ]);
        },
        // Returns the (absolute) largest element of the vector
        max: function() {
            var m = 0, n = this.elements.length, k = n, i;
            do {
                i = k - n;
                if (Math.abs(this.elements[i]) > Math.abs(m)) {
                    m = this.elements[i];
                }
            } while (--n);
            return m;
        },
        // Returns the index of the first match found
        indexOf: function(x) {
            var index = null, n = this.elements.length, k = n, i;
            do {
                i = k - n;
                if (index === null && this.elements[i] == x) {
                    index = i + 1;
                }
            } while (--n);
            return index;
        },
        // Returns a diagonal matrix with the vector's elements as its diagonal elements
        toDiagonalMatrix: function() {
            return Matrix.Diagonal(this.elements);
        },
        // Returns the result of rounding the elements of the vector
        round: function() {
            return this.map(function(x) {
                return Math.round(x);
            });
        },
        // Returns a copy of the vector with elements set to the given value if they
        // differ from it by less than Sylvester.precision
        snapTo: function(x) {
            return this.map(function(y) {
                return Math.abs(y - x) <= Sylvester.precision ? x : y;
            });
        },
        // Returns the vector's distance from the argument, when considered as a point in space
        distanceFrom: function(obj) {
            if (obj.anchor) {
                return obj.distanceFrom(this);
            }
            var V = obj.elements || obj;
            if (V.length != this.elements.length) {
                return null;
            }
            var sum = 0, part;
            this.each(function(x, i) {
                part = x - V[i - 1];
                sum += part * part;
            });
            return Math.sqrt(sum);
        },
        // Returns true if the vector is point on the given line
        liesOn: function(line) {
            return line.contains(this);
        },
        // Return true iff the vector is a point in the given plane
        liesIn: function(plane) {
            return plane.contains(this);
        },
        // Rotates the vector about the given object. The object should be a 
        // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
        rotate: function(t, obj) {
            var V, R, x, y, z;
            switch (this.elements.length) {
              case 2:
                V = obj.elements || obj;
                if (V.length != 2) {
                    return null;
                }
                R = Matrix.Rotation(t).elements;
                x = this.elements[0] - V[0];
                y = this.elements[1] - V[1];
                return Vector.create([ V[0] + R[0][0] * x + R[0][1] * y, V[1] + R[1][0] * x + R[1][1] * y ]);
                break;

              case 3:
                if (!obj.direction) {
                    return null;
                }
                var C = obj.pointClosestTo(this).elements;
                R = Matrix.Rotation(t, obj.direction).elements;
                x = this.elements[0] - C[0];
                y = this.elements[1] - C[1];
                z = this.elements[2] - C[2];
                return Vector.create([ C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z, C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z, C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z ]);
                break;

              default:
                return null;
            }
        },
        // Returns the result of reflecting the point in the given point, line or plane
        reflectionIn: function(obj) {
            if (obj.anchor) {
                // obj is a plane or line
                var P = this.elements.slice();
                var C = obj.pointClosestTo(P).elements;
                return Vector.create([ C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0)) ]);
            } else {
                // obj is a point
                var Q = obj.elements || obj;
                if (this.elements.length != Q.length) {
                    return null;
                }
                return this.map(function(x, i) {
                    return Q[i - 1] + (Q[i - 1] - x);
                });
            }
        },
        // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
        to3D: function() {
            var V = this.dup();
            switch (V.elements.length) {
              case 3:
                break;

              case 2:
                V.elements.push(0);
                break;

              default:
                return null;
            }
            return V;
        },
        // Returns a string representation of the vector
        inspect: function() {
            return "[" + this.elements.join(", ") + "]";
        },
        // Set vector's elements from an array
        setElements: function(els) {
            this.elements = (els.elements || els).slice();
            return this;
        }
    };
    // Constructor function
    Vector.create = function(elements) {
        var V = new Vector();
        return V.setElements(elements);
    };
    // i, j, k unit vectors
    Vector.i = Vector.create([ 1, 0, 0 ]);
    Vector.j = Vector.create([ 0, 1, 0 ]);
    Vector.k = Vector.create([ 0, 0, 1 ]);
    // Random vector of size n
    Vector.Random = function(n) {
        var elements = [];
        do {
            elements.push(Math.random());
        } while (--n);
        return Vector.create(elements);
    };
    // Vector filled with zeros
    Vector.Zero = function(n) {
        var elements = [];
        do {
            elements.push(0);
        } while (--n);
        return Vector.create(elements);
    };
    function Matrix() {}
    Matrix.prototype = {
        // Returns element (i,j) of the matrix
        e: function(i, j) {
            if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) {
                return null;
            }
            return this.elements[i - 1][j - 1];
        },
        // Returns row k of the matrix as a vector
        row: function(i) {
            if (i > this.elements.length) {
                return null;
            }
            return Vector.create(this.elements[i - 1]);
        },
        // Returns column k of the matrix as a vector
        col: function(j) {
            if (j > this.elements[0].length) {
                return null;
            }
            var col = [], n = this.elements.length, k = n, i;
            do {
                i = k - n;
                col.push(this.elements[i][j - 1]);
            } while (--n);
            return Vector.create(col);
        },
        // Returns the number of rows/columns the matrix has
        dimensions: function() {
            return {
                rows: this.elements.length,
                cols: this.elements[0].length
            };
        },
        // Returns the number of rows in the matrix
        rows: function() {
            return this.elements.length;
        },
        // Returns the number of columns in the matrix
        cols: function() {
            return this.elements[0].length;
        },
        // Returns true iff the matrix is equal to the argument. You can supply
        // a vector as the argument, in which case the receiver must be a
        // one-column matrix equal to the vector.
        eql: function(matrix) {
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            if (this.elements.length != M.length || this.elements[0].length != M[0].length) {
                return false;
            }
            var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
            do {
                i = ki - ni;
                nj = kj;
                do {
                    j = kj - nj;
                    if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) {
                        return false;
                    }
                } while (--nj);
            } while (--ni);
            return true;
        },
        // Returns a copy of the matrix
        dup: function() {
            return Matrix.create(this.elements);
        },
        // Maps the matrix to another matrix (of the same dimensions) according to the given function
        map: function(fn) {
            var els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
            do {
                i = ki - ni;
                nj = kj;
                els[i] = [];
                do {
                    j = kj - nj;
                    els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
                } while (--nj);
            } while (--ni);
            return Matrix.create(els);
        },
        // Returns true iff the argument has the same dimensions as the matrix
        isSameSizeAs: function(matrix) {
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            return this.elements.length == M.length && this.elements[0].length == M[0].length;
        },
        // Returns the result of adding the argument to the matrix
        add: function(matrix) {
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            if (!this.isSameSizeAs(M)) {
                return null;
            }
            return this.map(function(x, i, j) {
                return x + M[i - 1][j - 1];
            });
        },
        // Returns the result of subtracting the argument from the matrix
        subtract: function(matrix) {
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            if (!this.isSameSizeAs(M)) {
                return null;
            }
            return this.map(function(x, i, j) {
                return x - M[i - 1][j - 1];
            });
        },
        // Returns true iff the matrix can multiply the argument from the left
        canMultiplyFromLeft: function(matrix) {
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            // this.columns should equal matrix.rows
            return this.elements[0].length == M.length;
        },
        // Returns the result of multiplying the matrix from the right by the argument.
        // If the argument is a scalar then just multiply all the elements. If the argument is
        // a vector, a vector is returned, which saves you having to remember calling
        // col(1) on the result.
        multiply: function(matrix) {
            if (!matrix.elements) {
                return this.map(function(x) {
                    return x * matrix;
                });
            }
            var returnVector = matrix.modulus ? true : false;
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            if (!this.canMultiplyFromLeft(M)) {
                return null;
            }
            var ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
            var cols = this.elements[0].length, elements = [], sum, nc, c;
            do {
                i = ki - ni;
                elements[i] = [];
                nj = kj;
                do {
                    j = kj - nj;
                    sum = 0;
                    nc = cols;
                    do {
                        c = cols - nc;
                        sum += this.elements[i][c] * M[c][j];
                    } while (--nc);
                    elements[i][j] = sum;
                } while (--nj);
            } while (--ni);
            var M = Matrix.create(elements);
            return returnVector ? M.col(1) : M;
        },
        x: function(matrix) {
            return this.multiply(matrix);
        },
        // Returns a submatrix taken from the matrix
        // Argument order is: start row, start col, nrows, ncols
        // Element selection wraps if the required index is outside the matrix's bounds, so you could
        // use this to perform row/column cycling or copy-augmenting.
        minor: function(a, b, c, d) {
            var elements = [], ni = c, i, nj, j;
            var rows = this.elements.length, cols = this.elements[0].length;
            do {
                i = c - ni;
                elements[i] = [];
                nj = d;
                do {
                    j = d - nj;
                    elements[i][j] = this.elements[(a + i - 1) % rows][(b + j - 1) % cols];
                } while (--nj);
            } while (--ni);
            return Matrix.create(elements);
        },
        // Returns the transpose of the matrix
        transpose: function() {
            var rows = this.elements.length, cols = this.elements[0].length;
            var elements = [], ni = cols, i, nj, j;
            do {
                i = cols - ni;
                elements[i] = [];
                nj = rows;
                do {
                    j = rows - nj;
                    elements[i][j] = this.elements[j][i];
                } while (--nj);
            } while (--ni);
            return Matrix.create(elements);
        },
        // Returns true iff the matrix is square
        isSquare: function() {
            return this.elements.length == this.elements[0].length;
        },
        // Returns the (absolute) largest element of the matrix
        max: function() {
            var m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
            do {
                i = ki - ni;
                nj = kj;
                do {
                    j = kj - nj;
                    if (Math.abs(this.elements[i][j]) > Math.abs(m)) {
                        m = this.elements[i][j];
                    }
                } while (--nj);
            } while (--ni);
            return m;
        },
        // Returns the indeces of the first match found by reading row-by-row from left to right
        indexOf: function(x) {
            var index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
            do {
                i = ki - ni;
                nj = kj;
                do {
                    j = kj - nj;
                    if (this.elements[i][j] == x) {
                        return {
                            i: i + 1,
                            j: j + 1
                        };
                    }
                } while (--nj);
            } while (--ni);
            return null;
        },
        // If the matrix is square, returns the diagonal elements as a vector.
        // Otherwise, returns null.
        diagonal: function() {
            if (!this.isSquare) {
                return null;
            }
            var els = [], n = this.elements.length, k = n, i;
            do {
                i = k - n;
                els.push(this.elements[i][i]);
            } while (--n);
            return Vector.create(els);
        },
        // Make the matrix upper (right) triangular by Gaussian elimination.
        // This method only adds multiples of rows to other rows. No rows are
        // scaled up or switched, and the determinant is preserved.
        toRightTriangular: function() {
            var M = this.dup(), els;
            var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
            do {
                i = k - n;
                if (M.elements[i][i] == 0) {
                    for (j = i + 1; j < k; j++) {
                        if (M.elements[j][i] != 0) {
                            els = [];
                            np = kp;
                            do {
                                p = kp - np;
                                els.push(M.elements[i][p] + M.elements[j][p]);
                            } while (--np);
                            M.elements[i] = els;
                            break;
                        }
                    }
                }
                if (M.elements[i][i] != 0) {
                    for (j = i + 1; j < k; j++) {
                        var multiplier = M.elements[j][i] / M.elements[i][i];
                        els = [];
                        np = kp;
                        do {
                            p = kp - np;
                            // Elements with column numbers up to an including the number
                            // of the row that we're subtracting can safely be set straight to
                            // zero, since that's the point of this routine and it avoids having
                            // to loop over and correct rounding errors later
                            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
                        } while (--np);
                        M.elements[j] = els;
                    }
                }
            } while (--n);
            return M;
        },
        toUpperTriangular: function() {
            return this.toRightTriangular();
        },
        // Returns the determinant for square matrices
        determinant: function() {
            if (!this.isSquare()) {
                return null;
            }
            var M = this.toRightTriangular();
            var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
            do {
                i = k - n + 1;
                det = det * M.elements[i][i];
            } while (--n);
            return det;
        },
        det: function() {
            return this.determinant();
        },
        // Returns true iff the matrix is singular
        isSingular: function() {
            return this.isSquare() && this.determinant() === 0;
        },
        // Returns the trace for square matrices
        trace: function() {
            if (!this.isSquare()) {
                return null;
            }
            var tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
            do {
                i = k - n + 1;
                tr += this.elements[i][i];
            } while (--n);
            return tr;
        },
        tr: function() {
            return this.trace();
        },
        // Returns the rank of the matrix
        rank: function() {
            var M = this.toRightTriangular(), rank = 0;
            var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
            do {
                i = ki - ni;
                nj = kj;
                do {
                    j = kj - nj;
                    if (Math.abs(M.elements[i][j]) > Sylvester.precision) {
                        rank++;
                        break;
                    }
                } while (--nj);
            } while (--ni);
            return rank;
        },
        rk: function() {
            return this.rank();
        },
        // Returns the result of attaching the given argument to the right-hand side of the matrix
        augment: function(matrix) {
            var M = matrix.elements || matrix;
            if (typeof M[0][0] == "undefined") {
                M = Matrix.create(M).elements;
            }
            var T = this.dup(), cols = T.elements[0].length;
            var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
            if (ni != M.length) {
                return null;
            }
            do {
                i = ki - ni;
                nj = kj;
                do {
                    j = kj - nj;
                    T.elements[i][cols + j] = M[i][j];
                } while (--nj);
            } while (--ni);
            return T;
        },
        // Returns the inverse (if one exists) using Gauss-Jordan
        inverse: function() {
            if (!this.isSquare() || this.isSingular()) {
                return null;
            }
            var ni = this.elements.length, ki = ni, i, j;
            var M = this.augment(Matrix.I(ni)).toRightTriangular();
            var np, kp = M.elements[0].length, p, els, divisor;
            var inverse_elements = [], new_element;
            // Matrix is non-singular so there will be no zeros on the diagonal
            // Cycle through rows from last to first
            do {
                i = ni - 1;
                // First, normalise diagonal elements to 1
                els = [];
                np = kp;
                inverse_elements[i] = [];
                divisor = M.elements[i][i];
                do {
                    p = kp - np;
                    new_element = M.elements[i][p] / divisor;
                    els.push(new_element);
                    // Shuffle of the current row of the right hand side into the results
                    // array as it will not be modified by later runs through this loop
                    if (p >= ki) {
                        inverse_elements[i].push(new_element);
                    }
                } while (--np);
                M.elements[i] = els;
                // Then, subtract this row from those above it to
                // give the identity matrix on the left hand side
                for (j = 0; j < i; j++) {
                    els = [];
                    np = kp;
                    do {
                        p = kp - np;
                        els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
                    } while (--np);
                    M.elements[j] = els;
                }
            } while (--ni);
            return Matrix.create(inverse_elements);
        },
        inv: function() {
            return this.inverse();
        },
        // Returns the result of rounding all the elements
        round: function() {
            return this.map(function(x) {
                return Math.round(x);
            });
        },
        // Returns a copy of the matrix with elements set to the given value if they
        // differ from it by less than Sylvester.precision
        snapTo: function(x) {
            return this.map(function(p) {
                return Math.abs(p - x) <= Sylvester.precision ? x : p;
            });
        },
        // Returns a string representation of the matrix
        inspect: function() {
            var matrix_rows = [];
            var n = this.elements.length, k = n, i;
            do {
                i = k - n;
                matrix_rows.push(Vector.create(this.elements[i]).inspect());
            } while (--n);
            return matrix_rows.join("\n");
        },
        // Set the matrix's elements from an array. If the argument passed
        // is a vector, the resulting matrix will be a single column.
        setElements: function(els) {
            var i, elements = els.elements || els;
            if (typeof elements[0][0] != "undefined") {
                var ni = elements.length, ki = ni, nj, kj, j;
                this.elements = [];
                do {
                    i = ki - ni;
                    nj = elements[i].length;
                    kj = nj;
                    this.elements[i] = [];
                    do {
                        j = kj - nj;
                        this.elements[i][j] = elements[i][j];
                    } while (--nj);
                } while (--ni);
                return this;
            }
            var n = elements.length, k = n;
            this.elements = [];
            do {
                i = k - n;
                this.elements.push([ elements[i] ]);
            } while (--n);
            return this;
        }
    };
    // Constructor function
    Matrix.create = function(elements) {
        var M = new Matrix();
        return M.setElements(elements);
    };
    // Identity matrix of size n
    Matrix.I = function(n) {
        var els = [], k = n, i, nj, j;
        do {
            i = k - n;
            els[i] = [];
            nj = k;
            do {
                j = k - nj;
                els[i][j] = i == j ? 1 : 0;
            } while (--nj);
        } while (--n);
        return Matrix.create(els);
    };
    // Diagonal matrix - all off-diagonal elements are zero
    Matrix.Diagonal = function(elements) {
        var n = elements.length, k = n, i;
        var M = Matrix.I(n);
        do {
            i = k - n;
            M.elements[i][i] = elements[i];
        } while (--n);
        return M;
    };
    // Rotation matrix about some axis. If no axis is
    // supplied, assume we're after a 2D transform
    Matrix.Rotation = function(theta, a) {
        if (!a) {
            return Matrix.create([ [ Math.cos(theta), -Math.sin(theta) ], [ Math.sin(theta), Math.cos(theta) ] ]);
        }
        var axis = a.dup();
        if (axis.elements.length != 3) {
            return null;
        }
        var mod = axis.modulus();
        var x = axis.elements[0] / mod, y = axis.elements[1] / mod, z = axis.elements[2] / mod;
        var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
        // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
        // That proof rotates the co-ordinate system so theta
        // becomes -theta and sin becomes -sin here.
        return Matrix.create([ [ t * x * x + c, t * x * y - s * z, t * x * z + s * y ], [ t * x * y + s * z, t * y * y + c, t * y * z - s * x ], [ t * x * z - s * y, t * y * z + s * x, t * z * z + c ] ]);
    };
    // Special case rotations
    Matrix.RotationX = function(t) {
        var c = Math.cos(t), s = Math.sin(t);
        return Matrix.create([ [ 1, 0, 0 ], [ 0, c, -s ], [ 0, s, c ] ]);
    };
    Matrix.RotationY = function(t) {
        var c = Math.cos(t), s = Math.sin(t);
        return Matrix.create([ [ c, 0, s ], [ 0, 1, 0 ], [ -s, 0, c ] ]);
    };
    Matrix.RotationZ = function(t) {
        var c = Math.cos(t), s = Math.sin(t);
        return Matrix.create([ [ c, -s, 0 ], [ s, c, 0 ], [ 0, 0, 1 ] ]);
    };
    // Random matrix of n rows, m columns
    Matrix.Random = function(n, m) {
        return Matrix.Zero(n, m).map(function() {
            return Math.random();
        });
    };
    // Matrix filled with zeros
    Matrix.Zero = function(n, m) {
        var els = [], ni = n, i, nj, j;
        do {
            i = n - ni;
            els[i] = [];
            nj = m;
            do {
                j = m - nj;
                els[i][j] = 0;
            } while (--nj);
        } while (--ni);
        return Matrix.create(els);
    };
    function Line() {}
    Line.prototype = {
        // Returns true if the argument occupies the same space as the line
        eql: function(line) {
            return this.isParallelTo(line) && this.contains(line.anchor);
        },
        // Returns a copy of the line
        dup: function() {
            return Line.create(this.anchor, this.direction);
        },
        // Returns the result of translating the line by the given vector/array
        translate: function(vector) {
            var V = vector.elements || vector;
            return Line.create([ this.anchor.elements[0] + V[0], this.anchor.elements[1] + V[1], this.anchor.elements[2] + (V[2] || 0) ], this.direction);
        },
        // Returns true if the line is parallel to the argument. Here, 'parallel to'
        // means that the argument's direction is either parallel or antiparallel to
        // the line's own direction. A line is parallel to a plane if the two do not
        // have a unique intersection.
        isParallelTo: function(obj) {
            if (obj.normal) {
                return obj.isParallelTo(this);
            }
            var theta = this.direction.angleFrom(obj.direction);
            return Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision;
        },
        // Returns the line's perpendicular distance from the argument,
        // which can be a point, a line or a plane
        distanceFrom: function(obj) {
            if (obj.normal) {
                return obj.distanceFrom(this);
            }
            if (obj.direction) {
                // obj is a line
                if (this.isParallelTo(obj)) {
                    return this.distanceFrom(obj.anchor);
                }
                var N = this.direction.cross(obj.direction).toUnitVector().elements;
                var A = this.anchor.elements, B = obj.anchor.elements;
                return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
            } else {
                // obj is a point
                var P = obj.elements || obj;
                var A = this.anchor.elements, D = this.direction.elements;
                var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
                var modPA = Math.sqrt(PA1 * PA1 + PA2 * PA2 + PA3 * PA3);
                if (modPA === 0) return 0;
                // Assumes direction vector is normalized
                var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
                var sin2 = 1 - cosTheta * cosTheta;
                return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
            }
        },
        // Returns true iff the argument is a point on the line
        contains: function(point) {
            var dist = this.distanceFrom(point);
            return dist !== null && dist <= Sylvester.precision;
        },
        // Returns true iff the line lies in the given plane
        liesIn: function(plane) {
            return plane.contains(this);
        },
        // Returns true iff the line has a unique point of intersection with the argument
        intersects: function(obj) {
            if (obj.normal) {
                return obj.intersects(this);
            }
            return !this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision;
        },
        // Returns the unique intersection point with the argument, if one exists
        intersectionWith: function(obj) {
            if (obj.normal) {
                return obj.intersectionWith(this);
            }
            if (!this.intersects(obj)) {
                return null;
            }
            var P = this.anchor.elements, X = this.direction.elements, Q = obj.anchor.elements, Y = obj.direction.elements;
            var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
            var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
            var XdotQsubP = -X1 * PsubQ1 - X2 * PsubQ2 - X3 * PsubQ3;
            var YdotPsubQ = Y1 * PsubQ1 + Y2 * PsubQ2 + Y3 * PsubQ3;
            var XdotX = X1 * X1 + X2 * X2 + X3 * X3;
            var YdotY = Y1 * Y1 + Y2 * Y2 + Y3 * Y3;
            var XdotY = X1 * Y1 + X2 * Y2 + X3 * Y3;
            var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
            return Vector.create([ P[0] + k * X1, P[1] + k * X2, P[2] + k * X3 ]);
        },
        // Returns the point on the line that is closest to the given point or line
        pointClosestTo: function(obj) {
            if (obj.direction) {
                // obj is a line
                if (this.intersects(obj)) {
                    return this.intersectionWith(obj);
                }
                if (this.isParallelTo(obj)) {
                    return null;
                }
                var D = this.direction.elements, E = obj.direction.elements;
                var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
                // Create plane containing obj and the shared normal and intersect this with it
                // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
                var x = D3 * E1 - D1 * E3, y = D1 * E2 - D2 * E1, z = D2 * E3 - D3 * E2;
                var N = Vector.create([ x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1 ]);
                var P = Plane.create(obj.anchor, N);
                return P.intersectionWith(this);
            } else {
                // obj is a point
                var P = obj.elements || obj;
                if (this.contains(P)) {
                    return Vector.create(P);
                }
                var A = this.anchor.elements, D = this.direction.elements;
                var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
                var x = D1 * (P[1] - A2) - D2 * (P[0] - A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1] - A2), z = D3 * (P[0] - A1) - D1 * ((P[2] || 0) - A3);
                var V = Vector.create([ D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y ]);
                var k = this.distanceFrom(P) / V.modulus();
                return Vector.create([ P[0] + V.elements[0] * k, P[1] + V.elements[1] * k, (P[2] || 0) + V.elements[2] * k ]);
            }
        },
        // Returns a copy of the line rotated by t radians about the given line. Works by
        // finding the argument's closest point to this line's anchor point (call this C) and
        // rotating the anchor about C. Also rotates the line's direction about the argument's.
        // Be careful with this - the rotation axis' direction affects the outcome!
        rotate: function(t, line) {
            // If we're working in 2D
            if (typeof line.direction == "undefined") {
                line = Line.create(line.to3D(), Vector.k);
            }
            var R = Matrix.Rotation(t, line.direction).elements;
            var C = line.pointClosestTo(this.anchor).elements;
            var A = this.anchor.elements, D = this.direction.elements;
            var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
            var x = A1 - C1, y = A2 - C2, z = A3 - C3;
            return Line.create([ C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z, C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z, C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z ], [ R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2], R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2], R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2] ]);
        },
        // Returns the line's reflection in the given point or line
        reflectionIn: function(obj) {
            if (obj.normal) {
                // obj is a plane
                var A = this.anchor.elements, D = this.direction.elements;
                var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
                var newA = this.anchor.reflectionIn(obj).elements;
                // Add the line's direction vector to its anchor, then mirror that in the plane
                var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
                var Q = obj.pointClosestTo([ AD1, AD2, AD3 ]).elements;
                var newD = [ Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2] ];
                return Line.create(newA, newD);
            } else if (obj.direction) {
                // obj is a line - reflection obtained by rotating PI radians about obj
                return this.rotate(Math.PI, obj);
            } else {
                // obj is a point - just reflect the line's anchor in it
                var P = obj.elements || obj;
                return Line.create(this.anchor.reflectionIn([ P[0], P[1], P[2] || 0 ]), this.direction);
            }
        },
        // Set the line's anchor point and direction.
        setVectors: function(anchor, direction) {
            // Need to do this so that line's properties are not
            // references to the arguments passed in
            anchor = Vector.create(anchor);
            direction = Vector.create(direction);
            if (anchor.elements.length == 2) {
                anchor.elements.push(0);
            }
            if (direction.elements.length == 2) {
                direction.elements.push(0);
            }
            if (anchor.elements.length > 3 || direction.elements.length > 3) {
                return null;
            }
            var mod = direction.modulus();
            if (mod === 0) {
                return null;
            }
            this.anchor = anchor;
            this.direction = Vector.create([ direction.elements[0] / mod, direction.elements[1] / mod, direction.elements[2] / mod ]);
            return this;
        }
    };
    // Constructor function
    Line.create = function(anchor, direction) {
        var L = new Line();
        return L.setVectors(anchor, direction);
    };
    // Axes
    Line.X = Line.create(Vector.Zero(3), Vector.i);
    Line.Y = Line.create(Vector.Zero(3), Vector.j);
    Line.Z = Line.create(Vector.Zero(3), Vector.k);
    function Plane() {}
    Plane.prototype = {
        // Returns true iff the plane occupies the same space as the argument
        eql: function(plane) {
            return this.contains(plane.anchor) && this.isParallelTo(plane);
        },
        // Returns a copy of the plane
        dup: function() {
            return Plane.create(this.anchor, this.normal);
        },
        // Returns the result of translating the plane by the given vector
        translate: function(vector) {
            var V = vector.elements || vector;
            return Plane.create([ this.anchor.elements[0] + V[0], this.anchor.elements[1] + V[1], this.anchor.elements[2] + (V[2] || 0) ], this.normal);
        },
        // Returns true iff the plane is parallel to the argument. Will return true
        // if the planes are equal, or if you give a line and it lies in the plane.
        isParallelTo: function(obj) {
            var theta;
            if (obj.normal) {
                // obj is a plane
                theta = this.normal.angleFrom(obj.normal);
                return Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision;
            } else if (obj.direction) {
                // obj is a line
                return this.normal.isPerpendicularTo(obj.direction);
            }
            return null;
        },
        // Returns true iff the receiver is perpendicular to the argument
        isPerpendicularTo: function(plane) {
            var theta = this.normal.angleFrom(plane.normal);
            return Math.abs(Math.PI / 2 - theta) <= Sylvester.precision;
        },
        // Returns the plane's distance from the given object (point, line or plane)
        distanceFrom: function(obj) {
            if (this.intersects(obj) || this.contains(obj)) {
                return 0;
            }
            if (obj.anchor) {
                // obj is a plane or line
                var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
                return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
            } else {
                // obj is a point
                var P = obj.elements || obj;
                var A = this.anchor.elements, N = this.normal.elements;
                return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
            }
        },
        // Returns true iff the plane contains the given point or line
        contains: function(obj) {
            if (obj.normal) {
                return null;
            }
            if (obj.direction) {
                return this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction));
            } else {
                var P = obj.elements || obj;
                var A = this.anchor.elements, N = this.normal.elements;
                var diff = Math.abs(N[0] * (A[0] - P[0]) + N[1] * (A[1] - P[1]) + N[2] * (A[2] - (P[2] || 0)));
                return diff <= Sylvester.precision;
            }
        },
        // Returns true iff the plane has a unique point/line of intersection with the argument
        intersects: function(obj) {
            if (typeof obj.direction == "undefined" && typeof obj.normal == "undefined") {
                return null;
            }
            return !this.isParallelTo(obj);
        },
        // Returns the unique intersection with the argument, if one exists. The result
        // will be a vector if a line is supplied, and a line if a plane is supplied.
        intersectionWith: function(obj) {
            if (!this.intersects(obj)) {
                return null;
            }
            if (obj.direction) {
                // obj is a line
                var A = obj.anchor.elements, D = obj.direction.elements, P = this.anchor.elements, N = this.normal.elements;
                var multiplier = (N[0] * (P[0] - A[0]) + N[1] * (P[1] - A[1]) + N[2] * (P[2] - A[2])) / (N[0] * D[0] + N[1] * D[1] + N[2] * D[2]);
                return Vector.create([ A[0] + D[0] * multiplier, A[1] + D[1] * multiplier, A[2] + D[2] * multiplier ]);
            } else if (obj.normal) {
                // obj is a plane
                var direction = this.normal.cross(obj.normal).toUnitVector();
                // To find an anchor point, we find one co-ordinate that has a value
                // of zero somewhere on the intersection, and remember which one we picked
                var N = this.normal.elements, A = this.anchor.elements, O = obj.normal.elements, B = obj.anchor.elements;
                var solver = Matrix.Zero(2, 2), i = 0;
                while (solver.isSingular()) {
                    i++;
                    solver = Matrix.create([ [ N[i % 3], N[(i + 1) % 3] ], [ O[i % 3], O[(i + 1) % 3] ] ]);
                }
                // Then we solve the simultaneous equations in the remaining dimensions
                var inverse = solver.inverse().elements;
                var x = N[0] * A[0] + N[1] * A[1] + N[2] * A[2];
                var y = O[0] * B[0] + O[1] * B[1] + O[2] * B[2];
                var intersection = [ inverse[0][0] * x + inverse[0][1] * y, inverse[1][0] * x + inverse[1][1] * y ];
                var anchor = [];
                for (var j = 1; j <= 3; j++) {
                    // This formula picks the right element from intersection by
                    // cycling depending on which element we set to zero above
                    anchor.push(i == j ? 0 : intersection[(j + (5 - i) % 3) % 3]);
                }
                return Line.create(anchor, direction);
            }
        },
        // Returns the point in the plane closest to the given point
        pointClosestTo: function(point) {
            var P = point.elements || point;
            var A = this.anchor.elements, N = this.normal.elements;
            var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
            return Vector.create([ P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot ]);
        },
        // Returns a copy of the plane, rotated by t radians about the given line
        // See notes on Line#rotate.
        rotate: function(t, line) {
            var R = Matrix.Rotation(t, line.direction).elements;
            var C = line.pointClosestTo(this.anchor).elements;
            var A = this.anchor.elements, N = this.normal.elements;
            var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
            var x = A1 - C1, y = A2 - C2, z = A3 - C3;
            return Plane.create([ C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z, C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z, C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z ], [ R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2], R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2], R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2] ]);
        },
        // Returns the reflection of the plane in the given point, line or plane.
        reflectionIn: function(obj) {
            if (obj.normal) {
                // obj is a plane
                var A = this.anchor.elements, N = this.normal.elements;
                var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
                var newA = this.anchor.reflectionIn(obj).elements;
                // Add the plane's normal to its anchor, then mirror that in the other plane
                var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
                var Q = obj.pointClosestTo([ AN1, AN2, AN3 ]).elements;
                var newN = [ Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2] ];
                return Plane.create(newA, newN);
            } else if (obj.direction) {
                // obj is a line
                return this.rotate(Math.PI, obj);
            } else {
                // obj is a point
                var P = obj.elements || obj;
                return Plane.create(this.anchor.reflectionIn([ P[0], P[1], P[2] || 0 ]), this.normal);
            }
        },
        // Sets the anchor point and normal to the plane. If three arguments are specified,
        // the normal is calculated by assuming the three points should lie in the same plane.
        // If only two are sepcified, the second is taken to be the normal. Normal vector is
        // normalised before storage.
        setVectors: function(anchor, v1, v2) {
            anchor = Vector.create(anchor);
            anchor = anchor.to3D();
            if (anchor === null) {
                return null;
            }
            v1 = Vector.create(v1);
            v1 = v1.to3D();
            if (v1 === null) {
                return null;
            }
            if (typeof v2 == "undefined") {
                v2 = null;
            } else {
                v2 = Vector.create(v2);
                v2 = v2.to3D();
                if (v2 === null) {
                    return null;
                }
            }
            var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
            var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
            var normal, mod;
            if (v2 !== null) {
                var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
                normal = Vector.create([ (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2), (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3), (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1) ]);
                mod = normal.modulus();
                if (mod === 0) {
                    return null;
                }
                normal = Vector.create([ normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod ]);
            } else {
                mod = Math.sqrt(v11 * v11 + v12 * v12 + v13 * v13);
                if (mod === 0) {
                    return null;
                }
                normal = Vector.create([ v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod ]);
            }
            this.anchor = anchor;
            this.normal = normal;
            return this;
        }
    };
    // Constructor function
    Plane.create = function(anchor, v1, v2) {
        var P = new Plane();
        return P.setVectors(anchor, v1, v2);
    };
    // X-Y-Z planes
    Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
    Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
    Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
    Plane.YX = Plane.XY;
    Plane.ZY = Plane.YZ;
    Plane.XZ = Plane.ZX;
    // augment Sylvester some
    Matrix.Translation = function(v) {
        if (v.elements.length == 2) {
            var r = Matrix.I(3);
            r.elements[2][0] = v.elements[0];
            r.elements[2][1] = v.elements[1];
            return r;
        }
        if (v.elements.length == 3) {
            var r = Matrix.I(4);
            r.elements[0][3] = v.elements[0];
            r.elements[1][3] = v.elements[1];
            r.elements[2][3] = v.elements[2];
            return r;
        }
        throw "Invalid length for Translation";
    };
    Matrix.prototype.flatten = function() {
        var result = [];
        if (this.elements.length == 0) return [];
        for (var j = 0; j < this.elements[0].length; j++) for (var i = 0; i < this.elements.length; i++) result.push(this.elements[i][j]);
        return result;
    };
    Matrix.prototype.ensure4x4 = function() {
        if (this.elements.length == 4 && this.elements[0].length == 4) return this;
        if (this.elements.length > 4 || this.elements[0].length > 4) return null;
        for (var i = 0; i < this.elements.length; i++) {
            for (var j = this.elements[i].length; j < 4; j++) {
                if (i == j) this.elements[i].push(1); else this.elements[i].push(0);
            }
        }
        for (var i = this.elements.length; i < 4; i++) {
            if (i == 0) this.elements.push([ 1, 0, 0, 0 ]); else if (i == 1) this.elements.push([ 0, 1, 0, 0 ]); else if (i == 2) this.elements.push([ 0, 0, 1, 0 ]); else if (i == 3) this.elements.push([ 0, 0, 0, 1 ]);
        }
        return this;
    };
    Matrix.prototype.make3x3 = function() {
        if (this.elements.length != 4 || this.elements[0].length != 4) return null;
        return Matrix.create([ [ this.elements[0][0], this.elements[0][1], this.elements[0][2] ], [ this.elements[1][0], this.elements[1][1], this.elements[1][2] ], [ this.elements[2][0], this.elements[2][1], this.elements[2][2] ] ]);
    };
    Vector.prototype.flatten = function() {
        return this.elements;
    };
    function mht(m) {
        var s = "";
        if (m.length == 16) {
            for (var i = 0; i < 4; i++) {
                s += "<span style='font-family: monospace'>[" + m[i * 4 + 0].toFixed(4) + "," + m[i * 4 + 1].toFixed(4) + "," + m[i * 4 + 2].toFixed(4) + "," + m[i * 4 + 3].toFixed(4) + "]</span><br>";
            }
        } else if (m.length == 9) {
            for (var i = 0; i < 3; i++) {
                s += "<span style='font-family: monospace'>[" + m[i * 3 + 0].toFixed(4) + "," + m[i * 3 + 1].toFixed(4) + "," + m[i * 3 + 2].toFixed(4) + "]</font><br>";
            }
        } else {
            return m.toString();
        }
        return s;
    }
    //
    // gluLookAt
    //
    function makeLookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
        var eye = $V([ ex, ey, ez ]);
        var center = $V([ cx, cy, cz ]);
        var up = $V([ ux, uy, uz ]);
        var mag;
        var z = eye.subtract(center).toUnitVector();
        var x = up.cross(z).toUnitVector();
        var y = z.cross(x).toUnitVector();
        var m = $M([ [ x.e(1), x.e(2), x.e(3), 0 ], [ y.e(1), y.e(2), y.e(3), 0 ], [ z.e(1), z.e(2), z.e(3), 0 ], [ 0, 0, 0, 1 ] ]);
        var t = $M([ [ 1, 0, 0, -ex ], [ 0, 1, 0, -ey ], [ 0, 0, 1, -ez ], [ 0, 0, 0, 1 ] ]);
        return m.x(t);
    }
    //
    // glOrtho
    //
    function makeOrtho(left, right, bottom, top, znear, zfar) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(zfar + znear) / (zfar - znear);
        return $M([ [ 2 / (right - left), 0, 0, tx ], [ 0, 2 / (top - bottom), 0, ty ], [ 0, 0, -2 / (zfar - znear), tz ], [ 0, 0, 0, 1 ] ]);
    }
    //
    // gluPerspective
    //
    module.exports.makePerspective = function makePerspective(fovy, aspect, znear, zfar) {
        var ymax = znear * Math.tan(fovy * Math.PI / 360);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;
        return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
    };
    //
    // glFrustum
    //
    function makeFrustum(left, right, bottom, top, znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);
        return $M([ [ X, 0, A, 0 ], [ 0, Y, B, 0 ], [ 0, 0, C, D ], [ 0, 0, -1, 0 ] ]);
    }
    //
    // glOrtho
    //
    function makeOrtho(left, right, bottom, top, znear, zfar) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(zfar + znear) / (zfar - znear);
        return $M([ [ 2 / (right - left), 0, 0, tx ], [ 0, 2 / (top - bottom), 0, ty ], [ 0, 0, -2 / (zfar - znear), tz ], [ 0, 0, 0, 1 ] ]);
    }
    // Utility functions
    var $V = Vector.create;
    var $M = Matrix.create;
    var $L = Line.create;
    var $P = Plane.create;
    module.exports.Vector = Vector;
    module.exports.Matrix = Matrix;
    module.exports.Line = Line;
    module.exports.Plane = Plane;
    module.exports.$V = $V;
    module.exports.$M = $M;
    module.exports.$P = $P;
    module.exports.$L = $L;
}.bind(this));

require.config({
    map: {
        "famous_modules/famous/polyfills/_git_modularized/index.js": {
            "./classList.js": "famous_modules/famous/polyfills/_git_modularized/classList.js",
            "./functionPrototypeBind.js": "famous_modules/famous/polyfills/_git_modularized/functionPrototypeBind.js",
            "./requestAnimationFrame.js": "famous_modules/famous/polyfills/_git_modularized/requestAnimationFrame.js"
        },
        "famous_modules/famous/polyfills/_git_modularized/classList.js": {},
        "famous_modules/famous/polyfills/_git_modularized/functionPrototypeBind.js": {},
        "famous_modules/famous/polyfills/_git_modularized/requestAnimationFrame.js": {},
        "famous_modules/famous/transform/_git_modularized/index.js": {},
        "famous_modules/famous/utilities/utility/_git_modularized/index.js": {},
        "famous_modules/famous/transitions/multiple-transition/_git_modularized/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js"
        },
        "famous_modules/famous/transitions/tween-transition/_git_modularized/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js"
        },
        "famous_modules/famous/transitions/transitionable/_git_modularized/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js",
            "famous/transitions/multiple-transition": "famous_modules/famous/transitions/multiple-transition/_git_modularized/index.js",
            "famous/transitions/tween-transition": "famous_modules/famous/transitions/tween-transition/_git_modularized/index.js"
        },
        "famous_modules/famous/modifier/_git_modularized/index.js": {
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js"
        },
        "famous_modules/famous/animation/easing/_git_modularized/index.js": {},
        "famous_modules/famous/entity/_git_modularized/index.js": {},
        "famous_modules/famous/event-handler/_git_modularized/index.js": {},
        "famous_modules/famous/surface/_git_modularized/index.js": {
            "famous/entity": "famous_modules/famous/entity/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js"
        },
        "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js"
        },
        "famous_modules/famous/surfaces/canvas-surface/_git_modularized/index.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js"
        },
        "famous_modules/famous/options-manager/_git_modularized/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js"
        },
        "famous_modules/famous/view-sequence/_git_modularized/index.js": {
            "famous/options-manager": "famous_modules/famous/options-manager/_git_modularized/index.js"
        },
        "famous_modules/famous/views/sequential-layout/_git_modularized/index.js": {
            "famous/options-manager": "famous_modules/famous/options-manager/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "famous/view-sequence": "famous_modules/famous/view-sequence/_git_modularized/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js"
        },
        "famous_modules/famous/spec-parser/_git_modularized/index.js": {
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js"
        },
        "famous_modules/famous/render-node/_git_modularized/index.js": {
            "famous/entity": "famous_modules/famous/entity/_git_modularized/index.js",
            "famous/spec-parser": "famous_modules/famous/spec-parser/_git_modularized/index.js"
        },
        "famous_modules/famous/view/_git_modularized/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/options-manager": "famous_modules/famous/options-manager/_git_modularized/index.js",
            "famous/render-node": "famous_modules/famous/render-node/_git_modularized/index.js"
        },
        "famous_modules/famous/views/header-footer-layout/_git_modularized/index.js": {
            "famous/entity": "famous_modules/famous/entity/_git_modularized/index.js",
            "famous/render-node": "famous_modules/famous/render-node/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js"
        },
        "famous_modules/famous/views/light-box/_git_modularized/index.js": {
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/render-node": "famous_modules/famous/render-node/_git_modularized/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js"
        },
        "famous_modules/famous/element-allocator/_git_modularized/index.js": {},
        "famous_modules/famous/context/_git_modularized/index.js": {
            "famous/render-node": "famous_modules/famous/render-node/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/spec-parser": "famous_modules/famous/spec-parser/_git_modularized/index.js",
            "famous/element-allocator": "famous_modules/famous/element-allocator/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js"
        },
        "famous_modules/famous/engine/_git_modularized/index.js": {
            "famous/context": "famous_modules/famous/context/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/options-manager": "famous_modules/famous/options-manager/_git_modularized/index.js"
        },
        "famous_modules/famous/utilities/timer/_git_modularized/index.js": {
            "famous/engine": "famous_modules/famous/engine/_git_modularized/index.js"
        },
        "famous_modules/famous/surfaces/container-surface/_git_modularized/index.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/context": "famous_modules/famous/context/_git_modularized/index.js"
        },
        "famous_modules/famous/input/touch-tracker/_git_modularized/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js"
        },
        "famous_modules/famous/input/touch-sync/_git_modularized/index.js": {
            "famous/input/touch-tracker": "famous_modules/famous/input/touch-tracker/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js"
        },
        "famous_modules/famous/math/vector/_git_modularized/index.js": {},
        "famous_modules/famous/physics/bodies/particle/_git_modularized/index.js": {
            "famous/render-node": "famous_modules/famous/render-node/_git_modularized/index.js",
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/forces/force/_git_modularized/index.js": {
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/forces/drag/_git_modularized/index.js": {
            "famous/physics/forces/force": "famous_modules/famous/physics/forces/force/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/constraints/constraint/_git_modularized/index.js": {},
        "famous_modules/famous/physics/integrator/symplectic-euler/_git_modularized/index.js": {},
        "famous_modules/famous/math/quaternion/_git_modularized/index.js": {},
        "famous_modules/famous/physics/bodies/body/_git_modularized/index.js": {
            "famous/physics/bodies/particle": "famous_modules/famous/physics/bodies/particle/_git_modularized/index.js",
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js",
            "famous/math/quaternion": "famous_modules/famous/math/quaternion/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/bodies/circle/_git_modularized/index.js": {
            "famous/physics/bodies/body": "famous_modules/famous/physics/bodies/body/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/bodies/rectangle/_git_modularized/index.js": {
            "famous/physics/bodies/body": "famous_modules/famous/physics/bodies/body/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/engine/_git_modularized/index.js": {
            "famous/physics/bodies/particle": "famous_modules/famous/physics/bodies/particle/_git_modularized/index.js",
            "famous/physics/bodies/body": "famous_modules/famous/physics/bodies/body/_git_modularized/index.js",
            "famous/physics/bodies/circle": "famous_modules/famous/physics/bodies/circle/_git_modularized/index.js",
            "famous/physics/bodies/rectangle": "famous_modules/famous/physics/bodies/rectangle/_git_modularized/index.js",
            "famous/physics/forces/force": "famous_modules/famous/physics/forces/force/_git_modularized/index.js",
            "famous/physics/constraints/constraint": "famous_modules/famous/physics/constraints/constraint/_git_modularized/index.js",
            "famous/physics/integrator/symplectic-euler": "famous_modules/famous/physics/integrator/symplectic-euler/_git_modularized/index.js"
        },
        "famous_modules/famous/transitions/drag-transition/_git_modularized/index.js": {
            "famous/physics/engine": "famous_modules/famous/physics/engine/_git_modularized/index.js",
            "famous/physics/forces/drag": "famous_modules/famous/physics/forces/drag/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/forces/spring/_git_modularized/index.js": {
            "famous/physics/forces/force": "famous_modules/famous/physics/forces/force/_git_modularized/index.js",
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js"
        },
        "famous_modules/famous/transitions/spring-transition/_git_modularized/index.js": {
            "famous/physics/engine": "famous_modules/famous/physics/engine/_git_modularized/index.js",
            "famous/physics/forces/spring": "famous_modules/famous/physics/forces/spring/_git_modularized/index.js",
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js"
        },
        "famous_modules/famous/input/mouse-sync/_git_modularized/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js"
        },
        "famous_modules/famous/input/scroll-sync/_git_modularized/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/engine": "famous_modules/famous/engine/_git_modularized/index.js"
        },
        "famous_modules/famous/input/generic-sync/_git_modularized/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/input/touch-sync": "famous_modules/famous/input/touch-sync/_git_modularized/index.js",
            "famous/input/scroll-sync": "famous_modules/famous/input/scroll-sync/_git_modularized/index.js"
        },
        "famous_modules/famous/modifiers/draggable/_git_modularized/index.js": {
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/input/mouse-sync": "famous_modules/famous/input/mouse-sync/_git_modularized/index.js",
            "famous/input/touch-sync": "famous_modules/famous/input/touch-sync/_git_modularized/index.js",
            "famous/input/generic-sync": "famous_modules/famous/input/generic-sync/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/transitions/drag-transition": "famous_modules/famous/transitions/drag-transition/_git_modularized/index.js"
        },
        "famous_modules/famous/views/drag-sort/_git_modularized/index.js": {
            "famous/view-sequence": "famous_modules/famous/view-sequence/_git_modularized/index.js",
            "famous/modifiers/draggable": "famous_modules/famous/modifiers/draggable/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js",
            "famous/options-manager": "famous_modules/famous/options-manager/_git_modularized/index.js",
            "famous/transitions/drag-transition": "famous_modules/famous/transitions/drag-transition/_git_modularized/index.js"
        },
        "famous_modules/famous/group/_git_modularized/index.js": {
            "famous/context": "famous_modules/famous/context/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js"
        },
        "famous_modules/famous/views/scrollview/_git_modularized/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js",
            "famous/physics/engine": "famous_modules/famous/physics/engine/_git_modularized/index.js",
            "famous/physics/bodies/particle": "famous_modules/famous/physics/bodies/particle/_git_modularized/index.js",
            "famous/physics/forces/drag": "famous_modules/famous/physics/forces/drag/_git_modularized/index.js",
            "famous/physics/forces/spring": "famous_modules/famous/physics/forces/spring/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js",
            "famous/input/generic-sync": "famous_modules/famous/input/generic-sync/_git_modularized/index.js",
            "famous/view-sequence": "famous_modules/famous/view-sequence/_git_modularized/index.js",
            "famous/group": "famous_modules/famous/group/_git_modularized/index.js",
            "famous/entity": "famous_modules/famous/entity/_git_modularized/index.js"
        },
        "famous_modules/famous/physics/constraints/wall/_git_modularized/index.js": {
            "famous/physics/constraints/constraint": "famous_modules/famous/physics/constraints/constraint/_git_modularized/index.js",
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_modularized/index.js"
        },
        "famous_modules/famous/transitions/wall-transition/_git_modularized/index.js": {
            "famous/physics/engine": "famous_modules/famous/physics/engine/_git_modularized/index.js",
            "famous/physics/forces/spring": "famous_modules/famous/physics/forces/spring/_git_modularized/index.js",
            "famous/physics/constraints/wall": "famous_modules/famous/physics/constraints/wall/_git_modularized/index.js",
            "famous/math/vector": "famous_modules/famous/math/vector/_git_modularized/index.js"
        },
        "app/main/index.js": {
            "famous/engine": "famous_modules/famous/engine/_git_modularized/index.js",
            "./views/AppView": "app/main/views/AppView.js",
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "famous/transitions/wall-transition": "famous_modules/famous/transitions/wall-transition/_git_modularized/index.js",
            "famous/transitions/spring-transition": "famous_modules/famous/transitions/spring-transition/_git_modularized/index.js",
            "famous/utilities/timer": "famous_modules/famous/utilities/timer/_git_modularized/index.js",
            "famous/surfaces/canvas-surface": "famous_modules/famous/surfaces/canvas-surface/_git_modularized/index.js"
        },
        "app/main/fonts/specimen_files/easytabs.js": {},
        "app/main/views/AppView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "./PageView": "app/main/views/PageView.js",
            "famous/views/light-box": "famous_modules/famous/views/light-box/_git_modularized/index.js",
            "famous/surfaces/canvas-surface": "famous_modules/famous/surfaces/canvas-surface/_git_modularized/index.js",
            "famous/surfaces/input-surface": "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js"
        },
        "app/main/views/BoxContainer.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "famous/surfaces/input-surface": "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js",
            "./BoxView": "app/main/views/BoxView.js"
        },
        "app/main/views/BoxView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "famous/surfaces/input-surface": "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js"
        },
        "app/main/views/Color.js": {},
        "app/main/views/ContentView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "famous/views/scrollview": "famous_modules/famous/views/scrollview/_git_modularized/index.js",
            "./TaskView": "app/main/views/TaskView.js",
            "./data": "app/main/views/data.js",
            "./BoxView": "app/main/views/BoxView.js",
            "./BoxContainer": "app/main/views/BoxContainer.js",
            "famous/utilities/timer": "famous_modules/famous/utilities/timer/_git_modularized/index.js",
            "famous/surfaces/input-surface": "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js",
            "famous/views/drag-sort": "famous_modules/famous/views/drag-sort/_git_modularized/index.js",
            "./customScrollView": "app/main/views/customScrollView.js",
            "./TaskItem": "app/main/views/TaskItem.js",
            "./Color": "app/main/views/Color.js"
        },
        "app/main/views/FooterView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js"
        },
        "app/main/views/HeaderView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "./Color": "app/main/views/Color.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "./BoxView": "app/main/views/BoxView.js",
            "./BoxContainer": "app/main/views/BoxContainer.js"
        },
        "app/main/views/ListView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "./TaskView": "app/main/views/TaskView.js",
            "./data": "app/main/views/data.js",
            "famous/surfaces/input-surface": "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js",
            "famous/utilities/timer": "famous_modules/famous/utilities/timer/_git_modularized/index.js"
        },
        "app/main/views/PageView.js": {
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "famous/input/generic-sync": "famous_modules/famous/input/generic-sync/_git_modularized/index.js",
            "famous/surfaces/input-surface": "famous_modules/famous/surfaces/input-surface/_git_modularized/index.js",
            "famous/utilities/timer": "famous_modules/famous/utilities/timer/_git_modularized/index.js",
            "famous/modifiers/draggable": "famous_modules/famous/modifiers/draggable/_git_modularized/index.js",
            "famous/views/header-footer-layout": "famous_modules/famous/views/header-footer-layout/_git_modularized/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js",
            "./Color": "app/main/views/Color.js",
            "./data": "app/main/views/data.js",
            "./TaskView": "app/main/views/TaskView.js",
            "./HeaderView": "app/main/views/HeaderView.js",
            "./FooterView": "app/main/views/FooterView.js",
            "./ContentView": "app/main/views/ContentView.js"
        },
        "app/main/views/TaskItem.js": {
            "famous/engine": "famous_modules/famous/engine/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "famous/surface": "famous_modules/famous/surface/_git_modularized/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_modularized/index.js",
            "famous/views/header-footer-layout": "famous_modules/famous/views/header-footer-layout/_git_modularized/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_modularized/index.js",
            "famous/views/sequential-layout": "famous_modules/famous/views/sequential-layout/_git_modularized/index.js",
            "famous/view-sequence": "famous_modules/famous/view-sequence/_git_modularized/index.js",
            "famous/modifiers/draggable": "famous_modules/famous/modifiers/draggable/_git_modularized/index.js",
            "famous/animation/easing": "famous_modules/famous/animation/easing/_git_modularized/index.js"
        },
        "app/main/views/TaskView.js": {
            "famous/modifiers/draggable": "famous_modules/famous/modifiers/draggable/_git_modularized/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_modularized/index.js",
            "famous/view": "famous_modules/famous/view/_git_modularized/index.js",
            "./TaskItem": "app/main/views/TaskItem.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_modularized/index.js"
        },
        "app/main/views/colorData.js": {},
        "app/main/views/customScrollView.js": {
            "famous/views/scrollview": "famous_modules/famous/views/scrollview/_git_modularized/index.js",
            "famous/engine": "famous_modules/famous/engine/_git_modularized/index.js"
        },
        "app/main/views/data.js": {},
        "app/main/views/webGL/sylvester.js": {}
    }
});
//# sourceMappingURL=build.map.js
