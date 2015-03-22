var db = require('../libs/db');
var q = require('q');
var moment = require('moment');
var getError = require('../utils/getError');
var whatType = require('../utils/whatType');
var Project = require('./projects');

/**
 * Task class
 *
 * @constructor
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} id   project id
 * @param  {Object}  data fields
 */
var Task = function(id, data) {
	this.id = parseInt(id, 10) || 0;

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
Task.prototype.setFields = function(data) {
	var fields = {
		name: 'string',
		projectId: 'number',
		status: 'number',
		deadline: 'string',
		order: 'number'
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
 * Update task
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @return {Object} promise
 */
Task.prototype.update = function() {
	var that = this,
		defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		conn
			.where('id', that.id)
			.update('tasks', that, function(err) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to update task', 400);

					return defer.reject(error);
				}

				defer.resolve();
			});
	});

	return defer.promise;
};

/**
 * Delete task
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @return {Object} promise
 */
Task.prototype.delete = function() {
	var that = this,
		defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		conn
			.where('id', that.id)
			.delete('tasks', function(err) {
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

/**
 * Create task
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object} data extra fields
 *
 * @return {Object}      promise
 */
Task.create = function(data) {
	var defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		data.status = 0;
		data.order = 0;
		data.deadline = '';

		conn
			.insert('tasks', data, function(err, info) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to create task', 400);

					return defer.reject(error);
				}

				data.id = info.insertId;

				defer.resolve(data);
			});
	});

	return defer.promise;
};

/**
 * Get tasks by projects ids
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Array} projectIds project id's - array, or can be integer
 *
 * @return {Object}           promise
 */
Task.getByProjectIds = function(projectIds) {
	var defer = q.defer(),
		error;

	projectIds = whatType.isNumber(projectIds) ? [projectIds] : projectIds;

	db.getConnection(function(conn) {
		conn
			.where('projectId', projectIds)
			.order_by('tasks.order asc')
			.get('tasks', function(err, result) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to get tasks', 400);

					defer.reject(error);
				}

				defer.resolve(result);
			});
	});

	return defer.promise;
};

/**
 * Check user access to task
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} taskId task id
 * @param  {Integer} userId user id
 *
 * @return {Object}         promise
 */
Task.checkTaskOwner = function(taskId, userId) {
	var defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		conn
			.select('projectId')
			.where('id', taskId)
			.get('tasks', function(err, result) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to get task', 400);

					return defer.reject(error);
				}

				if (!result.length) {
					error = getError('Task is not exist', 404);

					return defer.reject(error);
				}

				var projectId = parseInt(result[0].projectId, 10);
				if (!projectId) {
					error = getError('Project is not exist', 404);

					return defer.reject(error);
				}

				Project
					.checkProjectOwner(projectId, userId)
					.then(function() {
						defer.resolve();
					})
					.catch(function(err) {
						defer.reject(err);
					});
			});
	});

	return defer.promise;
};


/**
 * Update tasks order
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Array} order       new tasks order
 * @param  {Integer} projectId project id
 *
 * @return {Object}            promise
 */
Task.saveOrder = function(order, projectId) {
	var defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		conn
			.where('projectId', projectId)
			.where('id', order)
			.get('tasks', function(err, result) {
				var idsStr = order.join(', '),
					query = '';

				if (err) {
					conn.releaseConnection();

					console.error(err.stack);

					error = getError('Unable to get tasks', 400);

					return defer.reject();
				}

				if (order.length !== result.length) {
					return defer.reject();
				}

				query += 'UPDATE tasks as t SET t.order = CASE id ';

				order.forEach(function(id, order) {
					id = parseInt(id, 10);
					order = parseInt(order, 10);

					if (isNaN(id) || isNaN(order)) {
						error = getError();

						return defer.reject(error);
					}

					query += 'WHEN ' + id +' THEN ' + order + ' ';
				});

				query += 'END WHERE t.id IN (' + idsStr + ');';

				conn
					.query(query, function(err) {
						conn.releaseConnection();

						if (err) {
							console.error(err.stack);

							error = getError('Unable to update tasks', 400);

							return defer.reject(error);
						}

						defer.resolve();
					});
			});
	});

	return defer.promise;
};

module.exports = Task;