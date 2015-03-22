var express = require('express');
var router = express.Router();
var Project = require('../models/projects');
var Task = require('../models/tasks');
var whatType = require('../utils/whatType');

/**
 * check has user access project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object}   req  request
 * @param  {Object}   res  response
 * @param  {Function} next next middleware in this stack
 */
var checkProjectOwner = function(req, res, next) {
	var id = parseInt(req.params.id, 10);
	if (!id) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	Project
		.checkProjectOwner(id, req.currentUserId)
		.then(function() {
			next();
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(err.message);
		});
};

/**
 * check auth
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.use(function(req, res, next) {
	if (!req.currentUserId) {
		res.status(401);
		return res.send(JSON.stringify({
			error: 'You must be logged in to access this page'
		}));
	}

	next();
});

/**
 * get user projects and tasks to them
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.get('/', function(req, res) {
	Project
		.getByUserId(req.currentUserId)
		.then(function(projects) {
			var pIds = [],
				tasksObj = {};

			if (!projects.length) {
				return res.send({
					projects: [],
					tasks: {}
				});
			}

			projects.forEach(function(p) {
				pIds.push(p.id);
			});

			Task
				.getByProjectIds(pIds)
				.then(function(tasks) {
					tasks.forEach(function(t) {
						if (!tasksObj[t.projectId]) {
							tasksObj[t.projectId] = [];
						}

						tasksObj[t.projectId].push(t);
					});

					res.send(JSON.stringify({
						projects: projects,
						tasks: tasksObj
					}));
				})
				.catch(function(err) {
					res.status(err.status);
					res.send(JSON.stringify({
						error: err.message
					}));
				});
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
});

/**
 * create project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.post('/', function(req, res) {
	var data = {}, errors;

	req.sanitize('name').trim();
	req.sanitize('name').escape();
	req.checkBody('name').name();

	errors = req.validationErrors(true);
	if (errors) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	data.name = req.body.name;
	data.ownerId = req.currentUserId;

	Project
		.create(data)
		.then(function(answer) {
			res.send(answer);
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
});

/**
 * delete project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.delete('/:id', checkProjectOwner, function(req, res) {
	new Project(req.params.id)
		.delete()
		.then(function() {
			res.send();
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
});

/**
 * update project
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.put('/:id', checkProjectOwner, function(req, res) {
	var data = {}, errors;

	req.sanitize('name').trim();
	req.sanitize('name').escape();
	req.checkBody('name').name();

	errors = req.validationErrors(true);
	if (errors) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	data.name = req.body.name;
	data.ownerId = req.currentUserId;

	new Project(req.params.id, data)
		.update()
		.then(function() {
			res.send();
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
});

module.exports = router;