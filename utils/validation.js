var whatType = require('./whatType');

module.exports = {
	name: function(value) {
		return whatType.isString(value) && !!value.trim().length;
	},
	password: function(value) {
		return whatType.isString(value) && !!value.trim().length && !/ /.test(value);
	},
	date: function(value) {
		return !value.length || value === '0000-00-00 00:00:00' || !isNaN(Date.parse(str));
	}
};