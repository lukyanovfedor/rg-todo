var express = require('express');
var router = express.Router();
var auth = require('../libs/auth');

/**
 * check user logged in or not
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object}   req  request
 * @param  {Object}   res  response
 * @param  {Function} next next middleware in this stack
 */
var checkLogin = function(req, res, next) {
	if (req.currentUserId) {
		res.status(409);
		res.send('User already logged in');
	}

	next();
};

// get user status
router.get('/', function(req, res) {
	console.log(req.currentUserId);
	res.send(JSON.stringify({
		loggedIn: !!req.currentUserId
	}));
});

// register
router.post('/register', checkLogin, function(req, res) {
	var regData = {}, errors;

	req.checkBody('email').notEmpty().isEmail();
	req.checkBody('password').notEmpty().password();
	req.checkBody('rePassword').notEmpty().password();

	errors = req.validationErrors(true);
	if (errors) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	if (req.body.password !== req.body.rePassword) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Password\'s not equal'
		}));
	}

	regData.email = req.body.email;
	regData.password = auth.createPasswordHash(req.body.password);

	auth
		.register(regData)
		.then(function() {
			auth
				.login(regData.email, regData.password)
				.then(function(userData) {
					auth
						.addAuthToken(userData.id, req.body.password)
						.then(function(authSession) {
							res.cookie('authSession', authSession, {httpOnly: true});
							res.send();
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
		})
		.catch(function(err) {
			res.status(err.status);
			res.send(JSON.stringify({
				error: err.message
			}));
		});
});

// login
router.post('/login', checkLogin, function(req, res) {
	var loginData = {}, errors;

	req.checkBody('email').notEmpty().isEmail();
	req.checkBody('password').notEmpty().password();

	errors = req.validationErrors(true);
	if (errors) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'Validation error'
		}));
	}

	loginData.email = req.body.email;
	loginData.password = auth.createPasswordHash(req.body.password);

	auth
		.login(loginData.email, loginData.password)
		.then(function(userData) {
			auth.addAuthToken(userData.id, req.body.password)
				.then(function(authSession) {
					res.cookie('authSession', authSession, {httpOnly: true});
					res.send();
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

// logout
router.post('/logout', function(req, res) {
	if (!req.currentUserId) {
		res.status(400);
		return res.send(JSON.stringify({
			error: 'You must be logged in to do this'
		}));
	}

	auth
		.removeAuthToken(req.currentUserId)
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