var db = require('../libs/db');
var q = require('q');
var getError = require('../utils/getError');
var whatType = require('../utils/whatType');
var gravatar = require('gravatar');

var User = function(id, opt) {
	this.id = parseInt(id, 10) || 0;

	if (whatType.isObject(opt)) {
		this.setFields(opt);
	}
};

User.prototype.setFields = function(data) {
	var fields = {
		email: 'string',
		password: 'string'
	};

	for (var field in data) {
		if (!Object.prototype.hasOwnProperty.call(fields, field)) {
			continue;
		}

		this[field] = data[field];
	}

	return this;
};

User.create = function(data) {
	var defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		var create = function() {
			conn
				.insert('users', data, function(err, info) {
					conn.releaseConnection();

					if (err) {
						console.error(err.stack);

						error = getError('Unable to create user', 400);

						return defer.reject(error);
					}

					data.id = info.insertId;

					defer.resolve(data);
				});
		};

		conn
			.where('email', data.email)
			.get('users', function(err, result) {
				if (err) {
					conn.releaseConnection();

					console.error(err.stack);

					error = getError('Unable to get user', 400);

					return defer.reject(error);
				}

				if (result.length) {
					conn.releaseConnection();

					error = getError('User with such email already exists', 409);

					return defer.reject(error);
				}

				create();
			});
	});

	return defer.promise;
};

/**
 * get user gravatar image
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @return {String}  img url
 */
User.prototype.getGravatar = function() {
	return gravatar.url(this.email, {s: '85'});
};

module.exports = User;