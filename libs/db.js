var Db = require('mysql-activerecord');
var config = require('./../config/db.json');

var pool = new Db.Pool({
	server: config.server,
	username: config.username,
	password: config.password,
	database: config.database,
	port: config.port,
	connectionLimit : config.connectionLimit
});

module.exports = {
	getConnection: function(callback) {
		pool.getNewAdapter(callback);
	}
};