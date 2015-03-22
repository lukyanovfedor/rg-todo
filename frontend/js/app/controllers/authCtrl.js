(function(window, document, angular, undefined) {
	'use strict';

	function AuthCtrl(Auth, $state) {
		var vm = this;

		vm.loginData = {
			email: '',
			password: ''
		};

		vm.registerData = {
			email: '',
			password: '',
			rePassword: ''
		};

		vm.login = function(form) {
			if (form.$invalid) {
				form.submitted = true;
				return;
			}

			Auth
				.login(vm.loginData)
				.then(function() {
					$state.go('projects');
				});
		};

		vm.register = function(form) {
			if (form.$invalid) {
				form.submitted = true;
				return;
			}
			Auth
				.register(vm.registerData)
				.then(function() {
					$state.go('projects');
				});
		};
	}

	var app = angular.module('todo');
	app.controller('AuthCtrl', ['Auth', '$state', AuthCtrl]);
})(window, document, window.angular);