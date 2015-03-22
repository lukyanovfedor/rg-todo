(function(window, document, angular, whatType, undefined) {
	'use strict';

	function projectFactory($http, $q) {
		var Project = function(id, opt) {
			this.id = parseInt(id, 10) || 0;

			if (whatType.isObject(opt)) {
				this.setFields(opt);
			}
		};

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

		Project.prototype.update = function() {
			var defer = $q.defer();

			$http
				.put('/projects/' + this.id, this)
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Project.prototype.delete = function() {
			var defer = $q.defer();

			$http
				.delete('projects/' + this.id)
				.success(function(answer) {
					defer.resolve();
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Project.getMy = function() {
			var defer = $q.defer();

			$http
				.get('/projects')
				.success(function(data) {
					defer.resolve(data);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		Project.create = function(data) {
			var defer = $q.defer();

			$http
				.post('/projects', data)
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		return Project;
	}

	var app = angular.module('todo');
	app.factory('Project', ['$http', '$q', projectFactory]);
})(window, document, window.angular, window.whatType);