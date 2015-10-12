/**
 * @package leya-tpl
 * @require fs
 */
var r_fs = require('fs');

/**
 * @constructor
 * @param {String} templateDirectory
 */
var fn = function(p) {
	// Unix base path.
	this.tplPath = p + (p.endsWith('/') ? '' : '/');
};

/**
 * @private
 * @method load
 * @param {String} filePath
 * File path of the template.
 * @param {Function} callback
 * Callback parameter:
 *
 * - err
 * - data 
 *
 * @param {Object} scope
 * Scope of the callback function.
 */
function load(f, c, sc) {
	r_fs.readFile(f, function (err, data) {
		c.call(sc || this, err, data.toString());
	});
}

/**
 * @private
 * @method transform
 * @param {String} str
 * @param {Object} obj
 */
function transform(str, flatObj) {
	var res = str.match(/{[\w]*}/g),
		id, data;

	for(var i=0, len = res.length; i < len; i++) {
		id = res[i];
		data = flatObj[id.replace(/{|}/g, '')];

		if(leya.isFunction(data)) {
			data = data();
		}

		//TODO what happened to the old string?
		str = str.replace(id, data || '');
	}

	return str;
}

/**
 * @private
 * @method loadTransform
 * @param {Object} param
 * Option list:
 *
 * - file {String}- Filename or full path.
 * - data {Object} - Data object where all values will came from.
 * - done {Function} - Callback function after data transformation.
 * 
 */
function loadTransform(p) {
	var begin = function(text, data) {
		p.done.call(p, null, transform(text.replace(/[\n\t]*/g, ''), data));
	};

	load(p.file, function(err, data) {
		if(!err) {
			var idata = p.data,
				ndata = {},
				noOfCall = 0,
				noOfCalled = 0,
				o;

			for(var n in idata) {
				o = idata[n];
				if(typeof o === 'object') {
					noOfCall++;
					o.fn.call(o.scope, null, function(value) {
						ndata[n] = value;
						if(++noOfCalled === noOfCall) begin(data, ndata);
					});
				} else {
					ndata[n] = o;
				}
			}

			if(!noOfCall) begin(data, ndata);
		} else {
			o.done(err);
		}
	});
}

/**
 * @method load
 * @param {String} filename
 * @param {Function} callback
 * Callback parameter:
 *
 * - err
 * - data 
 *
 * @param {Object} scope
 * Scope of the callback function.
 */
fn.prototype.load = function(t, c, sc) {
	var path = this.tplPath;
	// Unix base path.
	path += path.endsWith('/') ? '' : '/';
	load(path + t, c, sc);
};

/**
 * @method getPath
 * Return the template path
 * @return {String} path
 */
fn.prototype.getPath = function() {
	return this.tplPath;
};

/**
 * @method loadTransform
 * @param {Object} param
 */
fn.prototype.loadTransform = function(p) {
	p.file = this.getPath() + p.file;
	loadTransform(p);
};

/**
 * @static
 * @method load
 * @param {String} filePath
 * File path of the template.
 * @param {Function} callback
 * Callback parameter:
 *
 * - err
 * - data 
 *
 * @param {Object} scope
 * Scope of the callback function.
 */
fn.load = load;

/**
 * @static
 * @method loadTransform
 * @param {Object} param
 */
fn.loadTransform = loadTransform;

module.exports = fn;