/**
 * generate random string
 *
 * @author Lukyanov Fedor <lukyanov.f.ua@gmail.com>
 *
 * @param  {Integer} length string length, default 7
 *
 * @return {String}         random string ;)
 */
module.exports = function(length) {
	length = length || 7;

    var out = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(var i = 0; i < length; i++) {
        out += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return out;
};