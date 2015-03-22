(function(window, document, angular, undefined) {
	'use strict';

	function MainCtrl(Notify, Auth, $state) {
		var vm = this;

		vm.notify = Notify;

		vm.logout = function() {
			Auth
				.logout()
				.then(function() {
					$state.go('auth');
				});
		};
	}

	var app = angular.module('todo');
	app.controller('mainCtrl', ['Notify', 'Auth', '$state', MainCtrl]);
})(window, document, window.angular);