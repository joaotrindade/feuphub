module.exports = (function() {
    'use strict';
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
		host     : '127.0.0.1',
		user     : 'feuphub',
		password : 'chituc2014',
		database : 'feuphubmain'
	});
	
	var api = express.Router();
	var course = require("./curso");
	course.start(connection);
	var cadeira = require("./cadeira");
	cadeira.start(connection);
	var resposta = require("./resposta");
	resposta.start(connection);
	
	api.use('/curso', course.api);
	api.use('/cadeira', cadeira.api);
	api.use('/resposta',resposta.api);
    return api;

	
}(module || {}));