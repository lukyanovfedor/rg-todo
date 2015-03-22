var express = require('express');
var router = express.Router();
var auth = require('../libs/auth');
var User = require('../models/user');

// get user
router.get('/', function(req, res, next) {
	var userData = auth.getUserData(),
		avatar,
		user;

	if (!userData) {
		res.send(JSON.stringify({
			user: null
		}));
	} else {
		user = new User(userData.id, userData);
		avatar = user.getGravatar();

		res.send(JSON.stringify({
			user: userData,
			avatar: avatar
		}));
	}
});

module.exports = router;