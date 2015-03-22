(function(window, document, angular, undefined) {
	'use strict';

	var app = angular.module('todo', ['ui.router', 'ui.bootstrap', 'ui.sortable']);

	// routes
	app.config(['$stateProvider',  '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('auth', {
				url: '/auth',
				templateUrl: 'auth.html',
				controller: 'AuthCtrl',
				resolve: {
					access: ['Auth', function(Auth) {
						return Auth.check();
					}]
				},
				onEnter: ['access', '$injector', function(access, $injector) {
					if (access.loggedIn) {
						$injector.get('$state').go('projects');
					}
				}]
			})
			.state('projects', {
				url: '/projects',
				templateUrl: 'projects.html',
				controller: 'ProjectsCtrl',
				controllerAs: 'projCtrl',
				resolve: {
					my: ['Project', function(Project) {
						return Project.getMy();
					}],
					user: ['Auth', function(Auth) {
						return Auth.getUser();
					}]
				}
			});

		$urlRouterProvider.otherwise('/projects');
	}]);

	// access interceptors
	app.config(['$httpProvider', function($httpProvider) {
		$httpProvider.interceptors.push(['$q', '$injector', function($q, $injector) {
			return {
				responseError: function(rejection) {
					if (rejection.status && rejection.status === 401) {
						$injector.get('$state').go('auth');
					} else {
						var text = rejection.data && rejection.data.error ? rejection.data.error : rejection.statusText;

						$injector.get('Notify').add({
							type: 'error',
							text: text
						});
					}

					return $q.reject(rejection);
				}
			};
		}]);
	}]);
})(window, document, window.angular);