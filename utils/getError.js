/**
 * little error builder
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {String}  msg    error text
 * @param  {Integer} status error code
 *
 * @return {Object}         error object
 */
module.exports = function(msg, status) {
	var error = new Error(msg || 'Bad request');
	error.status = status || 400;

	return error;
};