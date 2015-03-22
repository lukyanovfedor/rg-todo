var md5 = require('MD5');
var db = require('./db');
var q = require('q');
var User = require('../models/user');
var randomString = require('../utils/randomString');
var serialize = require('node-serialize');
var getError = require('../utils/getError');
var gravatar = require('gravatar');
var exports = {};

var currentUser = null;

/**
 * create hash for password
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {String} password password
 *
 * @return {String}          hash
 */
exports.createPasswordHash = function(password) {
	return md5(password);
};

/**
 * create auth token
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {String} password password
 *
 * @return {String}          token
 */
var createAuthToken = function(password) {
	return md5(randomString() + password);
};

/**
 * register user
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Object} data user info
 *
 * @return {Object}      promise
 */
exports.register = function(data) {
	var defer = q.defer();

	User
		.create(data)
		.then(function(userData) {
			defer.resolve(userData);
		})
		.catch(function(err) {
			defer.reject(err);
		});

	return defer.promise;
};

/**
 * login user
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {String} email     user email
 * @param  {String} password  user password hash
 *
 * @return {Object}           promise
 */
exports.login = function(email, password) {
	var defer = q.defer(),
		error;

	db.getConnection(function(conn) {
		conn
			.where('email', email)
			.where('password', password)
			.get('users', function(err, result) {
				conn.releaseConnection();

				// something bad
				if (err) {
					console.error(err.stack);

					error = getError('Login failed', 400);

					return defer.reject(error);
				}

				// no user found or wrong password
				if (!result.length) {
					error = getError('User not exists', 404);

					return defer.reject(error);
				}

				currentUser = {
					id: result[0].id,
					email: result[0].email
				};

				defer.resolve(currentUser);
			});
	});

	return defer.promise;
};

/**
 * add auth token
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} userId    user id
 * @param  {String}  password  user password
 *
 * @return {Object}            promise
 */
exports.addAuthToken = function(userId, password) {
	var defer = q.defer(),
		insertData = {
			userId: userId,
			token: createAuthToken(password)
		},
		authSession,
		error;

	var add = function() {
		db.getConnection(function(conn){
			conn.insert('auth_tokens', insertData, function(err, info) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to add token', 400);

					return defer.reject(error);
				}

				authSession = {
					id: info.insertId,
					token: insertData.token
				};

				authSession = serialize.serialize(authSession);

				defer.resolve(authSession);
			});
		});
	};

	this.removeAuthToken(userId)
		.then(function() {
			add();
		})
		.catch(function(error) {
			defer.reject(error);
		});

	return defer.promise;
};

/**
 * remove auth token
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} userId  user id
 *
 * @return {Object}         promise
 */
exports.removeAuthToken = function(userId) {
	var defer = q.defer();

	var error;
	db.getConnection(function(conn) {
		conn
			.where('userId', userId)
			.delete('auth_tokens', function(err) {
				conn.releaseConnection();

				if (err) {
					console.error(err.stack);

					error = getError('Unable to delete token', 400);

					return defer.reject(error);
				}

				currentUser = null;

				defer.resolve();
			});
	});

	return defer.promise;
};

/**
 * remove auth token
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {String} authSession  user session cook
 *
 * @return {Object}              promise
 */
exports.checkLogin = function(authSession) {
	var defer = q.defer(),
		userId;

	try {
		authSession = serialize.unserialize(authSession);
	} catch (ex) {
		authSession = {
			id: null,
			token: null
		};
	}

	db.getConnection(function(conn) {
		conn
			.select('userId')
			.where('id', authSession.id)
			.where('token', authSession.token)
			.get('auth_tokens', function(err, result) {
				if (err) {
					conn.releaseConnection();

					error = getError('Unable to get user');

					console.error(err.stack);

					return defer.reject(error);
				}

				userId = !result.length ? null : result[0].userId;

				if (currentUser) {
					conn.releaseConnection();

					return defer.resolve(userId);
				}

				conn
					.where('id', userId)
					.get('users', function(err, result) {
						conn.releaseConnection();

						if (err) {
							console.error(err.stack);

							error = getError('Unable to get user');

							return defer.reject(error);
						}

						if (!result.length) {
							error = getError('User not exists', 404);

							return defer.reject(error);
						}

						currentUser = {
							id: result[0].id,
							email: result[0].email
						};

						defer.resolve(userId);
					});
			});
	});

	return defer.promise;
};

/**
 * get current logged in user
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @return {Object}  user
 */
exports.getUser = function() {
	return currentUser;
};

/**
 * get user gravatar image
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {String} email user email
 *
 * @return {string}       img url
 */
exports.getUserGravatar = function(email) {
	return gravatar.url(email, {s: '85'});
};

module.exports = exports;