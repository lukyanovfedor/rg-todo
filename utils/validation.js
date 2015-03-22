var whatType = require('./whatType');

module.exports = {
	name: function(value) {
		return whatType.isString(value) && !!value.trim().length;
	},
	password: function(value) {
		return whatType.isString(value) && !!value.trim().length && !/ /.test(value);
	},
	date: function(value) {
		if (value === '0000-00-00 00:00:00') {
			return true;
		}

		return !value.length || !isNaN(Date.parse(value));
	}
};