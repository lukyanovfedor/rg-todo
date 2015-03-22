(function(window, document, angular, undefined) {
	'use strict';

	function Auth($http, $q) {
		var auth = {};

		auth.login = function(data) {
			var defer = $q.defer();

			$http.post('/auth/login', data)
				.success(function() {
					defer.resolve();
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		auth.register = function(data) {
			var defer = $q.defer();

			$http.post('/auth/register', data)
				.success(function() {
					defer.resolve();
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		auth.check = function() {
			var defer = $q.defer();

			$http.get('/auth')
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		auth.logout = function() {
			var defer = $q.defer();

			$http.post('/auth/logout')
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		auth.getUser = function() {
			var defer = $q.defer();

			$http.get('/users')
				.success(function(answer) {
					defer.resolve(answer);
				})
				.error(function(error) {
					defer.reject(error);
				});

			return defer.promise;
		};

		return auth;
	}

	var app = angular.module('todo');
	app.service('Auth', ['$http', '$q', Auth]);
})(window, document, window.angular);