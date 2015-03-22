(function(window, document, angular, undefined) {
	'use strict';

	function notifyFactory($timeout) {
		var Notify = {};

		var _current = [],
			_queue = [],
			_timeout;

		var _base = {
			error: {
				title: 'Error',
				text: 'Oops, something wrong!',
				time: 3000
			}
		};

		Notify.getCurrent = function() {
			return _current;
		};

		Notify.hasCurrent = function() {
			return _current.length;
		};

		Notify.add = function(w) {
			var warn = {};
			console.log(w);
			if (angular.isObject(w)) {
				if (!w.type || !_base[w.type]) {
					throw Error('Miss require argument of function');
				}

				angular.extend(warn, _base[w.type], w);
			} else if (angular.isString(w)) {
				warn = _base[w];

				if (!warn) {
					throw Error('Wrong argument');
				}
			} else {
				throw Error('Miss require argument of function');
			}

			if (_current.length) {
				return _queue.push(warn);
			} else {
				_current.push(warn);
			}

			_timeout = $timeout(function() {
				Notify.removeCurrent();
			}, warn.time);
		};

		Notify.removeCurrent = function() {
			$timeout.cancel(_timeout);

			_current = [];

			if (_queue.length) {
				var warn = Array.prototype.shift.call(_queue);

				Notify.add(warn);
			}
		};

		return Notify;
	}

	var app = angular.module('todo');
	app.factory('Notify', ['$timeout', notifyFactory]);
})(window, document, angular);