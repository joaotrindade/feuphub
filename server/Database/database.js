module.exports = (function() {
    'use strict';
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
		host     : 'ldso08.fe.up.pt',
		user     : 'feuphub',
		password : 'chituc2014',
		database : 'feuphubmain'
	});
	
	var api = express.Router();
	var course = require("./curso");
	course.start(connection);
	var cadeira = require("./cadeira");
	cadeira.start(connection);

    api.get('/', function(req, res) {
        res.send('hello database');
    });
	
	api.use('/curso', course.api);
	api.use('/cadeira', cadeira.api);

    return api;
	
}(module || {}));