var db = require('../libs/db');
var q = require('q');
var moment = require('moment');
var getError = require('../utils/getError');
var whatType = require('../utils/whatType');

/**
 * Project class
 *
 * @constructor
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} id   project id
 * @param  {Object}  data fields
 */
var Project = function(id, data) {
	this.id = id || 0;

	if (whatType.isObject(data)) {
		this.setFields(data);
	}
};

/**
 * Set extra fields
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object}  data fields
 *
 * @return {Object}  this instance
 */
Project.prototype.setFields = function(data) {
	var fields = {
		name: 'string',
		ownerId: 'number'
	};

	for (var field in data) {
		if (!Object.prototype.hasOwnProperty.call(fields, field)) {
			continue;
		}

		this[field] = data[field];
	}

	return this;
};

/**
 * delete project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @return {Object} promise
 */
Project.prototype.delete = function() {
	var that = this,
		defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		conn
			.where('id', that.id)
			.delete('projects', function(err) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to delete project', 400);

					return defer.reject(error);
				}

				defer.resolve();
			});
	});

	return defer.promise;
};

Project.prototype.update = function() {
	var defer = q.defer();
	var that = this;

	var error;

	db.getConnection(function(conn) {
		conn
			.where('id', that.id)
			.update('projects', that, function(err) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to update project', 400);

					return defer.reject(error);
				}

				defer.resolve();
			});
	});

	return defer.promise;
};

/**
 * create project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object} data extra fields
 *
 * @return {Object}      promise
 */
Project.create = function(data) {
	var defer = q.defer();

	var error;

	db.getConnection(function(conn) {
		conn
			.insert('projects', data, function(err, info) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to create project', 400);

					return defer.reject(error);
				}

				data.id = info.insertId;

				defer.resolve(data);
			});
	});

	return defer.promise;
};

/**
 * get project by userId
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} userId userId
 *
 * @return {Object}         promise
 */
Project.getByUserId = function(userId) {
	var defer = q.defer(),
	error;

	db.getConnection(function(conn) {
		conn
			.where('ownerId', userId)
			.get('projects', function(err, result) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Can\'t get projects', 400);

					return defer.reject(error);
				}

				defer.resolve(result);
			});
	});

	return defer.promise;
};

/**
 * check user access to project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} id      projectId
 * @param  {Integer} ownerId ownerId
 *
 * @return {Object}          promise
 */
Project.checkProjectOwner = function(id, ownerId) {
	var defer = q.defer();

	var error;

	db.getConnection(function(conn) {
		conn
			.where('id', id)
			.get('projects', function(err, result) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to get project', 400);

					return defer.reject(error);
				}

				if (!result.length) {
					error = getError('Project doesn\'t exists', 404);

					return defer.reject(error);
				}

				if (ownerId !== result[0].ownerId) {
					error = getError('Access forbidden', 403);

					return defer.reject(error);
				}

				defer.resolve();
			});
	});

	return defer.promise;
};

module.exports = Project;