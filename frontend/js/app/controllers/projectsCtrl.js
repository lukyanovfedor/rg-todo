(function(window, document, angular, moment, undefined) {
	'use strict';

	function ProjectsCtrl(my, Project, Task, user) {
		var vm = this;

		var saveOrder = function(order, projectId) {
			Task.saveOrder(order, projectId);
		};

		vm.my = (function() {
			var out = {};

			out.projects = [];
			out.tasks = {};

			my.projects.forEach(function(p) {
				out.tasks[p.id] = [];
				out.projects.push(new Project(p.id, p));
			});

			for (var projId in my.tasks) {
				if (!Object.prototype.hasOwnProperty.call(my.tasks, projId)) {
					continue;
				}

				if (my.tasks[projId] && my.tasks[projId].length) {
					my.tasks[projId].forEach(function(t) {
						out.tasks[projId].push(new Task(t.id, t));
					});
				}
			}

			return out;
		})();

		vm.user = user;

		vm.create = {
			project: function() {
				var names = [
						'Give me a name'
					],
					randomIndx = Math.floor(Math.random() * names.length);

				Project.create({name: names[randomIndx]}).then(function(projectData) {
					vm.my.projects.push(new Project(projectData.id, projectData));
					vm.my.tasks[projectData.id] = [];
				});
			},
			task: function(form, projectId) {
				if (!form.taskName.$modelValue || !form.taskName.$modelValue.length) {
					form.submitted = true;
					return;
				}

				Task
					.create(projectId, form.newTask)
					.then(function(freshTask) {
						var newOrder = [];

						form.newTask = '';
						form.$setPristine(true);
						form.submitted = false;

						if (!vm.my.tasks[projectId].length) {
							vm.my.tasks[projectId] = [];
						}

						vm.my.tasks[projectId].unshift(new Task(freshTask.id, freshTask));

						vm.my.tasks[projectId].forEach(function(item) {
							newOrder.push(item.id);
						});

						saveOrder(newOrder, projectId);
					});
			}
		};

		vm.delete = {
			project: function(project) {
				project
					.delete()
					.then(function() {
						delete vm.my.tasks[project.id];

						var index = vm.my.projects.indexOf(project);
						if (index > -1) {
							vm.my.projects.splice(index, 1);
						}
					});
			},
			task: function(task) {
				task
					.delete()
					.then(function() {
						var tasks = vm.my.tasks[task.projectId],
							index = tasks.indexOf(task);

						if (index > -1) {
							tasks.splice(index, 1);
						}
					});
			}
		};

		vm.deadlineOpt = {
			'show-weeks': false
		};

		vm.dndHandlers = {
			accept: function(srcItemHandleScope, dstSortableScope) {
				return srcItemHandleScope.itemScope.sortableScope.$id === dstSortableScope.$id;
			},
			orderChanged: function(event) {
				var tasks = event.dest.sortableScope.modelValue,
					moved = tasks[event.dest.index],
					newOrder = [];

				tasks.forEach(function(item) {
					newOrder.push(item.id);
				});

				saveOrder(newOrder, moved.projectId);
			}
		};
	}

	var app = angular.module('todo');
	app.controller('ProjectsCtrl', ['my', 'Project', 'Task', 'user', ProjectsCtrl]);
})(window, document, window.angular, window.moment);