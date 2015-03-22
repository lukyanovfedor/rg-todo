var express = require('express');
var router = express.Router();
var auth = require('../libs/auth');

/**
 * check auth cookie
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.use(function(req, res, next) {
	var authSession;

	req.currentUserId = null;

	authSession = req.cookies.authSession;
	if (!authSession) {
		return next();
	}

	auth
		.checkLogin(authSession)
		.then(function(userId) {
			if (userId) {
				req.currentUserId = userId;
			}

			next();
		})
		.catch(function(err) {
			next();
		});
});

/**
 * render base layout, then angular staff in business
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 */
router.get('/', function(req, res, next) {
	res.render('index', {title: 'SIMPLE TODO LISTS'});
});

module.exports = router;