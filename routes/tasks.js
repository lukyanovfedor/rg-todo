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
	var id = parseInt(req.body.projectId, 10);
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
			res.send(JSON.stringify({
				error: err.message
			}));
		});
};

/**
 * check has user access task
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object}   req  request
 * @param  {Object}   res  response
 * @param  {Function} next next middleware in this stack
 */
var checkTaskOwner = function(req, res, next) {
	var id = parseInt(req.params.id, 10);
	if (!id) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	Task
		.checkTaskOwner(id, req.currentUserId)
		.then(function() {
			next();
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
};

// create
router.post('/', checkProjectOwner, function(req, res) {
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
	data.projectId = req.body.projectId;

	Task
		.create(data)
		.then(function(freshTask) {
			res.send(freshTask);
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
});

// delete
router.delete('/:id', checkTaskOwner, function(req, res) {
	new Task(req.params.id)
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

// update
router.put('/:id', checkTaskOwner, function(req, res) {
	var data = {}, errors;

	req.sanitize('name').trim();
	req.sanitize('name').escape();
	req.checkBody('name').name();

	req.checkBody('projectId').notEmpty().isInt();

	req.checkBody('status').isInt();

	req.sanitize('deadline').trim();
	req.sanitize('deadline').escape();
	req.checkBody('deadline').date();

	req.checkBody('order').isInt();

	errors = req.validationErrors(true);
	if (errors) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	new Task(req.params.id, req.body)
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


// change order
router.post('/order', checkProjectOwner, function(req, res) {
	Task
		.saveOrder(req.body.order, req.body.projectId)
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