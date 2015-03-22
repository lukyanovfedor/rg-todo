(function(window, document, angular, undefined) {
	'use strict';

	var app = angular.module('todo');

	app.directive('autoEdit', ['$timeout', function($timeout) {
		return {
			restrict: 'E',
			templateUrl: function(el, attrs) {
				return attrs.type === 'input' ? 'directives/autoInput.html' : 'directives/autoContent.html';
			},
			replace: true,
			scope: {
				model: '=model',
				field: '@field',
				editable: '=editable',
				save: '@save'
			},
			link: function(scope, el, attrs, ctrl) {
				var input = el.find('*'),
					last = scope.model[scope.field],
					timeout;

				// base save function
				var save = function() {
					if (!scope.model[scope.field].length) {
						return;
					}

					if (timeout) {
						$timeout.cancel(timeout);
					}

					timeout = $timeout(function() {
						scope.model[scope.save]();
						last = scope.model[scope.field];
					}, 350);
				};

				// watch editable and set focus if active
				scope.$watch('editable', function(value) {
					if (value) {
						input[0].focus();
					} else {
						if (!scope.model[scope.field].length) {
							scope.model[scope.field] = last;
						}
					}
				});

				// if save method, then on input lets save ;)
				if (typeof scope.model[scope.save] === 'function') {
					input.on('input', save);
				}
			}
		};
	}]);

})(window, document, angular);