/**
 * whatType
 * Service for type checking
 *
 * has methods checkers for such types:
 * Array, Object, Number, String, Null, Undefined, Function, Boolean, Date, RegExp
 *
 * @usage: whatType.isString(someVar)
 *
 * and method for type detection
 *
 * @usage: whatType.is(someVar)
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */

'use strict';

var whatType = {};

var _types = ['Array', 'Object', 'Number', 'String', 'Null', 'Undefined', 'Function', 'Boolean', 'Date', 'RegExp'];

var _getType = function(elem) {
	return Object.prototype.toString.call(elem).slice(8, -1);
};

// Create functions checkers for each type
for (var i = 0; i < _types.length; i++) {
	whatType['is' + _types[i]] = (function(type) {
		return function(elem) {
			return _getType(elem) === type;
		};
	})(_types[i]);
}

// return element type
whatType.is = function(elem) {
	if (elem !== elem) {
		return 'NaN';
	}

	return _getType(elem).toLowerCase();
};

module.exports = whatType;