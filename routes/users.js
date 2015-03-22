var express = require('express');
var router = express.Router();
var auth = require('../libs/auth');

// get user
router.get('/', function(req, res, next) {
	var user = auth.getUser(),
		avatar;

	if (!user) {
		res.send(JSON.stringify({
			user: null
		}));
	} else {
		avatar = auth.getUserGravatar(user.email);

		res.send(JSON.stringify({
			user: user,
			avatar: avatar
		}));
	}
});

module.exports = router;