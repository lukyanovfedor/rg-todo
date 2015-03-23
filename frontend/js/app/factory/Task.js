(function(window, document, angular, moment, undefined) {
	'use strict';

	function taskFactory($http, $q) {
		var Task = function(id, opt) {
			this.id = opt.id || 0;

			if (whatType.isObject(opt)) {
				this.setFields(opt);
			}
		};

		Task.prototype.setFields = function(data) {
			var fields = {
				name: 'string',
				projectId: 'number',
				status: 'number',
				deadline: 'string',
				order: 'string'
			};

			for (var field in data) {
				if (!Object.prototype.hasOwnProperty.call(fields, field)) {
					continue;
				}

				this[field] = data[field];
			}

			return this;
		};

		Task.create = function(projectId, taskName) {
			var defer = $q.defer();

			$http
				.post('/tasks', {projectId: projectId, name: taskName})
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Task.saveOrder = function(newOrder, projectId) {
			var defer = $q.defer();

			$http
				.post('/tasks/order', {order: newOrder, projectId: projectId})
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Task.prototype.update = function() {
			var defer = $q.defer();

			$http
				.put('/tasks/' + this.id, this)
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Task.prototype.delete = function() {
			var defer = $q.defer();

			$http
				.delete('/tasks/' + this.id)
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Task.prototype.statusToggler = function() {
			this.status = this.status === 1 ? 0 : 1;
			that.update();
		};

		Task.prototype.setDeadline = function(deadline) {
			this.deadline = deadline ? moment(deadline).format('YYYY-MM-DD HH:MM:SS') : '';
			this.update();
		};

		return Task;
	}

	var app = angular.module('todo');
	app.factory('Task', ['$http', '$q', taskFactory]);
})(window, document, window.angular, window.moment);